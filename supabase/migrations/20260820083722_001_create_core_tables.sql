/*
# RYDO Core Schema — Users, Drivers, Vehicles, Locations

## Summary
Creates the foundational tables for RYDO: profiles (extending auth.users), drivers, vehicles, and saved locations.
All tables have RLS enabled with owner-scoped policies for authenticated users.

## New Tables

### profiles
- Extends auth.users with role (passenger/driver/admin), name, phone, email, profile_image, preferred_commute_type.
- One row per authenticated user (id = auth.users.id).

### drivers
- Driver-specific data linked to a user profile: verification_status, licence_status, rating, availability (online/offline), current_mode (private/live_share/scheduled).
- Only users with role='driver' should have a row here.

### vehicles
- Vehicle info for a driver: type (auto/e_rickshaw), registration_number, capacity, verification_status, photo.
- Linked to drivers table via driver_id.

### saved_locations
- Passenger's saved locations (home, work, college, custom) with lat/lng and address.

## Security
- RLS enabled on all tables.
- Profiles: users can read/update their own profile.
- Drivers: users can read/update their own driver record; any authenticated user can read driver info (for ride matching display).
- Vehicles: owner driver can CRUD; any authenticated user can read (for ride display).
- Saved locations: owner-scoped CRUD.
- Admin role noted in profiles for future admin dashboard compatibility.
*/

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'passenger' CHECK (role IN ('passenger', 'driver', 'admin')),
  name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  profile_image text DEFAULT '',
  preferred_commute_type text DEFAULT 'both' CHECK (preferred_commute_type IN ('private', 'shared', 'both')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'active', 'rejected')),
  licence_status text DEFAULT 'not_submitted' CHECK (licence_status IN ('not_submitted', 'pending', 'verified', 'rejected')),
  rating numeric DEFAULT 0,
  total_ratings int DEFAULT 0,
  availability boolean DEFAULT false,
  current_mode text DEFAULT 'private' CHECK (current_mode IN ('private', 'live_share', 'scheduled')),
  upi_id text DEFAULT '',
  bank_account text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read driver info (needed for ride matching/display)
DROP POLICY IF EXISTS "select_drivers" ON drivers;
CREATE POLICY "select_drivers" ON drivers FOR SELECT
  TO authenticated USING (true);

-- Only the driver owner can insert/update their own driver record
DROP POLICY IF EXISTS "insert_own_driver" ON drivers;
CREATE POLICY "insert_own_driver" ON drivers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_driver" ON drivers;
CREATE POLICY "update_own_driver" ON drivers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('auto', 'e_rickshaw')),
  registration_number text NOT NULL DEFAULT '',
  capacity int NOT NULL DEFAULT 4,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  vehicle_photo text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read vehicle info (for ride display)
DROP POLICY IF EXISTS "select_vehicles" ON vehicles;
CREATE POLICY "select_vehicles" ON vehicles FOR SELECT
  TO authenticated USING (true);

-- Only the vehicle's driver owner can insert/update/delete
DROP POLICY IF EXISTS "insert_own_vehicle" ON vehicles;
CREATE POLICY "insert_own_vehicle" ON vehicles FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = vehicles.driver_id AND drivers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_vehicle" ON vehicles;
CREATE POLICY "update_own_vehicle" ON vehicles FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = vehicles.driver_id AND drivers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = vehicles.driver_id AND drivers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_vehicle" ON vehicles;
CREATE POLICY "delete_own_vehicle" ON vehicles FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = vehicles.driver_id AND drivers.user_id = auth.uid())
  );

-- Saved locations table (for passengers)
CREATE TABLE IF NOT EXISTS saved_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'custom' CHECK (label IN ('home', 'work', 'college', 'custom')),
  name text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  lat numeric,
  lng numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_locations" ON saved_locations;
CREATE POLICY "select_own_locations" ON saved_locations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_locations" ON saved_locations;
CREATE POLICY "insert_own_locations" ON saved_locations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_locations" ON saved_locations;
CREATE POLICY "update_own_locations" ON saved_locations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_locations" ON saved_locations;
CREATE POLICY "delete_own_locations" ON saved_locations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_saved_locations_user_id ON saved_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_drivers_updated_at ON drivers;
CREATE TRIGGER trg_drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
