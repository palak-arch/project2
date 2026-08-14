# Pulse — Serverless Data Pipeline & Analytics Dashboard

A complete serverless event-ingestion pipeline with an ETL aggregation layer and a
glassmorphism analytics dashboard — built on **AWS Free Tier** (≈ $0/month).

```
                    ┌────────────────────────────────────────────────────────┐
                    │                     Event Sources                       │
                    │            web SDK · mobile app · APIs · partners       │
                    └───────────────────────┬────────────────────────────────┘
                                            │  POST /events (single or batch ≤25)
                                            ▼
                    ┌────────────────────────────────────────────────────────┐
                    │   API Gateway (REST, CORS)                             │
                    │   POST /events · GET /api/stats/*                      │
                    └───────┬───────────────────────────┬────────────────────┘
                            ▼                           ▼
                    ┌───────────────┐           ┌──────────────────┐
                    │  Ingest λ     │           │  Dashboard API λ │
                    │  validate·enrich│         │  reads DynamoDB  │
                    └───────┬───────┘           └────────┬─────────┘
                            ▼                            │
                    ┌───────────────┐                    │
                    │  S3 raw lake  │                    │
                    │  raw/…/NDJSON │                    ▼
                    └───────┬───────┘           ┌──────────────────┐
                            │ EventBridge       │  DynamoDB        │
                            │ rate(1 hour)      │  single-table    │
                            ▼                   │  PK/SK + TTL     │
                    ┌───────────────┐           └──────────────────┘
                    │  ETL λ        │──────────► HOURLY# · DAILY#
                    │  aggregate    │  moves raw → processed/
                    └───────────────┘
                                                        │
                                                        ▼
                              ┌──────────────────────────────────────────┐
                              │   Dashboard (S3 static + CloudFront CDN) │
                              │   Chart.js SPA · demo-data fallback      │
                              └──────────────────────────────────────────┘
```

---

## Quick Start (Local Development)

No AWS account needed to develop — the dashboard ships with a **demo dataset
fallback** so the UI is fully explorable, and SAM runs everything locally.

```bash
# 1. Install dependencies
npm install

# 2. Preview the dashboard in a browser (demo data mode)
python -m http.server 8080 --directory dashboard
#   → open http://localhost:8080

# 3. Or run the API locally with SAM (needs Docker)
sam build
sam local start-api --port 3000
#   → POST events to http://localhost:3000/events
#   → query stats at http://localhost:3000/api/stats/realtime

# 4. Generate ~600 realistic sample events (last 7 days)
node scripts/generate-sample-events.js --api http://localhost:3000 --count 600 --days 7

# 5. Run the ETL to aggregate the last 168 hours
sam local invoke ETLFunction --event '{"hours":168}'

# 6. Point the dashboard at the local API
#   open http://localhost:8080/?api=http://localhost:3000
```

---

## Deploy to AWS (Free Tier)

