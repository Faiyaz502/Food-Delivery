import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AnalyticsModule } from "src/app/analytics/analytics.module";
import { CateringPackage, CateringOrder } from 'src/app/Models/catering-package.model';
import { CustomerLocation } from 'src/app/Models/customer-location.model';
import { MenuItem } from 'src/app/Models/MenuItem.model';
import { OrderResponseDTO } from 'src/app/Models/Order/order.models';


import { PendingRequest } from 'src/app/Models/pending-request.model';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { Review } from 'src/app/Models/review.model';
import { Rider } from 'src/app/Models/rider.model';
import { TeamMember } from 'src/app/Models/team-member.model';
import { User } from 'src/app/Models/Users/user.models';
import {  ApiService } from 'src/app/services/api.service';
import { OrderService } from 'src/app/services/Orders/order.service';


@Component({
  selector: 'app-admin-analytics',

  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.scss'],




})
export class AdminAnalyticsComponent {

///Total Order
@Input() dontWant : boolean = true ;

 @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  constructor(private api: ApiService , private orderService : OrderService) {}

  ngOnInit() {
    Chart.register(...registerables);
    this.orderService.getAllOrders().subscribe(orders => this.createMonthlyChart(orders));
     this.loadDashboardData();
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
    riders: Rider[] = [];
    menuItems: MenuItem[] = [];
    restaurants: Restaurant[] = [];
    cateringPackages: CateringPackage[] = [];
    cateringOrders: CateringOrder[] = [];
    recentTransactions: OrderResponseDTO[] = [];
    trendingMenuItems: MenuItem[] = [];
    availableRidersList: any[] = [];
    reviews: Review[] = [];
    recentReviews: any[] = [];
    pendingRequests: PendingRequest[] = [];
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

      this.api.getUsers().subscribe(users => {
        this.users = users;
        this.calculateUserStatistics();
      });

      this.api.getRiders().subscribe(riders => {
        this.riders = riders;
        this.calculateRiderStatistics();
        this.getAvailableRiders();
      });

      this.api.getMenuItems().subscribe(menuItems => {
        this.menuItems = menuItems;
        this.getTrendingMenuItems();
      });

      this.api.getRestaurants().subscribe(restaurants => {
        this.restaurants = restaurants;
      });

      this.api.getCateringOrders().subscribe(cateringOrders => {
        this.cateringOrders = cateringOrders;
        this.totalCateringOrders = cateringOrders.length;
      });

      this.api.getReviews().subscribe(reviews => {
        this.reviews = reviews;
        this.calculateReviewStatistics();
        this.getRecentReviews();
      });

      this.api.getPendingRequests().subscribe(requests => {
        this.pendingRequests = requests;
        this.pendingRequestsCount = requests.filter(r => r.status === 'pending').length;
      });

      this.api.getTeamMembers().subscribe(members => {
        this.teamMembers = members;
        this.activeTeamMembers = members.filter(m => m.status === 'active').length;
      });

      this.api.getCustomerLocations().subscribe(locations => {
        this.customerLocations = locations;
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
            ...review,
            userName: user?.firstName || 'Unknown User',
            restaurantName: restaurant?.name || 'Unknown Restaurant'
          };
        });
    }

    onYearChange() {
      this.createCharts();
    }

    onMonthChange() {
      this.createCharts();
    }

    approveRequest(requestId: string) {
      this.api.approveRequest(requestId).subscribe(() => {
        const request = this.pendingRequests.find(r => r.id === requestId);
        if (request) {
          request.status = 'approved';
          this.pendingRequestsCount = this.pendingRequests.filter(r => r.status === 'pending').length;
        }
      });
    }

    rejectRequest(requestId: string) {
      this.api.rejectRequest(requestId).subscribe(() => {
        const request = this.pendingRequests.find(r => r.id === requestId);
        if (request) {
          request.status = 'rejected';
          this.pendingRequestsCount = this.pendingRequests.filter(r => r.status === 'pending').length;
        }
      });
    }

    createSalesChart() {
      if (!this.salesChart) return;

      const ctx = this.salesChart.nativeElement.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Monthly Sales',
            data: [65, 59, 80, 81, 56, 55, 40, 65, 75, 85, 90, 95],
            borderColor: '#4F46E5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Monthly Sales Trend'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
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
      if (!this.revenueChart) return;

      const monthlyRevenue = Array(12).fill(0);
      this.orders.forEach(order => {
        if (order.paymentStatus === 'PAID') {
          const month = new Date(order.createdAt).getMonth();
          monthlyRevenue[month] += order.totalAmount;
        }
      });

      const ctx = this.revenueChart.nativeElement.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Revenue ($)',
            data: monthlyRevenue,
            backgroundColor: '#059669',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Monthly Revenue'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    createTopMenuChart() {
      if (!this.topMenuChart) return;

      const ctx = this.topMenuChart.nativeElement.getContext('2d');
      new Chart(ctx, {
        type: 'polarArea',
        data: {
          labels: this.trendingMenuItems.map(item => item.name),
          datasets: [{
            data: [25, 20, 18, 15],
            backgroundColor: [
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
              text: 'Popular Menu Items'
            }
          }
        }
      });
    }

    createCustomerLocationChart() {
      if (!this.customerLocationChart) return;

      const ctx = this.customerLocationChart.nativeElement.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.customerLocations.map(location => location.city),
          datasets: [{
            label: 'Customers',
            data: this.customerLocations.map(location => location.customers),
            backgroundColor: '#3B82F6',
            borderRadius: 8
          }, {
            label: 'Orders',
            data: this.customerLocations.map(location => location.orders),
            backgroundColor: '#10B981',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Customers by Location'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
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
