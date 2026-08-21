-- ============================================================
-- ridegoa — MySQL 8.0 seed data (mirrors src/store/seed.ts)
-- Run AFTER db/schema.sql, in Workbench or:
--   mysql -u root -p ridegoa < db/seed.sql
-- Demo password for every account: demo1234
--   (password_hash is empty in the mock; the client computes the
--    same SHA-256 hash it compares against. When you move auth to
--    the backend, replace these with bcrypt hashes.)
--
-- Safe to re-run: clears the ridegoa tables first so INSERTs never
-- collide on duplicate primary keys.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM saved_bikes;
DELETE FROM bookings;
DELETE FROM bikes;
DELETE FROM users;
SET FOREIGN_KEY_CHECKS = 1;

USE ridegoa;

-- ------------------------------------------------------------
-- Users (renter + 4 owners)
-- ------------------------------------------------------------
INSERT INTO users (id, name, email, initials, hue, verified, roles, password_hash, member_since, city, response_time, rating, reviews, phone, tagline) VALUES
('u-aarav',   'Aarav Mehta',     'aarav@ridegoa.in',   'AM', 38,  1, JSON_ARRAY('renter'), '', '2021', 'Mumbai', NULL,             4.8, 0,    NULL,                 NULL),
('o-rhea',    'Rhea Kapoor',     'rhea@ridegoa.in',    'RK', 38,  1, JSON_ARRAY('owner'),  '', '2019', NULL,     '~15 min',      4.9, 212,  '+91 98220 44120', 'Beach-season bikes, always fuelled and serviced.'),
('o-vikram',  'Vikram Shetty',   'vikram@ridegoa.in',  'VS', 190, 1, JSON_ARRAY('owner'),  '', '2020', NULL,     '~30 min',      4.7, 98,   '+91 98450 11230', 'Performance machines, maintained by a racer.'),
('o-ananya',  'Ananya Fernandes','ananya@ridegoa.in',  'AF', 330, 1, JSON_ARRAY('owner'),  '', '2021', NULL,     '~1 hr',        4.8, 64,   '+91 94220 77810', 'Vintage beauties with stories to tell.'),
('o-sameer',  'Sameer Naik',     'sameer@ridegoa.in',  'SN', 120, 1, JSON_ARRAY('owner'),  '', '2022', NULL,     '~45 min',      4.6, 41,   '+91 98900 33455', 'Fleet host · 15+ bikes across North Goa.');

-- ------------------------------------------------------------
-- Bikes (6 seeded — photos hotlinked from Wikimedia/Unsplash)
-- ------------------------------------------------------------
INSERT INTO bikes (id, owner_id, name, category, brand, model, year, cc, transmission, mileage, rate_per_day, rate_per_hour, security_deposit, helmet_included, gear_included, location, map_x, map_y, distance_km, rating, reviews, trips_completed, description, rental_rules, features, blocked_dates, available, listed_at, tone, photo, photo_url) VALUES
('b-anjuna-activa', 'o-rhea', 'Anjuna Sunset Scooty', 'scooter', 'Honda', 'Activa 125', 2023, 125, 'Automatic', '52 km/l', 399, 65, 2000, 1, 1, 'Anjuna', 32, 12, 1.2, 4.8, 187, 340,
 'The go-to beach hopper for Anjuna. Under-seat storage for two helmets, USB charging, and a matte-sand finish that hides the beach dust. Easy to park at Curlies and the flea market.',
 JSON_ARRAY('Valid two-wheeler licence required','Return with the same fuel level','No riding on beaches or off-road','Late return charged per hour'),
 JSON_ARRAY('Helmets x2','Phone mount','USB charging','Under-seat storage','Rain poncho'),
 JSON_ARRAY(),
 1, DATE_SUB(CURDATE(), INTERVAL 90 DAY), 0, '/bikes/anjuna-sunset-scooty.svg',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Honda_Activa_Rental-_Goa_6.jpg/1280px-Honda_Activa_Rental-_Goa_6.jpg'),

('b-baga-classic', 'o-rhea', 'Baga Beach Classic 350', 'cruiser', 'Royal Enfield', 'Classic 350', 2022, 349, 'Manual', '35 km/l', 649, 110, 3000, 1, 0, 'Baga', 30, 20, 2.8, 4.9, 254, 412,
 'The iconic thumper, tuned for lazy beach runs and sunset rides along Baga–Calangute. Jawan brown with chrome accents, twin exhaust note you will hear for a week.',
 JSON_ARRAY('Gear-shift bike — manual riders only','Valid licence + security deposit on card','Fuel: return as received','Free helmet + riding gloves included'),
 JSON_ARRAY('Chrome mirrors','Touring seat','Toolkit','Riding gloves'),
 JSON_ARRAY(),
 1, DATE_SUB(CURDATE(), INTERVAL 120 DAY), 1, '/bikes/baga-classic-350.svg',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Royal_Enfield_Classic_350_2010_Model.jpg/1280px-Royal_Enfield_Classic_350_2010_Model.jpg'),

('b-candolim-rc390', 'o-vikram', 'Candolim Rocket 390', 'sports', 'KTM', 'RC 390', 2024, 373, 'Manual', '26 km/l', 899, 150, 5000, 1, 1, 'Candolim', 34, 28, 4.1, 4.7, 96, 87,
 'Track-bred corner-carver for riders who want the ghats to themselves. Quickshifter, slipper clutch, and a bark that turns heads from Candolim to Chorla Ghat.',
 JSON_ARRAY('Minimum 2 years riding experience','Full riding gear provided & mandatory','Deposit refunded on return inspection','No pillion during the first hour'),
 JSON_ARRAY('Full riding gear','Quickshifter','Phone mount','Tyre pressure kit'),
 JSON_ARRAY(DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '%Y-%m-%d'), DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 4 DAY), '%Y-%m-%d')),
 1, DATE_SUB(CURDATE(), INTERVAL 45 DAY), 2, '/bikes/candolim-rc390.svg',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/KTM_RC390_Photo-1449426468159-d96dbf08f19f_2015.jpg/1280px-KTM_RC390_Photo-1449426468159-d96dbf08f19f_2015.jpg'),

