import { TokenService } from './../../services/authService/token.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { CateringOrder, CateringPackage } from 'src/app/Models/catering-package.model';
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


import { AuthServiceService } from 'src/app/services/authService/auth-service.service';
import { MenuItemService } from 'src/app/services/menu-item.service';
import { OrderService } from 'src/app/services/Orders/order.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { ReviewService } from 'src/app/services/reviewAndCoupon/review.service';
import { DeliveryPersonService } from 'src/app/services/UserServices/delivery-person.service';
import { UserProfileService } from 'src/app/services/UserServices/user-profile.service';
import { UserServiceService } from 'src/app/services/UserServices/user.service.service';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent  {


statistics: OrderStatistics | null = null;

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
  riders: DeliveryPersonProfile[] = [];
  menuItems: MenuItem[] = [];
  restaurants: Restaurant[] = [];
  cateringPackages: CateringPackage[] = [];
  cateringOrders: CateringOrder[] = [];
  recentTransactions: OrderResponseDTO[] = [];
  trendingMenuItems: MenuItem[] = [];
  availableRidersList: DeliveryPersonProfile[] = [];
  reviews: ReviewResponse[] = [];
  recentReviews: ReviewResponse[] = [];
  pendingRequests: Restaurant[] = [];
  teamMembers: TeamMember[] = [];
  customerLocations: CustomerLocation[] = [];

  constructor( private orderApi : OrderService , private userService : UserServiceService,
   private ss :TokenService , private auth : AuthServiceService , private riderService:DeliveryPersonService,
   private menuService : MenuItemService , private restaurantService:RestaurantService,private reviewService:ReviewService,
   private customerService:UserProfileService
  ) {}

  ngOnInit() {

   const token = this.ss.getToken
   console.log(token);



   this.loadDashboardData();


  }

  fetchStatistics() {
  this.orderApi.getCompanyStatistics().subscribe(stats => {
    this.statistics = stats;

    console.log(stats);



  });
}

  loadDashboardData() {
    // Load all data concurrently
    this.orderApi.getAllOrders().subscribe(orders => {
      this.orders = orders;
      this.calculateOrderStatistics();
      this.getRecentTransactions();

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

    this.menuService.getAllMenuItems().subscribe(menuItems => {
      this.menuItems = menuItems;
      this.getTrendingMenuItems();
    });

    this.restaurantService.getRestaurants().subscribe(restaurants => {
      this.restaurants = restaurants;
    });



    this.reviewService.getAllReviews().subscribe(reviews => {
      this.reviews = reviews;
    

      this.calculateReviewStatistics();
      this.getRecentReviews();
    });

    this.restaurantService.getPendingApprovalRestaurants().subscribe(requests => {
      this.pendingRequests = requests;

    });

    // this.apiService.getTeamMembers().subscribe(members => {
    //   this.teamMembers = members;
    //   this.activeTeamMembers = members.filter(m => m.status === 'active').length;
    // });

    this.customerService.getCustomerLocations().subscribe(locations => {
      this.customerLocations = locations;
    });

     this.fetchStatistics();
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
        return {
          ...rider
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
          ...review
        };
      });
  }

   approveRequest(requestId: number) {
      this.restaurantService.verifyRestaurant(requestId,'ACTIVE').subscribe(() => {
        const request = this.pendingRequests.find(r => r.id === requestId);
        if (request) {
          request.status = 'ACTIVE';
          this.pendingRequestsCount = this.pendingRequests.filter(r => r.status === 'PENDING_APPROVAL').length;
        }

      });
    }


//   verifyRestaurant(id: number, status: string) {
//   if (!confirm(`Are you sure you want to mark this restaurant as ${status.toLowerCase()}?`)) {
//     return;
//   }

//   this.apiService.verifyRestaurant(id, status).subscribe({
//     next: (updatedRestaurant) => {
//       // Update the local restaurant list with the new status
//       const index = this.restaurants.findIndex(r => r.id === id);
//       if (index !== -1) {
//         this.restaurants[index] = updatedRestaurant;
//       }
//       alert('Restaurant status updated successfully!');
//     },
//     error: (err) => {
//       console.error('Verification failed', err);
//       alert('Failed to update restaurant status. Please try again.');
//     }
//   });
// }




  rejectRequest(requestId: number) {
    this.restaurantService.verifyRestaurant(requestId,'REJECTED').subscribe(() => {
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








