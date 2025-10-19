export interface ReviewCreateRequest {
  orderId: number;
  foodRating: number;
  deliveryRating: number;
  comment: string;
  deliveryPersonRating?: number;
}

export interface ReviewUpdateRequest {
  foodRating?: number;
  deliveryRating?: number;
  comment?: string;
  deliveryPersonRating?: number;
}

export interface ReviewResponse {
  id: number;
  orderId: number;
  restaurantId: number;
  restaurantName: string;
  userId: number;
  userName: string;
  foodRating: number;
  deliveryRating: number;
  comment: string;
  deliveryPersonRating?: number;
  deliveryPersonId?: number;
  deliveryPersonName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantReviewSummary {
  restaurantId: number;
  restaurantName: string;
  averageFoodRating: number;
  averageDeliveryRating: number;
  overallRating: number;
  totalReviews: number;
}

export interface DeliveryPersonReviewSummary {
  deliveryPersonId: number;
  deliveryPersonName: string;
  averageRating: number;
  totalReviews: number;
}
