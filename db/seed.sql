-- RenTell Seed Data
-- Test password for all users: password123
-- Hash below is bcrypt(password123, rounds=10)

-- ============================================================
-- 1. Users (1 student, 1 host)
-- ============================================================
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, is_host, student_number, course, year_level, hometown)
VALUES
  ('student@rentell.test', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Juan', 'dela Cruz', '09171234567', false,
   '2021-12345', 'BS Computer Science', 3, 'Cebu City'),

  ('host@rentell.test', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Maria', 'Santos', '09281234567', true,
   NULL, NULL, NULL, 'Mandaue City');

-- ============================================================
-- 2. Amenity catalog
-- ============================================================
INSERT INTO amenity (name, description)
VALUES
  ('WiFi',           'Wireless internet connection'),
  ('AC',             'Air conditioning'),
  ('Water',          'Running water 24/7'),
  ('Parking',        'Motorcycle or bicycle parking'),
  ('CCTV',          'Security cameras on premises'),
  ('Laundry',        'In-unit or shared washing machine'),
  ('Kitchen',        'Shared kitchen access'),
  ('Security Guard', '24/7 security personnel');

-- ============================================================
-- 3. Housing (3 listings owned by host)
-- ============================================================
INSERT INTO housing (owner_id, name, housing_type, address, latitude, longitude,
                     monthly_price_min, monthly_price_max, contact_person,
                     contact_number, proximity_to_campus_km, description)
VALUES
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Santos Dormitory',
    'dormitory',
    '12 Gorordo Ave, Lahug, Cebu City',
    10.325600, 123.906700,
    2500.00, 4500.00,
    'Maria Santos', '09281234567', 0.8,
    'A well-maintained dormitory close to the main campus. All rooms come with WiFi and 24/7 water supply. Curfew at 10PM.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Ramos Boarding House',
    'boarding_house',
    '45 Leon Kilat St, Cebu City',
    10.296800, 123.898900,
    1500.00, 3000.00,
    'Maria Santos', '09281234567', 1.5,
    'Affordable boarding house with shared kitchen and laundry. Walking distance to jeepney routes. Good for students on a budget.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Cebu Student Apartments',
    'apartment',
    '88 Pope John Paul II Ave, Mabolo, Cebu City',
    10.318400, 123.912300,
    5000.00, 8000.00,
    'Maria Santos', '09281234567', 2.1,
    'Modern studio and one-bedroom apartments with full amenities. Ideal for upperclassmen or graduate students who prefer privacy.'
  );

-- ============================================================
-- 4. Rooms
-- ============================================================

-- Santos Dormitory rooms
INSERT INTO room (housing_id, room_number, room_type, capacity, available_slots, monthly_price)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'), '101', 'shared',    4, 2, 2500.00),
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'), '102', 'shared',    4, 0, 2500.00),
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'), '201', 'private',   1, 1, 4500.00),
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'), '202', 'bedspacer', 6, 3, 1800.00);

-- Ramos Boarding House rooms
INSERT INTO room (housing_id, room_number, room_type, capacity, available_slots, monthly_price)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Ramos Boarding House'), 'A', 'shared',    2, 1, 1500.00),
  ((SELECT housing_id FROM housing WHERE name = 'Ramos Boarding House'), 'B', 'shared',    2, 2, 1500.00),
  ((SELECT housing_id FROM housing WHERE name = 'Ramos Boarding House'), 'C', 'private',   1, 0, 3000.00);

-- Cebu Student Apartments rooms
INSERT INTO room (housing_id, room_number, room_type, capacity, available_slots, monthly_price)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Cebu Student Apartments'), 'Studio 1', 'private', 1, 1, 5000.00),
  ((SELECT housing_id FROM housing WHERE name = 'Cebu Student Apartments'), 'Studio 2', 'private', 1, 1, 5000.00),
  ((SELECT housing_id FROM housing WHERE name = 'Cebu Student Apartments'), '1BR-A',    'private', 2, 1, 8000.00);

-- ============================================================
-- 5. Housing amenities
-- ============================================================
INSERT INTO housing_amenity (housing_id, amenity_name)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'),       'WiFi'),
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'),       'Water'),
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'),       'CCTV'),
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'),       'Security Guard'),

  ((SELECT housing_id FROM housing WHERE name = 'Ramos Boarding House'),   'WiFi'),
  ((SELECT housing_id FROM housing WHERE name = 'Ramos Boarding House'),   'Water'),
  ((SELECT housing_id FROM housing WHERE name = 'Ramos Boarding House'),   'Kitchen'),
  ((SELECT housing_id FROM housing WHERE name = 'Ramos Boarding House'),   'Laundry'),

  ((SELECT housing_id FROM housing WHERE name = 'Cebu Student Apartments'),'WiFi'),
  ((SELECT housing_id FROM housing WHERE name = 'Cebu Student Apartments'),'AC'),
  ((SELECT housing_id FROM housing WHERE name = 'Cebu Student Apartments'),'Water'),
  ((SELECT housing_id FROM housing WHERE name = 'Cebu Student Apartments'),'Parking'),
  ((SELECT housing_id FROM housing WHERE name = 'Cebu Student Apartments'),'CCTV');

