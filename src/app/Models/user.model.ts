export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'restaurant_owner' | 'rider' | 'admin';
}