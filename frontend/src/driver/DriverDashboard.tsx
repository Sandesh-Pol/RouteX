import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MapContainer } from '@/components/maps/MapContainer';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/auth/AuthContext';
import { driverAPI } from '@/lib/api';
import { DriverTask, DriverVehicleInfo } from '@/types/driver';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', path: '/driver', icon: 'fas fa-home' },
  { label: 'Assignments', path: '/driver/assignments', icon: 'fas fa-clipboard-list' },
  { label: 'Navigation', path: '/driver/navigation', icon: 'fas fa-route' },
];

export default function DriverDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DriverTask[]>([]);
  const [vehicleInfo, setVehicleInfo] = useState<DriverVehicleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [tasksRes, vehicleRes] = await Promise.all([
        driverAPI.getTasks(),
        driverAPI.getVehicleInfo(),
      ]);

      setTasks(tasksRes.data);
      setVehicleInfo(vehicleRes.data);
    } catch (error: any) {
      console.error('Failed to load driver data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkDelivered = async (parcelId: number) => {
    try {
      await driverAPI.updateParcelStatus(parcelId, { current_status: 'delivered' });
      toast.success('Parcel marked as delivered');
      loadData(); // Reload data
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.error || 'Failed to update parcel status');
    }
  };

  const activeTasks = tasks.filter(t => t.current_status !== 'delivered');
  const completedTasks = tasks.filter(t => t.current_status === 'delivered');

  const getMapMarkers = () => {
    const markers: Array<{
      id: string;
      position: [number, number];
      type: 'pickup' | 'destination';
      popup?: string;
      label?: string;
    }> = [];

    activeTasks.forEach(task => {
      if (task.pickup_lat && task.pickup_lng) {
        markers.push({
          id: `pickup-${task.id}`,
          position: [Number(task.pickup_lat), Number(task.pickup_lng)],
          type: 'pickup',
          popup: `Pickup: ${task.from_location}`,
          label: 'Pickup',
        });
      }
      if (task.drop_lat && task.drop_lng) {
        markers.push({
          id: `drop-${task.id}`,
          position: [Number(task.drop_lat), Number(task.drop_lng)],
          type: 'destination',
          popup: `Drop: ${task.to_location}`,
          label: 'Drop',
        });
      }
    });

    return markers;
  };

  const getMapCenter = (): [number, number] => {
    if (activeTasks.length > 0 && activeTasks[0].pickup_lat && activeTasks[0].pickup_lng) {
      return [Number(activeTasks[0].pickup_lat), Number(activeTasks[0].pickup_lng)];
    }
    return [19.0760, 72.8777]; // Default: Mumbai
  };

  if (isLoading) {
    return (
      <DashboardLayout navItems={navItems} title="Driver Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-accent mb-4"></i>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Driver Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">
          Hey, {vehicleInfo?.name?.split(' ')[0] || user?.name?.split(' ')[0]}! 🚚
        </h2>
        <p className="text-muted-foreground mt-1">
          Here's your delivery overview
        </p>
        {vehicleInfo && (
          <p className="text-sm text-muted-foreground mt-1">
            {vehicleInfo.vehicle_type} • {vehicleInfo.vehicle_number}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active', value: activeTasks.length, icon: 'fa-truck', color: 'accent' },
          { label: 'Completed', value: completedTasks.length, icon: 'fa-check-double', color: 'success' },
          { label: 'Total', value: tasks.length, icon: 'fa-box', color: 'primary' },
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
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {activeTasks.length === 0 ? (
              <div className="p-8 text-center">
                <i className="fas fa-coffee text-3xl text-muted-foreground mb-3"></i>
                <p className="text-muted-foreground">No active deliveries</p>
              </div>
            ) : (
              activeTasks.map((task) => (
                <div key={task.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-medium">{task.tracking_number}</span>
                      <StatusBadge status={task.current_status} className="ml-2" />
                    </div>
                    {task.current_status === 'out_for_delivery' && (
                      <button
                        onClick={() => handleMarkDelivered(task.id)}
                        className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-sm font-medium hover:bg-success/90 transition-colors"
                      >
                        <i className="fas fa-check mr-1"></i>
                        Delivered
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <i className="fas fa-user text-info mt-0.5"></i>
                      <span>{task.client_name} • {task.client_phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <i className="fas fa-location-dot text-info mt-0.5"></i>
                      <span className="text-muted-foreground">{task.from_location}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <i className="fas fa-flag-checkered text-destructive mt-0.5"></i>
                      <span className="text-muted-foreground">{task.to_location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <i className="fas fa-weight-hanging"></i>
                      <span>{task.weight}kg</span>
                    </div>
                  </div>
                  {task.current_status === 'assigned' && (
                    <button
                      onClick={async () => {
                        try {
                          await driverAPI.updateParcelStatus(task.id, { current_status: 'picked_up' });
                          toast.success('Parcel picked up');
                          loadData();
                        } catch (error: any) {
                          toast.error(error.response?.data?.error || 'Failed to update status');
                        }
                      }}
                      className="mt-3 w-full py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors"
                    >
                      <i className="fas fa-box-open mr-1"></i>
                      Mark as Picked Up
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Map */}
        <div className="card-elevated p-4">
          <h3 className="font-semibold mb-3">Delivery Locations</h3>
          <div className="h-[400px] rounded-lg overflow-hidden">
            {activeTasks.length > 0 ? (
              <MapContainer
                center={getMapCenter()}
                zoom={12}
                markers={getMapMarkers()}
              />
            ) : (
              <div className="h-full bg-secondary/50 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">No active deliveries to show</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
