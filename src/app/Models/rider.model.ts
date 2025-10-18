
// export interface Rider {
//   id: number;
//   user_id: number;
//   name?: string;
//   phone?: string;
//   // document have to apply
//   vehicle_type: 'motorcycle' | 'bicycle' | 'car' | 'scooter';
//   availability: boolean;
//   earnings: number;
//   rating?: number;
//   avgRating: number;
//   totalDeliveries?: number;
//   created_at?: string;
//   image_url : string ;
//   current_location?: {
//     latitude: number;
//     longitude: number;
//   };
// }

import { AvailabilityStatus, VehicleType } from "../Enums/profileEnums";

export interface Rider {
  id: number;
  riderId: number;
  riderName: string;
  vehicleType: VehicleType;
  drivingLicenseNumber: string;
  currentLatitude: number;
  currentLongitude: number;
  availabilityStatus: AvailabilityStatus;
  avgRating: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  earningsToday: number;
  totalEarnings: number;
  maxDeliveryRadius: number;
  isVerified: boolean;
  imageUrl : string ;
  lastLocationUpdate: string;  // ISO date string (LocalDateTime)
  shiftStartTime: string;
  shiftEndTime: string;
  createdAt: string;
  updatedAt: string;
}


