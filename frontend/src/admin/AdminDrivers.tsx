import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { dataStore } from '@/data/store';
import { Driver } from '@/data/mockData';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: 'fas fa-home' },
  { label: 'Requests', path: '/admin/requests', icon: 'fas fa-inbox' },
  { label: 'Live Tracking', path: '/admin/tracking', icon: 'fas fa-map-location-dot' },
  { label: 'Drivers', path: '/admin/drivers', icon: 'fas fa-users' },
];

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    setDrivers(dataStore.getDrivers());
  }, []);

  return (
    <DashboardLayout navItems={navItems} title="Driver Management">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">All Drivers</h2>
        <p className="text-muted-foreground text-sm">{drivers.length} registered drivers</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {drivers.map((driver, index) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-elevated p-5"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center",
                driver.isAvailable ? "bg-success/15" : "bg-muted"
              )}>
                <i className={cn(
                  "fas fa-user text-xl",
                  driver.isAvailable ? "text-success" : "text-muted-foreground"
                )}></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{driver.name}</h3>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    driver.isAvailable 
                      ? "bg-success/15 text-success" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {driver.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{driver.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Vehicle</span>
                <span className="text-sm font-medium">{driver.vehicleType}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Number</span>
                <span className="text-sm font-medium">{driver.vehicleNumber}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-sm font-medium">{driver.phone}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Rating</span>
                <div className="flex items-center gap-1">
                  <i className="fas fa-star text-warning text-sm"></i>
                  <span className="text-sm font-medium">{driver.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Current Location</p>
              <p className="text-sm truncate">{driver.currentLocation.address}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
