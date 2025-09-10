import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

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
    if (!this.isMobile) this.sidebarOpen = true; // keep sidebar open on desktop
  }

}
