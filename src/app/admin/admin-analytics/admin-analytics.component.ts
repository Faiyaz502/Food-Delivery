import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AnalyticsModule } from "src/app/analytics/analytics.module";
import { CateringPackage, CateringOrder } from 'src/app/Models/catering-package.model';
import { CustomerLocation } from 'src/app/Models/customer-location.model';
import { MenuItem } from 'src/app/Models/MenuItem.model';
import { ReviewResponse } from 'src/app/Models/NotificationAndCoupon/review.model';
import { OrderResponseDTO, OrderStatistics } from 'src/app/Models/Order/order.models';


import { PendingRequest } from 'src/app/Models/pending-request.model';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { Review } from 'src/app/Models/review.model';
import { Rider } from 'src/app/Models/rider.model';
import { TeamMember } from 'src/app/Models/team-member.model';
import { DeliveryPersonProfile } from 'src/app/Models/Users/profile.model';
import { User } from 'src/app/Models/Users/user.models';
import { MenuItemService } from 'src/app/services/menu-item.service';
import { OrderService } from 'src/app/services/Orders/order.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { ReviewService } from 'src/app/services/reviewAndCoupon/review.service';
import { DeliveryPersonService } from 'src/app/services/UserServices/delivery-person.service';
import { UserProfileService } from 'src/app/services/UserServices/user-profile.service';
import { UserServiceService } from 'src/app/services/UserServices/user.service.service';



@Component({
  selector: 'app-admin-analytics',

  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.scss'],




})
export class AdminAnalyticsComponent {

///Total Order
@Input() dontWant : boolean = true ;


private orderStatusChartInstance: Chart | null = null;
private revenueChartInstance: Chart | null = null;
private topMenuChartInstance: Chart | null = null;
private customerLocationChartInstance: Chart | null = null;
private mainMonthlyChartInstance: Chart | null = null; // for #chartCanvas

statistics: OrderStatistics | null = null;


 @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  constructor( private orderService : OrderService ,
    private userService : UserServiceService , private riderService : DeliveryPersonService, private menuItemService : MenuItemService,
    private restaurantService:RestaurantService , private reviewService : ReviewService , private customerService:UserProfileService ,
    
  ) {}

  ngOnInit() {
    Chart.register(...registerables);
    this.orderService.getAllOrders().subscribe(orders => this.createMonthlyChart(orders));
    
     this.fetchStatistics();

      this.loadDashboardData();
    
  }

