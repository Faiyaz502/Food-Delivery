export type PaymentMethodPayroll = 'NET_BANKING' | 'CASH' | 'MOBILE_MONEY';
export type PayrollStatus = 'GENERATED' | 'PAID' | 'FAILED' | 'PENDING';

export interface RiderPayroll {
  id: number;
  riderId: number;
  year: number;
  month: number;

  workPayment: number;
  totalDeliveries: number;

  // New / updated fields
  deliveryBonus: number;
  overtimeBonus: number;

  deductionAmount: number;

  finalPay: number;

  totalWorkHours: number;
  totalBreakHours: number;

  paid: boolean;
  paymentDate: string | null;
  paymentMethod: PaymentMethodPayroll | null;
  receiptNumber: string | null;
}

export interface PayoutRequestDTO {
  amount: number;
  paymentMethod: string;
}

// models/common.model.ts
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
