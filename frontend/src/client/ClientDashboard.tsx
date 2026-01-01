import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/auth/AuthContext';
import { dataStore } from '@/data/store';
import { Parcel, ParcelStatus } from '@/data/mockData';

const navItems = [
  { label: 'Dashboard', path: '/client', icon: 'fas fa-home' },
  { label: 'Send Parcel', path: '/client/send', icon: 'fas fa-paper-plane' },
  { label: 'Track Parcel', path: '/client/track', icon: 'fas fa-location-crosshairs' },
];

const statusOrder: ParcelStatus[] = ['requested', 'accepted', 'in-transit', 'delivered'];

export default function ClientDashboard() {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);

  useEffect(() => {
    if (user) {
      setParcels(dataStore.getParcelsByClient(user.id));
    }
  }, [user]);

  const stats = {
    total: parcels.length,
    inTransit: parcels.filter(p => p.status === 'in-transit').length,
    delivered: parcels.filter(p => p.status === 'delivered').length,
    pending: parcels.filter(p => p.status === 'requested' || p.status === 'accepted').length,
  };

  return (
    <DashboardLayout navItems={navItems} title="Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your parcels
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Parcels', value: stats.total, icon: 'fa-box', color: 'primary' },
          { label: 'In Transit', value: stats.inTransit, icon: 'fa-truck', color: 'accent' },
          { label: 'Delivered', value: stats.delivered, icon: 'fa-check-double', color: 'success' },
          { label: 'Pending', value: stats.pending, icon: 'fa-clock', color: 'warning' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-elevated p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}/15 flex items-center justify-center`}>
                <i className={`fas ${stat.icon} text-${stat.color}`}></i>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Parcels */}
      <div className="card-elevated">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-lg">Recent Parcels</h3>
          <a href="/client/track" className="text-sm text-accent hover:underline">
            View all
          </a>
        </div>
        <div className="divide-y divide-border">
          {parcels.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <i className="fas fa-box-open text-2xl text-muted-foreground"></i>
              </div>
              <p className="text-muted-foreground">No parcels yet</p>
              <a href="/client/send" className="inline-block mt-4 text-accent hover:underline">
                Send your first parcel →
              </a>
            </div>
          ) : (
            parcels.slice(0, 5).map((parcel, index) => (
              <motion.div
                key={parcel.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-box text-primary"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground truncate">
                        #{parcel.id.slice(-8).toUpperCase()}
                      </p>
                      <StatusBadge status={parcel.status} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {parcel.pickupLocation.address} → {parcel.dropLocation.address}
                    </p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(parcel.createdAt).toLocaleDateString()}
                    </p>
                    {parcel.driverName && (
                      <p className="text-xs text-accent mt-0.5">
                        <i className="fas fa-user mr-1"></i>
                        {parcel.driverName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {parcel.status !== 'delivered' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      {statusOrder.map((status, idx) => {
                        const currentIdx = statusOrder.indexOf(parcel.status);
                        const isCompleted = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;
                        return (
                          <div
                            key={status}
                            className={`flex items-center gap-2 ${idx > 0 ? 'flex-1' : ''}`}
                          >
                            {idx > 0 && (
                              <div className={`h-0.5 flex-1 ${isCompleted ? 'bg-accent' : 'bg-border'}`} />
                            )}
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                isCompleted
                                  ? isCurrent
                                    ? 'bg-accent text-accent-foreground animate-pulse-soft'
                                    : 'bg-accent text-accent-foreground'
                                  : 'bg-secondary text-muted-foreground'
                              }`}
                            >
                              {isCompleted && !isCurrent ? (
                                <i className="fas fa-check text-[10px]"></i>
                              ) : (
                                idx + 1
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Requested</span>
                      <span>Accepted</span>
                      <span>In Transit</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
