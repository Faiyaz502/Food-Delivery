// rider-shift.types.ts
export interface RiderShiftSummary {
  id: number;
  riderId: number;
  riderName: string;
  date: string; // "2025-11-18"
  shiftStart: string; // ISO 8601
  shiftEnd?: string;
  totalWorkHours: number;
  completedDeliveries: number;
  finalPay: string; // "620.00"
  status: 'ACTIVE' | 'COMPLETED' | 'AUTO_ENDED';
}

export interface RiderShiftDetail {
  id: number;
  riderName: string;
  shiftStart: string;
  shiftEnd?: string;
  totalWorkHours: number;
  totalBreakHours: number;
  completedDeliveries: number;
  delayedDeliveries: number;
  payroll: {
    workPayment: string;
    overtimeBonus: string;
    deliveryBonus: string;
    delayPenalty: string;
    deductions: string;
    finalPay: string;
  };
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export enum PayrollRuleKey {
  BASE_SALARY = 'BASE_SALARY',
  PER_DELIVERY_RATE = 'PER_DELIVERY_RATE',
  BONUS_THRESHOLD = 'BONUS_THRESHOLD',
  BONUS_AMOUNT = 'BONUS_AMOUNT',
  HOURLY_RATE = 'HOURLY_RATE',
  OVERTIME_MULTIPLIER = 'OVERTIME_MULTIPLIER',
  DELIVERY_BONUS_PER_ORDER = 'DELIVERY_BONUS_PER_ORDER',
  DELAY_PENALTY_PER_ORDER = 'DELAY_PENALTY_PER_ORDER'
}

export interface PayrollRuleDTO {
  key: PayrollRuleKey;
  value: string;
  description: string;
  defaultValue: string;
}

export interface UpdatePayrollRuleRequest {
  value: string;
  description?: string;
}
