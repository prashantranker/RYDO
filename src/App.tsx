import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/Logo';
import { BottomNav } from '@/components/BottomNav';
import { SplashScreen } from '@/screens/SplashScreen';
import { Onboarding } from '@/screens/Onboarding';
import { RoleSelection } from '@/screens/RoleSelection';
import { AuthScreen } from '@/screens/AuthScreen';
import { PassengerSetup } from '@/screens/PassengerSetup';
import { DriverSetup, DriverVerificationStatus } from '@/screens/DriverSetup';
import { PassengerHome } from '@/screens/passenger/PassengerHome';
import { PassengerRides } from '@/screens/passenger/PassengerRides';
import { PassengerSchedule } from '@/screens/passenger/PassengerSchedule';
import { PassengerWallet } from '@/screens/passenger/PassengerWallet';
import { PassengerProfile } from '@/screens/passenger/PassengerProfile';
import { PrivateBooking } from '@/screens/passenger/PrivateBooking';
import { SharedBooking } from '@/screens/passenger/SharedBooking';
import { ScheduleConfirmation } from '@/screens/passenger/ScheduleConfirmation';
import { DriverHome } from '@/screens/driver/DriverHome';
import { DriverRides } from '@/screens/driver/DriverRides';
import { DriverEarnings } from '@/screens/driver/DriverEarnings';
import { DriverDemand } from '@/screens/driver/DriverDemand';
import { DriverProfile } from '@/screens/driver/DriverProfile';
import type { UserRole, DriverMode } from '@/types';

type Screen =
  | 'splash'
  | 'onboarding'
  | 'role'
  | 'auth'
  | 'passenger-setup'
  | 'driver-setup'
  | 'driver-pending'
  | 'passenger-app'
  | 'driver-app'
  | 'private-booking'
  | 'shared-booking'
  | 'schedule-confirmation';

interface BookingData {
  pickup: string;
  destination: string;
}

interface ScheduleData {
  pickup: string;
  destination: string;
  date: string;
  time: string;
}

