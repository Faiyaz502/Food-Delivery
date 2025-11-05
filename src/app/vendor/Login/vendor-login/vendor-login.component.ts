import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {}

  switchUserType(type: 'rider' | 'restaurant'): void {
    this.userType = type;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;
        console.log('Login data:', {
          ...this.loginForm.value,
          userType: this.userType
        });
      }, 2000);
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

  
  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

}
