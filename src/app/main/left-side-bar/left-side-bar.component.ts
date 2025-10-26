import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/app/Envirment/environment';
import { OrderResponseDTO } from 'src/app/Models/Order/order.models';
import { PaginatedResponse, User } from 'src/app/Models/Users/user.models';
import { OrderService } from 'src/app/services/Orders/order.service';
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

    recentOrder: OrderResponseDTO | null = null;

    currentPage: number = 0; // 0-indexed
  pageSize: number = 4;
  totalPages: number = 0;
  totalElements: number = 0;


  UserId:number =  environment.userId ; //Tsp



  // DEMO DATA - Replace with actual service calls
  user!: User  ;
  // debitCards: DebitCard[] = [];

  constructor(private paymentService: PaymentService, private router: Router,
    private userService:UserServiceService,
    private orderService:OrderService
  ) {}

  ngOnInit(): void {
    // Load debit cards for the user
    // this.paymentService.getUserDebitCards(this.user.id).subscribe(cards => {
    //   this.debitCards = cards;
    // });

    this.userService.getUserById(this.UserId).subscribe((res)=>{

      this.user = res ;

    })

    this.fetchMostRecentOrder();

   
    




    




  }

  closeSidebar() {

    this.isOpen = !this.isOpen;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  trackOrder(): void {
    this.router.navigate(['main/trackOrder', this.recentOrder?.id]);
  }


  
  


  fetchMostRecentOrder(): void {



    // Fetch page 0 with size 1 → gets the most recent order
    this.orderService.getOrdersByCustomermain(this.UserId,0, 1)
      .subscribe((response)=>{

          console.log(response);
          
        this.recentOrder = response.content.length > 0 ? response.content[0] : null

        console.log(this.recentOrder);
        
      }
          

      

       );
  }

    
}
