import { CustomerTier, VehicleType, AvailabilityStatus, AdminLevel, UserStatus } from "src/app/Enums/profileEnums";


export interface UserProfile {
  id: number;
  userId: number;
  dateOfBirth?: string;
  username?: string;
  profileImageUrl?: string;
  imageUrl:string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  loyaltyPoints: number;
  customerTier: CustomerTier;
  latitude:number ;
  longitude : number ;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileCreateDTO {
  dateOfBirth?: string;
  profileImageUrl?: string;
  latitude:number ;
  longitude : number ;
}

export interface DeliveryPersonProfile {
  id: number;
  userId: number;
  riderName : string ;
  vehicleType: VehicleType;
  drivingLicenseNumber: string;
  maxDeliveryRadius: number;
  currentLatitude?: number;
  currentLongitude?: number;
  availabilityStatus: AvailabilityStatus;
  totalDeliveries: number;
  successfulDeliveries: number;
  successRate: number;
  avgRating: number;
  earningsToday: number;
  totalEarnings: number;
  isVerified: boolean;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
  wallet : number ;
}

export interface DeliveryPersonCreateDTO {
  vehicleType: VehicleType;
  drivingLicenseNumber: string;
}

export interface LocationUpdateDTO {
  latitude: number;
  longitude: number;
}

export interface RestaurantOwnerProfile {
  id: number;
  ownerName:string;
  userId: number;
  businessLicenseNumber: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  isApproved: boolean;
  totalEarnings: number;
  pendingPayout: number;
  lastPayoutDate?: string;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantOwnerCreateDTO {
  businessLicenseNumber: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
}

export interface AdminProfile {
  id: number;
  userId: number;
  adminName:string;
  adminEmail:string ;
  department: string;
  adminImg : string ;
  location:string ;
  phone : string ;
  status : UserStatus;
  adminLevel: AdminLevel;
  accessLevel: number;
  supervisorId?: number;
  canApproveRestaurants: boolean;
  canManageUsers: boolean;
  canManageOrders: boolean;
  canManagePayments: boolean;
  canManageDrones: boolean;
  canViewAnalytics: boolean;
  loginCount: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfileCreateDTO {
  department: string;
  adminLevel: AdminLevel;
  accessLevel: number;
  supervisorId?: number;
}

export interface AdminPermissionsDTO {
  canApproveRestaurants: boolean;
  canManageUsers: boolean;
  canManageOrders: boolean;
  canManagePayments: boolean;
  canManageDrones: boolean;
  canViewAnalytics: boolean;
}
