import { Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/app/services/authService/auth-service.service';

@Component({
  selector: 'app-horizantalnav',
  templateUrl: './horizantalnav.component.html',
  styleUrls: ['./horizantalnav.component.scss']
})
export class HorizantalnavComponent {

public showChatDropdown: boolean = false;
  public showNotificationsDropdown: boolean = false;
  public showProfileDropdown: boolean = false;

  constructor(private auth:AuthServiceService ,private router : Router){}

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
