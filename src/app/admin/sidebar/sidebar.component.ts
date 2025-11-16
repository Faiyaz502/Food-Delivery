import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AdminProfile } from 'src/app/Models/Users/profile.model';
import { TokenService } from 'src/app/services/authService/token.service';
import { AdminProfileService } from 'src/app/services/UserServices/admin-profile.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

   navItems = [
    { path: 'dashboard', label: 'Dashboard', icon: '<i class="fas fa-chart-line"></i>' },
    { path: 'adminAnalytics', label: 'Analytics', icon: '<i class="fas fa-chart-pie"></i>' },
    { path: 'users', label: 'Users', icon: '<i class="fas fa-users"></i>' },
    { path: 'customer', label: 'Customer', icon: '<i class="fas fa-users"></i>' },
    { path: 'restaurant', label: 'Restaurants', icon: '<i class="fas fa-store"></i>' },
    { path: 'orders', label: 'Orders', icon: '<i class="fas fa-box"></i>' },
    { path: 'review', label: 'Reviews', icon: '<i class="fa-solid fa-star"></i>' },
    { path: 'notification', label: 'Notification', icon: '<i class="fa-solid fa-bell"></i>' },
    { path: 'chat', label: 'Chat', icon: '<i class="fa-solid fa-comments"></i>' },
    { path: 'profile', label: 'Profile', icon: '<i class="fa-solid fa-user"></i>' },
    { path: 'payroll', label: 'Payroll', icon: '<i class="fa-solid fa-comments-dollar"></i>' },

  ];

  secondaryNavItems = [
    { path: 'riders', label: 'Riders', icon: '<i class="fas fa-motorcycle"></i>' },
    { path: 'catering', label: 'Catering', icon: '<i class="fas fa-utensils"></i>' },
    { path: 'settings', label: 'Settings', icon: '<i class="fas fa-cog"></i>' },
  ];

  @Output() sectionChange = new EventEmitter<string>();

      userId: any = null; 
    admin! : AdminProfile ;

 sidebarOpen: boolean = false;
  isMobile: boolean = false;

  constructor(private token : TokenService,
    private adminService:AdminProfileService
  ) {
    this.checkWindowSize();
  }
  ngOnInit(): void {
     this.userId = Number(this.token.getId());

     this.loadAdmin();

  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

   loadAdmin(){

    this.adminService.getAdminProfileById(this.userId).subscribe((x)=>{

        this.admin = x ;

      })



  }




  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowSize();
  }

  private checkWindowSize() {
    this.isMobile = window.innerWidth < 768; // Tailwind md breakpoint
    if (!this.isMobile){
      this.sidebarOpen = true; // keep sidebar open on desktop
    } else{
      this.sidebarOpen= false;
    }
  }

}
