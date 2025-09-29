export interface MenuItem {
  id?: number;                // optional since it may not exist on create
  name: string;
  description?: string;
  price: number;              // BigDecimal comes as number in JSON
  imageUrl?: string;
  isSpicy: boolean;
  spiceLevel: number;
  preparationTime?: number;
  isAvailable: boolean;
  restaurantId: number;
  catagoryName?: string;      // note: typo preserved to match your DTO
}

