// Driver API Type Definitions

export interface DriverTask {
  id: number;
  tracking_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  from_location: string;
  to_location: string;
  pickup_lat: string;
  pickup_lng: string;
  drop_lat: string;
  drop_lng: string;
  weight: number;
  description: string;
  special_instructions: string;
  current_status: 'assigned' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered';
  created_at: string;
  updated_at: string;
}

export interface DriverRoute {
  id: number;
  tracking_number: string;
  pickup_lat: number;
  pickup_lng: number;
  drop_lat: number;
  drop_lng: number;
  from_location: string;
  to_location: string;
}

export interface DriverVehicleInfo {
  driver_id: number;
  name: string;
  phone_number: string;
  vehicle_number: string;
  vehicle_type: string;
  is_active: boolean;
}

export interface ClientContact {
  client_id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  parcel_tracking_number: string;
}

export interface StatusUpdateRequest {
  current_status: 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered';
}

export interface StatusUpdateResponse {
  message: string;
  parcel_id: number;
  status: string;
}
