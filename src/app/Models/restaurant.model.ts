export interface Restaurant {
  image_url: any;
  rating: any;
  id?: number | null;                  // Optional for new restaurants
  name: string;
  address: string;
  phoneNumber : number ;
  description : string ;
  email : string ;
  ownerId: number;
  latitude?: number;
  longitude?: number;
  minimumOrderAmount?: number;
  estimatedDeliveryTime?: number;
  droneDeliveryEnabled?: boolean;
  maxDroneDeliveryWeight?: number;
  status?: string;               // PENDING_APPROVAL, ACTIVE, REJECTED
  imageUrls: string[];           // Multiple images
  averageRating?: number;
  totalReviews?: number;
  totalOrders?: number;
  totalRevenue?: number;
  isOpen?: boolean;
}


