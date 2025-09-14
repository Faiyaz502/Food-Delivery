export interface Payment {
  id: number;
  order_id: number;
  method: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
}

