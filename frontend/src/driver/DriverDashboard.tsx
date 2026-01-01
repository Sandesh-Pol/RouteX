import { useState, useEffect } from 'react';
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

export default function DriverDashboard() {
  const { user } = useAuth();
  const [assignedParcels, setAssignedParcels] = useState<Parcel[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location>({
    lat: 40.7128,
    lng: -74.006,
    address: 'Current Location',
  });

  useEffect(() => {
    if (user) {
      setAssignedParcels(dataStore.getParcelsByDriver(user.id));
    }
  }, [user]);

  // Simulate current location updates
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const newLocation: Location = {
        lat: currentLocation.lat + (Math.random() - 0.5) * 0.001,
        lng: currentLocation.lng + (Math.random() - 0.5) * 0.001,
        address: 'Current Location',
      };
      setCurrentLocation(newLocation);
      dataStore.updateDriverLocation(user.id, newLocation);
      dummySocket.updateDriverLocation(user.id, newLocation);
    }, 5000);

    return () => clearInterval(interval);
  }, [user, currentLocation]);

  const activeParcels = assignedParcels.filter(p => p.status === 'in-transit');
  const completedParcels = assignedParcels.filter(p => p.status === 'delivered');

  const handleDeliverParcel = (parcelId: string) => {
    dataStore.deliverParcel(parcelId);
    if (user) {
      setAssignedParcels(dataStore.getParcelsByDriver(user.id));
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Driver Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">
          Hey, {user?.name?.split(' ')[0]}! 🚚
        </h2>
        <p className="text-muted-foreground mt-1">
          Here's your delivery overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active', value: activeParcels.length, icon: 'fa-truck', color: 'accent' },
          { label: 'Completed', value: completedParcels.length, icon: 'fa-check-double', color: 'success' },
          { label: 'Total', value: assignedParcels.length, icon: 'fa-box', color: 'primary' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-elevated p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}/15 flex items-center justify-center`}>
                <i className={`fas ${stat.icon} text-${stat.color}`}></i>
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Deliveries */}
        <div className="card-elevated">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Active Deliveries</h3>
          </div>
          <div className="divide-y divide-border">
            {activeParcels.length === 0 ? (
              <div className="p-8 text-center">
                <i className="fas fa-coffee text-3xl text-muted-foreground mb-3"></i>
                <p className="text-muted-foreground">No active deliveries</p>
              </div>
            ) : (
              activeParcels.map((parcel) => (
                <div key={parcel.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-medium">#{parcel.id.slice(-8).toUpperCase()}</span>
                      <StatusBadge status={parcel.status} className="ml-2" />
                    </div>
                    <button
                      onClick={() => handleDeliverParcel(parcel.id)}
                      className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-sm font-medium hover:bg-success/90 transition-colors"
                    >
                      <i className="fas fa-check mr-1"></i>
                      Mark Delivered
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <i className="fas fa-user text-info mt-0.5"></i>
                      <span>{parcel.clientName} • {parcel.contactNumber}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <i className="fas fa-location-dot text-info mt-0.5"></i>
                      <span className="text-muted-foreground">{parcel.pickupLocation.address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <i className="fas fa-flag-checkered text-destructive mt-0.5"></i>
                      <span className="text-muted-foreground">{parcel.dropLocation.address}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Map */}
        <div className="card-elevated p-4">
          <h3 className="font-semibold mb-3">Your Location</h3>
          <div className="h-[300px] rounded-lg overflow-hidden">
            <MapContainer
              center={[currentLocation.lat, currentLocation.lng]}
              zoom={14}
              markers={[
                {
                  id: 'driver',
                  position: [currentLocation.lat, currentLocation.lng],
                  type: 'driver',
                  popup: 'You are here',
                },
                ...activeParcels.map((parcel) => ({
                  id: `drop-${parcel.id}`,
                  position: [parcel.dropLocation.lat, parcel.dropLocation.lng] as [number, number],
                  type: 'destination' as const,
                  popup: `Delivery: ${parcel.dropLocation.address}`,
                })),
              ]}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
