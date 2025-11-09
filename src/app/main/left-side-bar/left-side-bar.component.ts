import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/app/Envirment/environment';
import { OrderResponseDTO } from 'src/app/Models/Order/order.models';
import { PaginatedResponse, User } from 'src/app/Models/Users/user.models';
import { AuthServiceService } from 'src/app/services/authService/auth-service.service';
import { TokenService } from 'src/app/services/authService/token.service';
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


  UserId:any ; //Tsp



  // DEMO DATA - Replace with actual service calls
  user!: User  ;
  // debitCards: DebitCard[] = [];

  constructor(private paymentService: PaymentService, private router: Router,
    private userService:UserServiceService,
    private orderService:OrderService ,
    private token :TokenService ,
    private auth:AuthServiceService
  ) {}

  ngOnInit(): void {
     this.UserId = Number(this.token.getId());
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


  //upload image

  @ViewChild('profileImageInput', { static: false }) profileImageInput!: ElementRef;

// Trigger file input click
triggerFileInput(): void {
  this.profileImageInput.nativeElement.click();
}

// Handle image selection
onProfileImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];

    // Optional: Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, etc.)');
      return;
    }

    // Preview immediately
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.user.imageUrl = e.target.result; // Update preview
    };
    reader.readAsDataURL(file);

    // Upload to backend
    this.uploadProfileImage(file);
  }

  // Reset input to allow re-selecting same file
  input.value = '';
}

// Upload to API
private uploadProfileImage(file: File): void {
  const formData = new FormData();
  formData.append('file', file);

  this.userService.uploadProfileImage(this.user.id, formData).subscribe({
    next: (updatedUser: User) => {
      // Optional: Update full user object if backend returns it
      this.user = { ...this.user, ...updatedUser };
      console.log('Profile image uploaded successfully');
    },
    error: (err) => {
      console.error('Profile image upload failed', err);
      alert('Failed to upload profile picture. Please try again.');
      // Revert to previous image if needed
    }
  });


}

logout(){

  this.auth.logout();
  this.closeSidebar();

  this.router.navigate(['/main']).then(() => {
    window.location.reload(); // optional if you want full reset
  });

}


}
