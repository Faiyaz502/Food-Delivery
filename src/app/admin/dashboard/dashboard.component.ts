import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { CateringOrder, CateringPackage } from 'src/app/Models/catering-package.model';
import { CustomerLocation } from 'src/app/Models/customer-location.model';
import { MenuItem } from 'src/app/Models/menu-item.model';
import { Order } from 'src/app/Models/order.model';
import { Payment } from 'src/app/Models/payment.model';
import { PendingRequest } from 'src/app/Models/pending-request.model';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { Review } from 'src/app/Models/review.model';
import { Rider } from 'src/app/Models/rider.model';
import { TeamMember } from 'src/app/Models/team-member.model';
import { User } from 'src/app/Models/user.model';
import { ApiService } from 'src/app/services/api.service';


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
  orders: Order[] = [];
  users: User[] = [];
  riders: Rider[] = [];
  menuItems: MenuItem[] = [];
  restaurants: Restaurant[] = [];
  cateringPackages: CateringPackage[] = [];
  cateringOrders: CateringOrder[] = [];
  recentTransactions: Order[] = [];
  trendingMenuItems: MenuItem[] = [];
  availableRidersList: any[] = [];
  reviews: Review[] = [];
  recentReviews: any[] = [];
  pendingRequests: PendingRequest[] = [];
  teamMembers: TeamMember[] = [];
  customerLocations: CustomerLocation[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Load all data concurrently
    this.apiService.getOrders().subscribe(orders => {
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
      order.created_at.split('T')[0] === today
    ).length;

    // Calculate total revenue
    this.totalRevenue = this.orders
      .filter(order => order.payment_status === 'paid')
      .reduce((sum, order) => sum + order.total_amount, 0);
  }

  calculateUserStatistics() {
    this.totalCustomers = this.users.filter(user => user.role === 'customer').length;
  }

  calculateRiderStatistics() {
    this.totalRiders = this.riders.length;
    this.availableRiders = this.riders.filter(rider => rider.availability).length;
  }

  getRecentTransactions() {
    this.recentTransactions = this.orders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }

  getTrendingMenuItems() {
    // Simple logic to get random trending items
    this.trendingMenuItems = this.menuItems.slice(0, 4);
  }

  getAvailableRiders() {
    this.availableRidersList = this.riders
      .filter(rider => rider.availability)
      .map(rider => {
        const user = this.users.find(u => u.id === rider.id);
        return {
          ...rider,
          name: user?.name || 'Unknown',
          phone: user?.phone || 'N/A'
        };
      });
  }



  calculateReviewStatistics() {
    if (this.reviews.length > 0) {
      this.totalReviews = this.reviews.length;
      this.averageRating = this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length;
    }
  }

  getRecentReviews() {
    this.recentReviews = this.reviews
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(review => {
        const user = this.users.find(u => u.id === review.user_id);
        const restaurant = this.restaurants.find(r => r.id === review.restaurant_id);
        return {
          ...review,
          userName: user?.name || 'Unknown User',
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








