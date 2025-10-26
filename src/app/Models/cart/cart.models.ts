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
  imageUrl:string
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
 paymentMethod : string;

}

export interface CartItemCreateDTO {
  menuItemId: number;               // Long → number
  quantity: number;                 // Integer → number
  specialInstructions?: string;     // Optional
}



export interface CartSummaryDTO {
  totalItems: number;   // Integer → number
  subtotal: number;     // BigDecimal → number
  tax: number;          // BigDecimal → number
  total: number;        // BigDecimal → number
}

export interface AddCartItemDTO {
  menuItemId: number | undefined;
  quantity: number;
  specialInstructions?: string;
}

export interface CheckoutDTO {
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryType: 'STANDARD' | 'EXPRESS' | 'SCHEDULED' | 'PICKUP';
  specialInstructions?: string;
  deliveryFee: number;
  discount:number;
  paymentMethod : string;
  priorityLevel: number;
  totalAmount : number
}
