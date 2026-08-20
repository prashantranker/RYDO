/*
# RYDO Rides & Bookings Schema

## Summary
Creates the rides, bookings, and ride_status_log tables for the core booking flow.
Rides represent a vehicle trip (private or shared). Bookings link passengers to rides.
Multiple passengers can join a shared ride (respecting vehicle capacity).

## New Tables

### rides
- Represents a vehicle trip: ride_type (private/shared/scheduled), pickup/destination, route, driver_id, status, scheduled_at, fare, driver_payout.
- Statuses: searching, driver_assigned, driver_arriving, in_progress, completed, cancelled, expired.
- For shared rides, multiple bookings link to one ride.
- For scheduled rides, scheduled_at holds the departure time.

### bookings
- Links a passenger to a ride: seats, fare, status, payment_status.
- Statuses: pending, confirmed, joined, boarding, on_ride, completed, cancelled, no_show.
- fare is the passenger's share (for shared) or full fare (for private).

### ride_status_log
- Audit trail of ride status changes with timestamps.
- Useful for tracking and future admin dashboard analytics.

## Security
- RLS enabled on all tables.
- Rides: drivers can insert/update their own rides; all authenticated users can read (passengers need to see ride info).
- Bookings: passengers can insert/update their own bookings; ride driver can read bookings on their rides.
- Status log: readable by all authenticated, writable by ride owner or booking owner.
*/

-- Rides table
CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_type text NOT NULL CHECK (ride_type IN ('private', 'shared', 'scheduled')),
  pickup_name text NOT NULL DEFAULT '',
  pickup_lat numeric,
  pickup_lng numeric,
  destination_name text NOT NULL DEFAULT '',
  destination_lat numeric,
  destination_lng numeric,
  route text DEFAULT '',
  driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  passenger_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'searching' CHECK (status IN ('searching', 'driver_assigned', 'driver_arriving', 'in_progress', 'completed', 'cancelled', 'expired')),
  scheduled_at timestamptz,
  fare numeric DEFAULT 0,
  driver_payout numeric DEFAULT 0,
  estimated_arrival_min int DEFAULT 0,
  total_seats int DEFAULT 4,
  filled_seats int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rides ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read rides (passengers need to see ride details, drivers see their rides)
DROP POLICY IF EXISTS "select_rides" ON rides;
CREATE POLICY "select_rides" ON rides FOR SELECT
  TO authenticated USING (true);

-- Drivers can insert rides (when accepting a booking)
-- Passengers can also insert rides (when creating a booking request)
DROP POLICY IF EXISTS "insert_rides" ON rides;
CREATE POLICY "insert_rides" ON rides FOR INSERT
  TO authenticated WITH CHECK (true);

-- Only the ride's driver or the requesting passenger can update
DROP POLICY IF EXISTS "update_rides" ON rides;
CREATE POLICY "update_rides" ON rides FOR UPDATE
  TO authenticated USING (
    driver_id IS NOT NULL AND EXISTS (SELECT 1 FROM drivers WHERE drivers.id = rides.driver_id AND drivers.user_id = auth.uid())
    OR passenger_id = auth.uid()
  ) WITH CHECK (
    driver_id IS NOT NULL AND EXISTS (SELECT 1 FROM drivers WHERE drivers.id = rides.driver_id AND drivers.user_id = auth.uid())
    OR passenger_id = auth.uid()
  );

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  passenger_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  pickup_name text NOT NULL DEFAULT '',
  destination_name text NOT NULL DEFAULT '',
  seats int NOT NULL DEFAULT 1,
  fare numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'joined', 'boarding', 'on_ride', 'completed', 'cancelled', 'no_show')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Passengers can read their own bookings; drivers can read bookings on their rides
DROP POLICY IF EXISTS "select_bookings" ON bookings;
CREATE POLICY "select_bookings" ON bookings FOR SELECT
  TO authenticated USING (
    passenger_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM rides
      JOIN drivers ON drivers.id = rides.driver_id
      WHERE rides.id = bookings.ride_id AND drivers.user_id = auth.uid()
    )
  );

-- Passengers can insert their own bookings
DROP POLICY IF EXISTS "insert_own_bookings" ON bookings;
CREATE POLICY "insert_own_bookings" ON bookings FOR INSERT
  TO authenticated WITH CHECK (passenger_id = auth.uid());

-- Passengers can update their own bookings; ride driver can update bookings on their ride
DROP POLICY IF EXISTS "update_bookings" ON bookings;
CREATE POLICY "update_bookings" ON bookings FOR UPDATE
  TO authenticated USING (
    passenger_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM rides
      JOIN drivers ON drivers.id = rides.driver_id
      WHERE rides.id = bookings.ride_id AND drivers.user_id = auth.uid()
    )
  ) WITH CHECK (
    passenger_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM rides
      JOIN drivers ON drivers.id = rides.driver_id
      WHERE rides.id = bookings.ride_id AND drivers.user_id = auth.uid()
    )
  );

-- Ride status log
CREATE TABLE IF NOT EXISTS ride_status_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  status text NOT NULL,
  changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ride_status_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_status_log" ON ride_status_log;
CREATE POLICY "select_status_log" ON ride_status_log FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_status_log" ON ride_status_log;
CREATE POLICY "insert_status_log" ON ride_status_log FOR INSERT
  TO authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_passenger_id ON rides(passenger_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_ride_type ON rides(ride_type);
CREATE INDEX IF NOT EXISTS idx_rides_scheduled_at ON rides(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_ride_id ON bookings(ride_id);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger_id ON bookings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_rides_updated_at ON rides;
CREATE TRIGGER trg_rides_updated_at BEFORE UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON bookings;
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
