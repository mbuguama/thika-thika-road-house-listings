INSERT INTO users (full_name, email, password_hash, phone, role)
VALUES
  ('Admin User', 'admin@thikahousehunter.local', crypt('Password123!', gen_salt('bf')), '+254700000001', 'admin'),
  ('Daniel Kariuki', 'landlord@thikahousehunter.local', crypt('Password123!', gen_salt('bf')), '+254700000002', 'landlord'),
  ('Jane Mwangi', 'renter@thikahousehunter.local', crypt('Password123!', gen_salt('bf')), '+254700000003', 'renter')
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    updated_at = NOW();

INSERT INTO estates (name, description, city, latitude, longitude)
VALUES
  ('Thika Town', 'Central Thika with easy access to shops, schools, banks, and matatus.', 'Thika', -1.0333000, 37.0693000),
  ('Makongeni', 'Budget-friendly estates with local markets and quick access to Thika town.', 'Thika', -1.0500000, 37.1000000),
  ('Kenyatta Estate', 'Quiet residential area near shops and commuter routes.', 'Thika', -1.0429000, 37.0813000),
  ('Section 9', 'Central residential pocket close to Thika CBD services and stages.', 'Thika', -1.0365000, 37.0618000),
  ('Landless', 'Practical residential area toward Garissa Road with local shops and stages.', 'Thika', -1.0520000, 37.1160000),
  ('Ngoingwa', 'Quieter family estates with good links back into Thika town.', 'Thika', -1.0180000, 37.0840000),
  ('Jomoko', 'Growing residential zone around Gatitu and Jomoko with affordable rentals.', 'Thika', -1.0105000, 37.1035000),
  ('Juja', 'Student and commuter market around JKUAT with direct Thika Road access.', 'Juja', -1.1018000, 37.0144000),
  ('Ruiru', 'Large commuter hub with estates, malls, and direct superhighway access.', 'Ruiru', -1.1467000, 36.9617000),
  ('TRM / Roysambu', 'Urban apartment market near TRM, Kasarani, USIU, and Thika Road.', 'Nairobi', -1.2180000, 36.8870000),
  ('Garden City', 'Premium Thika Road location near Garden City Mall and major offices.', 'Nairobi', -1.2325000, 36.8782000),
  ('Kenyatta Road / Theta', 'Fast-growing family-home corridor between Juja, Ruiru, and Thika.', 'Kiambu', -1.1080000, 37.1010000),
  ('Runda-Thika', 'Emerging residential pocket north of Thika with quieter family homes.', 'Thika', -1.0020000, 37.0800000),
  ('Green Valley', 'Leafy estate with gated apartments and family homes.', 'Thika', -1.0217000, 37.0870000)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    city = EXCLUDED.city,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

INSERT INTO property_types (label, value, sort_order)
VALUES
  ('Apartment', 'apartment', 10),
  ('House', 'house', 20),
  ('Studio', 'studio', 30),
  ('Bedsitter', 'bedsitter', 40),
  ('Single room', 'single-room', 50)
ON CONFLICT (value) DO UPDATE
SET label = EXCLUDED.label,
    sort_order = EXCLUDED.sort_order,
    active = TRUE,
    updated_at = NOW();

INSERT INTO budget_ranges (label, value, min_price, max_price, sort_order)
VALUES
  ('Under KES 20,000', 'under-20000', 0, 19999, 10),
  ('KES 20,000 - 40,000', '20000-40000', 20000, 40000, 20),
  ('KES 40,000+', '40000-plus', 40001, NULL, 30)
ON CONFLICT (value) DO UPDATE
SET label = EXCLUDED.label,
    min_price = EXCLUDED.min_price,
    max_price = EXCLUDED.max_price,
    sort_order = EXCLUDED.sort_order,
    active = TRUE,
    updated_at = NOW();

INSERT INTO properties (
  landlord_id, estate_id, title, description, property_type, price, bedrooms,
  bathrooms, size_sqft, location, address, city, latitude, longitude, amenities,
  image_url, status, is_verified
)
SELECT
  u.id,
  e.id,
  '3BR Family House',
  'Spacious verified family house with a private compound, secure parking, and quick access to Thika town centre.',
  'house',
  35000,
  3,
  2,
  1450,
  'Thika Town',
  'Section 9, Thika Town',
  'Thika',
  -1.0333000,
  37.0693000,
  '["Furnished", "Parking", "Water storage", "Secure compound"]'::jsonb,
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
  'active',
  TRUE
