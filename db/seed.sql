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
INSERT INTO amenity (name)
VALUES
  ('WiFi'),
  ('AC'),
  ('Water'),
  ('Parking'),
  ('CCTV'),
  ('Laundry'),
  ('Kitchen'),
  ('Security Guard');

-- ============================================================
-- 3. Housing (3 listings owned by host)
-- ============================================================
INSERT INTO housing (owner_id, name, housing_type, address, latitude, longitude,
                     monthly_price_min, monthly_price_max, contact_person,
                     contact_number, description)
VALUES
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Santos Dormitory',
    'dormitory',
    '12 Gorordo Ave, Lahug, Cebu City',
    10.325600, 123.906700,
    2500.00, 4500.00,
    'Maria Santos', '09281234567',
    'A well-maintained dormitory close to the main campus. All rooms come with WiFi and 24/7 water supply. Curfew at 10PM.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Ramos Boarding House',
    'boarding_house',
    '45 Leon Kilat St, Cebu City',
    10.296800, 123.898900,
    1500.00, 3000.00,
    'Maria Santos', '09281234567',
    'Affordable boarding house with shared kitchen and laundry. Walking distance to jeepney routes. Good for students on a budget.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Cebu Student Apartments',
    'apartment',
    '88 Pope John Paul II Ave, Mabolo, Cebu City',
    10.318400, 123.912300,
    5000.00, 8000.00,
    'Maria Santos', '09281234567',
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
INSERT INTO essential (added_by, name, type, address, latitude, longitude)
VALUES
  (
    (SELECT user_id FROM users WHERE email = 'student@rentell.test'),
    'Quick Wash Laundry',
    'laundry',
    '8 Gorordo Ave, Lahug, Cebu City',
    10.325300, 123.906500
  ),
  (
    (SELECT user_id FROM users WHERE email = 'student@rentell.test'),
    'Mercury Drug - Gorordo',
    'pharmacy',
    '20 Gorordo Ave, Lahug, Cebu City',
    10.325800, 123.907100
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'BDO ATM - Lahug',
    'atm',
    '15 Archbishop Reyes Ave, Cebu City',
    10.324900, 123.905800
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

-- ============================================================
-- 11. Additional Housing Listings (8 more)
-- ============================================================
INSERT INTO housing (owner_id, name, housing_type, address, latitude, longitude,
                     monthly_price_min, monthly_price_max, contact_person,
                     contact_number, description)
VALUES
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Lopez Dormitory',
    'dormitory',
    '33 V. Rama Ave, Cebu City',
    10.321500, 123.903200,
    2000.00, 3500.00,
    'Maria Santos', '09281234567',
    'Quiet and well-secured dormitory with separate male and female floors. Water and electricity included in monthly rate. Curfew at 10PM on weekdays.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Fuente Boarding House',
    'boarding_house',
    '7 Fuente Osmeña, Cebu City',
    10.315200, 123.892400,
    1800.00, 2800.00,
    'Maria Santos', '09281234567',
    'Centrally located near Fuente Osmeña circle. Common kitchen available. Near public transport routes. Ideal for students with classes in different campuses.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Osmeña Apartments',
    'apartment',
    '14 Capitol Site, Cebu City',
    10.310800, 123.895600,
    4500.00, 7000.00,
    'Maria Santos', '09281234567',
    'Newly renovated studio and one-bedroom units. Each unit has its own comfort room and kitchenette. AC included. Gated compound with parking.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Velez Dormitory',
    'dormitory',
    '3 F. Ramos St, Cebu City',
    10.323800, 123.908900,
    2200.00, 4000.00,
    'Maria Santos', '09281234567',
    'Safe and affordable dorm just minutes from campus. CCTV-monitored common areas. Accepts both male and female tenants on separate floors. WiFi included.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Barrio Luz Rooms',
    'boarding_house',
    '20 Barrio Luz, Cebu City',
    10.307400, 123.901200,
    1500.00, 2500.00,
    'Maria Santos', '09281234567',
    'Budget-friendly rooms in a quiet residential neighborhood. Shared kitchen and bathroom. Close to the public market for affordable grocery runs.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Lahug View Suites',
    'apartment',
    '55 Salinas Drive, Lahug, Cebu City',
    10.328900, 123.909500,
    6000.00, 9000.00,
    'Maria Santos', '09281234567',
    'Premium furnished suites with city view. Full AC, fast fiber WiFi, and covered parking. Pet-friendly upon request. Suitable for grad students and young professionals.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Sinulog Student Residence',
    'dormitory',
    '18 M.J. Cuenco Ave, Cebu City',
    10.319600, 123.904100,
    2800.00, 4200.00,
    'Maria Santos', '09281234567',
    'Well-established student dorm with a strong community culture. Monthly meetings, curfew strictly enforced. Common study area and TV lounge on each floor.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Budget Corner Boardinghouse',
    'other',
    '4 Urgello St, Cebu City',
    10.322100, 123.907800,
    1200.00, 2000.00,
    'Maria Santos', '09281234567',
    'Most affordable option near campus. Bedspacer and shared rooms available. Basic amenities included. Perfect for students on the tightest budget. No curfew.'
  );

