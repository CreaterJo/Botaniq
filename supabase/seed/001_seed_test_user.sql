-- Test data for development
-- Insert a test user and some favorites

-- Insert test user (UUID: 550e8400-e29b-41d4-a716-446655440000)
INSERT INTO public.user_profiles (id, username, created_at, last_seen)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'gruener-gaertner-42',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Insert test favorites
INSERT INTO public.favorites (user_id, plant_name, plant_id, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Rosa canina', 'rosa-canina-1', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'Lavandula angustifolia', 'lavender-1', now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'Rosmarinus officinalis', 'rosemary-1', now())
ON CONFLICT (user_id, plant_name) DO NOTHING;