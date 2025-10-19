export enum DiscountType { PERCENTAGE = 'PERCENTAGE', FIXED = 'FIXED' }
export enum CouponType { GENERAL = 'GENERAL', FIRST_ORDER = 'FIRST_ORDER' }

//Should add enum of    FIRST_ORDER, GENERAL, FLASH_SALE,SEASONAL,LOYALTY,REFERRAL
    
   

   
export interface CouponCreateRequest {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  couponType: CouponType;
  usageLimit: number;
  validFrom: string;
  validUntil: string;
  applicableOnFirstOrder: boolean;
}
export interface CouponUpdateRequest {
  description?: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validUntil?: string; // ISO string
  isActive?: boolean;
  applicableOnFirstOrder?: boolean;
}

export interface CouponResponse {
  id: number;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  couponType: CouponType;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableOnFirstOrder: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponApplyRequest {
  couponCode: string;
  orderAmount: number;
}

export interface CouponDiscountResponse {
  couponCode: string;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

export interface validCoupon {

    valid : boolean

}