Prereqs: [AWS CLI](https://aws.amazon.com/cli/), [SAM CLI](https://aws.amazon.com/serverless/sam/), Node 18+, valid credentials.

```bash
# One-shot deploy (build → deploy → upload dashboard → print URLs)
./scripts/deploy.sh

# ...or step by step
sam build
sam deploy --guided          # first run; samconfig.toml pre-fills stack/region
aws s3 sync dashboard/ s3://<dashboard-bucket> --delete
```

After deploying, set the API URL in the dashboard **Settings** page
(or `?api=<API_URL>`), then populate data:

```bash
API_URL="https://<api-id>.execute-api.us-east-1.amazonaws.com/Prod"
node scripts/generate-sample-events.js --api "$API_URL" --count 1000 --days 7
aws lambda invoke --function-name analytics-etl-prod --payload '{"hours":168}' out.json
```

Cleanup:

```bash
sam delete --stack-name analytics-pipeline
```

---

## API Reference

### Ingest — `POST /events`

Accept a single object or a batch (≤ 25). Validates with **Ajv**, enriches with
`eventId` / `receivedAt` / `processedDate`, writes NDJSON to
`raw/{YYYY}/{MM}/{DD}/{HH}/`, and bumps the realtime counter.

```bash
curl -X POST "$API_URL/events" \
  -H 'Content-Type: application/json' \
  -d '{
    "source": "web",
    "event_type": "page_view",
    "timestamp": "2026-08-06T15:00:00Z",
    "metadata": {
      "country": "US",
      "device": "desktop",
      "page": "/pricing",
      "user_id": "user_123",
      "referrer": "https://google.com"
    }
  }'
```

**Response**

```json
{ "status": "accepted", "eventCount": 1, "rejected": 0, "errors": [], "batchId": "…", "storedFiles": 1, "counter": { "eventsToday": 104, "eventsThisHour": 3 } }
```

### Stats — `GET /api/stats/*`

| Endpoint | Params | Returns |
|---|---|---|
| `/api/stats/realtime` | — | `{ eventsToday, eventsThisHour, lastEventAt }` |
| `/api/stats/hourly` | `date=YYYY-MM-DD` | 24 hourly objects (totalEvents, uniqueUsers, errorCount, errorRate, byType, bySource, byCountry, byDevice, topPages, topErrors) |
| `/api/stats/daily` | `from=…&to=…` | Daily summaries array |
| `/api/stats/top-pages` | `date=…` | Top 10 pages `[{key,count}]` |
| `/api/stats/by-country` | `date=…` | Country breakdown `[{country,count}]` |
| `/api/stats/by-type` | `date=…` | Type breakdown `[{type,count}]` |
| `/api/stats/errors` | `date=…` | `{ errorCount, errorRate, errors }` |

```bash
curl "$API_URL/api/stats/realtime"
curl "$API_URL/api/stats/hourly?date=2026-08-06"
curl "$API_URL/api/stats/daily?from=2026-07-31&to=2026-08-06"
curl "$API_URL/api/stats/errors?date=2026-08-06"
```

---

## DynamoDB Data Model (single table, TTL-enabled)

| PK | SK | Contents |
|---|---|---|
| `REALTIME#counter` | `CURRENT` | eventsToday, eventsThisHour, lastEventAt (version-locked) |
| `HOURLY#2026-08-06` | `HOUR#15` | Full hourly metrics + breakdowns |
| `DAILY#2026-08-06` | `SUMMARY` | Rolled-up daily totals, topPages, topErrors |
| `DAILY#2026-08-06` | `TYPE#page_view` | Per-type daily count |
| `DAILY#2026-08-06` | `COUNTRY#US` | Per-country daily count |

Every item carries a `ttl` (epoch seconds) — DynamoDB auto-expires data per the
template's `ANALYTICS_TTL_DAYS` (default 90).

---

## Project Structure

```
├── template.yaml              # SAM stack: S3, DynamoDB, 3 Lambdas, API GW, EventBridge, CloudFront
├── samconfig.toml             # sam deploy defaults (stack, region, capabilities)
├── package.json
├── lambdas/
│   ├── package.json           # Lambda runtime deps (built by sam build)
│   ├── shared/                # Reusable modules
│   │   ├── util.js            # date/TTL helpers
│   │   ├── validator.js       # Ajv event schema
│   │   ├── dynamodb.js        # DocumentClient helpers (get/put/query/increment)
│   │   ├── s3.js              # S3 helpers (put/get/list/move)
│   │   └── response.js        # CORS-aware API responses
│   ├── ingest/index.js        # POST /events
│   ├── etl/index.js           # hourly aggregation → DynamoDB
│   └── dashboard-api/index.js # GET /api/stats/*
├── dashboard/                 # static SPA (S3 + CloudFront)
│   ├── index.html
│   ├── css/styles.css         # dark glassmorphism theme
│   └── js/{api,demo-data,charts,app}.js
├── scripts/
│   ├── generate-sample-events.js
│   ├── test-pipeline.sh       # E2E verification
│   └── deploy.sh
```

---

## ETL Details

Triggered hourly by an **EventBridge rule** (`rate(1 hour)`). Payload options:

| Payload | Behavior |
|---|---|
| *(none / EventBridge)* | Process the last 1 completed hour |
| `{ "hours": 168 }` | Process the last 168 hours (backfill) |
| `{ "date": "2026-08-06", "hour": "14" }` | Process one specific window |

Metrics computed per hour: total events, unique users (distinct `metadata.user_id`),
error rate, events by type/source/country/device, top 10 pages, top error messages.
Files are moved `raw/ → processed/` after processing.

---

## Testing

```bash
# Full E2E (needs a running API)
API_URL=http://localhost:3000 ./scripts/test-pipeline.sh
# Deployed variant
API_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com/Prod ETL_FUNCTION=analytics-etl-prod ./scripts/test-pipeline.sh
```

Manual checks:

```bash
curl -X POST http://localhost:3000/events -H 'Content-Type: application/json' \
  -d '{"source":"test","event_type":"page_view","timestamp":"2026-08-06T15:00:00Z"}'
curl http://localhost:3000/api/stats/realtime
curl http://localhost:3000/api/stats/hourly?date=2026-08-06
```

---

## Free Tier Cost Breakdown ($0/month)

| Service | Free tier allowance | Expected usage |
|---|---|---|
| Lambda | 1M requests / 400k GB-s / mo | ~8k requests |
| S3 | 5 GB storage / 20k GET, 2k PUT | well under |
| DynamoDB | 25 RCU / 25 WCU on-demand | under |
| API Gateway | 1M REST calls / mo | few thousand |
| EventBridge | 14M events / mo | ~744 rules fires |
| CloudFront | 1 TB egress / 10M requests (12 mo) | tiny |

---

## Troubleshooting

- **`sam local start-api` needs Docker** — install Docker Desktop and keep it running.
- **Dashboard shows demo data** — you haven't configured the API base URL yet; use Settings → API Base URL, or `?api=…`.
- **CORS errors** — the API already returns `Access-Control-Allow-Origin: *`; ensure you're hitting `/Prod` stage URL.
- **Bucket name conflicts** — template suffixes bucket names with `{Environment}-{AccountId}`, so they're unique per account.
