export const ROUTES = {
  // Delhi-NCR college corridors
  COLLEGE_CORRIDORS: [
    { pickup: 'ABS', destination: 'Mohan Nagar', fare: { private: 120, shared: 30 } },
    { pickup: 'ABS', destination: 'Lal Kuan', fare: { private: 100, shared: 25 } },
    { pickup: 'ABS', destination: 'Sector 62', fare: { private: 150, shared: 35 } },
    { pickup: 'AKGEC', destination: 'Sector 62', fare: { private: 130, shared: 32 } },
    { pickup: 'Mohan Nagar', destination: 'ABS', fare: { private: 120, shared: 30 } },
    { pickup: 'Sector 62', destination: 'ABS', fare: { private: 150, shared: 35 } },
    { pickup: 'Lal Kuan', destination: 'ABS', fare: { private: 100, shared: 25 } },
    { pickup: 'Sector 62', destination: 'AKGEC', fare: { private: 130, shared: 32 } },
    { pickup: 'Vaishali', destination: 'Sector 62', fare: { private: 110, shared: 28 } },
    { pickup: 'Kaushambi', destination: 'ABS', fare: { private: 140, shared: 33 } },
    { pickup: 'Anand Vihar', destination: 'Mohan Nagar', fare: { private: 160, shared: 38 } },
    { pickup: 'Sector 62 Metro', destination: 'ABS', fare: { private: 150, shared: 35 } },
  ],

  POPULAR_LOCATIONS: [
    'ABS College',
    'AKGEC',
    'Mohan Nagar',
    'Lal Kuan',
    'Sector 62',
    'Sector 62 Metro Station',
    'Vaishali',
    'Kaushambi',
    'Anand Vihar',
    'Ghaziabad Railway Station',
    'Indirapuram',
    'Crossing Republik',
  ],

  PLATFORM_FEE_PERCENT: 0.10,

  INCENTIVES: {
    DAILY_RIDE_TARGET: 20,
    DAILY_BONUS_THRESHOLD: 21,
    DAILY_BONUS_PER_RIDE: 15,
    WEEKLY_STREAK_TARGET: 5,
    WEEKLY_STREAK_BONUS: 500,
    PEAK_DEMAND_BONUS: 50,
  },

  VEHICLE_CAPACITY: {
    AUTO: 4,
    E_RICKSHAW: 3,
  },

  CANCELLATION: {
    FREE_WINDOW_MIN: 2,
    CANCELLATION_FEE: 10,
  },
};

export function calculateFare(pickup: string, destination: string, type: 'private' | 'shared'): number {
  const corridor = ROUTES.COLLEGE_CORRIDORS.find(
    (r) =>
      (r.pickup.toLowerCase() === pickup.toLowerCase() &&
        r.destination.toLowerCase() === destination.toLowerCase()) ||
      (r.pickup.toLowerCase() === destination.toLowerCase() &&
        r.destination.toLowerCase() === pickup.toLowerCase())
  );
  if (corridor) return corridor.fare[type];

  // Fallback: estimate by distance
  const baseFare = type === 'private' ? 80 : 20;
  const perKm = type === 'private' ? 12 : 4;
  const estimatedKm = 5 + Math.abs(pickup.length - destination.length) * 2;
  return baseFare + perKm * estimatedKm;
}

export function calculatePlatformFee(fare: number): number {
  return Math.round(fare * ROUTES.PLATFORM_FEE_PERCENT);
}

export function calculateDriverPayout(fare: number): number {
  return fare - calculatePlatformFee(fare);
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount)}`;
}
