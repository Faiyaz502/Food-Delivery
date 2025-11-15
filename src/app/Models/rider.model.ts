
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
  userId: number;
  riderId: number;
  riderName: string;
  vehicleType: VehicleType;
  drivingLicenseNumber: string;
  currentLatitude: number;
  currentLongitude: number;
  availabilityStatus: AvailabilityStatus;
  avgRating: number;
  phoneNumber:number ;
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
  assignedOrders?: any[];
  wallet : number ;
  isOnline: boolean;
}

export interface DeliveryStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  cancelledDeliveries: number;
  avgDeliveryTime: number;
  totalEarnings: number;
  successRate: number;
  avgRating: number;
  todayDeliveries: number;
  weekDeliveries: number;
  monthDeliveries: number;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
}

export interface PendingOrder {
  id: number;
  orderId: number;
  restaurantName: string;
  customerName: string;
  deliveryAddress: string;
  orderTotal: number;
  distance: number;
  estimatedTime: number;
  createdAt: string;
  pickupLatitude: number;
  pickupLongitude: number;
  deliveryLatitude: number;
  deliveryLongitude: number;
}

export interface DeliveryAssignment {
  deliveryId: number;
  deliveryPersonId: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}



