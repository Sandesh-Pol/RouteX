import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/auth/AuthContext';
import { driverAPI } from '@/lib/api';
import { DriverTask, ClientContact } from '@/types/driver';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', path: '/driver', icon: 'fas fa-home' },
  { label: 'Assignments', path: '/driver/assignments', icon: 'fas fa-clipboard-list' },
  { label: 'Navigation', path: '/driver/navigation', icon: 'fas fa-route' },
];

type TabType = 'active' | 'completed';

export default function DriverAssignments() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DriverTask[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParcelContact, setSelectedParcelContact] = useState<ClientContact | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const response = await driverAPI.getTasks();
      setTasks(response.data);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (parcelId: number, newStatus: string) => {
    try {
      await driverAPI.updateParcelStatus(parcelId, { current_status: newStatus });
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      loadTasks();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const loadClientContact = async (parcelId: number) => {
    try {
      const response = await driverAPI.getClientContact(parcelId);
      setSelectedParcelContact(response.data);
    } catch (error: any) {
      console.error('Failed to load client contact:', error);
      toast.error('Failed to load client contact');
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const statusMap: Record<string, string> = {
      'assigned': 'picked_up',
      'picked_up': 'in_transit',
      'in_transit': 'out_for_delivery',
      'out_for_delivery': 'delivered',
    };
    return statusMap[currentStatus] || null;
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'assigned': 'Pick Up',
      'picked_up': 'Start Transit',
      'in_transit': 'Out for Delivery',
      'out_for_delivery': 'Mark Delivered',
      'delivered': 'Completed',
    };
    return labels[status] || status;
  };

  const filteredTasks = tasks.filter(t => 
    activeTab === 'active' ? t.current_status !== 'delivered' : t.current_status === 'delivered'
  );

  if (isLoading) {
    return (
      <DashboardLayout navItems={navItems} title="Assignments">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-accent mb-4"></i>
            <p className="text-muted-foreground">Loading assignments...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Assignments">
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'active' as TabType, label: 'Active', icon: 'fa-truck' },
            { id: 'completed' as TabType, label: 'Completed', icon: 'fa-check-double' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <i className={`fas ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Parcel List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="card-elevated p-12 text-center">
              <i className={`fas ${activeTab === 'active' ? 'fa-inbox' : 'fa-box-archive'} text-4xl text-muted-foreground mb-4`}></i>
              <p className="text-muted-foreground">
                No {activeTab === 'active' ? 'active' : 'completed'} deliveries
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const nextStatus = getNextStatus(task.current_status);
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-elevated p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        task.current_status === 'delivered' ? "bg-success/15" : "bg-accent/15"
                      )}>
                        <i className={cn(
                          "fas",
                          task.current_status === 'delivered' ? "fa-check-double text-success" : "fa-box text-accent"
                        )}></i>
                      </div>
                      <div>
                        <p className="font-semibold">{task.tracking_number}</p>
                        <p className="text-sm text-muted-foreground">{task.weight}kg</p>
                      </div>
                    </div>
                    <StatusBadge status={task.current_status} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground mb-1">Client</p>
                      <p className="font-medium">{task.client_name}</p>
                      <p className="text-sm text-muted-foreground">{task.client_phone}</p>
                      <button
                        onClick={() => loadClientContact(task.id)}
                        className="text-xs text-accent hover:underline mt-1"
                      >
                        View Contact
                      </button>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground mb-1">Created</p>
                      <p className="font-medium">{new Date(task.created_at).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">{new Date(task.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-info/5 border border-info/20">
                      <i className="fas fa-location-dot text-info mt-0.5"></i>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Pickup</p>
                        <p>{task.from_location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <i className="fas fa-flag-checkered text-destructive mt-0.5"></i>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Drop</p>
                        <p>{task.to_location}</p>
                      </div>
                    </div>
                  </div>

                  {task.description && (
                    <div className="mb-4 p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{task.description}</p>
                    </div>
                  )}

                  {task.special_instructions && (
                    <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
                      <p className="text-xs text-muted-foreground mb-1">
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        Special Instructions
                      </p>
                      <p className="text-sm">{task.special_instructions}</p>
                    </div>
                  )}

                  {task.current_status !== 'delivered' && (
                    <div className="flex gap-2">
                      <a
                        href={`/driver/navigation?parcel=${task.id}`}
                        className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-center font-medium hover:bg-primary/90 transition-colors"
                      >
                        <i className="fas fa-route mr-2"></i>
                        Navigate
                      </a>
                      {nextStatus && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, nextStatus)}
                          className="flex-1 py-2.5 rounded-lg bg-accent text-accent-foreground text-center font-medium hover:bg-accent/90 transition-colors"
                        >
                          <i className="fas fa-arrow-right mr-2"></i>
                          {getStatusLabel(task.current_status)}
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Client Contact Modal */}
      {selectedParcelContact && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedParcelContact(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Client Contact</h3>
              <button
                onClick={() => setSelectedParcelContact(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{selectedParcelContact.client_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <a
                  href={`tel:${selectedParcelContact.client_phone}`}
                  className="font-medium text-accent hover:underline"
                >
                  {selectedParcelContact.client_phone}
                </a>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <a
                  href={`mailto:${selectedParcelContact.client_email}`}
                  className="font-medium text-accent hover:underline"
                >
                  {selectedParcelContact.client_email}
                </a>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tracking Number</p>
                <p className="font-medium">{selectedParcelContact.parcel_tracking_number}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
