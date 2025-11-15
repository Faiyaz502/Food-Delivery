import { Component } from '@angular/core';
import { finalize } from 'rxjs';
import { PaymentMethodPayroll, RiderPayroll } from 'src/app/Models/payroll/payroll.model';
import { Rider } from 'src/app/Models/rider.model';
import { DeliveryPersonProfile, RestaurantOwnerProfile } from 'src/app/Models/Users/profile.model';
import { PayrollService } from 'src/app/services/payroll/payroll.service';
import { RiderService } from 'src/app/services/Rider/rider.service';
import { RestaurantOwnerService } from 'src/app/services/UserServices/restaurant-owner.service';


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
export class PayrollComponent {


  activeTab: 'riders' | 'salary' | 'restaurants' = 'riders';

  riders: Rider[] = [];
  restaurants: RestaurantOwnerProfile[] = [];
  monthlyPayrolls: RiderPayroll[] = [];

  loading: LoadingState = {};
  customPayouts: CustomPayoutAmount = {};

  filterText: string = '';

  // Payroll filters
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  years: number[] = [];

  // Pagination
  riderPage = 0;
  riderSize = 20;
  restaurantPage = 0;
  restaurantSize = 20;

  constructor(
    private riderService: RiderService,
    private restaurantOwnerService: RestaurantOwnerService,
    private payrollService: PayrollService
  ) {
    // Generate years array (current year and previous 2 years)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 3; i++) {
      this.years.push(currentYear - i);
    }
  }

  ngOnInit(): void {
    this.loadRiders();
    this.loadRestaurants();
    this.loadMonthlyPayrolls();
  }

  loadRiders(): void {
    this.loading['riders-list'] = true;
    this.riderService
      .getAllRiders(this.riderPage, this.riderSize, 'createdAt', 'DESC')
      .pipe(finalize(() => this.loading['riders-list'] = false))
      .subscribe({
        next: (response) => {
          this.riders = response.content;

          console.log(this.riders);

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
          console.log(response.content);


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
          this.monthlyPayrolls = payrolls;
        },
        error: (error) => {
          console.error('Error loading payrolls:', error);
          alert('Failed to load monthly payrolls. Please try again.');
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
          // Update local state
          this.riders = this.riders.map(r =>
            r.id === riderId ? { ...r, wallet: 0 } : r
          );
          alert('Daily collection received successfully!');
        },
        error: (error) => {
          console.error('Error receiving daily collection:', error);
          alert('Failed to receive daily collection. Please try again.');
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
          // Update local state with response from backend
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
          // Reload payrolls if we're on the salary tab
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

  handlePaySalary(payrollId: number, paymentMethod: PaymentMethodPayroll = 'BANK_TRANSFER'): void {
    const payroll = this.monthlyPayrolls.find(p => p.id === payrollId);

    if (!payroll) {
      alert('Payroll not found.');
      return;
    }

    if (payroll.status === 'PAID') {
      alert('This payroll has already been paid.');
      return;
    }

    if (!confirm(`Pay salary of ৳${payroll.netSalary.toLocaleString()} to Rider #${payroll.riderId}?`)) {
      return;
    }

    this.loading[`payroll-${payrollId}`] = true;
    this.payrollService
      .payPayroll(payrollId, paymentMethod)
      .pipe(finalize(() => this.loading[`payroll-${payrollId}`] = false))
      .subscribe({
        next: (updatedPayroll) => {
          // Update local state
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

  get totalRiderWallets(): number {
    return this.riders.reduce((sum, r) => sum + (r.wallet || 0), 0);
  }

  get totalPendingPayouts(): number {
    return this.restaurants.reduce((sum, r) => sum + r.pendingPayout, 0);
  }

  get totalPendingSalaries(): number {
    return this.monthlyPayrolls
      .filter(p => p.status !== 'PAID')
      .reduce((sum, p) => sum + p.netSalary, 0);
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
        return 'status-paid';
      case 'GENERATED':
        return 'status-pending';
      case 'FAILED':
        return 'status-failed';
      default:
        return '';
    }
  }

  private getMonthName(month: number): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || '';
  }



}
