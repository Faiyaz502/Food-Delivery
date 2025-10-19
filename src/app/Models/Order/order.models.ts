export interface OrderItem {
  id?: number;
  menuItemId: number;
  menuItemName?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  specialInstructions?: string;
  customizations?: string;
}

export interface CreateOrderDTO {
  customerId: number;
  restaurantId: number;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryType: 'STANDARD' | 'EXPRESS' | 'SCHEDULED' | 'PICKUP';
  specialInstructions?: string;
  deliveryFee: number;
  priorityLevel: number;
  orderItems: OrderItem[];
}



export interface OrderResponseDTO {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  restaurantId: number;
  restaurantName: string;
  orderDate: string;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryType: string;
  estimatedDeliveryTime?: string;
  priorityLevel: number;
  specialInstructions?: string;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders?: number;
  completedOrders?: number;
  cancelledOrders?: number;
}

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  deliveryType?: string;
  searchQuery?: string;
  dateRange?: string;
  priorityLevel?: number;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
}

// ============================================
// 2. CART MODELS (models/cart.model.ts)
// ============================================

export interface CartItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  specialInstructions?: string;
  restaurantId: number;
  restaurantName: string;
}

export interface AddCartItemDTO {
  menuItemId: number | undefined;
  quantity: number;
  specialInstructions?: string;
}

export interface CartResponseDTO {
  id: number;
  userId: number;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  restaurantName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface CheckoutDTO {
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryType: 'STANDARD' | 'EXPRESS' | 'SCHEDULED' | 'PICKUP';
  specialInstructions?: string;
  deliveryFee: number;
  priorityLevel: number;
}
