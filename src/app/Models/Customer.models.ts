export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  status?: 'active' | 'suspended' | 'blocked';
  city?: string;
  total_orders?: number;
  total_spend?: number;
  customer_type?: 'new' | 'regular' | 'VIP';
  addresses?: Address[];
  payment_methods?: PaymentMethod[];
}

export interface Address {
  id: string;
  customer_id: string;
  type: 'home' | 'work' | 'other';
  address_line: string;
  city: string;
  is_default: boolean;
}

export interface PaymentMethod {
  id: string;
  customer_id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'wallet';
  last_four: string;
  is_default: boolean;
}