-- ============================================================
-- 12. Rooms for new housing
-- ============================================================

-- Lopez Dormitory
INSERT INTO room (housing_id, room_number, room_type, capacity, available_slots, monthly_price)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Lopez Dormitory'), '101', 'shared',    4, 3, 2000.00),
  ((SELECT housing_id FROM housing WHERE name = 'Lopez Dormitory'), '102', 'shared',    4, 2, 2000.00),
  ((SELECT housing_id FROM housing WHERE name = 'Lopez Dormitory'), '201', 'private',   1, 1, 3500.00),
  ((SELECT housing_id FROM housing WHERE name = 'Lopez Dormitory'), '202', 'bedspacer', 8, 5, 1500.00);

-- Fuente Boarding House
INSERT INTO room (housing_id, room_number, room_type, capacity, available_slots, monthly_price)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Fuente Boarding House'), 'A', 'shared',  2, 2, 1800.00),
  ((SELECT housing_id FROM housing WHERE name = 'Fuente Boarding House'), 'B', 'shared',  3, 1, 1800.00),
  ((SELECT housing_id FROM housing WHERE name = 'Fuente Boarding House'), 'C', 'private', 1, 1, 2800.00);

-- Osmeña Apartments
INSERT INTO room (housing_id, room_number, room_type, capacity, available_slots, monthly_price)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Osmeña Apartments'), 'Studio A', 'private', 1, 1, 4500.00),
  ((SELECT housing_id FROM housing WHERE name = 'Osmeña Apartments'), 'Studio B', 'private', 1, 0, 4500.00),
  ((SELECT housing_id FROM housing WHERE name = 'Osmeña Apartments'), '1BR-1',    'private', 2, 1, 7000.00);

-- Velez Dormitory
INSERT INTO room (housing_id, room_number, room_type, capacity, available_slots, monthly_price)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Velez Dormitory'), '101', 'shared',    4, 4, 2200.00),
  ((SELECT housing_id FROM housing WHERE name = 'Velez Dormitory'), '102', 'bedspacer', 6, 3, 1800.00),
  ((SELECT housing_id FROM housing WHERE name = 'Velez Dormitory'), '201', 'private',   1, 0, 4000.00);

-- Barrio Luz Rooms
INSERT INTO room (housing_id, room_number, room_type, capacity, available_slots, monthly_price)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Barrio Luz Rooms'), '1', 'shared',    2, 1, 1500.00),
  ((SELECT housing_id FROM housing WHERE name = 'Barrio Luz Rooms'), '2', 'shared',    2, 2, 1500.00),
  ((SELECT housing_id FROM housing WHERE name = 'Barrio Luz Rooms'), '3', 'bedspacer', 4, 0, 1200.00);

-- Lahug View Suites
INSERT INTO room (housing_id, room_number, room_type, capacity, available_slots, monthly_price)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Lahug View Suites'), 'Suite 1',   'private', 2, 1, 6000.00),
  ((SELECT housing_id FROM housing WHERE name = 'Lahug View Suites'), 'Suite 2',   'private', 2, 2, 6000.00),
  ((SELECT housing_id FROM housing WHERE name = 'Lahug View Suites'), 'Penthouse', 'private', 2, 1, 9000.00);

-- Sinulog Student Residence
INSERT INTO room (housing_id, room_number, room_type, capacity, available_slots, monthly_price)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Sinulog Student Residence'), '101', 'shared',  4, 2, 2800.00),
  ((SELECT housing_id FROM housing WHERE name = 'Sinulog Student Residence'), '102', 'shared',  4, 4, 2800.00),
  ((SELECT housing_id FROM housing WHERE name = 'Sinulog Student Residence'), '201', 'private', 1, 1, 4200.00);

-- Budget Corner Boardinghouse
INSERT INTO room (housing_id, room_number, room_type, capacity, available_slots, monthly_price)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Budget Corner Boardinghouse'), 'A', 'bedspacer', 8, 6, 1200.00),
  ((SELECT housing_id FROM housing WHERE name = 'Budget Corner Boardinghouse'), 'B', 'shared',    2, 1, 2000.00),
  ((SELECT housing_id FROM housing WHERE name = 'Budget Corner Boardinghouse'), 'C', 'shared',    2, 0, 2000.00);

