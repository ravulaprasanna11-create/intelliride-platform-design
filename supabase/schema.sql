-- ==============================================================================
-- IntelliRide PostgreSQL Schema & Row Level Security (RLS) for Supabase
-- ==============================================================================

-- 1. Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. ORGANIZATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. PROFILES TABLE (Linked to auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('employee', 'driver', 'admin')) DEFAULT 'employee',
    avatar_url TEXT,
    org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. COMMUTE PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.commute_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    home_address TEXT NOT NULL,
    office_address TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    return_time TEXT NOT NULL,
    schedule_days TEXT[] DEFAULT '{"M", "T", "W", "T", "F"}'::TEXT[],
    pickup_preference TEXT DEFAULT 'Nearby landmark',
    commute_role TEXT NOT NULL CHECK (commute_role IN ('passenger', 'driver', 'either')) DEFAULT 'passenger',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. VEHICLES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    color TEXT NOT NULL,
    license_plate TEXT NOT NULL UNIQUE,
    vehicle_type TEXT DEFAULT 'Sedan',
    total_seats INTEGER NOT NULL DEFAULT 4,
    available_seats INTEGER NOT NULL DEFAULT 2,
    has_ac BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 6. RIDES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    pickup_location TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    eta TEXT NOT NULL,
    total_cost INTEGER NOT NULL DEFAULT 300,
    price_per_passenger INTEGER NOT NULL DEFAULT 100,
    seats_available INTEGER NOT NULL DEFAULT 2,
    status TEXT NOT NULL CHECK (status IN ('requested', 'accepted', 'confirmed', 'started', 'completed', 'cancelled')) DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 7. RIDE MEMBERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ride_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pickup_location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(ride_id, user_id)
);

-- ==============================================================================
-- 8. RIDE REQUESTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ride_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pickup_location TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 9. NOTIFICATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'general',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 10. PAYMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('pending', 'due', 'processing', 'paid', 'failed')) DEFAULT 'due',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 11. AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT;
BEGIN
    -- Public signup only allows 'employee' or 'driver'. Admin is restricted.
    assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'employee');
    IF assigned_role NOT IN ('employee', 'driver') THEN
        assigned_role := 'employee';
    END IF;

    INSERT INTO public.profiles (id, name, email, phone, role, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'name',
            NEW.phone,
            split_part(NEW.email, '@', 1),
            'User'
        ),
        NEW.email,
        NEW.phone,
        assigned_role,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        name = EXCLUDED.name,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        role = CASE
            WHEN public.profiles.role = 'admin' THEN 'admin'
            ELSE EXCLUDED.role
        END,
        updated_at = timezone('utc'::text, now());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commute_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view all company profiles for matching"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- ORGANIZATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Authenticated users can view organizations"
    ON public.organizations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage organizations"
    ON public.organizations FOR ALL
    TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- COMMUTE PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view commute profiles for route matching"
    ON public.commute_profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own commute profile"
    ON public.commute_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own commute profile"
    ON public.commute_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- VEHICLES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view vehicles for ride booking"
    ON public.vehicles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Drivers can manage their own vehicles"
    ON public.vehicles FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RIDES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view available rides"
    ON public.rides FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Drivers can manage their own rides"
    ON public.rides FOR ALL
    TO authenticated
    USING (auth.uid() = driver_id)
    WITH CHECK (auth.uid() = driver_id);

-- ------------------------------------------------------------------------------
-- RIDE MEMBERS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Ride members and drivers can view membership"
    ON public.ride_members FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id OR
        EXISTS (SELECT 1 FROM public.rides WHERE rides.id = ride_members.ride_id AND rides.driver_id = auth.uid())
    );

CREATE POLICY "Users can join rides"
    ON public.ride_members FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members and drivers can update membership status"
    ON public.ride_members FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = user_id OR
        EXISTS (SELECT 1 FROM public.rides WHERE rides.id = ride_members.ride_id AND rides.driver_id = auth.uid())
    );

-- ------------------------------------------------------------------------------
-- RIDE REQUESTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users and drivers can view relevant requests"
    ON public.ride_requests FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id OR
        EXISTS (SELECT 1 FROM public.rides WHERE rides.id = ride_requests.ride_id AND rides.driver_id = auth.uid())
    );

CREATE POLICY "Users can submit ride requests"
    ON public.ride_requests FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Drivers and requesters can update ride requests"
    ON public.ride_requests FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = user_id OR
        EXISTS (SELECT 1 FROM public.rides WHERE rides.id = ride_requests.ride_id AND rides.driver_id = auth.uid())
    );

-- ------------------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- PAYMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Passengers and drivers can view their payment records"
    ON public.payments FOR SELECT
    TO authenticated
    USING (auth.uid() = passenger_id OR auth.uid() = driver_id OR public.is_admin());

CREATE POLICY "Passengers can update payment records"
    ON public.payments FOR UPDATE
    TO authenticated
    USING (auth.uid() = passenger_id OR public.is_admin())
    WITH CHECK (auth.uid() = passenger_id OR public.is_admin());

CREATE POLICY "System/Drivers can create payment records"
    ON public.payments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = driver_id OR auth.uid() = passenger_id OR public.is_admin());
