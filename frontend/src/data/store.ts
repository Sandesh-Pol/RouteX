import { Parcel, Notification, initialParcels, initialNotifications, mockDrivers, Driver } from './mockData';

// Simple in-memory store with localStorage persistence
class DataStore {
  private parcels: Parcel[] = [];
  private notifications: Notification[] = [];
  private drivers: Driver[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const storedParcels = localStorage.getItem('parcels');
    const storedNotifications = localStorage.getItem('notifications');
    const storedDrivers = localStorage.getItem('drivers');

    this.parcels = storedParcels 
      ? JSON.parse(storedParcels).map((p: Parcel) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }))
      : [...initialParcels];

    this.notifications = storedNotifications
      ? JSON.parse(storedNotifications).map((n: Notification) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        }))
      : [...initialNotifications];

    this.drivers = storedDrivers
      ? JSON.parse(storedDrivers)
      : [...mockDrivers];
  }

  private saveToStorage() {
    localStorage.setItem('parcels', JSON.stringify(this.parcels));
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
    localStorage.setItem('drivers', JSON.stringify(this.drivers));
  }

  // Parcel operations
  getParcels(): Parcel[] {
    return [...this.parcels];
  }

  getParcelsByClient(clientId: string): Parcel[] {
    return this.parcels.filter(p => p.clientId === clientId);
  }

  getParcelsByDriver(driverId: string): Parcel[] {
    return this.parcels.filter(p => p.driverId === driverId);
  }

  getParcelById(parcelId: string): Parcel | undefined {
    return this.parcels.find(p => p.id === parcelId);
  }

  addParcel(parcel: Omit<Parcel, 'id' | 'createdAt' | 'updatedAt'>): Parcel {
    const newParcel: Parcel = {
      ...parcel,
      id: `parcel-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.parcels.push(newParcel);
    this.saveToStorage();
    
    // Notify admin
    this.addNotification({
      userId: 'admin-1',
      title: 'New Parcel Request',
      message: `New parcel request from ${parcel.clientName}`,
      type: 'info',
      read: false,
    });

    return newParcel;
  }

  updateParcel(parcelId: string, updates: Partial<Parcel>): Parcel | undefined {
    const index = this.parcels.findIndex(p => p.id === parcelId);
    if (index === -1) return undefined;

    this.parcels[index] = {
      ...this.parcels[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveToStorage();
    return this.parcels[index];
  }

  acceptParcel(parcelId: string): Parcel | undefined {
    const parcel = this.updateParcel(parcelId, { status: 'accepted' });
    if (parcel) {
      this.addNotification({
        userId: parcel.clientId,
        title: 'Parcel Accepted',
        message: `Your parcel request #${parcelId.slice(-4)} has been accepted.`,
        type: 'success',
        read: false,
      });
    }
    return parcel;
  }

  rejectParcel(parcelId: string): boolean {
    const parcel = this.getParcelById(parcelId);
    if (!parcel) return false;

    this.parcels = this.parcels.filter(p => p.id !== parcelId);
    this.saveToStorage();

    this.addNotification({
      userId: parcel.clientId,
      title: 'Parcel Rejected',
      message: `Your parcel request #${parcelId.slice(-4)} has been rejected.`,
      type: 'warning',
      read: false,
    });

    return true;
  }

  assignDriver(parcelId: string, driverId: string): Parcel | undefined {
    const driver = this.drivers.find(d => d.id === driverId);
    if (!driver) return undefined;

    const parcel = this.updateParcel(parcelId, {
      driverId,
      driverName: driver.name,
      status: 'in-transit',
    });

    if (parcel) {
      // Notify client
      this.addNotification({
        userId: parcel.clientId,
        title: 'Driver Assigned',
        message: `${driver.name} has been assigned to your parcel #${parcelId.slice(-4)}.`,
        type: 'info',
        read: false,
      });

      // Notify driver
      this.addNotification({
        userId: driverId,
        title: 'New Assignment',
        message: `You have been assigned a new parcel from ${parcel.clientName}.`,
        type: 'info',
        read: false,
      });
    }

    return parcel;
  }

  deliverParcel(parcelId: string): Parcel | undefined {
    const parcel = this.updateParcel(parcelId, { status: 'delivered' });
    if (parcel) {
      this.addNotification({
        userId: parcel.clientId,
        title: 'Parcel Delivered',
        message: `Your parcel #${parcelId.slice(-4)} has been delivered successfully!`,
        type: 'success',
        read: false,
      });
    }
    return parcel;
  }

  // Driver operations
  getDrivers(): Driver[] {
    return [...this.drivers];
  }

  getAvailableDrivers(): Driver[] {
    return this.drivers.filter(d => d.isAvailable);
  }

  getDriverById(driverId: string): Driver | undefined {
    return this.drivers.find(d => d.id === driverId);
  }

  updateDriverLocation(driverId: string, location: { lat: number; lng: number; address: string }) {
    const index = this.drivers.findIndex(d => d.id === driverId);
    if (index !== -1) {
      this.drivers[index].currentLocation = location;
      this.saveToStorage();
    }
  }

  // Notification operations
  getNotifications(userId: string): Notification[] {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getUnreadNotificationCount(userId: string): number {
    return this.notifications.filter(n => n.userId === userId && !n.read).length;
  }

  addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date(),
    };
    this.notifications.push(newNotification);
    this.saveToStorage();
    return newNotification;
  }

  markNotificationRead(notificationId: string) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications[index].read = true;
      this.saveToStorage();
    }
  }

  markAllNotificationsRead(userId: string) {
    this.notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    this.saveToStorage();
  }

  // Reset store
  reset() {
    this.parcels = [...initialParcels];
    this.notifications = [...initialNotifications];
    this.drivers = [...mockDrivers];
    this.saveToStorage();
  }
}

export const dataStore = new DataStore();
