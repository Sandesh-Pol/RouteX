import { Location } from '@/data/mockData';

type LocationCallback = (driverId: string, location: Location) => void;

class DummySocketService {
  private listeners: Map<string, LocationCallback[]> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private driverLocations: Map<string, Location> = new Map();

  // Subscribe to location updates for a specific driver
  subscribe(driverId: string, callback: LocationCallback) {
    if (!this.listeners.has(driverId)) {
      this.listeners.set(driverId, []);
    }
    this.listeners.get(driverId)!.push(callback);
  }

  // Subscribe to all driver updates
  subscribeAll(callback: LocationCallback) {
    if (!this.listeners.has('all')) {
      this.listeners.set('all', []);
    }
    this.listeners.get('all')!.push(callback);
  }

  // Unsubscribe from updates
  unsubscribe(driverId: string, callback: LocationCallback) {
    const callbacks = this.listeners.get(driverId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Unsubscribe from all updates
  unsubscribeAll(callback: LocationCallback) {
    const callbacks = this.listeners.get('all');
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Start simulating driver movement
  startDriverSimulation(
    driverId: string,
    startLocation: Location,
    endLocation: Location,
    durationMs: number = 30000
  ) {
    // Clear any existing interval for this driver
    if (this.intervals.has(driverId)) {
      clearInterval(this.intervals.get(driverId)!);
    }

    const steps = 100;
    const stepDuration = durationMs / steps;
    let currentStep = 0;

    const latDiff = endLocation.lat - startLocation.lat;
    const lngDiff = endLocation.lng - startLocation.lng;

    // Set initial location
    this.driverLocations.set(driverId, { ...startLocation });

    const interval = setInterval(() => {
      currentStep++;
      
      if (currentStep >= steps) {
        clearInterval(interval);
        this.intervals.delete(driverId);
        return;
      }

      // Add some random variation for realistic movement
      const randomLat = (Math.random() - 0.5) * 0.0005;
      const randomLng = (Math.random() - 0.5) * 0.0005;

      const newLocation: Location = {
        lat: startLocation.lat + (latDiff * currentStep / steps) + randomLat,
        lng: startLocation.lng + (lngDiff * currentStep / steps) + randomLng,
        address: `In transit (${Math.round((currentStep / steps) * 100)}% complete)`,
      };

      this.driverLocations.set(driverId, newLocation);
      this.emit(driverId, newLocation);
    }, stepDuration);

    this.intervals.set(driverId, interval);
  }

  // Stop driver simulation
  stopDriverSimulation(driverId: string) {
    if (this.intervals.has(driverId)) {
      clearInterval(this.intervals.get(driverId)!);
      this.intervals.delete(driverId);
    }
  }

  // Get current location of a driver
  getDriverLocation(driverId: string): Location | undefined {
    return this.driverLocations.get(driverId);
  }

  // Emit location update to all subscribers
  private emit(driverId: string, location: Location) {
    // Notify specific driver subscribers
    const driverCallbacks = this.listeners.get(driverId);
    if (driverCallbacks) {
      driverCallbacks.forEach(callback => callback(driverId, location));
    }

    // Notify 'all' subscribers
    const allCallbacks = this.listeners.get('all');
    if (allCallbacks) {
      allCallbacks.forEach(callback => callback(driverId, location));
    }
  }

  // Update driver location manually (for driver app)
  updateDriverLocation(driverId: string, location: Location) {
    this.driverLocations.set(driverId, location);
    this.emit(driverId, location);
  }

  // Cleanup all intervals
  cleanup() {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
    this.listeners.clear();
    this.driverLocations.clear();
  }
}

// Export singleton instance
export const dummySocket = new DummySocketService();
