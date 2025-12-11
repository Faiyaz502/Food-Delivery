import { ToastrService } from 'ngx-toastr';
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
import { WebSocketService } from 'src/app/services/web-Socket/web-socket.service';
import { MenuItem } from 'src/app/Models/MenuItem.model';
import { MenuItemService } from 'src/app/services/menu-item.service';
import { MenuCategoryDto, MenuCategoryService } from 'src/app/services/restaurant/menu-category.service';
import { TokenService } from 'src/app/services/authService/token.service';
import { AuthServiceService } from 'src/app/services/authService/auth-service.service';
import { RestaurantOwnerProfile } from 'src/app/Models/Users/profile.model';


@Component({
  selector: 'app-restaurant',
  templateUrl:'./restaurant.component.html',
  styleUrls: ['./restaurant.component.scss']
})
export class RestaurantComponent {



 restaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | null = null;
  newOrders: OrderResponseDTO[] = [];
  preparingOrders: OrderResponseDTO[] = [];
  readyOrders: OrderResponseDTO[] = [];
    categories!: MenuCategoryDto[];
  menuItems: MenuItem[] = [];
    showAddMenuItem = false;
  showEditMenuItem = false;
    showCreateModal = false;
  showEditModal = false;
  showMenuModal = false;
   showOrders: boolean = false;
   owner!:RestaurantOwnerProfile;


