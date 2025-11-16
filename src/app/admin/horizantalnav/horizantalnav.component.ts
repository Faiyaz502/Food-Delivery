import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdminProfile, UserProfile } from 'src/app/Models/Users/profile.model';
import { User } from 'src/app/Models/Users/user.models';
import { AuthServiceService } from 'src/app/services/authService/auth-service.service';
import { TokenService } from 'src/app/services/authService/token.service';
import { NotificationResponseDTO, NotificationService } from 'src/app/services/notificationAndcoupon/notification.service';
import { AdminProfileService } from 'src/app/services/UserServices/admin-profile.service';
import { UserProfileService } from 'src/app/services/UserServices/user-profile.service';
import { UserServiceService } from 'src/app/services/UserServices/user.service.service';
import { WebSocketService } from 'src/app/services/web-Socket/web-socket.service';

@Component({
  selector: 'app-horizantalnav',
  templateUrl: './horizantalnav.component.html',
  styleUrls: ['./horizantalnav.component.scss']
})
export class HorizantalnavComponent implements OnInit {

public showChatDropdown: boolean = false;
  public showNotificationsDropdown: boolean = false;
  public showProfileDropdown: boolean = false;

       userId: any = null; 
     user! : User ;


  constructor(private auth:AuthServiceService ,private router : Router,
    private token : TokenService,
        private userService:UserServiceService,
        private webSocket:WebSocketService ,
        private notificationService : NotificationService
  ){}
  ngOnInit(): void {
       this.userId = Number(this.token.getId());

     this.loadAdmin();

      this.loadNotifications();



    //webSocket

      this.ConncetWebSocket();


        this.webSocket.notificationReceived
    .pipe(takeUntil(this.destroy$))
    .subscribe(notification => {
      console.log(notification);
      
      const exists = this.notifications.some(n => n.id === notification.id);
      if (!exists) {
        this.notifications.unshift(notification);
        this.unreadCount += 1;
      }
    });



  }

  /**
   * Toggles the visibility of a specific dropdown and closes all others.
   * @param dropdownName The name of the dropdown to toggle.
   */
  toggleDropdown(dropdownName: 'chat' | 'notifications' | 'profile'): void {
    // Check if the clicked dropdown is already open. If so, close it.
    if (
      (dropdownName === 'chat' && this.showChatDropdown) ||
      (dropdownName === 'notifications' && this.showNotificationsDropdown) ||
      (dropdownName === 'profile' && this.showProfileDropdown)
    ) {
      this.closeAllDropdowns();
    } else {
      // Close all dropdowns first, then open the selected one.
      this.closeAllDropdowns();
      switch (dropdownName) {
        case 'chat':
          this.showChatDropdown = true;
          break;
        case 'notifications':
          this.showNotificationsDropdown = true;
          break;
        case 'profile':
          this.showProfileDropdown = true;
          break;
      }
    }
  }


     loadAdmin(){

    this.userService.getUserById(this.userId).subscribe((x)=>{

      console.log(x);
      
        this.user = x ;

      })



  }


  

  //notification

   private destroy$ = new Subject<void>();
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



    //WebSocket

async ConncetWebSocket() {
 await this.webSocket.connect(this.userId);


}


  /**
   * Closes all dropdown menus.
   */
  private closeAllDropdowns(): void {
    this.showChatDropdown = false;
    this.showNotificationsDropdown = false;
    this.showProfileDropdown = false;
  }

  /**
   * Listens for clicks on the entire document to close dropdowns when the user clicks away.
   * @param event The mouse click event.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Check if the click is outside all dropdowns and their toggle buttons.
    if (!target.closest('button') && !target.closest('.relative')) {
      this.closeAllDropdowns();
    }
  }


  Logout() {

    this.auth.logout();

    this.router.navigate(['adminLogin'])

}

}
