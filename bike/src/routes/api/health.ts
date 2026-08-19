import { createAPIFileRoute } from '@tanstack/react-start/api'
import { pingDb } from '@/lib/db'

export const APIRoute = createAPIFileRoute('/api/health')({
  GET: async () => {
    const db = await pingDb()
    return Response.json(
      {
        ok: db.connected,
        service: 'ridegoa',
        db,
        timestamp: new Date().toISOString(),
      },
      { status: db.connected ? 200 : 503 },
    )
  },
})
