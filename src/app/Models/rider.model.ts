
export interface Rider {
  id: number;
  name?: string;
  phone?: string;
  vehicle_type: 'motorcycle' | 'bicycle' | 'car' | 'scooter';
  availability: boolean;
  earnings: number;
  rating?: number;
  total_deliveries?: number;
  created_at?: string;
  image_url : string ;
  current_location?: {
    latitude: number;
    longitude: number;
  };
}

