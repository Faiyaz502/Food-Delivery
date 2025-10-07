export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  deliveryFee: number;
  tax: number;
  deliveryAddress: DeliveryAddress;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  orderDate: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  cancelReason?: string;
  specialInstructions?: string;
  createdAt : string ;
}

export interface OrderStatistics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  totalRevenue: number;
  totalDeliveryFees: number;
  averageOrderValue: number;
}

export interface CustomerOrderStats {
  customerId: string;
  customerName: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
}

export interface RestaurantOrderStats {
  restaurantId: string;
  restaurantName: string;
  totalOrders: number;
  totalRevenue: number;
  averagePreparationTime: number;
  commissionRate: number;
  totalCommission: number;
}

export interface DeliveryStats {
  deliveryPersonId: string;
  deliveryPersonName: string;
  totalDeliveries: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  totalEarnings: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  restaurantId?: string;
  customerId?: string;
  paymentStatus?: PaymentStatus;
  searchTerm?: string;
}
