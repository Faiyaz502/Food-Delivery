export type PaymentMethodPayroll = 'BANK_TRANSFER' | 'CASH' | 'MOBILE_MONEY';
export type PayrollStatus = 'GENERATED' | 'PAID' | 'FAILED' | 'PENDING';

export interface RiderPayroll {
  id: number;
  riderId: number;
  year: number;
  month: number;
  baseSalary: number;
  totalDeliveries: number;
  deliveryEarnings: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: PayrollStatus;
  generatedAt: string;
  paidAt?: string;
  paymentMethod?: PaymentMethodPayroll;
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
