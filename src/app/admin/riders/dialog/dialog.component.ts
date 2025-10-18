
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { DeliveryService } from 'src/app/services/delivery/delivery.service';
import { RiderService } from 'src/app/services/Rider/rider.service';

interface RiderStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  successRate: number;
  avgRating: number;
  earningsToday: number;
  totalEarnings: number;
}

interface Delivery {
  id: number;
  orderNumber: string;
  status: string;
  amount: number;
  deliveryAddress: string;
  deliveryDate: string;
  rating?: number;
  customerName?: string;
}
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {

   riderId: number;
  riderName: string;
  riderData: any;
  stats: RiderStats | null = null;
  heatmapData: any[] = [];
  deliveryHistory: Delivery[] = [];
  performanceData: any = null;

  selectedPeriod = 'today';
  selectedTab = 'stats';
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private riderService: RiderService,
    private deliveryService: DeliveryService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<DialogComponent>
  ) {
    this.riderId = data.riderId;
    this.riderName = data.riderName;
    this.riderData = data.riderData;
    this.stats = data.stats;
    this.heatmapData = data.heatmapData;
  }

  ngOnInit(): void {
    this.loadDeliveryHistory();
    this.loadPerformanceData();
  }

  /**
   * Load delivery history for the rider
   */
  loadDeliveryHistory(): void {
    this.loading = true;
    this.deliveryService.getRiderDeliveries(this.riderId, 0, 10).subscribe({
      next: (response) => {
        this.deliveryHistory = response.content || response || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading delivery history', err);
        this.toastr.error('Failed to load delivery history');
        this.loading = false;
      }
    });
  }

  /**
   * Load performance metrics
   */
  loadPerformanceData(): void {
    const { startDate, endDate } = this.getDateRange();

    this.deliveryService.getDeliveryPerformance(this.riderId, startDate, endDate).subscribe({
      next: (data) => {
        this.performanceData = data;
      },
      error: (err) => {
        console.error('Error loading performance data', err);
      }
    });
  }

  /**
   * Get date range based on selected period
   */
  getDateRange(): { startDate: string; endDate: string } {
    const today = new Date();
    let startDate = new Date();
    const endDate = today.toISOString().split('T')[0];

    switch (this.selectedPeriod) {
      case 'today':
        startDate = new Date(today);
        break;
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate
    };
  }

  /**
   * On period change - reload performance data
   */
  onPeriodChange(): void {
    this.loadPerformanceData();
  }

  /**
   * Get star rating array for display
   */
  getStarArray(rating: number | undefined): boolean[] {
    return Array(5).fill(false).map((_, i) => i < Math.floor(rating || 0));
  }

  /**
   * Format currency for INR
   */
  formatCurrency(value: number | undefined): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value || 0);
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'CANCELLED':
        return 'bg-red-500';
      case 'IN_TRANSIT':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  }

  /**
   * Get status label with emoji
   */
  getStatusLabel(status: string): string {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return '✅ Delivered';
      case 'PENDING':
        return '⏳ Pending';
      case 'CANCELLED':
        return '❌ Cancelled';
      case 'IN_TRANSIT':
        return '🚗 In Transit';
      default:
        return status;
    }
  }

  /**
   * Get vehicle icon
   */
  getVehicleIcon(vehicleType: string): string {
    const icons: { [key: string]: string } = {
      BIKE: '🏍️',
      SCOOTER: '🛵',
      CAR: '🚗',
      BICYCLE: '🚴'
    };
    return icons[vehicleType] || '🚚';
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    if (!this.stats || !this.stats.totalDeliveries || this.stats.totalDeliveries === 0) {
      return 100;
    }
    return (this.stats.successfulDeliveries / this.stats.totalDeliveries) * 100;
  }

  /**
   * Update rider status
   */
  updateRiderStatus(status: string): void {
    this.loading = true;
    let statusUpdate: Observable<any>;

    switch (status) {
      case 'AVAILABLE':
        statusUpdate = this.riderService.goOnline(this.riderId);
        break;
      case 'BUSY':
        statusUpdate = this.riderService.setBusy(this.riderId);
        break;
      case 'OFFLINE':
        statusUpdate = this.riderService.goOffline(this.riderId);
        break;
      default:
        statusUpdate = this.riderService.goOffline(this.riderId);
    }

    statusUpdate.subscribe({
      next: (response) => {
        this.riderData = response;
        this.toastr.success(`Rider status updated to ${status}`);
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to update rider status');
        console.error(err);
        this.loading = false;
      }
    });
  }

  /**
   * Export statistics as CSV
   */
  exportStats(): void {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rider-stats-${this.riderId}-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastr.success('Statistics exported successfully');
  }

  /**
   * Generate CSV content
   */
  private generateCSV(): string {
    let csv = 'Rider Statistics Report\n';
    csv += `Rider: ${this.riderName}\n`;
    csv += `ID: ${this.riderId}\n`;
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;

    csv += 'Statistics\n';
    csv += `Total Deliveries,${this.stats?.totalDeliveries || 0}\n`;
    csv += `Successful Deliveries,${this.stats?.successfulDeliveries || 0}\n`;
    csv += `Success Rate,${this.getSuccessRate().toFixed(2)}%\n`;
    csv += `Average Rating,${this.stats?.avgRating || 0}\n`;
    csv += `Today's Earnings,₹${this.stats?.earningsToday || 0}\n`;
    csv += `Total Earnings,₹${this.stats?.totalEarnings || 0}\n\n`;

    csv += 'Recent Deliveries\n';
    csv += 'Order Number,Status,Amount,Date,Customer\n';
    this.deliveryHistory.forEach(delivery => {
      csv += `"${delivery.orderNumber}","${delivery.status}","₹${delivery.amount || 0}","${delivery.deliveryDate}","${delivery.customerName || 'N/A'}"\n`;
    });

    return csv;
  }

  /**
   * Close dialog
   */
  closeDialog(): void {
    this.dialogRef.close();
  }

}