('b-vagator-himalayan', 'o-rhea', 'Vagator Adventure 450', 'adventure', 'Royal Enfield', 'Himalayan 450', 2024, 452, 'Manual', '30 km/l', 799, 135, 4000, 1, 1, 'Vagator', 38, 6, 3.4, 4.8, 143, 176,
 'Built for the red laterite trails and jungle roads of interior Goa. Tall suspension, crash guards, and a luggage rack — the full ADV touring setup, highway-ready.',
 JSON_ARRAY('Off-road capable, beach sand still off-limits','Panniers available on request','Fuel policy: full-to-full','Valid licence mandatory'),
 JSON_ARRAY('Crash guards','Luggage rack','Tall windscreen','USB + 12V','Panniers (on request)'),
 JSON_ARRAY(),
 1, DATE_SUB(CURDATE(), INTERVAL 60 DAY), 3, '/bikes/vagator-himalayan-450.svg',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Royal_Enfield_Himalayan_450_Mana_Black.jpg/1280px-Royal_Enfield_Himalayan_450_Mana_Black.jpg'),

('b-palolem-bullet', 'o-ananya', 'Palolem Vintage Bullet 500', 'vintage', 'Royal Enfield', 'Bullet 500', 2013, 499, 'Manual', '28 km/l', 549, 95, 3500, 0, 0, 'Palolem', 40, 86, 38.0, 4.6, 58, 64,
 'A 2013 Bullet with hand-painted tank art and a kick-start ritual that feels like time travel. Slow, loud, and impossibly charming down the South Goa coast road.',
 JSON_ARRAY('No highway speeds — enjoy the scenic route','Kick-start demo provided at handover','Helmet BYO (₹150/day rental available)','Service backup on call across South Goa'),
 JSON_ARRAY('Hand-painted tank','Solo sprung seat','Toolkit pouch','Chrome exhaust'),
 JSON_ARRAY(),
 1, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 4, '/bikes/palolem-bullet-500.svg',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Royal_Enfield_Bullet_500_G5.jpg/1280px-Royal_Enfield_Bullet_500_G5.jpg'),

('b-panjim-ather', 'o-rhea', 'Panjim Ather 450X', 'electric', 'Ather', '450X', 2024, 0, 'Automatic', '105 km/charge', 499, 85, 2500, 1, 0, 'Panjim', 58, 42, 9.6, 4.8, 121, 210,
 'Silent, zippy and ideal for exploring Fontainhas and the Mandovi promenade. 105 km real-world range, fast-charges at the Panjim Ather grid while you have fish curry rice.',
 JSON_ARRAY('Charged to 100% at pickup','Range mode limits top speed to 40 km/h','Return with ≥20% charge','Fast-charge card included'),
 JSON_ARRAY('Fast-charge card','7" dash with maps','Bluetooth speakers','Helmet x2'),
 JSON_ARRAY(),
 1, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 5, '/bikes/panjim-ather-450x.svg',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&h=800&q=80');

-- ------------------------------------------------------------
-- Bookings (Pending / Active / Completed)
-- ------------------------------------------------------------
INSERT INTO bookings (id, bike_id, renter_id, owner_id, status, start_date, end_date, pickup_time, dropoff_time, days, daily_rate, security_deposit, service_fee, helmet_addon, helmet_cost, total, conversation_id, created_at, handover, review) VALUES
('bk-1', 'b-anjuna-activa', 'u-aarav', 'o-rhea', 'Pending',
 DATE_ADD(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), '11:00:00', '19:00:00', 3, 399, 2000, 96, 1, 450, 3743, 'con-1',
 DATE_SUB(NOW(), INTERVAL 1 DAY), NULL, NULL),

('bk-2', 'b-baga-classic', 'u-aarav', 'o-rhea', 'Active',
 DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00', '18:00:00', 5, 649, 3000, 260, 1, 750, 7255, 'con-2',
 DATE_SUB(NOW(), INTERVAL 7 DAY),
 JSON_OBJECT('bodyItems', JSON_ARRAY(
   JSON_OBJECT('label','No new scratches or dents','checked',1),
   JSON_OBJECT('label','Tyres & pressure good','checked',1),
   JSON_OBJECT('label','Brakes & clutch working','checked',1),
   JSON_OBJECT('label','Lights & indicators OK','checked',1),
   JSON_OBJECT('label','Mirrors intact','checked',1)),
   'fuelLevel', 100, 'odometer', 12340, 'photo', 'snap-1', 'signature', 'sig-aarav',
   'at', DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 DAY), '%Y-%m-%dT%H:%i:%s.000Z')),
 NULL),

('bk-3', 'b-vagator-himalayan', 'u-aarav', 'o-rhea', 'Completed',
 DATE_SUB(CURDATE(), INTERVAL 28 DAY), DATE_SUB(CURDATE(), INTERVAL 24 DAY), '09:00:00', '17:00:00', 4, 799, 4000, 256, 0, 0, 7452, 'con-none',
 DATE_SUB(NOW(), INTERVAL 32 DAY), NULL,
 JSON_OBJECT('rating', 5, 'by', 'u-aarav',
   'comment','Smooth ride through the Western Ghats — the Himalayan ate the laterite roads for breakfast. Handover was 10 minutes flat.',
   'at', DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 22 DAY), '%Y-%m-%dT%H:%i:%s.000Z')));

