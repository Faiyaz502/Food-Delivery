import { Component, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';

import { Rider } from 'src/app/Models/rider.model';
import { DeliveryService } from 'src/app/services/delivery/delivery.service';
import { RiderService } from 'src/app/services/Rider/rider.service';
import { DialogComponent } from './dialog/dialog.component';
import * as ApexCharts from 'apexcharts';
import { ChartComponent } from 'chart.js';

interface PendingOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  totalAmount: number;
  orderDate: string;
  orderStatus: string;
}

export interface ApexOptions {
  series?: any[];
  chart?: any;
  colors?: string[];
  xaxis?: any;
  yaxis?: any;
  dataLabels?: any;
  states?: any;
  plotOptions?: any;
  tooltip?: any;
}

interface RiderStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  successRate: number;
  avgRating: number;
  earningsToday: number;
  totalEarnings: number;
}

@Component({
  selector: 'app-riders',
  templateUrl: './riders.component.html',
  styleUrls: ['./riders.component.scss']
})
export class RidersComponent {

  // Data properties
  riders: Rider[] = [];
  filteredRiders: Rider[] = [];
  pendingOrders: PendingOrder[] = [];
  selectedRider: Rider | null = null;
  riderStats: RiderStats | null = null;
  riderHeatmapData: any[] = [];

  // State properties
  loading = false;
  searchText = '';
  filterStatus = 'ALL';
  sortBy = 'avgRating';
  currentPage = 0;
  pageSize = 20;
  totalRiders = 0;

  // Dialog properties
  selectedMonth = new Date().toISOString().substring(0, 7);
  selectedYear = new Date().getFullYear();

  // NEW: Get all rider drop list IDs for connection
  get riderDropListIds(): string[] {
    return this.filteredRiders.map(r => `rider-${r.id}`);
  }

  constructor(
    private riderService: RiderService,
    private deliveryService: DeliveryService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadRiders();
    this.loadPendingOrders();
    this.startAutoRefresh();
  }

