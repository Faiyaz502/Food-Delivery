import { TokenService } from './../../services/authService/token.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { CateringOrder, CateringPackage } from 'src/app/Models/catering-package.model';
import { CustomerLocation } from 'src/app/Models/customer-location.model';
import { MenuItem } from 'src/app/Models/MenuItem.model';

import { OrderResponseDTO } from 'src/app/Models/Order/order.models';


import { PendingRequest } from 'src/app/Models/pending-request.model';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { Review } from 'src/app/Models/review.model';
import { Rider } from 'src/app/Models/rider.model';
import { TeamMember } from 'src/app/Models/team-member.model';
import { User } from 'src/app/Models/Users/user.models';

import { ApiService } from 'src/app/services/api.service';
import { AuthServiceService } from 'src/app/services/authService/auth-service.service';
import { OrderService } from 'src/app/services/Orders/order.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent  {


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

  constructor(private apiService: ApiService , private orderApi : OrderService ,
   private ss :TokenService , private auth : AuthServiceService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
   const token = this.ss.getToken
   console.log(token);
    



  }

  loadDashboardData() {
    // Load all data concurrently
    this.orderApi.getAllOrders().subscribe(orders => {
      this.orders = orders;
      this.calculateOrderStatistics();
      this.getRecentTransactions();

    });

    this.apiService.getUsers().subscribe(users => {
      this.users = users;
      this.calculateUserStatistics();
    });

    this.apiService.getRiders().subscribe(riders => {
      this.riders = riders;
      this.calculateRiderStatistics();
      this.getAvailableRiders();
    });

    this.apiService.getMenuItems().subscribe(menuItems => {
      this.menuItems = menuItems;
      this.getTrendingMenuItems();
    });

    this.apiService.getRestaurants().subscribe(restaurants => {
      this.restaurants = restaurants;
    });

    this.apiService.getCateringOrders().subscribe(cateringOrders => {
      this.cateringOrders = cateringOrders;
      this.totalCateringOrders = cateringOrders.length;
    });

    this.apiService.getReviews().subscribe(reviews => {
      this.reviews = reviews;
      this.calculateReviewStatistics();
      this.getRecentReviews();
    });

    this.apiService.getPendingRequests().subscribe(requests => {
      this.pendingRequests = requests;
      this.pendingRequestsCount = requests.filter(r => r.status === 'pending').length;
    });

    this.apiService.getTeamMembers().subscribe(members => {
      this.teamMembers = members;
      this.activeTeamMembers = members.filter(m => m.status === 'active').length;
    });

    this.apiService.getCustomerLocations().subscribe(locations => {
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

   approveRequest(requestId: string) {
      this.apiService.approveRequest(requestId).subscribe(() => {
        const request = this.pendingRequests.find(r => r.id === requestId);
        if (request) {
          request.status = 'approved';
          this.pendingRequestsCount = this.pendingRequests.filter(r => r.status === 'pending').length;
        }
      });
    }


  rejectRequest(requestId: string) {
    this.apiService.rejectRequest(requestId).subscribe(() => {
      const request = this.pendingRequests.find(r => r.id === requestId);
      if (request) {
        request.status = 'rejected';
        this.pendingRequestsCount = this.pendingRequests.filter(r => r.status === 'pending').length;
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








