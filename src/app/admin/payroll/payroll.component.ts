import { Component } from '@angular/core';

import { PaymentMethod, PayrollService, RiderPayroll } from 'src/app/services/payroll/payroll.service';

export enum PaymentMethods {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET'
}
@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent {

     payrolls: RiderPayroll[] = [];
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;

  paymentMethods: PaymentMethod[] = [
    { id: '1', customer_id: '', type: 'CASH', last_four: '', is_default: true },
    { id: '2', customer_id: '', type: 'CARD', last_four: '1234', is_default: false }
  ];

  constructor(private payrollService: PayrollService) { }

  ngOnInit(): void {
    this.loadPayrolls();
  }

  loadPayrolls() {
    this.payrollService.getPayrollsByMonth(this.selectedYear, this.selectedMonth).subscribe({
      next: data => this.payrolls = data,
      error: err => console.error(err)
    });
  }

  generatePayroll(riderId: number) {
    this.payrollService.generatePayroll(riderId, this.selectedYear, this.selectedMonth).subscribe({
      next: data => {
        console.log('Payroll generated', data);
        this.loadPayrolls();
      }
    });
  }

  payPayroll(payrollId: number, method: string) {
    this.payrollService.payPayroll(payrollId, method).subscribe({
      next: data => {
        console.log('Paid', data);
        this.loadPayrolls();
      }
    });
  }

  viewReceipt(payrollId: number) {
    this.payrollService.getReceipt(payrollId).subscribe({
      next: receipt => alert(receipt)
    });
  }
}
