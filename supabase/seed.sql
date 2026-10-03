-- ==============================================================================
-- IntelliRide Sample Seed Data for Supabase Local / Staging
-- ==============================================================================

-- 1. Insert Acme Technologies Organization
INSERT INTO public.organizations (id, name, domain)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acme Technologies', 'acme.com')
ON CONFLICT (domain) DO NOTHING;

-- 2. Seed Sample Rides (if drivers exist)
-- Example placeholder template:
-- INSERT INTO public.rides (driver_id, origin, destination, pickup_location, departure_time, eta, total_cost, price_per_passenger, seats_available, status)
-- VALUES ('<driver-user-id>', 'Kondapur', 'Acme HQ', 'Hitech City Metro', '8:20 AM', '8:48 AM', 300, 100, 2, 'confirmed');
