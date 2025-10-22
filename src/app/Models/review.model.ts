export interface Review {
  id: number;
  orderId: number;
  restaurantId: number;
  restaurantName: string;
  userId: number;
  userName: string;
  foodRating: number;
  deliveryRating: number;
  comment: string;
  deliveryPersonRating: number;
  deliveryPersonId: number;
  deliveryPersonName: string;
  createdAt: string;
  updatedAt: string; 
}
