// cart.models.ts

export interface CartItemResponseDTO {
  id: number;
  menuItemId: number;
  menuItemName: string;
  unitPrice: number;           // BigDecimal → number
  quantity: number;
  totalPrice: number;          // BigDecimal → number
  specialInstructions: string | null;
  restaurantId: number;
  restaurantName: string;
}

export interface CartResponseDTO {
  id: number;
  userId: number;
  userName: string;
  items: CartItemResponseDTO[];
  subtotal: number;            // BigDecimal → number
  totalItems: number;
  createdAt: string;           // LocalDateTime → ISO string
  updatedAt: string;
}

export interface CartItemCreateDTO {
  menuItemId: number;               // Long → number
  quantity: number;                 // Integer → number
  specialInstructions?: string;     // Optional
}

export interface CartCheckoutDTO {
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryType: 'STANDARD' | 'EXPRESS' |'PICKUP'; // Replace with your DeliveryType enum values
  specialInstructions?: string;
  deliveryFee?: number;             // BigDecimal → number
}

export interface CartSummaryDTO {
  totalItems: number;   // Integer → number
  subtotal: number;     // BigDecimal → number
  tax: number;          // BigDecimal → number
  total: number;        // BigDecimal → number
}
