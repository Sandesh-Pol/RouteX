import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/auth/AuthContext';
import { clientAPI } from '@/lib/api';
import { ParcelStats } from '@/types/client';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', path: '/client', icon: 'fas fa-home' },
  { label: 'Send Parcel', path: '/client/send', icon: 'fas fa-paper-plane' },
  { label: 'Track Parcel', path: '/client/track', icon: 'fas fa-location-crosshairs' },
  { label: 'Profile', path: '/client/profile', icon: 'fas fa-user' },
];

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  created_at: string;
}

export default function ClientProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ParcelStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    address: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const [profileRes, statsRes] = await Promise.all([
        clientAPI.getProfile(),
        clientAPI.getStats(),
      ]);
      console.log('Profile API response:', profileRes);
      console.log('Stats API response:', statsRes);
      
      const profileData = profileRes.data;
      const statsData = statsRes.data;
      
      console.log('Profile data:', profileData);
      console.log('Stats data:', statsData);
      
      setProfile(profileData);
      setStats(statsData);
      setFormData({
        name: profileData.name || '',
        phone_number: profileData.phone_number || '',
        address: profileData.address || '',
      });
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate fields
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.phone_number.trim()) {
      toast.error('Phone number is required');
      return;
    }

    setIsSaving(true);
    try {
      await clientAPI.patchProfile({
        full_name: formData.name,
        phone_number: formData.phone_number,
        address: formData.address,
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      loadProfile();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout navItems={navItems} title="Profile">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <i className="fas fa-spinner fa-spin text-4xl text-accent"></i>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Profile">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-6"
        >
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
              <i className="fas fa-user text-4xl text-white"></i>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{profile?.name}</h2>
              <p className="text-muted-foreground">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                  <i className="fas fa-circle-check mr-1"></i>
                  Active Client
                </span>
                <span className="text-xs text-muted-foreground">
                  Member since {new Date(profile?.created_at || '').toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors flex items-center gap-2"
            >
              <i className={`fas ${isEditing ? 'fa-times' : 'fa-pen'}`}></i>
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated p-6"
        >
          <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <i className="fas fa-id-card text-accent"></i>
            Personal Information
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter your full name"
                  required
                />
              ) : (
                <div className="p-3 rounded-lg bg-secondary/50 text-foreground">
                  {profile?.name}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="p-3 rounded-lg bg-secondary/50 text-foreground">
                {profile?.email}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number *
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="input-field"
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="p-3 rounded-lg bg-secondary/50 text-foreground">
                  {profile?.phone_number || 'Not provided'}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Address
              </label>
              {isEditing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Enter your address"
                  rows={3}
                />
              ) : (
                <div className="p-3 rounded-lg bg-secondary/50 text-foreground">
                  {profile?.address || 'Not provided'}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>

        {/* Account Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated p-6"
        >
          <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <i className="fas fa-chart-line text-accent"></i>
            Account Statistics
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-info/10 border border-info/30">
              <i className="fas fa-box text-2xl text-info mb-2"></i>
              <p className="text-2xl font-bold text-foreground">{stats?.total_parcels || 0}</p>
              <p className="text-sm text-muted-foreground">Total Parcels</p>
            </div>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
              <i className="fas fa-clock text-2xl text-warning mb-2"></i>
              <p className="text-2xl font-bold text-foreground">
                {((stats?.requested || 0) + (stats?.assigned || 0)) || 0}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>

            <div className="p-4 rounded-lg bg-success/10 border border-success/30">
              <i className="fas fa-check-circle text-2xl text-success mb-2"></i>
              <p className="text-2xl font-bold text-foreground">{stats?.delivered || 0}</p>
              <p className="text-sm text-muted-foreground">Delivered</p>
            </div>

            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <i className="fas fa-indian-rupee-sign text-2xl text-accent mb-2"></i>
              <p className="text-2xl font-bold text-foreground">
                {stats?.total_spent ? `₹${Number(stats.total_spent).toFixed(2)}` : '₹0.00'}
              </p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated p-6"
        >
          <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <i className="fas fa-shield-halved text-accent"></i>
            Security
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <i className="fas fa-key text-xl text-muted-foreground"></i>
                <div>
                  <p className="font-medium text-foreground">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
                Change
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <i className="fas fa-mobile-screen text-xl text-muted-foreground"></i>
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                Enable
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