  ownerId: any ; // Get from auth service
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
    private notificationService : NotificationService,
     private webSocket:WebSocketService,
     private toast : ToastrService,
     private menuService : MenuItemService,
     private menuCategoryService : MenuCategoryService,
     private token : TokenService ,
     private auth : AuthServiceService
  ) {}

  ngOnInit(): void {
     this.ownerId = Number(this.token.getId());

    this.loadRestaurants();
    this.startOrderPolling();


     this.ConncetWebSocket();


        this.webSocket.notificationReceived
    .pipe(takeUntil(this.destroy$))
    .subscribe(notification => {
      const exists = this.notifications.some(n => n.id === notification.id);
      if (!exists) {
        this.notifications.unshift(notification);
        this.unreadCount += 1;
      }
    });

   this.getRestaurantOwner(this.ownerId);


  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();


    this.restaurantService.closeAllRestaurantsByOwner(this.ownerId).subscribe({
      next: (res) => console.log(res),
      error: (err) => console.error(' Failed to close restaurants', err)
    });


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


  getAllCategorys(){
        this.menuCategoryService.getAllCategories().subscribe((res)=>{

          console.log("category ",res);


            this.categories = res ;

        })


  }

  getRestaurantOwner(ownerId:number){

    this.restaurantOwnerService.getRestaurantOwnerById(ownerId).subscribe((s)=>{

          this.owner = s ;

    })
  }

 loadStats(restaurantId: number): void {
  this.orderService.getTodayStats(restaurantId)
    .subscribe({
      next: (data) => {
        this.todayOrders = data.todayOrders;
        this.todayRevenue = data.todayRevenue;
      }
    });
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


    //  No manual count updates!
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



      //  Fix: Separate click handler with stopPropagation
        toggleNotifications(event: MouseEvent): void {
      event.stopPropagation();
      this.showNotificationsPanel = !this.showNotificationsPanel;

      if (this.showNotificationsPanel) {
        this.markAllAsRead();
        this.unreadCount=0;
          this.loadNotifications();
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


        //

             async ConncetWebSocket() {
 await this.webSocket.connect(this.ownerId);


}


//toggle restaurant status

toggleOpenClose(id: number, isOpen: boolean | undefined): void {
  const newStatus = !isOpen;
  this.restaurantService.toggleRestaurantStatus(id, newStatus).subscribe({
    next: (updated) => {
      console.log('✅ Restaurant status updated:', updated);

         //  Immediately update local data (UI)
      const index = this.restaurants.findIndex(r => r.id === id);
      if (index !== -1) {
        this.restaurants[index].isOpen = updated.isOpen;
      }

      this.toast.info(`Restaurant is now ${updated.isOpen ? 'Open' : 'Closed'}`);

    },
    error: (err) => {
      console.error('❌ Failed to update restaurant status:', err);
    }
  });
}

// ✅ FIXED: Corrected method call and error handling
    // Menu item image upload
  selectedMenuItemImageFile: File | null = null;
  previewMenuItemImageUrl: string | null = null;

 currentMenuItem: MenuItem = {
  name: '',
  price: 0,
  description: '',
  imageUrl: '',
  isSpicy: false,
  spiceLevel: 0,
  preparationTime: 30,
  isAvailable: true,
  restaurantId: 0,
  catagoryName: ''
};
onMenuItemImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedMenuItemImageFile = input.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewMenuItemImageUrl = e.target.result;
    };
    reader.readAsDataURL(this.selectedMenuItemImageFile);
  }
}

private async uploadMenuItemImage(menuItemId: number): Promise<void> {
  if (!this.selectedMenuItemImageFile) {
    console.log('No menu item image selected');
    return;
  }

  const formData = new FormData();
  formData.append('file', this.selectedMenuItemImageFile);

  try {
    console.log(`Uploading image for menu item ${menuItemId}...`);
    // ✅ FIXED: Use correct method name from MenuItemService
    await this.menuService.uploadMenuItemImage(menuItemId, formData).toPromise();
    console.log('Menu item image uploaded successfully');
  } catch (error) {
    console.error('Menu item image upload failed:', error);
    alert('Failed to upload menu item image. Please try again.');
    throw error; // Re-throw to handle in calling function
  }
}

// ✅ IMPROVED: Better error handling and flow


  viewMenuItems(restaurant: Restaurant) {

    this.menuService.getMenuItemsByRestaurant(restaurant.id || 0).subscribe(items => {
      console.log(items);
        this.getAllCategorys();
      this.menuItems = items;
      this.showMenuModal = true;


    });
  }

  editMenuItem(item: MenuItem) {
    this.currentMenuItem = { ...item };
    this.showEditMenuItem = true;

  }

  deleteMenuItem(id: number) {
    if (confirm('Are you sure you want to delete this menu item?')) {
      this.menuService.delete(id).subscribe(() => {
        if (this.selectedRestaurant) {
          this.viewMenuItems(this.selectedRestaurant);
        }
      });
    }}

async saveMenuItem() {
  if (!this.selectedRestaurant) {
    alert('No restaurant selected');
    return;
  }

  this.currentMenuItem.restaurantId = this.selectedRestaurant.id ?? 0;

  try {
    if (this.showEditMenuItem) {
      // Update existing menu item
      await this.menuService.updateMenu(this.currentMenuItem.id!, this.currentMenuItem).toPromise();
      console.log('Menu item updated');

      // Upload image if selected
      if (this.selectedMenuItemImageFile) {
        await this.uploadMenuItemImage(this.currentMenuItem.id!);
      }

      this.viewMenuItems(this.selectedRestaurant!);
      this.closeMenuItemModal();
    } else {
      // Create new menu item
      const res = await this.menuService.createMenuItem(this.currentMenuItem).toPromise();
      console.log('Menu item created:', res);

      // Upload image if selected
      if (res && res.id && this.selectedMenuItemImageFile) {
        await this.uploadMenuItemImage(res.id);
      }

      this.viewMenuItems(this.selectedRestaurant!);
      this.closeMenuItemModal();
    }
  } catch (error) {
    console.error('Error saving menu item:', error);
    alert('Failed to save menu item. Please check console for details.');
  }
}

closeMenuItemModal() {
  this.showAddMenuItem = false;
  this.showEditMenuItem = false;
  this.currentMenuItem = {
    name: '',
    price: 0,
    description: '',
    imageUrl: '',
    isSpicy: false,
    spiceLevel: 0,
    preparationTime: 30,
    isAvailable: true,
    restaurantId: 0,
    catagoryName: ''
  };
  // ✅ Clear image selection
  this.selectedMenuItemImageFile = null;
  this.previewMenuItemImageUrl = null;
}


  closeMenuModal() {
    this.showMenuModal = false;


    this.menuItems = [];
  }


  showOrder(){

this.showOrders = true ;


  }

Logout() {
this.auth.logout();
  this.router.navigate(['/vendor']).then(() => {
      this.toast.success("Succesfully Logout from the Account")
  });
}




}
