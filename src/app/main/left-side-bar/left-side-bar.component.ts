import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/Models/Users/user.models';
import { PaymentService } from 'src/app/services/payment/payment.service';

@Component({
  selector: 'app-left-side-bar',
  templateUrl: './left-side-bar.component.html',
  styleUrls: ['./left-side-bar.component.scss']
})
export class LeftSideBarComponent {
@Input() isOpen: boolean = true;
  @Output() closeSidebarEvent = new EventEmitter<void>();

  // DEMO DATA - Replace with actual service calls
  user: User = {
    id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com',
    profilePictureUrl: 'https://via.placeholder.com/150/ff0000/ffffff?text=JD' /* ... other properties */
  } as User;
  // debitCards: DebitCard[] = [];

  constructor(private paymentService: PaymentService, private router: Router) {}

  ngOnInit(): void {
    // Load debit cards for the user
    // this.paymentService.getUserDebitCards(this.user.id).subscribe(cards => {
    //   this.debitCards = cards;
    // });
  }

  closeSidebar() {
    this.closeSidebarEvent.emit();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
