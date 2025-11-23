// payroll.component.ts
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { PaymentMethodPayroll, RiderPayroll } from 'src/app/Models/payroll/payroll.model';
import { Rider } from 'src/app/Models/rider.model';
import { DeliveryPersonProfile, RestaurantOwnerProfile } from 'src/app/Models/Users/profile.model';
import { PayrollService } from 'src/app/services/payroll/payroll.service';
import { RiderService } from 'src/app/services/Rider/rider.service';
import { RestaurantOwnerService } from 'src/app/services/UserServices/restaurant-owner.service';
import { RiderShiftService } from 'src/app/services/rider-shift.service';
import { RiderShiftSummary, PayrollRuleDTO, RiderShiftDetail, PayrollRuleKey } from 'src/app/Models/payroll/riderShift.model';


interface LoadingState {
  [key: string]: boolean;
}

interface CustomPayoutAmount {
  [restaurantId: number]: number;
}

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit {
  activeTab: 'riders' | 'salary' | 'restaurants' | 'shifts' | 'rules' = 'riders';

  riders: Rider[] = [];
  restaurants: RestaurantOwnerProfile[] = [];
  monthlyPayrolls: RiderPayroll[] = [];
  shifts: RiderShiftSummary[] = [];
  payrollRules: PayrollRuleDTO[] = [];
  selectedShiftDetail: RiderShiftDetail | null = null;

  loading: LoadingState = {};
  customPayouts: CustomPayoutAmount = {};

  filterText: string = '';

  // Payroll filters
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  years: number[] = [];

  // Shift filters
  shiftStartDate: string = '';
  shiftEndDate: string = '';
  shiftRiderId: number | null = null;
  shiftRiderName: string = '';

  // Pagination
  riderPage = 0;
  riderSize = 20;
  restaurantPage = 0;
  restaurantSize = 20;
  shiftPage = 0;
  shiftSize = 20;
  totalShiftPages = 0;
  totalShiftElements = 0;

  // Edit mode for rules
  editingRules: { [key: string]: boolean } = {};
  ruleEditValues: { [key: string]: string } = {};

  constructor(
    private riderService: RiderService,
    private restaurantOwnerService: RestaurantOwnerService,
    private payrollService: PayrollService,
    private riderShiftService: RiderShiftService
  ) {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 3; i++) {
      this.years.push(currentYear - i);
    }
  }

  ngOnInit(): void {
    this.loadRiders();
    this.loadRestaurants();
    this.loadMonthlyPayrolls();
    this.loadShifts();
    this.loadPayrollRules();
  }

  loadRiders(): void {
    this.loading['riders-list'] = true;
    this.riderService
      .getAllRiders(this.riderPage, this.riderSize, 'createdAt', 'DESC')
      .pipe(finalize(() => this.loading['riders-list'] = false))
      .subscribe({
        next: (response) => {
          this.riders = response.content;
        },
        error: (error) => {
          console.error('Error loading riders:', error);
          alert('Failed to load riders. Please try again.');
        }
      });
  }

  loadRestaurants(): void {
    this.loading['restaurants-list'] = true;
    this.restaurantOwnerService
      .getAllRestaurantOwners(this.restaurantPage, this.restaurantSize, 'totalEarnings', 'DESC')
      .pipe(finalize(() => this.loading['restaurants-list'] = false))
      .subscribe({
        next: (response) => {
          this.restaurants = response.content;
        },
        error: (error) => {
          console.error('Error loading restaurants:', error);
          alert('Failed to load restaurants. Please try again.');
        }
      });
  }

  loadMonthlyPayrolls(): void {
    this.loading['payrolls-list'] = true;
    this.payrollService
      .getPayrollsByMonth(this.selectedYear, this.selectedMonth)
      .pipe(finalize(() => this.loading['payrolls-list'] = false))
      .subscribe({
        next: (payrolls) => {
          console.log(payrolls);

          this.monthlyPayrolls = payrolls;
        },
        error: (error) => {
          console.error('Error loading payrolls:', error);
          alert('Failed to load monthly payrolls. Please try again.');
        }
      });
  }

  loadShifts(): void {
    this.loading['shifts-list'] = true;
    this.riderShiftService
      .getAllShiftsForAdmin(
        this.shiftPage,
        this.shiftSize,
        this.shiftStartDate,
        this.shiftEndDate,
        this.shiftRiderId || undefined,
        this.shiftRiderName || undefined
      )
      .pipe(finalize(() => this.loading['shifts-list'] = false))
      .subscribe({
        next: (response) => {
          this.shifts = response.content;
          this.totalShiftPages = response.totalPages;
          this.totalShiftElements = response.totalElements;
        },
        error: (error) => {
          console.error('Error loading shifts:', error);
          alert('Failed to load shifts. Please try again.');
        }
      });
  }

  loadPayrollRules(): void {
    this.loading['rules-list'] = true;
    this.riderShiftService
      .getAllPayrollRules()
      .pipe(finalize(() => this.loading['rules-list'] = false))
      .subscribe({
        next: (rules) => {
          this.payrollRules = rules;
          rules.forEach(rule => {
            this.ruleEditValues[rule.key] = rule.value;
          });
        },
        error: (error) => {
          console.error('Error loading payroll rules:', error);
          alert('Failed to load payroll rules. Please try again.');
        }
      });
  }

  onShiftFiltersChange(): void {
    this.shiftPage = 0;
    this.loadShifts();
  }

  clearShiftFilters(): void {
    this.shiftStartDate = '';
    this.shiftEndDate = '';
    this.shiftRiderId = null;
    this.shiftRiderName = '';
    this.onShiftFiltersChange();
  }

  previousShiftPage(): void {
    if (this.shiftPage > 0) {
      this.shiftPage--;
      this.loadShifts();
    }
  }

  nextShiftPage(): void {
    if (this.shiftPage < this.totalShiftPages - 1) {
      this.shiftPage++;
      this.loadShifts();
    }
  }

  viewShiftDetail(shiftId: number): void {
    this.loading[`shift-detail-${shiftId}`] = true;
    this.riderShiftService
      .getShiftDetail(shiftId)
      .pipe(finalize(() => this.loading[`shift-detail-${shiftId}`] = false))
      .subscribe({
        next: (detail) => {
          this.selectedShiftDetail = detail;
        },
        error: (error) => {
          console.error('Error loading shift detail:', error);
          alert('Failed to load shift details. Please try again.');
        }
      });
  }

  closeShiftDetail(): void {
    this.selectedShiftDetail = null;
  }

  startEditingRule(key: string): void {
    this.editingRules[key] = true;
  }

  cancelEditingRule(key: string): void {
    this.editingRules[key] = false;
    const rule = this.payrollRules.find(r => r.key === key);
    if (rule) {
      this.ruleEditValues[key] = rule.value;
    }
  }

  saveRule(key: PayrollRuleKey): void {
    const newValue = this.ruleEditValues[key];

    if (!newValue || parseFloat(newValue) < 0) {
      alert('Please enter a valid positive number.');
      return;
    }

    this.loading[`rule-${key}`] = true;
    this.riderShiftService
      .updatePayrollRule(key, { value: newValue })
      .pipe(finalize(() => this.loading[`rule-${key}`] = false))
      .subscribe({
        next: (updatedRule) => {
          const index = this.payrollRules.findIndex(r => r.key === key);
          if (index !== -1) {
            this.payrollRules[index] = updatedRule;
          }
          this.editingRules[key] = false;
          alert('Payroll rule updated successfully!');
        },
        error: (error) => {
          console.error('Error updating payroll rule:', error);
          alert('Failed to update payroll rule. Please try again.');
        }
      });
  }

  onMonthYearChange(): void {
    this.loadMonthlyPayrolls();
  }

  handleReceiveDailyCollection(riderId: number): void {
    if (!confirm('Are you sure you want to receive this rider\'s daily collection? This will reset their wallet to 0.')) {
      return;
    }

    this.loading[`rider-${riderId}`] = true;
    this.riderService
      .payDailyCollection(riderId)
      .pipe(finalize(() => this.loading[`rider-${riderId}`] = false))
      .subscribe({
        next: () => {
          this.riders = this.riders.map(r =>
            r.id === riderId ? { ...r, wallet: 0 } : r
          );
          alert('Daily collection received successfully!');
        },
        error: (error) => {
          console.error('Error receiving daily collection:', error);
         
        }
      });
  }

  handleRestaurantPayout(restaurantId: number, amount: number): void {
    const restaurant = this.restaurants.find(r => r.id === restaurantId);

    if (!restaurant) {
      alert('Restaurant not found.');
      return;
    }

    if (amount <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }

    if (amount > restaurant.pendingPayout) {
      alert('Payout amount cannot exceed pending payout.');
      return;
    }

    if (!confirm(`Are you sure you want to pay ৳${amount.toLocaleString()} to Restaurant #${restaurantId}?`)) {
      return;
    }

    this.loading[`restaurant-${restaurantId}`] = true;

    this.restaurantOwnerService
      .processPayout(restaurantId, amount)
      .pipe(finalize(() => this.loading[`restaurant-${restaurantId}`] = false))
      .subscribe({
        next: (updatedRestaurant) => {
          this.restaurants = this.restaurants.map(r =>
            r.id === restaurantId ? updatedRestaurant : r
          );
          this.customPayouts[restaurantId] = 0;
          alert('Payout processed successfully!');
        },
        error: (error) => {
          console.error('Error processing payout:', error);
          alert('Failed to process payout. Please try again.');
        }
      });
  }

  handleGeneratePayroll(riderId: number): void {
    if (!confirm(`Generate payroll for Rider #${riderId} for ${this.getMonthName(this.selectedMonth)} ${this.selectedYear}?`)) {
      return;
    }

    this.loading[`generate-${riderId}`] = true;
    this.payrollService
      .generatePayroll(riderId, this.selectedYear, this.selectedMonth)
      .pipe(finalize(() => this.loading[`generate-${riderId}`] = false))
      .subscribe({
        next: (payroll) => {
          alert(`Payroll generated successfully! Payroll ID: ${payroll.id}`);
          if (this.activeTab === 'salary') {
            this.loadMonthlyPayrolls();
          }
        },
        error: (error) => {
          console.error('Error generating payroll:', error);
          const errorMsg = error.error?.message || 'Failed to generate payroll. Please try again.';
          alert(errorMsg);
        }
      });
  }

  handlePaySalary(payrollId: number, paymentMethod: PaymentMethodPayroll = 'NET_BANKING'): void {
    const payroll = this.monthlyPayrolls.find(p => p.id === payrollId);

    if (!payroll) {
      alert('Payroll not found.');
      return;
    }

    if (payroll.paid) {
      alert('This payroll has already been paid.');
      return;
    }

    if (!confirm(`Pay salary of ৳${payroll.finalPay.toLocaleString()} to Rider #${payroll.riderId}?`)) {
      return;
    }

    this.loading[`payroll-${payrollId}`] = true;
    this.payrollService
      .payPayroll(payrollId, paymentMethod)
      .pipe(finalize(() => this.loading[`payroll-${payrollId}`] = false))
      .subscribe({
        next: (updatedPayroll) => {
          this.monthlyPayrolls = this.monthlyPayrolls.map(p =>
            p.id === payrollId ? updatedPayroll : p
          );
          alert('Salary paid successfully!');
        },
        error: (error) => {
          console.error('Error paying salary:', error);
          alert('Failed to pay salary. Please try again.');
        }
      });
  }

  get filteredRiders(): Rider[] {
    if (!this.filterText) return this.riders;

    const search = this.filterText.toLowerCase();
    return this.riders.filter(r =>
      r.id.toString().includes(search) ||
      r.userId.toString().includes(search) ||
      r.vehicleType.toLowerCase().includes(search)
    );
  }

  get filteredRestaurants(): RestaurantOwnerProfile[] {
    if (!this.filterText) return this.restaurants;

    const search = this.filterText.toLowerCase();
    return this.restaurants.filter(r =>
      r.id.toString().includes(search) ||
      r.businessLicenseNumber.toLowerCase().includes(search)
    );
  }

  get filteredPayrolls(): RiderPayroll[] {
    if (!this.filterText) return this.monthlyPayrolls;

    const search = this.filterText.toLowerCase();
    return this.monthlyPayrolls.filter(p =>
      p.id.toString().includes(search) ||
      p.riderId.toString().includes(search)
    );
  }

  get filteredShifts(): RiderShiftSummary[] {
    if (!this.filterText) return this.shifts;

    const search = this.filterText.toLowerCase();
    return this.shifts.filter(s =>
      s.id.toString().includes(search) ||
      s.riderId.toString().includes(search) ||
      s.riderName.toLowerCase().includes(search)
    );
  }

  get totalRiderWallets(): number {
    return this.riders.reduce((sum, r) => sum + (r.wallet || 0), 0);
  }

  get totalPendingPayouts(): number {
    return this.restaurants.reduce((sum, r) => sum + r.pendingPayout, 0);
  }

  get totalPendingSalaries(): number {
    return this.monthlyPayrolls
      .filter(p => p.paid)
      .reduce((sum, p) => sum + p.finalPay, 0);
  }

  get activeRidersCount(): number {
    return this.riders.filter(r => r.isOnline).length;
  }

  setCustomPayout(restaurantId: number, value: string): void {
    const amount = parseFloat(value);
    this.customPayouts[restaurantId] = isNaN(amount) ? 0 : amount;
  }

  getCustomPayout(restaurantId: number): number {
    return this.customPayouts[restaurantId] || 0;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return 'status-paid';
      case 'GENERATED':
      case 'ACTIVE':
        return 'status-pending';
      case 'FAILED':
      case 'AUTO_ENDED':
        return 'status-failed';
      default:
        return '';
    }
  }

  getShiftStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'AUTO_ENDED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  private getMonthName(month: number): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || '';
  }
}