  ngAfterViewInit() {
  if (this.statistics) {
    this.createRevenueChart();
  }
}


fetchStatistics() {
  this.orderService.getCompanyStatistics().subscribe(stats => {
    this.statistics = stats;

    // If the chart canvas already loaded, draw the chart
    if (this.revenueChart?.nativeElement) {
      this.createRevenueChart();
    }
  });
}

private createMonthlyChart(orders: OrderResponseDTO[]) {
  const monthlyCounts = new Array(12).fill(0);
  orders.forEach(order => {
    const date = new Date(order.createdAt);
    monthlyCounts[date.getMonth()]++;
  });

  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const ctx = this.chartCanvas.nativeElement.getContext('2d');
  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)');
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0.4)');

  this.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthLabels,
      datasets: [{
        label: 'Orders',
        data: monthlyCounts,
        backgroundColor: gradient,
        borderRadius: 12,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(99,102,241,1)',
        maxBarThickness: 60,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 20, bottom: 20 }
      },
      plugins: {
        title: {
          display: true,
          text: '📊 Monthly Orders Overview',
          color: '#1e293b',
          font: { size: 22, weight: 'bold' },
          padding: { top: 10, bottom: 10 }
        },
        subtitle: {
          display: true,
          text: `Total Orders: ${orders.length} | Avg / Month: ${(orders.length / 12).toFixed(1)}`,
          color: '#475569',
          font: { size: 14, style: 'italic' },
          padding: { bottom: 20 }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { weight: 'bold', size: 14 },
          bodyFont: { size: 13 },
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (ctx) => `Orders: ${ctx.raw}`,
            afterLabel: (ctx) => `Month: ${ctx.label}`
          }
        },

        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            font: { size: 12 },
            callback: (val) => Number(val) % 1 === 0 ? val : ''
          }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 12 } }
        }
      },
      animation: {
        duration: 1800,
        easing: 'easeOutBounce'
      },
      hover: {
        mode: 'nearest',
        intersect: true
      }
    }
  })};


  @ViewChild('salesChart') salesChart!: ElementRef;
    @ViewChild('orderStatusChart') orderStatusChart!: ElementRef;
    @ViewChild('revenueChart') revenueChart!: ElementRef;
    @ViewChild('topMenuChart') topMenuChart!: ElementRef;
    @ViewChild('customerLocationChart') customerLocationChart!: ElementRef;
    private salesChartInstance: Chart | null = null;

    // Dashboard statistics
    totalOrders = 0;
    totalRiders = 0;
    totalOrdersToday = 0;
    totalRevenue = 0;
    totalCustomers = 0;
    availableRiders = 0;
    totalCateringOrders = 0;
    averageRating = 0;
    totalReviews = 0;
    pendingRequestsCount = 0;
    activeTeamMembers = 0;

    // Date filters
    selectedYear = new Date().getFullYear();
    selectedMonth = new Date().getMonth() + 1;
    availableYears = [2023, 2024, 2025];
    availableMonths = [
      { value: 1, name: 'January' },
      { value: 2, name: 'February' },
      { value: 3, name: 'March' },
      { value: 4, name: 'April' },
      { value: 5, name: 'May' },
      { value: 6, name: 'June' },
      { value: 7, name: 'July' },
      { value: 8, name: 'August' },
      { value: 9, name: 'September' },
      { value: 10, name: 'October' },
      { value: 11, name: 'November' },
      { value: 12, name: 'December' }
    ];

    // Data arrays
    orders: OrderResponseDTO[] = [];
    users: User[] = [];
    riders: DeliveryPersonProfile[] = [];
    menuItems: MenuItem[] = [];
    restaurants: Restaurant[] = [];
    cateringPackages: CateringPackage[] = [];
    cateringOrders: CateringOrder[] = [];
    recentTransactions: OrderResponseDTO[] = [];
    trendingMenuItems: MenuItem[] = [];
    availableRidersList: any[] = [];
    reviews: ReviewResponse[] = [];
    recentReviews: ReviewResponse[] = [];
    pendingRequests: any[] = [];
    teamMembers: TeamMember[] = [];
    customerLocations: CustomerLocation[] = [];





    loadDashboardData() {
      // Load all data concurrently
      this.orderService.getAllOrders().subscribe(orders => {
        this.orders = orders;
        this.calculateOrderStatistics();
        this.getRecentTransactions();
        this.createCharts();
      });

      this.userService.getAllUserswithoutPage().subscribe(users => {
        this.users = users;
        this.calculateUserStatistics();
      });

      this.riderService.getAllDeliveryPersonswithoutPage().subscribe(riders => {
        this.riders = riders;
        this.calculateRiderStatistics();
        this.getAvailableRiders();
      });

      this.menuItemService.getAllMenuItems().subscribe(menuItems => {
        this.menuItems = menuItems;
        this.getTrendingMenuItems();
      });

      this.getMenuItem();

      this.restaurantService.getRestaurants().subscribe(restaurants => {
        this.restaurants = restaurants;
      });

      // this.api.getCateringOrders().subscribe(cateringOrders => {
      //   this.cateringOrders = cateringOrders;
      //   this.totalCateringOrders = cateringOrders.length;
      // });

      this.reviewService.getAllReviews().subscribe(reviews => {
        this.reviews = reviews;
        this.calculateReviewStatistics();
        this.getRecentReviews();
      });



      // this.api.getTeamMembers().subscribe(members => {
      //   this.teamMembers = members;
      //   this.activeTeamMembers = members.filter(m => m.status === 'active').length;
      // });

      this.customerService.getCustomerLocations().subscribe(locations => {
        this.customerLocations = locations;
      });
    }
      getMenuItem(){
           this.menuItemService.getAllMenuItems().subscribe(menuItems => {
        this.menuItems = menuItems;
        this.getTrendingMenuItems();
      });
      }


    

    calculateOrderStatistics() {
      this.totalOrders = this.orders.length;

      // Calculate today's orders
      const today = new Date().toISOString().split('T')[0];
      this.totalOrdersToday = this.orders.filter(order =>
        order.createdAt.split('T')[0] === today
      ).length;

      // Calculate total revenue
      this.totalRevenue = this.orders
        .filter(order => order.paymentStatus === 'PAID')
        .reduce((sum, order) => sum + order.totalAmount, 0);
    }

    calculateUserStatistics() {
      this.totalCustomers = this.users.filter(user => user.primaryRole === 'CUSTOMER').length;
    }

    calculateRiderStatistics() {
      this.totalRiders = this.riders.length;
      this.availableRiders = this.riders.filter(rider => rider.availabilityStatus).length;
    }

    getRecentTransactions() {
      this.recentTransactions = this.orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    }

    getTrendingMenuItems() {
      // Simple logic to get random trending items
      this.trendingMenuItems = this.menuItems.slice(0, 4);
    }

    getAvailableRiders() {
      this.availableRidersList = this.riders
        .filter(rider => rider.availabilityStatus)
        .map(rider => {
          const user = this.users.find(u => u.id === rider.id);
          return {
            ...rider,
            name: user?.firstName || 'Unknown',
            phone: user?.phoneNumber || 'N/A'
          };
        });
    }

    createCharts() {
      setTimeout(() => {
        this.createSalesChart();
        this.createOrderStatusChart();
        this.createRevenueChart();
        this.createTopMenuChart();
        this.createCustomerLocationChart();
      }, 100);
    }

    calculateReviewStatistics() {
      if (this.reviews.length > 0) {
        this.totalReviews = this.reviews.length;
        this.averageRating = this.reviews.reduce((sum, review) => sum + review.foodRating, 0) / this.reviews.length;
      }
    }

    getRecentReviews() {
      this.recentReviews = this.reviews
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(review => {
          const user = this.users.find(u => u.id === review.userId);
          const restaurant = this.restaurants.find(r => r.id === review.restaurantId);
          return {
            ...review
          };
        });
    }

    onYearChange() {
      this.createCharts();
    }

    onMonthChange() {
      this.createCharts();
    }


