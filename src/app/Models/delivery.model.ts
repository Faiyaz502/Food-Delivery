// src/app/Models/delivery.model.ts
export interface Delivery {
  id: number;
  order_id: number;
  rider_id: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  assigned_at: string;
  picked_up_at?: string;
  delivered_at?: string;
  estimated_delivery: string;
  tracking_code?: string;
  delivery_notes?: string;
}
