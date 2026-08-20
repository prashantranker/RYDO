export type UserRole = 'passenger' | 'driver' | 'admin';

export type PreferredCommute = 'private' | 'shared' | 'both';

export type VerificationStatus = 'pending' | 'under_review' | 'verified' | 'active' | 'rejected';

export type DriverMode = 'private' | 'live_share' | 'scheduled';

export type RideType = 'private' | 'shared' | 'scheduled';

export type RideStatus =
  | 'searching'
  | 'driver_assigned'
  | 'driver_arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'joined'
  | 'boarding'
  | 'on_ride'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type PaymentMethod = 'upi' | 'cash' | 'wallet' | 'razorpay';

export type IncentiveType = 'daily_rides' | 'peak_demand' | 'weekly_streak';
export type IncentiveStatus = 'pending' | 'earned' | 'paid' | 'expired';

export type VehicleType = 'auto' | 'e_rickshaw';

export type DocumentType =
  | 'aadhaar'
  | 'licence'
  | 'rc'
  | 'vehicle_photo'
  | 'bank_proof'
  | 'profile_photo';

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  email: string;
  profile_image: string;
  preferred_commute_type: PreferredCommute;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  user_id: string;
  verification_status: VerificationStatus;
  licence_status: string;
  rating: number;
  total_ratings: number;
  availability: boolean;
  current_mode: DriverMode;
  upi_id: string;
  bank_account: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  driver_id: string;
  type: VehicleType;
  registration_number: string;
  capacity: number;
  verification_status: string;
  vehicle_photo: string;
  created_at: string;
}

export interface SavedLocation {
  id: string;
  user_id: string;
  label: 'home' | 'work' | 'college' | 'custom';
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface Ride {
  id: string;
  ride_type: RideType;
  pickup_name: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  destination_name: string;
  destination_lat: number | null;
  destination_lng: number | null;
  route: string;
  driver_id: string | null;
  passenger_id: string | null;
  status: RideStatus;
  scheduled_at: string | null;
  fare: number;
  driver_payout: number;
  estimated_arrival_min: number;
  total_seats: number;
  filled_seats: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  ride_id: string;
  passenger_id: string;
  pickup_name: string;
  destination_name: string;
  seats: number;
  fare: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string | null;
  ride_id: string | null;
  passenger_id: string;
  driver_id: string | null;
  amount: number;
  platform_fee: number;
  driver_payout: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  created_at: string;
}

export interface Incentive {
  id: string;
  driver_id: string;
  incentive_type: IncentiveType;
  amount: number;
  criteria: string;
  status: IncentiveStatus;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Subscription {
  id: string;
  passenger_id: string;
  pickup_name: string;
  destination_name: string;
  route_name: string;
  days_of_week: number[];
  departure_time: string;
  commute_type: 'private' | 'shared';
  active: boolean;
  created_at: string;
}

export interface DemandData {
  id: string;
  route_name: string;
  pickup_name: string;
  destination_name: string;
  timestamp: string;
  expected_demand: number;
  actual_demand: number;
  available_drivers: number;
  required_drivers: number;
  created_at: string;
}

export interface Rating {
  id: string;
  ride_id: string;
  booking_id: string | null;
  rater_id: string;
  ratee_id: string;
  rater_role: 'passenger' | 'driver';
  stars: number;
  feedback: string;
  feedback_categories: string[];
  created_at: string;
}

export interface DriverDocument {
  id: string;
  driver_id: string;
  document_type: DocumentType;
  storage_path: string;
  verification_status: string;
  created_at: string;
}
