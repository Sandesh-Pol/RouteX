import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MapContainer } from '@/components/maps/MapContainer';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/auth/AuthContext';
import { dataStore } from '@/data/store';
import { dummySocket } from '@/sockets/dummySocket';
import { Parcel, Location } from '@/data/mockData';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/driver', icon: 'fas fa-home' },
  { label: 'Assignments', path: '/driver/assignments', icon: 'fas fa-clipboard-list' },
  { label: 'Navigation', path: '/driver/navigation', icon: 'fas fa-route' },
];

export default function DriverNavigation() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location>({
    lat: 40.7128,
    lng: -74.006,
    address: 'Current Location',
  });
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (user) {
      const userParcels = dataStore.getParcelsByDriver(user.id).filter(p => p.status === 'in-transit');
      setParcels(userParcels);

      // Check for parcel in URL
      const parcelId = searchParams.get('parcel');
      if (parcelId) {
        const parcel = userParcels.find(p => p.id === parcelId);
        if (parcel) {
          setSelectedParcel(parcel);
        }
      } else if (userParcels.length > 0) {
        setSelectedParcel(userParcels[0]);
      }
    }
  }, [user, searchParams]);

  // Simulate GPS movement when navigating
  useEffect(() => {
    if (!isNavigating || !selectedParcel || !user) return;

    dummySocket.startDriverSimulation(
      user.id,
      currentLocation,
      selectedParcel.dropLocation,
      60000
    );

    const handleLocationUpdate = (driverId: string, location: Location) => {
      if (driverId === user.id) {
        setCurrentLocation(location);
      }
    };

    dummySocket.subscribe(user.id, handleLocationUpdate);

    return () => {
      dummySocket.unsubscribe(user.id, handleLocationUpdate);
      dummySocket.stopDriverSimulation(user.id);
    };
  }, [isNavigating, selectedParcel, user]);

  const handleStartNavigation = () => {
    setIsNavigating(true);
  };

  const handleDeliverParcel = () => {
    if (!selectedParcel || !user) return;
    
    dataStore.deliverParcel(selectedParcel.id);
    dummySocket.stopDriverSimulation(user.id);
    setIsNavigating(false);
    
    const updatedParcels = dataStore.getParcelsByDriver(user.id).filter(p => p.status === 'in-transit');
    setParcels(updatedParcels);
    
    if (updatedParcels.length > 0) {
      setSelectedParcel(updatedParcels[0]);
    } else {
      setSelectedParcel(null);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Navigation">
      <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
        {/* Parcel List */}
        <div className="card-elevated overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Active Deliveries</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {parcels.length === 0 ? (
              <div className="p-6 text-center">
                <i className="fas fa-check-double text-2xl text-success mb-2"></i>
                <p className="text-sm text-muted-foreground">All deliveries completed!</p>
              </div>
            ) : (
              parcels.map((parcel) => (
                <button
                  key={parcel.id}
                  onClick={() => {
                    setSelectedParcel(parcel);
                    setIsNavigating(false);
                  }}
                  className={cn(
                    "w-full p-4 text-left border-b border-border transition-colors",
                    selectedParcel?.id === parcel.id
                      ? "bg-accent/10"
                      : "hover:bg-secondary/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      #{parcel.id.slice(-8).toUpperCase()}
                    </span>
                    <StatusBadge status={parcel.status} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {parcel.clientName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    → {parcel.dropLocation.address}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Map & Controls */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {selectedParcel ? (
            <>
              {/* Map */}
              <div className="card-elevated flex-1 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">
                      {isNavigating ? 'Navigating to Destination' : 'Route Preview'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedParcel.dropLocation.address}
                    </p>
                  </div>
                  {isNavigating && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/15 text-accent">
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                      <span className="text-sm font-medium">Live Tracking</span>
                    </div>
                  )}
                </div>
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <MapContainer
                    center={[currentLocation.lat, currentLocation.lng]}
                    zoom={14}
                    markers={[
                      {
                        id: 'driver',
                        position: [currentLocation.lat, currentLocation.lng],
                        type: 'driver',
                        popup: 'Your Location',
                        label: 'You',
                      },
                      {
                        id: 'pickup',
                        position: [selectedParcel.pickupLocation.lat, selectedParcel.pickupLocation.lng],
                        type: 'pickup',
                        popup: `Pickup: ${selectedParcel.pickupLocation.address}`,
                      },
                      {
                        id: 'drop',
                        position: [selectedParcel.dropLocation.lat, selectedParcel.dropLocation.lng],
                        type: 'destination',
                        popup: `Drop: ${selectedParcel.dropLocation.address}`,
                      },
                    ]}
                    showRoute={true}
                    routeStart={[currentLocation.lat, currentLocation.lng]}
                    routeEnd={[selectedParcel.dropLocation.lat, selectedParcel.dropLocation.lng]}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="card-elevated p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{selectedParcel.clientName}</p>
                    <p className="text-sm text-accent">{selectedParcel.contactNumber}</p>
                  </div>

                  <div className="flex gap-2">
                    {!isNavigating ? (
                      <button
                        onClick={handleStartNavigation}
                        className="px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
                      >
                        <i className="fas fa-play"></i>
                        Start Navigation
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsNavigating(false)}
                          className="px-6 py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2"
                        >
                          <i className="fas fa-pause"></i>
                          Pause
                        </button>
                        <button
                          onClick={handleDeliverParcel}
                          className="px-6 py-3 rounded-lg bg-success text-success-foreground font-medium hover:bg-success/90 transition-colors flex items-center gap-2"
                        >
                          <i className="fas fa-check"></i>
                          Mark Delivered
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card-elevated flex-1 flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-route text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground">
                  {parcels.length === 0 
                    ? 'No active deliveries to navigate'
                    : 'Select a delivery to navigate'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
