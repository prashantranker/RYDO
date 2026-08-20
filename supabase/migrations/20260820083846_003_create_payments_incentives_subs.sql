/*
# RYDO Payments, Incentives, Subscriptions, Demand Data, Ratings

## Summary
Creates the remaining tables: payments, incentives, subscriptions, demand_data, ratings, and driver_documents.
These support the full platform: payment tracking, driver incentive system, passenger commute subscriptions,
demand forecasting data, ride ratings, and secure driver KYC document references.

## New Tables

### payments
- Tracks each payment: ride_id, passenger_id, amount, platform_fee, driver_payout, payment_status, payment_method.

### incentives
- Driver incentive records: incentive_type (daily_rides, peak_demand, weekly_streak), amount, criteria, status.

### subscriptions
- Passenger daily/weekly commute subscriptions: route, schedule (days of week), active status.

### demand_data
- Aggregated demand per route/timestamp for forecasting and heatmap.

### ratings
- Ride ratings: passenger rates driver, driver rates passenger. 1-5 stars + optional feedback.

### driver_documents
- Secure references to KYC documents with Supabase Storage paths and access control.

## Security
- RLS enabled on all tables with appropriate ownership checks.
*/

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  ride_id uuid REFERENCES rides(id) ON DELETE SET NULL,
  passenger_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  platform_fee numeric DEFAULT 0,
  driver_payout numeric DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  payment_method text DEFAULT 'upi' CHECK (payment_method IN ('upi', 'cash', 'wallet', 'razorpay')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_payments" ON payments;
CREATE POLICY "select_payments" ON payments FOR SELECT
  TO authenticated USING (
    passenger_id = auth.uid()
    OR (driver_id IS NOT NULL AND EXISTS (SELECT 1 FROM drivers WHERE drivers.id = payments.driver_id AND drivers.user_id = auth.uid()))
  );

DROP POLICY IF EXISTS "insert_own_payments" ON payments;
CREATE POLICY "insert_own_payments" ON payments FOR INSERT
  TO authenticated WITH CHECK (passenger_id = auth.uid());

DROP POLICY IF EXISTS "update_own_payments" ON payments;
CREATE POLICY "update_own_payments" ON payments FOR UPDATE
  TO authenticated USING (
    passenger_id = auth.uid()
    OR (driver_id IS NOT NULL AND EXISTS (SELECT 1 FROM drivers WHERE drivers.id = payments.driver_id AND drivers.user_id = auth.uid()))
  ) WITH CHECK (
    passenger_id = auth.uid()
    OR (driver_id IS NOT NULL AND EXISTS (SELECT 1 FROM drivers WHERE drivers.id = payments.driver_id AND drivers.user_id = auth.uid()))
  );

-- Incentives table
CREATE TABLE IF NOT EXISTS incentives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  incentive_type text NOT NULL CHECK (incentive_type IN ('daily_rides', 'peak_demand', 'weekly_streak')),
  amount numeric NOT NULL DEFAULT 0,
  criteria text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'earned', 'paid', 'expired')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE incentives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_incentives" ON incentives;
CREATE POLICY "select_incentives" ON incentives FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = incentives.driver_id AND drivers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_incentives" ON incentives;
CREATE POLICY "insert_own_incentives" ON incentives FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = incentives.driver_id AND drivers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_incentives" ON incentives;
CREATE POLICY "update_own_incentives" ON incentives FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = incentives.driver_id AND drivers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = incentives.driver_id AND drivers.user_id = auth.uid())
  );

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  pickup_name text NOT NULL DEFAULT '',
  destination_name text NOT NULL DEFAULT '',
  route_name text NOT NULL DEFAULT '',
  days_of_week int[] NOT NULL DEFAULT ARRAY[1,2,3,4,5],
  departure_time time NOT NULL DEFAULT '09:00',
  commute_type text DEFAULT 'shared' CHECK (commute_type IN ('private', 'shared')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscriptions" ON subscriptions;
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (passenger_id = auth.uid());

DROP POLICY IF EXISTS "insert_own_subscriptions" ON subscriptions;
CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (passenger_id = auth.uid());

DROP POLICY IF EXISTS "update_own_subscriptions" ON subscriptions;
CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE
  TO authenticated USING (passenger_id = auth.uid()) WITH CHECK (passenger_id = auth.uid());

DROP POLICY IF EXISTS "delete_own_subscriptions" ON subscriptions;
CREATE POLICY "delete_own_subscriptions" ON subscriptions FOR DELETE
  TO authenticated USING (passenger_id = auth.uid());

-- Demand data table
CREATE TABLE IF NOT EXISTS demand_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name text NOT NULL DEFAULT '',
  pickup_name text NOT NULL DEFAULT '',
  destination_name text NOT NULL DEFAULT '',
  timestamp timestamptz NOT NULL DEFAULT now(),
  expected_demand int DEFAULT 0,
  actual_demand int DEFAULT 0,
  available_drivers int DEFAULT 0,
  required_drivers int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE demand_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_demand_data" ON demand_data;
CREATE POLICY "select_demand_data" ON demand_data FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_demand_data" ON demand_data;
CREATE POLICY "insert_demand_data" ON demand_data FOR INSERT
  TO authenticated WITH CHECK (true);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  rater_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  ratee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rater_role text NOT NULL CHECK (rater_role IN ('passenger', 'driver')),
  stars int NOT NULL CHECK (stars >= 1 AND stars <= 5),
  feedback text DEFAULT '',
  feedback_categories text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_ratings" ON ratings;
CREATE POLICY "select_ratings" ON ratings FOR SELECT
  TO authenticated USING (
    rater_id = auth.uid() OR ratee_id = auth.uid()
  );

DROP POLICY IF EXISTS "insert_own_ratings" ON ratings;
CREATE POLICY "insert_own_ratings" ON ratings FOR INSERT
  TO authenticated WITH CHECK (rater_id = auth.uid());

-- Driver documents table (secure KYC document references)
CREATE TABLE IF NOT EXISTS driver_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('aadhaar', 'licence', 'rc', 'vehicle_photo', 'bank_proof', 'profile_photo')),
  storage_path text NOT NULL DEFAULT '',
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON driver_documents;
CREATE POLICY "select_own_documents" ON driver_documents FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = driver_documents.driver_id AND drivers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_documents" ON driver_documents;
CREATE POLICY "insert_own_documents" ON driver_documents FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = driver_documents.driver_id AND drivers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_documents" ON driver_documents;
CREATE POLICY "update_own_documents" ON driver_documents FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = driver_documents.driver_id AND drivers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = driver_documents.driver_id AND drivers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_documents" ON driver_documents;
CREATE POLICY "delete_own_documents" ON driver_documents FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = driver_documents.driver_id AND drivers.user_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_passenger_id ON payments(passenger_id);
CREATE INDEX IF NOT EXISTS idx_payments_ride_id ON payments(ride_id);
CREATE INDEX IF NOT EXISTS idx_incentives_driver_id ON incentives(driver_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_passenger_id ON subscriptions(passenger_id);
CREATE INDEX IF NOT EXISTS idx_demand_data_route ON demand_data(route_name);
CREATE INDEX IF NOT EXISTS idx_demand_data_timestamp ON demand_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_ratings_ride_id ON ratings(ride_id);
CREATE INDEX IF NOT EXISTS idx_ratings_ratee_id ON ratings(ratee_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON driver_documents(driver_id);
