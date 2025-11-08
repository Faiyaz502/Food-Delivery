export interface OrderItemDto {
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number; // quantity * unitPrice
}

export interface OrderReportDto {
  // Customer Information
  customerName: string;

  // Restaurant Information
  restaurantName: string;

  // Order Information
  orderNumber: string;
  orderDate: Date | string; // Can be Date object or ISO string
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryType: string;
  estimatedDeliveryTime: Date | string;
  specialInstructions?: string;

  // Financials
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;

  // Items List
  items: OrderItemDto[];
}
