import { Component } from '@angular/core';

@Component({
  selector: 'app-vendor-login',
  templateUrl: './vendor-login.component.html',
  styleUrls: ['./vendor-login.component.scss']
})
export class VendorLoginComponent {
 userType: 'rider' | 'restaurant' = 'rider';

  /**
   * Toggles the userType property.
   * @param type The user type to set ('rider' or 'restaurant').
   */
  toggleUserType(type: 'rider' | 'restaurant'): void {
    this.userType = type;
  }

  /**
   * Handles the form submission (for demonstration).
   */
  submitForm(): void {
    const type = this.userType;
    console.log(`Attempting sign-in as: ${type}`);
    // In a real application, you would add authentication logic here.
  }
}
