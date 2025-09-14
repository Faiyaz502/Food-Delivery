import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

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

  ];

  secondaryNavItems = [
    { path: 'riders', label: 'Riders', icon: '<i class="fas fa-motorcycle"></i>' },
    { path: 'catering', label: 'Catering', icon: '<i class="fas fa-utensils"></i>' },
    { path: 'settings', label: 'Settings', icon: '<i class="fas fa-cog"></i>' },
  ];

  @Output() sectionChange = new EventEmitter<string>();


 sidebarOpen: boolean = false;
  isMobile: boolean = false;

  constructor() {
    this.checkWindowSize();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
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
