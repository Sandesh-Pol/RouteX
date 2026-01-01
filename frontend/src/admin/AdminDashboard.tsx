import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { dataStore } from '@/data/store';
import { Parcel, Driver } from '@/data/mockData';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: 'fas fa-home' },
  { label: 'Requests', path: '/admin/requests', icon: 'fas fa-inbox' },
  { label: 'Live Tracking', path: '/admin/tracking', icon: 'fas fa-map-location-dot' },
  { label: 'Drivers', path: '/admin/drivers', icon: 'fas fa-users' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalParcels: 0,
    pendingRequests: 0,
    inTransit: 0,
    delivered: 0,
    activeDrivers: 0,
    totalDrivers: 0,
  });
  const [recentParcels, setRecentParcels] = useState<Parcel[]>([]);

  useEffect(() => {
    const parcels = dataStore.getParcels();
    const drivers = dataStore.getDrivers();

    setStats({
      totalParcels: parcels.length,
      pendingRequests: parcels.filter(p => p.status === 'requested').length,
      inTransit: parcels.filter(p => p.status === 'in-transit').length,
      delivered: parcels.filter(p => p.status === 'delivered').length,
      activeDrivers: drivers.filter(d => d.isAvailable).length,
      totalDrivers: drivers.length,
    });

    setRecentParcels(
      parcels
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    );
  }, []);

  return (
    <DashboardLayout navItems={navItems} title="Admin Dashboard">
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Command Center 🎯</h2>
        <p className="text-muted-foreground mt-1">Overview of all logistics operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Parcels', value: stats.totalParcels, icon: 'fa-box', color: 'primary' },
          { label: 'Pending', value: stats.pendingRequests, icon: 'fa-clock', color: 'warning' },
          { label: 'In Transit', value: stats.inTransit, icon: 'fa-truck', color: 'accent' },
          { label: 'Delivered', value: stats.delivered, icon: 'fa-check-double', color: 'success' },
          { label: 'Active Drivers', value: stats.activeDrivers, icon: 'fa-user-check', color: 'info' },
          { label: 'Total Drivers', value: stats.totalDrivers, icon: 'fa-users', color: 'muted' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card-elevated p-4"
          >
            <div className={`w-10 h-10 rounded-lg bg-${stat.color}/15 flex items-center justify-center mb-3`}>
              <i className={`fas ${stat.icon} text-${stat.color}`}></i>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <a href="/admin/requests" className="card-elevated p-5 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fas fa-inbox text-warning text-xl"></i>
            </div>
            <div>
              <p className="font-semibold">Pending Requests</p>
              <p className="text-sm text-muted-foreground">{stats.pendingRequests} awaiting review</p>
            </div>
          </div>
        </a>
        <a href="/admin/tracking" className="card-elevated p-5 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fas fa-map-location-dot text-accent text-xl"></i>
            </div>
            <div>
              <p className="font-semibold">Live Tracking</p>
              <p className="text-sm text-muted-foreground">{stats.inTransit} vehicles on road</p>
            </div>
          </div>
        </a>
        <a href="/admin/drivers" className="card-elevated p-5 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-info/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fas fa-users text-info text-xl"></i>
            </div>
            <div>
              <p className="font-semibold">Driver Management</p>
              <p className="text-sm text-muted-foreground">{stats.activeDrivers} available</p>
            </div>
          </div>
        </a>
      </div>

      {/* Recent Parcels */}
      <div className="card-elevated">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-lg">Recent Activity</h3>
          <a href="/admin/requests" className="text-sm text-accent hover:underline">View all</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Route</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Driver</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentParcels.map((parcel) => (
                <tr key={parcel.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <span className="font-medium">#{parcel.id.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium">{parcel.clientName}</p>
                    <p className="text-sm text-muted-foreground">{parcel.contactNumber}</p>
                  </td>
                  <td className="p-4 max-w-[200px]">
                    <p className="text-sm truncate">{parcel.pickupLocation.address}</p>
                    <p className="text-sm text-muted-foreground truncate">→ {parcel.dropLocation.address}</p>
                  </td>
                  <td className="p-4">
                    <span className={parcel.driverName ? "text-foreground" : "text-muted-foreground"}>
                      {parcel.driverName || 'Not assigned'}
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={parcel.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
