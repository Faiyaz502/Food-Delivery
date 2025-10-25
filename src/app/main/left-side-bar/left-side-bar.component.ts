import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/Models/Users/user.models';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { UserServiceService } from 'src/app/services/UserServices/user.service.service';

@Component({
  selector: 'app-left-side-bar',
  templateUrl: './left-side-bar.component.html',
  styleUrls: ['./left-side-bar.component.scss']
})
export class LeftSideBarComponent {
@Input() isOpen: boolean = false;
  @Output() closeSidebarEvent = new EventEmitter<void>();

  // UserId:number = 5 ; // home
  UserId:number = 2 ; //Tsp



  // DEMO DATA - Replace with actual service calls
  user!: User  ;
  // debitCards: DebitCard[] = [];

  constructor(private paymentService: PaymentService, private router: Router,private userService:UserServiceService) {}

  ngOnInit(): void {
    // Load debit cards for the user
    // this.paymentService.getUserDebitCards(this.user.id).subscribe(cards => {
    //   this.debitCards = cards;
    // });

    this.userService.getUserById(this.UserId).subscribe((res)=>{

      this.user = res ;

    })




  }

  closeSidebar() {

    this.isOpen = !this.isOpen;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
