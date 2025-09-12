export interface Review {
  id: string;
  user_id: number;
  restaurant_id: number;
  rating: number;
  comment: string;
  created_at: string;
}