-- ============================================================
-- 13. Amenities for new housing
-- ============================================================
INSERT INTO housing_amenity (housing_id, amenity_name)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Lopez Dormitory'), 'WiFi'),
  ((SELECT housing_id FROM housing WHERE name = 'Lopez Dormitory'), 'Water'),
  ((SELECT housing_id FROM housing WHERE name = 'Lopez Dormitory'), 'CCTV'),
  ((SELECT housing_id FROM housing WHERE name = 'Lopez Dormitory'), 'Security Guard'),
  ((SELECT housing_id FROM housing WHERE name = 'Lopez Dormitory'), 'Laundry'),

  ((SELECT housing_id FROM housing WHERE name = 'Fuente Boarding House'), 'WiFi'),
  ((SELECT housing_id FROM housing WHERE name = 'Fuente Boarding House'), 'Water'),
  ((SELECT housing_id FROM housing WHERE name = 'Fuente Boarding House'), 'Kitchen'),
  ((SELECT housing_id FROM housing WHERE name = 'Fuente Boarding House'), 'Laundry'),

  ((SELECT housing_id FROM housing WHERE name = 'Osmeña Apartments'), 'WiFi'),
  ((SELECT housing_id FROM housing WHERE name = 'Osmeña Apartments'), 'AC'),
  ((SELECT housing_id FROM housing WHERE name = 'Osmeña Apartments'), 'Water'),
  ((SELECT housing_id FROM housing WHERE name = 'Osmeña Apartments'), 'Parking'),
  ((SELECT housing_id FROM housing WHERE name = 'Osmeña Apartments'), 'CCTV'),

  ((SELECT housing_id FROM housing WHERE name = 'Velez Dormitory'), 'WiFi'),
  ((SELECT housing_id FROM housing WHERE name = 'Velez Dormitory'), 'Water'),
  ((SELECT housing_id FROM housing WHERE name = 'Velez Dormitory'), 'CCTV'),
  ((SELECT housing_id FROM housing WHERE name = 'Velez Dormitory'), 'Security Guard'),

  ((SELECT housing_id FROM housing WHERE name = 'Barrio Luz Rooms'), 'WiFi'),
  ((SELECT housing_id FROM housing WHERE name = 'Barrio Luz Rooms'), 'Water'),
  ((SELECT housing_id FROM housing WHERE name = 'Barrio Luz Rooms'), 'Kitchen'),

  ((SELECT housing_id FROM housing WHERE name = 'Lahug View Suites'), 'WiFi'),
  ((SELECT housing_id FROM housing WHERE name = 'Lahug View Suites'), 'AC'),
  ((SELECT housing_id FROM housing WHERE name = 'Lahug View Suites'), 'Water'),
  ((SELECT housing_id FROM housing WHERE name = 'Lahug View Suites'), 'Parking'),
  ((SELECT housing_id FROM housing WHERE name = 'Lahug View Suites'), 'CCTV'),
  ((SELECT housing_id FROM housing WHERE name = 'Lahug View Suites'), 'Laundry'),

  ((SELECT housing_id FROM housing WHERE name = 'Sinulog Student Residence'), 'WiFi'),
  ((SELECT housing_id FROM housing WHERE name = 'Sinulog Student Residence'), 'Water'),
  ((SELECT housing_id FROM housing WHERE name = 'Sinulog Student Residence'), 'Security Guard'),
  ((SELECT housing_id FROM housing WHERE name = 'Sinulog Student Residence'), 'CCTV'),

  ((SELECT housing_id FROM housing WHERE name = 'Budget Corner Boardinghouse'), 'WiFi'),
  ((SELECT housing_id FROM housing WHERE name = 'Budget Corner Boardinghouse'), 'Water');