-- ============================================================
-- 6. Housing images
-- ============================================================
INSERT INTO housing_image (housing_id, url, caption, is_primary, sort_order)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'),
   'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 'Front entrance', true, 0),
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'),
   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 'Common area', false, 1),

  ((SELECT housing_id FROM housing WHERE name = 'Ramos Boarding House'),
   'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'Exterior', true, 0),

  ((SELECT housing_id FROM housing WHERE name = 'Cebu Student Apartments'),
   'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'Studio interior', true, 0),
  ((SELECT housing_id FROM housing WHERE name = 'Cebu Student Apartments'),
   'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'Building facade', false, 1);

-- ============================================================
-- 7. Carinderias
-- ============================================================
INSERT INTO carinderia (added_by, name, address, latitude, longitude, description)
VALUES
  (
    (SELECT user_id FROM users WHERE email = 'student@rentell.test'),
    'Nanay Linda''s Carinderia',
    '10 Gorordo Ave, Lahug, Cebu City',
    10.325100, 123.906200,
    'Classic Filipino home-cooked meals. Open 6AM–8PM. Budget-friendly rice toppings and soups.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'student@rentell.test'),
    'Mang Tony''s Food House',
    '22 Leon Kilat St, Cebu City',
    10.296500, 123.898600,
    'Popular among students for its affordable combo meals and unlimited rice promo.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Cagayan Eatery',
    '5 Cagayan St, Cebu City',
    10.297200, 123.899100,
    'Serves Cebuano dishes including lechon kawali, puso, and fish tinola. Open daily.'
  );

-- ============================================================
-- 8. Essentials
-- ============================================================
INSERT INTO essential (added_by, name, type, address, latitude, longitude, description)
VALUES
  (
    (SELECT user_id FROM users WHERE email = 'student@rentell.test'),
    'Quick Wash Laundry',
    'laundry',
    '8 Gorordo Ave, Lahug, Cebu City',
    10.325300, 123.906500,
    'Self-service and drop-off laundry. ₱35/kg. Open 7AM–9PM.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'student@rentell.test'),
    'Mercury Drug - Gorordo',
    'pharmacy',
    '20 Gorordo Ave, Lahug, Cebu City',
    10.325800, 123.907100,
    '24-hour pharmacy with complete OTC and prescription medicines.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'BDO ATM - Lahug',
    'atm',
    '15 Archbishop Reyes Ave, Cebu City',
    10.324900, 123.905800,
    'BDO ATM available 24/7. Accepts all major networks.'
  );

-- ============================================================
-- 9. Housing visiting hours (Santos Dormitory)
-- ============================================================
INSERT INTO housing_visiting_hours (housing_id, day_of_week, start_time, end_time)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'), 1, '09:00', '17:00'),
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'), 2, '09:00', '17:00'),
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'), 3, '09:00', '17:00'),
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'), 4, '09:00', '17:00'),
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'), 5, '09:00', '17:00'),
  ((SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'), 6, '10:00', '14:00');

-- ============================================================
-- 10. Nearby links
-- ============================================================
INSERT INTO housing_carinderia (housing_id, carinderia_id, distance_km)
VALUES
  (
    (SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'),
    (SELECT carinderia_id FROM carinderia WHERE name = 'Nanay Linda''s Carinderia'),
    0.1
  ),
  (
    (SELECT housing_id FROM housing WHERE name = 'Ramos Boarding House'),
    (SELECT carinderia_id FROM carinderia WHERE name = 'Mang Tony''s Food House'),
    0.2
  ),
  (
    (SELECT housing_id FROM housing WHERE name = 'Ramos Boarding House'),
    (SELECT carinderia_id FROM carinderia WHERE name = 'Cagayan Eatery'),
    0.3
  );

INSERT INTO housing_essential (housing_id, essential_id, distance_km)
VALUES
  (
    (SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'),
    (SELECT essential_id FROM essential WHERE name = 'Quick Wash Laundry'),
    0.1
  ),
  (
    (SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'),
    (SELECT essential_id FROM essential WHERE name = 'Mercury Drug - Gorordo'),
    0.3
  ),
  (
    (SELECT housing_id FROM housing WHERE name = 'Santos Dormitory'),
    (SELECT essential_id FROM essential WHERE name = 'BDO ATM - Lahug'),
    0.4
  );
