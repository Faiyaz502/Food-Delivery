export interface CateringPackage {
  id: number;
  provider_id: number;
  name: string;
  description: string;
  base_price: number;
  max_people: number;
  image_url: string;
  status: 'active' | 'inactive';
}

export interface CateringOrder {
  id: number;
  user_id: number;
  package_id: number;
  quantity: number;
  scheduled_date: string;
  status: string;
  delivery_address: string;
}