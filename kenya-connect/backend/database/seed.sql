INSERT INTO users (id, email, password_hash, role, status, is_email_verified, is_phone_verified)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@kenyaconnect.local', '$2b$12$8CBXHHw.rRekJFVtp6Myj.2dZGVcAK0noXLDPf8mbwaW/fl77SE/W', 'admin', 'active', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000101', 'amani@example.com', '$2b$12$8CBXHHw.rRekJFVtp6Myj.2dZGVcAK0noXLDPf8mbwaW/fl77SE/W', 'user', 'active', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000102', 'brian@example.com', '$2b$12$8CBXHHw.rRekJFVtp6Myj.2dZGVcAK0noXLDPf8mbwaW/fl77SE/W', 'user', 'active', TRUE, FALSE),
  ('00000000-0000-0000-0000-000000000103', 'leila@example.com', '$2b$12$8CBXHHw.rRekJFVtp6Myj.2dZGVcAK0noXLDPf8mbwaW/fl77SE/W', 'user', 'active', TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000104', 'victor@example.com', '$2b$12$8CBXHHw.rRekJFVtp6Myj.2dZGVcAK0noXLDPf8mbwaW/fl77SE/W', 'user', 'active', TRUE, TRUE)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  is_email_verified = EXCLUDED.is_email_verified,
  is_phone_verified = EXCLUDED.is_phone_verified;

INSERT INTO profiles (
  id, user_id, display_name, bio, gender, age, town, occupation, education,
  relationship_goal, interests, profile_completion, verification_badge,
  popularity_score, activity_score, last_active_at
)
VALUES
  ('10000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000101', 'Amani', 'Creative, warm, and intentional. Looking for mature conversations and real chemistry.', 'woman', 26, 'Nairobi', 'Designer', 'University', 'Long-term dating', ARRAY['coffee', 'art', 'road trips'], 96, 'full', 88, 91, NOW() - INTERVAL '20 minutes'),
  ('10000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000102', 'Brian', 'Direct, respectful, and clear about boundaries. Casual but kind.', 'man', 31, 'Thika', 'Fitness coach', 'College', 'Casual connection', ARRAY['music', 'gym', 'privacy'], 84, 'email', 74, 80, NOW() - INTERVAL '1 hour'),
  ('10000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000103', 'Leila', 'Easygoing and curious. I like beach walks, great food, and people who keep their word.', 'woman', 24, 'Mombasa', 'Hospitality', 'College', 'Long-term dating', ARRAY['beach', 'food', 'kindness'], 90, 'phone', 82, 73, NOW() - INTERVAL '3 hours'),
  ('10000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000104', 'Victor', 'Established, calm, and social. Interested in mature dating with honesty and dignity.', 'man', 49, 'Kiambu', 'Business owner', 'University', 'Mature dating', ARRAY['travel', 'jazz', 'conversation'], 98, 'full', 94, 88, NOW() - INTERVAL '15 minutes')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO photos (user_id, profile_id, image_url, public_id, moderation_status, is_primary)
VALUES
  ('00000000-0000-0000-0000-000000000101', '10000000-0000-0000-0000-000000000101', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1100&q=80', 'seed/amani', 'approved', TRUE),
  ('00000000-0000-0000-0000-000000000102', '10000000-0000-0000-0000-000000000102', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1100&q=80', 'seed/brian', 'approved', TRUE),
  ('00000000-0000-0000-0000-000000000103', '10000000-0000-0000-0000-000000000103', 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=1100&q=80', 'seed/leila', 'approved', TRUE),
  ('00000000-0000-0000-0000-000000000104', '10000000-0000-0000-0000-000000000104', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1100&q=80', 'seed/victor', 'approved', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO subscriptions (user_id, plan, status)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'premium', 'active'),
  ('00000000-0000-0000-0000-000000000102', 'free', 'active'),
  ('00000000-0000-0000-0000-000000000103', 'free', 'active'),
  ('00000000-0000-0000-0000-000000000104', 'premium', 'active')
ON CONFLICT DO NOTHING;

-- Sample password for all seeded accounts: Password123!
