import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import { environment } from 'src/app/Envirment/environment';
import { OrderResponseDTO } from 'src/app/Models/Order/order.models';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { NotificationResponseDTO, NotificationService } from 'src/app/services/notificationAndcoupon/notification.service';
import { OrderService } from 'src/app/services/Orders/order.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { RestaurantOwnerService } from 'src/app/services/UserServices/restaurant-owner.service';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss']
})
export class RestaurantComponent {
 restaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | null = null;
  newOrders: OrderResponseDTO[] = [];
  preparingOrders: OrderResponseDTO[] = [];
  readyOrders: OrderResponseDTO[] = [];

  ownerId: number = environment.ownerId; // Get from auth service 
  loading: boolean = false;
  error: string = '';

  // Stats
  todayOrders: number = 0;
  todayRevenue: number = 0;
  pendingOrders: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private restaurantService: RestaurantService,
    private orderService: OrderService,
    private router: Router ,
    private restaurantOwnerService:RestaurantOwnerService,
    private notificationService : NotificationService
  ) {}

  ngOnInit(): void {
    this.loadRestaurants();
    this.startOrderPolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRestaurants(): void {
    this.loading = true;
    this.restaurantService.getRestaurantsByOwner(this.ownerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (restaurants) => {
          this.restaurants = restaurants;
          if (restaurants.length > 0) {
            this.selectedRestaurant = restaurants[0];
            this.loadOrders(restaurants[0].id!);
            this.loadStats(restaurants[0].id!);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load restaurants';
          this.loading = false;
          console.error('Error loading restaurants:', err);
        }
      });
  }

  loadOrders(restaurantId: number): void {
    // Load orders by different statuses
    this.orderService.getOrdersByRestaurantAndStatus(restaurantId, 'PLACED')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.newOrders = orders;
          this.pendingOrders = orders.length;
        },
        error: (err) => console.error('Error loading new orders:', err)
      });

    this.orderService.getOrdersByRestaurantAndStatus(restaurantId, 'PREPARING')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {this.preparingOrders = orders
          console.log(orders);
          
        },
        
        error: (err) => {console.error('Error loading preparing orders:', err)}
      });

    this.orderService.getOrdersByRestaurantAndStatus(restaurantId, 'READY_FOR_PICKUP')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => this.readyOrders = orders,
        error: (err) => console.error('Error loading ready orders:', err)
      });
  }

  loadStats(restaurantId: number): void {
    // You'll need to add these endpoints to your backend
    // For now using mock data
    this.todayOrders = 24;
    this.todayRevenue = 2450;
  }

  startOrderPolling(): void {
    // Poll for new orders every 30 seconds
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.selectedRestaurant?.id) {
          this.loadOrders(this.selectedRestaurant.id);
        }
      });
  }

  onSelectRestaurant(restaurant: Restaurant): void {
    this.selectedRestaurant = restaurant;
    if (restaurant.id) {
      this.loadOrders(restaurant.id);
      this.loadStats(restaurant.id);
    }
  }

  acceptOrder(order: OrderResponseDTO): void {
    this.orderService.updateOrderStatus(order.id, 'CONFIRMED')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.newOrders = this.newOrders.filter(o => o.id !== order.id);
          this.preparingOrders.push(order);
          this.pendingOrders--;
        },
        error: (err) => {
          alert('Failed to accept order');
          console.error('Error accepting order:', err);
        }
      });
  }

  rejectOrder(order: OrderResponseDTO): void {
    if (!confirm('Are you sure you want to reject this order?')) return;

    this.orderService.updateOrderStatus(order.id, 'CANCELLED')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.newOrders = this.newOrders.filter(o => o.id !== order.id);
          this.pendingOrders--;
        },
        error: (err) => {
          alert('Failed to reject order');
          console.error('Error rejecting order:', err);
        }
      });
  }

  startPreparing(order: OrderResponseDTO): void {
    this.orderService.updateOrderStatus(order.id, 'PREPARING')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.preparingOrders = this.preparingOrders.filter(o => o.id !== order.id);
          this.preparingOrders.push(order);
        },
        error: (err) => {
          alert('Failed to update order status');
          console.error('Error updating order:', err);
        }
      });
  }

  markReady(order: OrderResponseDTO): void {

    console.log(order.id);
   
    
    
    this.orderService.updateOrderStatus2(order.id, 'READY_FOR_PICKUP')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {


          this.preparingOrders = this.preparingOrders.filter(o => o.id !== order.id);
          this.readyOrders.push(order);
        },
        error: (err) => {
          alert('Failed to mark order as ready');
          console.error('Error updating order:', err);
        }
      });
  }

  navigateToAddRestaurant(): void {
    this.router.navigate(['/restaurant/add']);
  }

  navigateToEditRestaurant(restaurantId: number): void {
    this.router.navigate(['/restaurant/edit', restaurantId]);
  }

  navigateToMenu(restaurantId: number): void {
    this.router.navigate(['/restaurant', restaurantId, 'menu']);
  }

  navigateToOffers(restaurantId: number): void {
    this.router.navigate(['/restaurant', restaurantId, 'offers']);
  }

  toggleRestaurantStatus(restaurant: Restaurant): void {
    const updatedRestaurant = { ...restaurant, isOpen: !restaurant.isOpen };
    this.restaurantService.updateRestaurant(restaurant.id!, updatedRestaurant)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          const index = this.restaurants.findIndex(r => r.id === updated.id);
          if (index !== -1) {
            this.restaurants[index] = updated;
            if (this.selectedRestaurant?.id === updated.id) {
              this.selectedRestaurant = updated;
            }
          }
        },
        error: (err) => {
          alert('Failed to update restaurant status');
          console.error('Error updating status:', err);
        }
      });
  }

  getOrderTime(orderDate: string): string {
    const now = new Date();
    const orderTime = new Date(orderDate);
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }

  //Notification

  
    
    notifications: NotificationResponseDTO[] = [];
    unreadCount = 0;
    loadingN = false;
      showNotificationsPanel = false;
    
      loadNotifications(): void {
        this.loadingN = true;
        this.notificationService.getUserNotifications(this.ownerId).subscribe({
          next: (res) => {
            this.notifications = res.content || res;
            this.loadingN = false;
          },
          error: (err) => {
            console.error('Failed to fetch notifications:', err);
            this.loadingN = false;
          }
        });
      }
    
    
    // ✅ No manual count updates!
    markAsRead(notificationId: number): void {
      this.notificationService.markAsRead(notificationId).subscribe();
    }
    
    markAllAsRead(): void {
      this.notificationService.markAllAsRead(this.ownerId).subscribe();
    }
    
      loadUnreadCount(): void {
        this.notificationService.getUnreadCount(this.ownerId).subscribe({
          next: (count) => (this.unreadCount = count),
          error: (err) => console.error('Failed to load unread count:', err)
        });
      }
    
    
    
    
    formatTimeAgo(isoDate: string): string {
        const date = new Date(isoDate);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + 'y';
    
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + 'mo';
    
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + 'd';
    
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + 'h';
    
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + 'm';
    
        return Math.floor(seconds) + 's';
      }
    
  
    
      // ✅ Fix: Separate click handler with stopPropagation
      toggleNotifications(event: MouseEvent): void {
        event.stopPropagation();
        this.showNotificationsPanel = !this.showNotificationsPanel;
    
        if (this.showNotificationsPanel) {
          this.markAllAsRead();
        }
      }
  
       @HostListener('document:click', ['$event'])
        onDocumentClick(event: Event): void {
          const target = event.target as HTMLElement;
      
     
      
          // Close Notification Panel
          const bell = document.querySelector('.notification-bell');
          const panel = document.querySelector('.notification-panel');
      
          if (
            this.showNotificationsPanel &&
            bell &&
            panel &&
            !bell.contains(target) &&
            !panel.contains(target)
          ) {
            this.showNotificationsPanel = false;
          }
        }




}