FROM users u, estates e
WHERE u.email = 'landlord@thikahousehunter.local'
  AND e.name = 'Thika Town'
  AND NOT EXISTS (SELECT 1 FROM properties WHERE title = '3BR Family House');

INSERT INTO properties (
  landlord_id, estate_id, title, description, property_type, price, bedrooms,
  bathrooms, size_sqft, location, address, city, latitude, longitude, amenities,
  image_url, status, is_verified
)
SELECT
  u.id,
  e.id,
  'Studio Apartment',
  'Compact studio close to shops and public transport, ideal for students and young professionals.',
  'studio',
  12000,
  1,
  1,
  430,
  'Kenyatta Estate',
  'Kenyatta Estate Road',
  'Thika',
  -1.0429000,
  37.0813000,
  '["Near shops", "Prepaid electricity", "Tiled floors"]'::jsonb,
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  'active',
  TRUE
FROM users u, estates e
WHERE u.email = 'landlord@thikahousehunter.local'
  AND e.name = 'Kenyatta Estate'
  AND NOT EXISTS (SELECT 1 FROM properties WHERE title = 'Studio Apartment');

INSERT INTO properties (
  landlord_id, estate_id, title, description, property_type, price, bedrooms,
  bathrooms, size_sqft, location, address, city, latitude, longitude, amenities,
  image_url, status, is_verified
)
SELECT
  u.id,
  e.id,
  '2BR Green Valley Apartment',
  'Modern apartment in a secure block with balcony, borehole water, and dedicated parking.',
  'apartment',
  25000,
  2,
  2,
  880,
  'Green Valley',
  'Green Valley Estate',
  'Thika',
  -1.0217000,
  37.0870000,
  '["Secure", "Balcony", "Parking", "Borehole"]'::jsonb,
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80',
  'active',
  TRUE
FROM users u, estates e
WHERE u.email = 'landlord@thikahousehunter.local'
  AND e.name = 'Green Valley'
  AND NOT EXISTS (SELECT 1 FROM properties WHERE title = '2BR Green Valley Apartment');

INSERT INTO properties (
  landlord_id, estate_id, title, description, property_type, price, bedrooms,
  bathrooms, size_sqft, location, address, city, latitude, longitude, amenities,
  image_url, status, is_verified
)
SELECT
  u.id,
  e.id,
  'Executive 4BR Maisonette',
  'Large family maisonette with DSQ, garden, perimeter wall, and quick highway access.',
  'house',
  55000,
  4,
  3,
  2100,
  'Green Valley',
  'Green Valley Drive',
  'Thika',
  -1.0224000,
  37.0887000,
  '["Garden", "DSQ", "Parking", "Secure compound", "Water storage"]'::jsonb,
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
  'active',
  TRUE
FROM users u, estates e
WHERE u.email = 'landlord@thikahousehunter.local'
  AND e.name = 'Green Valley'
  AND NOT EXISTS (SELECT 1 FROM properties WHERE title = 'Executive 4BR Maisonette');

INSERT INTO property_images (property_id, image_url, caption, is_primary, sort_order)
SELECT p.id, p.image_url, p.title, TRUE, 0
FROM properties p
WHERE p.image_url IS NOT NULL
  AND NOT EXISTS (
  SELECT 1 FROM property_images pi WHERE pi.property_id = p.id AND pi.image_url = p.image_url
);

INSERT INTO favorites (user_id, property_id)
SELECT u.id, p.id
FROM users u, properties p
WHERE u.email = 'renter@thikahousehunter.local'
  AND p.title IN ('3BR Family House', 'Studio Apartment')
ON CONFLICT (user_id, property_id) DO NOTHING;

INSERT INTO reviews (property_id, user_id, rating, comment)
SELECT p.id, u.id, 5, 'Clean listing, clear location, and the landlord responded quickly.'
FROM properties p, users u
WHERE p.title = '3BR Family House'
  AND u.email = 'renter@thikahousehunter.local'
ON CONFLICT (property_id, user_id) DO UPDATE
SET rating = EXCLUDED.rating,
    comment = EXCLUDED.comment,
    updated_at = NOW();

INSERT INTO bookings (property_id, renter_id, viewing_date, message, status)
SELECT p.id, u.id, NOW() + INTERVAL '2 days', 'I would like to view this house in the afternoon.', 'pending'
FROM properties p, users u
WHERE p.title = '3BR Family House'
  AND u.email = 'renter@thikahousehunter.local'
  AND NOT EXISTS (
    SELECT 1 FROM bookings b WHERE b.property_id = p.id AND b.renter_id = u.id
  );
