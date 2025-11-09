import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/app/services/authService/auth-service.service';

@Component({
  selector: 'app-vendor-login',
  templateUrl: './vendor-login.component.html',
  styleUrls: ['./vendor-login.component.scss'],
   animations: [
    trigger('pageAnimation', [
      transition(':enter', [
        query('.animate-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('0.6s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.8s ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class VendorLoginComponent {

  loginForm: FormGroup;
  userType: 'rider' | 'restaurant' = 'rider';
  isLoading = false;
  error = '';


  constructor(
    private fb: FormBuilder,
    private auth: AuthServiceService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {

      if(this.auth.isLoggedIn()){
          const roles = this.auth.getUserRoles();

              if (roles.includes('ROLE_RESTAURANT_OWNER')) {
        this.router.navigate(['vendor/restaurantVendor']);
      } else if (roles.includes('ROLE_DELIVERY_PERSON')) {
        this.router.navigate(['vendor/rider']);
      } else {
        this.router.navigate(['/']);
      }



      }



  }

  switchUserType(type: 'rider' | 'restaurant'): void {
    this.userType = type;
  }

  async submit() {
    this.isLoading = true;
    this.error = '';

    const username = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;

    try {
      await this.auth.login(username, password);

      // Get roles after login
      const roles = this.auth.getUserRoles();
      console.log('Logged in roles:', roles);


    // 🔒 Block admin or other disallowed roles
    const allowedRoles = ['ROLE_RESTAURANT_OWNER', 'ROLE_DELIVERY_PERSON']; // ← adjust to match your backend roles
    const hasAllowedRole = roles.some(role => allowedRoles.includes(role));

    if (!hasAllowedRole) {
      this.auth.logout(); // 🔒 Clear admin token!
      this.error = 'Only restaurant owners and riders can log in here.';
      return;
    }





      // Example: navigate based on role
      if (roles.includes('ROLE_RESTAURANT_OWNER')) {
        this.router.navigate(['vendor/restaurantVendor']);
      } else if (roles.includes('ROLE_DELIVERY_PERSON')) {
        this.router.navigate(['vendor/rider']);
      } else {
        this.router.navigate(['/']);
      }

    } catch (err: any) {
      this.error = err?.message || 'Login failed';
    } finally {
      this.isLoading = false;
    }
  }

 


  loginWithGoogle(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      console.log('Google login for:', this.userType);
    }, 2000);
  }

  loginWithGithub(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      console.log('GitHub login for:', this.userType);
    }, 2000);
  }

  
  get username() { 
    return this.loginForm?.get('username') ; 
  }
  get password() { return this.loginForm.get('password'); }

}