-- ============================================================
-- 14. Images for new housing
-- ============================================================
INSERT INTO housing_image (housing_id, url, caption, is_primary, sort_order)
VALUES
  ((SELECT housing_id FROM housing WHERE name = 'Lopez Dormitory'),
   'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800', 'Dormitory exterior', true, 0),
  ((SELECT housing_id FROM housing WHERE name = 'Lopez Dormitory'),
   'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 'Shared room', false, 1),

  ((SELECT housing_id FROM housing WHERE name = 'Fuente Boarding House'),
   'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800', 'Room interior', true, 0),

  ((SELECT housing_id FROM housing WHERE name = 'Osmeña Apartments'),
   'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'Studio apartment', true, 0),
  ((SELECT housing_id FROM housing WHERE name = 'Osmeña Apartments'),
   'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800', 'Bedroom area', false, 1),

  ((SELECT housing_id FROM housing WHERE name = 'Velez Dormitory'),
   'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', 'Dormitory building', true, 0),

  ((SELECT housing_id FROM housing WHERE name = 'Barrio Luz Rooms'),
   'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800', 'Boarding house exterior', true, 0),

  ((SELECT housing_id FROM housing WHERE name = 'Lahug View Suites'),
   'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', 'Suite interior', true, 0),
  ((SELECT housing_id FROM housing WHERE name = 'Lahug View Suites'),
   'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'City view suite', false, 1),

  ((SELECT housing_id FROM housing WHERE name = 'Sinulog Student Residence'),
   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 'Study common area', true, 0),

  ((SELECT housing_id FROM housing WHERE name = 'Budget Corner Boardinghouse'),
   'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'Entrance', true, 0);

-- ============================================================
-- 15. Additional Carinderias (8 more)
-- ============================================================
INSERT INTO carinderia (added_by, name, address, latitude, longitude, description)
VALUES
  (
    (SELECT user_id FROM users WHERE email = 'student@rentell.test'),
    'Aling Nena''s Kitchen',
    '15 V. Rama Ave, Cebu City',
    10.321200, 123.903000,
    'Home-style Cebuano cooking with fresh ingredients daily. Known for their sinigang and kare-kare. Very affordable — most meals under ₱60.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'student@rentell.test'),
    'Kuya Ben''s Turo-Turo',
    '8 Fuente Osmeña, Cebu City',
    10.315000, 123.892200,
    'Classic turo-turo style with rotating daily specials. Always has rice, viand, and soup combos. Open from 6AM to 3PM only — come early!'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Bisaya Canteen',
    '10 F. Ramos St, Cebu City',
    10.323600, 123.908700,
    'Traditional Bisayan dishes including paklay, pochero, and kinilaw. Popular among locals and students alike. Open for lunch and dinner.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'student@rentell.test'),
    'Mama Saling''s Lutuan',
    '25 Barrio Luz, Cebu City',
    10.307200, 123.901000,
    'Homemade comfort food served by Mama Saling herself. Generous portions at student prices. Lechon kawali is their bestseller every Friday.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'student@rentell.test'),
    'Kanto Eatery',
    '2 Urgello St, Cebu City',
    10.322000, 123.907600,
    'Quick bites at the corner. Serves puso (hanging rice), barbecue, and street food. Perfect for grab-and-go between classes.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Budget Bites Cebu',
    '40 Salinas Drive, Lahug, Cebu City',
    10.328700, 123.909300,
    'Affordable eat-all-you-can rice with a changing daily viand menu. Very popular with engineering and nursing students. Friendly staff.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'student@rentell.test'),
    'Visayan Home Cooking',
    '12 M.J. Cuenco Ave, Cebu City',
    10.319400, 123.903900,
    'Run by a retired teacher who cooks everything fresh each morning. Known for bulalo on Saturdays and arroz caldo on rainy days.'
  ),
  (
    (SELECT user_id FROM users WHERE email = 'host@rentell.test'),
    'Gabay Student Canteen',
    '5 Archbishop Reyes Ave, Cebu City',
    10.324800, 123.905600,
    'Established canteen catering specifically to students. Offers weekly combo meal cards for extra savings. Has vegetarian options. Open Mon–Sat.'
  );

-- ============================================================
-- 16. Carinderia images (existing 3 + new 8)
-- ============================================================
INSERT INTO carinderia_image (carinderia_id, url, caption, is_primary)
VALUES
  -- Existing carinderias (no images before)
  ((SELECT carinderia_id FROM carinderia WHERE name = 'Nanay Linda''s Carinderia'),
   'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', 'Daily menu spread', true),

  ((SELECT carinderia_id FROM carinderia WHERE name = 'Mang Tony''s Food House'),
   'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800', 'Combo meal lineup', true),

  ((SELECT carinderia_id FROM carinderia WHERE name = 'Cagayan Eatery'),
   'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800', 'Cebuano dishes', true),

  -- New carinderias
  ((SELECT carinderia_id FROM carinderia WHERE name = 'Aling Nena''s Kitchen'),
   'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800', 'Home-cooked meals', true),

  ((SELECT carinderia_id FROM carinderia WHERE name = 'Kuya Ben''s Turo-Turo'),
   'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', 'Daily specials', true),

  ((SELECT carinderia_id FROM carinderia WHERE name = 'Bisaya Canteen'),
   'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800', 'Bisayan dishes', true),

  ((SELECT carinderia_id FROM carinderia WHERE name = 'Mama Saling''s Lutuan'),
   'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800', 'Comfort food', true),

  ((SELECT carinderia_id FROM carinderia WHERE name = 'Kanto Eatery'),
   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', 'Street food stall', true),

  ((SELECT carinderia_id FROM carinderia WHERE name = 'Budget Bites Cebu'),
   'https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=800', 'Unlimited rice meals', true),

  ((SELECT carinderia_id FROM carinderia WHERE name = 'Visayan Home Cooking'),
   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'Home cooking', true),

  ((SELECT carinderia_id FROM carinderia WHERE name = 'Gabay Student Canteen'),
   'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800', 'Canteen meals', true);