  loadRiders(): void {
    this.loading = true;
    this.riderService.getAllRiders(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.riders = response.content || [];
        // FIXED: Initialize assignedOrders for each rider
        this.riders.forEach(rider => {
          if (!rider.assignedOrders) {
            rider.assignedOrders = [];
          }
        });
        this.totalRiders = response.totalElements || 0;
        this.applyFiltersAndSort();
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load riders');
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadPendingOrders(): void {
    this.deliveryService.getPendingOrders().subscribe({
      next: (orders) => {
        this.pendingOrders = orders;
      },
      error: (err) => {
        this.toastr.error('Failed to load pending orders');
        console.error(err);
      }
    });
  }

  applyFiltersAndSort(): void {
    let filtered = [...this.riders].filter(rider => {
      const matchesSearch = rider.riderName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        rider.drivingLicenseNumber?.includes(this.searchText);
      const matchesStatus = this.filterStatus === 'ALL' || rider.availabilityStatus === this.filterStatus;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'avgRating':
          return (b.avgRating || 0) - (a.avgRating || 0);
        case 'totalDeliveries':
          return (b.totalDeliveries || 0) - (a.totalDeliveries || 0);
        case 'earningsToday':
          return (b.earningsToday || 0) - (a.earningsToday || 0);
        case 'successRate':
          const successRateB = b.totalDeliveries ? ((b.successfulDeliveries || 0) / b.totalDeliveries) * 100 : 0;
          const successRateA = a.totalDeliveries ? ((a.successfulDeliveries || 0) / a.totalDeliveries) * 100 : 0;
          return successRateB - successRateA;
        case 'name':
          return (a.riderName || '').localeCompare(b.riderName || '');
        default:
          return 0;
      }
    });

    this.filteredRiders = filtered;
  }

  // FIXED: Improved drop handler
  drop(event: CdkDragDrop<any[]>): void {
    console.log('DROP EVENT:', event);
    console.log('Previous Container ID:', event.previousContainer.id);
    console.log('Current Container ID:', event.container.id);

    // If dropped in the same container, do nothing
    if (event.previousContainer === event.container) {
      return;
    }
     console.log('DROP EVENT:', event);

    // Check if dropping from pending orders to a rider
    if (event.previousContainer.id === 'orderList') {
      const order = event.previousContainer.data[event.previousIndex];

      // Extract rider ID from container ID (format: "rider-123")
      const riderIdStr = event.container.id.replace('rider-', '');
      const riderId = parseInt(riderIdStr, 10);

      console.log('Parsed Rider ID:', riderId);

      const rider = this.riders.find(r => r.id === riderId);

      if (rider && order) {
        console.log('Assigning order to rider:', rider.riderName);
        this.assignOrderToRider(order, rider);
      } else {
        console.error('Rider not found or invalid order', { riderId, rider, order });
        this.toastr.warning('Unable to assign order - invalid rider');
      }
    }
  }

  assignOrderToRider(order: PendingOrder, rider: Rider): void {
    this.loading = true;

    this.deliveryService.assignDeliveryPerson(order.id, rider.id).subscribe({
      next: (response) => {
        this.toastr.success(`Order ${order.orderNumber} assigned to ${rider.riderName}`);
        this.loadPendingOrders();
        this.loadRiders(); // Refresh riders to update their assigned orders
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to assign order: ' + (err.error?.message || err.message));
        console.error(err);
        this.loading = false;
      }
    });
  }

  selectRider(rider: Rider): void {
    this.selectedRider = rider;
    this.loadRiderStats(rider.id);
    this.loadRiderHeatmap(rider.id);
  }

  loadRiderStats(riderId: number): void {
    this.riderService.getDeliveryStats(riderId).subscribe({
      next: (stats) => {
        this.riderStats = stats;
      },
      error: (err) => {
        this.toastr.error('Failed to load rider stats');
        console.error(err);
      }
    });
  }

  loadRiderHeatmap(riderId: number): void {
    const year = this.selectedYear;
    const month = this.selectedMonth.split('-')[1];

    this.riderService.getRiderHeatmapData(riderId, year, parseInt(month)).subscribe({
      next: (data) => {
        this.riderHeatmapData = this.transformHeatmapData(data);
      },
      error: (err) => {
        console.error('Failed to load heatmap data', err);
        this.riderHeatmapData = [];
      }
    });
  }

  transformHeatmapData(data: any[]): any[] {
    return data.map(item => ({
      x: new Date(item.date).toLocaleDateString(),
      y: item.hour || 0,
      value: item.orderCount || 0
    }));
  }

  openRiderDetail(rider: Rider): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '1000px',
      maxHeight: '90vh',
      data: {
        riderId: rider.id,
        riderName: rider.riderName,
        riderData: rider,
        stats: this.riderStats,
        heatmapData: this.riderHeatmapData
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadRiders();
      this.selectedRider = null;
    });
  }

  startAutoRefresh(): void {
    setInterval(() => {
      this.loadRiders();
    }, 30000);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500';
      case 'BUSY':
        return 'bg-yellow-500';
      case 'OFFLINE':
        return 'bg-red-500';
      case 'ON_BREAK':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  }

  getVehicleIcon(vehicleType: string): string {
    const icons: { [key: string]: string } = {
      BIKE: '🏍️',
      SCOOTER: '🛵',
      CAR: '🚗',
      BICYCLE: '🚴'
    };
    return icons[vehicleType] || '🚚';
  }

  getSuccessRate(rider: Rider): number {
    if (!rider.totalDeliveries || rider.totalDeliveries === 0) {
      return 100;
    }
    return ((rider.successfulDeliveries || 0) / rider.totalDeliveries) * 100;
  }

  formatCurrency(value: number | undefined): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value || 0);
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.applyFiltersAndSort();
  }

  onSortChange(): void {
    this.applyFiltersAndSort();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.applyFiltersAndSort();
  }

  onMonthChange(): void {
    if (this.selectedRider) {
      this.loadRiderHeatmap(this.selectedRider.id);
    }
  }

  nextPage(): void {
    if ((this.currentPage + 1) * this.pageSize < this.totalRiders) {
      this.currentPage++;
      this.loadRiders();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadRiders();
    }
  }

  closeRiderDetail(): void {
    this.selectedRider = null;
  }

  @ViewChild('heatmapChart') heatmapChart!: ChartComponent;
  heatmapOptions: ApexOptions = {};

  ngAfterViewInit(): void {
    if (this.selectedRider && this.riderHeatmapData.length > 0) {
      this.initializeHeatmap();
    }
  }

  initializeHeatmap(): void {
    const chartElement = document.getElementById('heatmap-chart');
    if (!chartElement) return;

    const heatmapData = this.transformDataForHeatmap();

    const options = {
      series: heatmapData,
      chart: {
        height: 350,
        type: 'heatmap',
        zoom: {
          enabled: true
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 150
          }
        }
      },
      colors: ['#008FFB'],
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '10px',
          colors: ['#fff']
        },
        formatter: (val: any) => val ? val : ''
      },
      states: {
        hover: {
          filter: {
            type: 'darken',
            value: 0.15
          }
        },
        active: {
          filter: {
            type: 'darken',
            value: 0.15
          }
        }
      },
      xaxis: {
        type: 'category',
        categories: this.getDaysOfMonth(),
        title: {
          text: 'Day of Month'
        }
      },
      yaxis: {
        type: 'category',
        categories: this.getHoursOfDay(),
        title: {
          text: 'Hour of Day'
        }
      },
      tooltip: {
        enabled: true,
        theme: 'dark',
        x: {
          show: true,
          format: 'dd MMM'
        },
        y: {
          formatter: (val: any) => `${val} orders`
        }
      },
      plotOptions: {
        heatmap: {
          radius: 0,
          useFillColorAsStroke: false,
          colorScale: {
            ranges: [
              {
                from: 0,
                to: 5,
                name: 'Low',
                color: '#93d82d'
              },
              {
                from: 6,
                to: 10,
                name: 'Medium',
                color: '#ffc107'
              },
              {
                from: 11,
                to: 20,
                name: 'High',
                color: '#ff6b6b'
              },
              {
                from: 21,
                to: 50,
                name: 'Very High',
                color: '#c92a2a'
              }
            ]
          }
        }
      }
    };

    ApexCharts.exec('heatmap', 'updateOptions', options, false, true);
  }

  private transformDataForHeatmap(): any[] {
    const series: any[] = [];
    const hoursData: { [key: number]: any[] } = {};

    for (let i = 0; i < 24; i++) {
      hoursData[i] = new Array(31).fill(0);
    }

    this.riderHeatmapData.forEach((item: any) => {
      const date = new Date(item.x);
      const day = date.getDate();
      const hour = item.y || 0;
      const value = item.value || 0;

      if (hour >= 0 && hour < 24 && day >= 1 && day <= 31) {
        hoursData[hour][day - 1] = value;
      }
    });

    for (let hour = 0; hour < 24; hour++) {
      series.push({
        name: `${hour}:00`,
        data: hoursData[hour]
      });
    }

    return series;
  }

  private getDaysOfMonth(): string[] {
    const [year, month] = this.selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const days: string[] = [];

    while (date.getMonth() === parseInt(month) - 1) {
      days.push(date.getDate().toString());
      date.setDate(date.getDate() + 1);
    }

    return days;
  }

  private getHoursOfDay(): string[] {
    return Array.from({ length: 24 }, (_, i) => `${i}:00`);
  }
}
