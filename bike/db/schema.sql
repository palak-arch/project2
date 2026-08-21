-- ============================================================
-- ridegoa — MySQL 8.0 schema
-- Run this in MySQL Workbench (or via: mysql -u root -p < db/schema.sql)
-- ============================================================

CREATE DATABASE IF NOT EXISTS ridegoa
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ridegoa;

-- ------------------------------------------------------------
-- Users: renters + owners in one table (roles JSON decides)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(32)  NOT NULL PRIMARY KEY,     -- 'u-aarav', 'o-rhea', or generated
  name          VARCHAR(80)  NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  initials      VARCHAR(4)   NOT NULL DEFAULT '',
  hue           SMALLINT     NOT NULL DEFAULT 38,
  verified      TINYINT(1)   NOT NULL DEFAULT 0,
  roles         JSON         NOT NULL,                 -- '["renter"]', '["owner"]', '["renter","owner"]'
  password_hash VARCHAR(255) NOT NULL DEFAULT '',
  member_since  VARCHAR(10)  NOT NULL DEFAULT '',
  city          VARCHAR(60)  NULL,
  response_time VARCHAR(30)  NULL,
  rating        DECIMAL(2,1) NULL,
  reviews       INT          NOT NULL DEFAULT 0,
  phone         VARCHAR(20)  NULL,
  tagline       VARCHAR(160) NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Bikes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bikes (
  id                VARCHAR(32)  NOT NULL PRIMARY KEY,
  owner_id          VARCHAR(32)  NOT NULL,
  name              VARCHAR(100) NOT NULL,
  category          VARCHAR(20)  NOT NULL,             -- scooter | cruiser | sports | adventure | vintage | electric
  brand             VARCHAR(40)  NOT NULL,
  model             VARCHAR(60)  NOT NULL,
  year              SMALLINT     NOT NULL,
  cc                SMALLINT     NOT NULL DEFAULT 0,
  transmission      VARCHAR(12)  NOT NULL,             -- Automatic | Manual
  mileage           VARCHAR(20)  NOT NULL DEFAULT '',
  rate_per_day      INT          NOT NULL,
  rate_per_hour     INT          NOT NULL,
  security_deposit  INT          NOT NULL DEFAULT 0,
  helmet_included   TINYINT(1)   NOT NULL DEFAULT 0,
  gear_included     TINYINT(1)   NOT NULL DEFAULT 0,
  location          VARCHAR(60)  NOT NULL,
  map_x             SMALLINT     NOT NULL DEFAULT 30,
  map_y             SMALLINT     NOT NULL DEFAULT 30,
  distance_km       DECIMAL(4,1) NOT NULL DEFAULT 0,
  rating            DECIMAL(2,1) NOT NULL DEFAULT 5.0,
  reviews           INT          NOT NULL DEFAULT 0,
  trips_completed   INT          NOT NULL DEFAULT 0,
  description       TEXT         NULL,
  rental_rules      JSON         NULL,                 -- string[]
  features          JSON         NULL,                 -- string[]
  blocked_dates     JSON         NULL,                 -- string[] (ISO day keys)
  available         TINYINT(1)   NOT NULL DEFAULT 1,
  listed_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tone              SMALLINT     NOT NULL DEFAULT 0,
  photo             VARCHAR(255) NULL,                 -- local SVG scene path
  photo_url         VARCHAR(500) NULL,                 -- remote photo (Wikimedia/Unsplash)
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bikes_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Bookings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id                VARCHAR(32) NOT NULL PRIMARY KEY,
  bike_id           VARCHAR(32) NOT NULL,
  renter_id         VARCHAR(32) NOT NULL,
  owner_id          VARCHAR(32) NOT NULL,
  status            ENUM('Pending','Confirmed','Active','Completed','Declined') NOT NULL DEFAULT 'Pending',
  start_date        DATE        NOT NULL,
  end_date          DATE        NOT NULL,
  pickup_time       TIME        NOT NULL DEFAULT '11:00:00',
  dropoff_time      TIME        NOT NULL DEFAULT '19:00:00',
  days              SMALLINT    NOT NULL DEFAULT 1,
  daily_rate        INT         NOT NULL,
  security_deposit  INT         NOT NULL DEFAULT 0,
  service_fee       INT         NOT NULL DEFAULT 0,
  helmet_addon      TINYINT(1)  NOT NULL DEFAULT 0,
  helmet_cost       INT         NOT NULL DEFAULT 0,
  total             INT         NOT NULL,
  conversation_id   VARCHAR(32) NULL,
  created_at        DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  handover          JSON        NULL,                  -- { bodyItems, fuelLevel, odometer, photo, signature, at }
  extension         JSON        NULL,                  -- { id, days, note, status, at }
  review            JSON        NULL,                  -- { rating, comment, at, by }
  CONSTRAINT fk_bookings_bike   FOREIGN KEY (bike_id)   REFERENCES bikes (id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_renter FOREIGN KEY (renter_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_owner  FOREIGN KEY (owner_id)  REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Conversations + messages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id          VARCHAR(32) NOT NULL PRIMARY KEY,
  bike_id     VARCHAR(32) NOT NULL,
  booking_id  VARCHAR(32) NULL,
  renter_id   VARCHAR(32) NOT NULL,
  owner_id    VARCHAR(32) NOT NULL,
  unread_renter INT NOT NULL DEFAULT 0,
  unread_owner  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_convo_bike   FOREIGN KEY (bike_id)   REFERENCES bikes (id) ON DELETE CASCADE,
  CONSTRAINT fk_convo_renter FOREIGN KEY (renter_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_convo_owner  FOREIGN KEY (owner_id)  REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
  id              VARCHAR(32) NOT NULL PRIMARY KEY,
  conversation_id VARCHAR(32) NOT NULL,
  from_role       VARCHAR(10) NOT NULL,                -- renter | owner | system
  from_id         VARCHAR(32) NOT NULL DEFAULT 'system',
  kind            ENUM('text','photo','location','system') NOT NULL DEFAULT 'text',
  text            TEXT        NOT NULL,
  attachment      JSON        NULL,                    -- { name, size }
  location        JSON        NULL,                    -- { label, x, y }
  is_read         TINYINT(1)  NOT NULL DEFAULT 0,
  read_by_other   TINYINT(1)  NOT NULL DEFAULT 0,
  timestamp       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_msg_convo FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Saved bikes (wishlist): the mock's savedByUser map
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_bikes (
  user_id VARCHAR(32) NOT NULL,
  bike_id VARCHAR(32) NOT NULL,
  saved_at TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, bike_id),
  CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_bike FOREIGN KEY (bike_id) REFERENCES bikes (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Indexes for the hot query paths
-- ------------------------------------------------------------
CREATE INDEX idx_bikes_owner     ON bikes (owner_id);
CREATE INDEX idx_bikes_category  ON bikes (category);
CREATE INDEX idx_bikes_available ON bikes (available);
CREATE INDEX idx_bookings_renter ON bookings (renter_id);
CREATE INDEX idx_bookings_owner  ON bookings (owner_id);
CREATE INDEX idx_bookings_bike   ON bookings (bike_id);
CREATE INDEX idx_convo_renter    ON conversations (renter_id);
CREATE INDEX idx_convo_owner     ON conversations (owner_id);
CREATE INDEX idx_msg_convo       ON messages (conversation_id);