function AppContent() {
  const { session, profile, driver, loading, refreshProfile } = useAuth();
  const [screen, setScreen] = useState<Screen>('splash');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [passengerTab, setPassengerTab] = useState('home');
  const [driverTab, setDriverTab] = useState('home');
  const [bookingData, setBookingData] = useState<BookingData>({ pickup: '', destination: '' });
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  // Handle splash transition
  useEffect(() => {
    if (screen === 'splash') return;
  }, [screen]);

  // Handle auth state
  useEffect(() => {
    if (loading) return;

    if (session && profile) {
      // User is logged in
      if (profile.role === 'driver') {
        if (driver && (driver.verification_status === 'verified' || driver.verification_status === 'active')) {
          setScreen('driver-app');
        } else if (driver && (driver.verification_status === 'pending' || driver.verification_status === 'under_review' || driver.verification_status === 'rejected')) {
          // Check if driver has completed setup (has vehicle)
          setScreen('driver-pending');
        } else {
          setScreen('driver-setup');
        }
      } else if (profile.role === 'passenger') {
        // Check if passenger has completed setup
        if (needsSetup) {
          setScreen('passenger-setup');
        } else {
          setScreen('passenger-app');
        }
      }
    } else if (!session && screen !== 'splash' && screen !== 'onboarding' && screen !== 'role' && screen !== 'auth') {
      setScreen('onboarding');
    }
  }, [session, profile, driver, loading, needsSetup]);

  // Splash screen
  if (screen === 'splash') {
    return <SplashScreen onDone={() => setScreen('onboarding')} />;
  }

  // Onboarding
  if (screen === 'onboarding') {
    return <Onboarding onComplete={() => setScreen('role')} />;
  }

  // Role selection
  if (screen === 'role') {
    return (
      <RoleSelection
        selectedRole={selectedRole}
        onSelectRole={(role) => setSelectedRole(role)}
        onContinue={() => setScreen('auth')}
      />
    );
  }

  // Auth
  if (screen === 'auth') {
    return (
      <AuthScreen
        role={(selectedRole === 'driver' ? 'driver' : 'passenger')}
        onBack={() => setScreen('role')}
      />
    );
  }

  // Passenger setup
  if (screen === 'passenger-setup') {
    return <PassengerSetup onDone={() => { setNeedsSetup(false); setScreen('passenger-app'); }} />;
  }

  // Driver setup
  if (screen === 'driver-setup') {
    return <DriverSetup onDone={() => setScreen('driver-pending')} />;
  }

  // Driver pending verification
  if (screen === 'driver-pending' && driver) {
    return (
      <DriverVerificationStatus
        status={driver.verification_status}
        onContinue={() => setScreen('driver-app')}
      />
    );
  }

  // Private booking flow
  if (screen === 'private-booking') {
    return (
      <PrivateBooking
        pickup={bookingData.pickup}
        destination={bookingData.destination}
        onBack={() => setScreen('passenger-app')}
        onComplete={() => { setPassengerTab('rides'); setScreen('passenger-app'); }}
      />
    );
  }

  // Shared booking flow
  if (screen === 'shared-booking') {
    return (
      <SharedBooking
        pickup={bookingData.pickup}
        destination={bookingData.destination}
        onBack={() => setScreen('passenger-app')}
        onComplete={() => { setPassengerTab('rides'); setScreen('passenger-app'); }}
      />
    );
  }

  // Schedule confirmation
  if (screen === 'schedule-confirmation' && scheduleData) {
    return (
      <ScheduleConfirmation
        pickup={scheduleData.pickup}
        destination={scheduleData.destination}
        date={scheduleData.date}
        time={scheduleData.time}
        onDone={() => { setScheduleData(null); setPassengerTab('rides'); setScreen('passenger-app'); }}
        onSubscribe={() => {
          // Create subscription
          if (profile && scheduleData) {
            supabase.from('subscriptions').insert({
              passenger_id: profile.id,
              pickup_name: scheduleData.pickup,
              destination_name: scheduleData.destination,
              route_name: `${scheduleData.pickup} → ${scheduleData.destination}`,
              days_of_week: [1, 2, 3, 4, 5],
              departure_time: scheduleData.time,
              commute_type: 'shared',
              active: true,
            });
          }
          setScheduleData(null);
          setPassengerTab('rides');
          setScreen('passenger-app');
        }}
      />
    );
  }

  // Passenger app
  if (screen === 'passenger-app' && profile) {
    return (
      <div className="screen-container">
        {passengerTab === 'home' && (
          <PassengerHome
            onBookPrivate={(pickup, destination) => {
              setBookingData({ pickup, destination });
              setScreen('private-booking');
            }}
            onBookShared={(pickup, destination) => {
              setBookingData({ pickup, destination });
              setScreen('shared-booking');
            }}
            onSchedule={(data) => {
              setScheduleData(data);
              setScreen('schedule-confirmation');
            }}
          />
        )}
        {passengerTab === 'rides' && <PassengerRides />}
        {passengerTab === 'schedule' && (
          <PassengerSchedule
            onSchedule={(data) => {
              setScheduleData(data);
              setScreen('schedule-confirmation');
            }}
          />
        )}
        {passengerTab === 'wallet' && <PassengerWallet />}
        {passengerTab === 'profile' && <PassengerProfile />}

        <BottomNav active={passengerTab} onChange={setPassengerTab} role="passenger" />
      </div>
    );
  }

  // Driver app
  if (screen === 'driver-app' && profile && driver) {
    const handleModeChange = async (mode: DriverMode) => {
      await supabase.from('drivers').update({ current_mode: mode }).eq('id', driver.id);
      await refreshProfile();
    };

    const handleGoOnline = async () => {
      await supabase.from('drivers').update({ availability: !driver.availability }).eq('id', driver.id);
      await refreshProfile();
    };

    return (
      <div className="screen-container">
        {driverTab === 'home' && <DriverHome onModeChange={handleModeChange} onGoOnline={handleGoOnline} />}
        {driverTab === 'rides' && <DriverRides />}
        {driverTab === 'earnings' && <DriverEarnings />}
        {driverTab === 'demand' && <DriverDemand />}
        {driverTab === 'profile' && <DriverProfile />}
        <BottomNav active={driverTab} onChange={setDriverTab} role="driver" />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="screen-container flex flex-col items-center justify-center bg-white">
        <Logo size="lg" showText />
        <div className="mt-8 w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Default fallback to onboarding
  return <Onboarding onComplete={() => setScreen('role')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