createSalesChart() {
  if (!this.salesChart?.nativeElement) return;

  // Use real orders
  const monthlyCounts = new Array(12).fill(0);
  this.orders.forEach(order => {
    const month = new Date(order.createdAt).getMonth();
    if (month >= 0 && month < 12) monthlyCounts[month]++;
  });

  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const ctx = this.salesChart.nativeElement.getContext('2d');
  if (!ctx) return;

  // Cleanup
  if (this.salesChartInstance) this.salesChartInstance.destroy();

  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(79, 70, 229, 0.8)');
  gradient.addColorStop(1, 'rgba(79, 70, 229, 0.2)');

  this.salesChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [{
        label: 'Orders',
        data: monthlyCounts,
        borderColor: '#4F46E5',
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '📈 Monthly Orders Trend',
          font: { size: 16, weight: 'bold' }
        },
        legend: { display: true }
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
        x: { grid: { display: false } }
      }
    }
  });
}

    createOrderStatusChart() {
      if (!this.orderStatusChart) return;

      const statusCounts = this.orders.reduce((acc: any, order) => {
        acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
        return acc;
      }, {});

      const ctx = this.orderStatusChart.nativeElement.getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(statusCounts),
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: [
              '#10B981',
              '#F59E0B',
              '#EF4444',
              '#8B5CF6',
              '#06B6D4'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Order Status Distribution'
            }
          }
        }
      });
    }

  createRevenueChart() {
    if (!this.revenueChart?.nativeElement || !this.statistics) return;

    const ctx = this.revenueChart.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.revenueChartInstance) this.revenueChartInstance.destroy();

    this.revenueChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Total Revenue'], // You can expand to months if backend supports
        datasets: [{
          label: 'Revenue (৳)',
          data: [this.statistics.totalRevenue],
          backgroundColor: '#059669',
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '💰 Company Revenue',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => '৳' + v.toLocaleString() }
          }
        }
      }
    });
  }


    createTopMenuChart() {
  if (!this.topMenuChart?.nativeElement || this.orders.length === 0) return;

  const ctx = this.topMenuChart.nativeElement.getContext('2d');
  if (!ctx) return;

  if (this.topMenuChartInstance) {
    this.topMenuChartInstance.destroy();
  }

  // 🔥 Count how many times each menu item appears across all orders
  const itemCounts: { [name: string]: number } = {};

  this.orders.forEach(order => {
    order.orderItems?.forEach(item => {
      const name = item.menuItemName?.trim() || 'Unknown Item';
      itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
    });
  });

  // Get top 5 items by count
  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topItems.length === 0) return;

  const labels = topItems.map(([name]) => name);
  const data = topItems.map(([, count]) => count);
  const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

  this.topMenuChartInstance = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Items With Most Orders 🔥',
          font: { size: 16, weight: 'bold' }
        }
      },
      scales: {
        r: {
          beginAtZero: true
        }
      }
    }
  });
}


