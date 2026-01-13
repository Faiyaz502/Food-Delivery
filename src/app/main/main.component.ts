import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { Component, HostListener } from '@angular/core';
import { CartService } from '../services/Cart/cart.service';
import { CartResponseDTO } from '../Models/cart/cart.models';
import { environment } from '../Envirment/environment';
import { NotificationResponseDTO, NotificationService} from '../services/notificationAndcoupon/notification.service';


import { WebSocketService } from '../services/web-Socket/web-socket.service';
import { parseJwt, TokenService } from '../services/authService/token.service';
import { AuthServiceService } from '../services/authService/auth-service.service';

export interface Page<T> {
  content: T[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {




isCartOpen = false;
  isProfileOpen = false;
  isLogin = false;


   private destroy$ = new Subject<void>();

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
    if (this.isCartOpen) this.isProfileOpen = false;
  }

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
    if (this.isProfileOpen) this.isCartOpen = false;
  }

  closeSidebars() {
    this.isCartOpen = false;
    this.isProfileOpen = false;
  }


    cart: CartResponseDTO | null = null;

    userId: any = null;




    constructor(private cartService: CartService,private router: Router,
      private notificationService: NotificationService ,
      private webSocket:WebSocketService ,
      private token : TokenService ,
      private auth : AuthServiceService
    ) {}

    ngOnInit(): void {



      if(this.auth.isLoggedIn()){

          this.isLogin = true ;

     const token = this.token.getToken()  ;

      if(token != null){
        const payload =  decodeJwtPayload(token);

        console.log(payload.roles[0]);

          if(payload.roles[0] != "ROLE_CUSTOMER"){

            this.token.removeToken();

            this.isLogin = false ;


          }
      }
      }

     this.userId = Number(this.token.getId());





      // Load cart on component initialization (if not already loaded)
      this.cartService.getOrCreateCart(this.userId).subscribe();

      // Subscribe to currentCart$ for real-time updates
      this.cartService.currentCart$.subscribe(cart => {
        this.cart = cart;
        console.log(cart);

      });

       this.loadNotifications();

      this.loadUnreadCount();

      //webSocket

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


    }

          //restaurants
     goToRestaurants() {
    this.router.navigate(['/main/restaurantList/All']);
  }


  //Join button

    isJoinDropdownOpen = false;

  toggleJoinDropdown() {
    this.isJoinDropdownOpen = !this.isJoinDropdownOpen;
  }

  closeJoinDropdown() {
    this.isJoinDropdownOpen = false;

  }





  //notification


notifications: NotificationResponseDTO[] = [];
unreadCount = 0;
loading = false;
  showNotificationsPanel = false;

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getUserNotifications(this.userId).subscribe({
      next: (res) => {
        this.notifications = res.content || res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch notifications:', err);
        this.loading = false;
      }
    });
  }


// ✅ No manual count updates!
markAsRead(notificationId: number): void {
  this.notificationService.markAsRead(notificationId).subscribe();
}

markAllAsRead(): void {
  this.notificationService.markAllAsRead(this.userId).subscribe();
}

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount(this.userId).subscribe({
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

    ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ Fix: Separate click handler with stopPropagation
  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.showNotificationsPanel = !this.showNotificationsPanel;

    if (this.showNotificationsPanel) {
      this.markAllAsRead();
      this.unreadCount=0;
        this.loadNotifications();
    }
  }



  // ✅ Fixed @HostListener
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Close Join Dropdown
    if (!target.closest('.join-dropdown-container')) {
      this.isJoinDropdownOpen = false;
    }

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


    //WebSocket

async ConncetWebSocket() {
 await this.webSocket.connect(this.userId);


}









}
function decodeJwtPayload(token: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT');
  const payload = parts[1];
  // pad base64
  const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  const padded = b64 + (pad ? '='.repeat(4 - pad) : '');
  const json = atob(padded);
  return JSON.parse(json);
}