-- ------------------------------------------------------------
-- Conversations + messages
-- ------------------------------------------------------------
INSERT INTO conversations (id, bike_id, booking_id, renter_id, owner_id, unread_renter, unread_owner) VALUES
('con-1', 'b-anjuna-activa', 'bk-1', 'u-aarav', 'o-rhea', 0, 1),
('con-2', 'b-baga-classic',  'bk-2', 'u-aarav', 'o-rhea', 2, 0),
('con-3', 'b-candolim-rc390', NULL,  'u-aarav', 'o-vikram', 1, 0);

INSERT INTO messages (id, conversation_id, from_role, from_id, kind, text, is_read, read_by_other, timestamp) VALUES
-- con-1: booking inquiry for the Activa
('m-1-1', 'con-1', 'renter', 'u-aarav', 'text',
 'Hey! Booking sent for the Activa — 3 days from the 4th. Is pickup at Anjuna beach road okay?', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('m-1-2', 'con-1', 'owner', 'o-rhea', 'text',
 'Got it, Aarav! I usually meet at the St. Michael''s church corner, 100m from your stay. Two helmets + rain poncho will be in the boot. I''ll confirm the booking in a bit 👍', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- con-2: approved Classic 350 rental with handover
('m-2-1', 'con-2', 'system', 'system', 'system',
 'Booking #bk-2 was approved. Rental starts at Baga · 10:00.', 1, 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('m-2-2', 'con-2', 'renter', 'u-aarav', 'text',
 'We''re parked at Britto''s side road, in a white Scorpio.', 1, 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('m-2-3', 'con-2', 'owner', 'o-rhea', 'text',
 'Checklist done — tank full, 12,340 km on the odo. The Classic is fuelled and gloved up. Ride safe! 🏍️', 1, 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('m-2-4', 'con-2', 'renter', 'u-aarav', 'text',
 'Thank you Rhea! The Classic handles the Baga potholes beautifully 😄 If the sunset view at the fort is anything to go by, best decision ever.', 0, 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('m-2-5', 'con-2', 'owner', 'o-rhea', 'location',
 'Shared a pin for the drop-off point', 0, 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- con-3: RC 390 inquiry
('m-3-1', 'con-3', 'renter', 'u-aarav', 'text',
 'Hi Vikram — is the RC 390 free next weekend? Want it for a Chorla Ghat sunrise run.', 1, 1, NOW()),
('m-3-2', 'con-3', 'owner', 'o-vikram', 'text',
 'Yes! Saturday pickup works. Helmet + full gear included. Bring your licence and riding gloves — I''ll have the quickshifter fuelled and ready.', 0, 0, NOW());

-- con-2 location pin metadata (mock stores { label, x, y } on the message)
UPDATE messages SET location = JSON_OBJECT('label', 'Rhea''s Garage · Baga Beach Road', 'x', 46, 'y', 58) WHERE id = 'm-2-5';

-- ------------------------------------------------------------
-- Saved bikes
-- ------------------------------------------------------------
INSERT INTO saved_bikes (user_id, bike_id) VALUES ('u-aarav', 'b-baga-classic');