createCustomerLocationChart() {
  if (!this.customerLocationChart?.nativeElement || this.customerLocations.length === 0) return;

  const locations = this.customerLocations.slice(0, 8); // top 8 to avoid clutter
  const cities = locations.map(loc => loc.city);
  const customerCounts = locations.map(loc => loc.customers || 0);
  const orderCounts = locations.map(loc => loc.orders || 0);

  const ctx = this.customerLocationChart.nativeElement.getContext('2d');
  if (!ctx) return;

  if (this.customerLocationChartInstance) this.customerLocationChartInstance.destroy();

  this.customerLocationChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: cities,
      datasets: [
        {
          label: 'Customers',
          data: customerCounts,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderRadius: 6
        },
        {
          label: 'Orders',
          data: orderCounts,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '📍 Customers & Orders by City',
          font: { size: 16, weight: 'bold' }
        }
      },
      scales: {
        x: { stacked: false },
        y: { beginAtZero: true, stacked: false }
      }
    }
  });
}
    getOrderStatusClass(status: string): string {
      const statusClasses: { [key: string]: string } = {
        'delivered': 'bg-green-100 text-green-800',
        'in_transit': 'bg-blue-100 text-blue-800',
        'ready': 'bg-yellow-100 text-yellow-800',
        'pending': 'bg-gray-100 text-gray-800',
        'cancelled': 'bg-red-100 text-red-800'
      };
      return statusClasses[status] || 'bg-gray-100 text-gray-800';
    }

    getRequestTypeIcon(type: string): string {
      const icons: { [key: string]: string } = {
        'restaurant': '🏪',
        'rider': '🏍️',
        'catering': '🍽️'
      };
      return icons[type] || '📋';
    }

    getTeamStatusClass(status: string): string {
      const statusClasses: { [key: string]: string } = {
        'active': 'bg-green-100 text-green-800',
        'away': 'bg-yellow-100 text-yellow-800',
        'offline': 'bg-gray-100 text-gray-800'
      };
      return statusClasses[status] || 'bg-gray-100 text-gray-800';
    }

    getRatingStars(rating: number): string {
      return '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '⭐' : '');
    }

}
