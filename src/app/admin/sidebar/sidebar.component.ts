import { Component, EventEmitter, Output } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  @Output() sectionChange = new EventEmitter<string>();




  //---------------------

activeSection: string = 'dashboard';
  sidebarOpen: boolean = false;

  constructor(private router: Router) {
    // Listen to route changes to update active section
    this.router.events
      .pipe(filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveSection(event.url);
      });
  }

  setActive(section: string): void {
    this.activeSection = section;
    // Close mobile sidebar after navigation
    if (window.innerWidth < 768) {
      this.sidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  private updateActiveSection(url: string): void {
    // Extract the route name from URL
    const route = url.split('/')[1] || 'dashboard';
    this.activeSection = route;
  }

}
