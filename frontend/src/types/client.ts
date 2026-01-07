// Client API Type Definitions

export interface ClientProfile {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  created_at: string;
}

export interface ParcelStatusHistory {
  id: number;
  status: string;
  location: string;
  notes: string;
  created_by_name: string;
  created_at: string;
}

export interface ParcelList {
  id: number;
  tracking_number: string;
  client_name: string;
  from_location: string;
  to_location: string;
  weight: number;
  price: number;
  current_status: string;
  status_display: string;
  created_at: string;
  updated_at: string;
}

export interface ParcelDetail {
  id: number;
  tracking_number: string;
  client: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  from_location: string;
  to_location: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  drop_lat: number | null;
  drop_lng: number | null;
  pickup_stop_id: number | null;
  drop_stop_id: number | null;
  weight: number;
  height: number | null;
  width: number | null;
  breadth: number | null;
  price: number;
  distance_km: number;
  current_status: string;
  status_display: string;
  description: string;
  created_at: string;
  updated_at: string;
  status_history: ParcelStatusHistory[];
  driver?: {
    id: number;
    name: string;
    phone_number: string;
    vehicle_type: string;
    vehicle_number: string;
  } | null;
}

export interface ParcelCreate {
  from_location: string;
  to_location: string;
  pickup_lat: number;
  pickup_lng: number;
  drop_lat: number;
  drop_lng: number;
  weight: number;
  height?: number;
  width?: number;
  breadth?: number;
  description?: string;
}

export interface ParcelStats {
  total_parcels: number;
  requested: number;
  assigned: number;
  picked_up: number;
  in_transit: number;
  out_for_delivery: number;
  delivered: number;
  cancelled: number;
  rejected: number;
}

export interface DriverContact {
  driver_name: string;
  driver_phone: string;
  driver_vehicle: string;
  driver_vehicle_number: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  parcel?: number | null;
}

export interface PricingRule {
  id: number;
  rule_name: string;
  base_price: number;
  per_km_rate: number;
  per_kg_rate: number;
  min_price: number;
  max_price: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
