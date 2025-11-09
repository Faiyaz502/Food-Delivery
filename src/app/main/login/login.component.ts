import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserRole } from 'src/app/Enums/profileEnums';
import { User } from 'src/app/Models/Users/user.models';
import { AuthServiceService } from 'src/app/services/authService/auth-service.service';
import { UserProfileService } from 'src/app/services/UserServices/user-profile.service';
import { UserServiceService } from 'src/app/services/UserServices/user.service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  // Inject services and FormBuilder



  constructor(private fb: FormBuilder,
     private userService: UserServiceService,
     private userProfileService: UserProfileService,
     private auth :AuthServiceService ,
     private router:Router ,
     private toast :ToastrService
    ) {

      this.initForm();

                     this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      loginPass: ['', [Validators.required, Validators.minLength(4)]]
    });

  }

  customerProfile = {
    dateOfBirth: '',
    profileImageUrl: '',
    latitude: 0,
    longitude: 0

  };
    loginForm!: FormGroup;
  registerForm!: FormGroup;
  isRegisterMode: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  error = '';





  // Initialize the reactive form with validators
  initForm() {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: [''], // Optional fields
      dateOfBirth: [''], // Optional fields
    });




  }








  // Helper to access form controls easily
  get f(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
  }

  // Implements the user's provided logic for user creation
  createUser(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    // Construct the payload for the service
    const newUser = {
      ...this.registerForm.value,
      primaryRole: UserRole.CUSTOMER // Fixed role as requested
    };

    // Prepare profile data based on form values
    this.customerProfile = {
      dateOfBirth: newUser.dateOfBirth,
      profileImageUrl: '',// Not collected in this form
      latitude: 0,
      longitude: 0



    };

    // Start user creation process
    this.userService.createUser(newUser).subscribe({
      next: (user) => {
        if (!user) {
          this.errorMessage = 'User creation failed: The User Already Exist (or email is already in use).';
          this.isLoading = false;
          return;
        }
        this.createRoleProfile(user);
      },
      error: (error) => {
        // Generic API error during user creation
        this.errorMessage = 'An unexpected error occurred during user registration.';
        this.isLoading = false;
        console.error('User creation API error:', error);
      }
    });
  }

  // Implements the user's provided logic for profile creation
  createRoleProfile(user: User): void {
    // Check if profile data exists to be saved
    if (user.primaryRole === UserRole.CUSTOMER) {
      if (this.customerProfile.dateOfBirth || this.customerProfile.profileImageUrl) {
        this.userProfileService.createUserProfile(user.id, this.customerProfile).subscribe({
          next: (s) => {
            console.log('Profile creation success:', s);
            this.successMessage = 'User and profile created successfully!';
            this.completeUserCreation();
          },
          error: (error) => {
            console.error('Profile creation error:', error);
            // Handle profile failure but user success
            this.successMessage = 'User created, but profile creation failed (Try updating your profile later).';
            this.completeUserCreation();
          }
        });
      } else {
        // No profile data to save, complete registration
        this.successMessage = 'User created successfully! (No optional profile data was submitted)';
        this.completeUserCreation();
      }
    } else {
      this.errorMessage = `Unsupported user role: ${user.primaryRole}. Cannot complete registration.`;
      this.isLoading = false;
    }
  }

  completeUserCreation(): void {
    this.isLoading = false;
    this.registerForm.reset();
    // Use setTimeout to clear success message after a short period if needed
    setTimeout(() => this.successMessage = null, 5000);
  }

  /**
   * Switches the UI to show the Register form and resets the state.
   */
  switchToRegister(): void {
    this.isRegisterMode = true;
    this.registerForm.reset();
    this.errorMessage = null;
    this.successMessage = null;
    this.isLoading = false;
  }

  /**
   * Switches the UI back to show the Login form and resets the state.
   */
  switchToLogin(): void {
    this.isRegisterMode = false;
    this.errorMessage = null;
    this.successMessage = null;
    this.isLoading = false;
  }


  //Login

   async submit() {



    const username = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('loginPass')?.value;

    console.log(username,password);


    try {
      await this.auth.login(username, password);

      // Get roles after login
      const roles = this.auth.getUserRoles();
      console.log('Logged in roles:', roles);


    // 🔒 Block admin or other disallowed roles
    const allowedRoles = ['ROLE_CUSTOMER']; // ← adjust to match your backend roles
    const hasAllowedRole = roles.some(role => allowedRoles.includes(role));

    if (!hasAllowedRole) {
      this.auth.logout(); // 🔒 Clear admin token!

      return;
    }





      // Example: navigate based on role
      if (roles.includes('ROLE_CUSTOMER')) {
           this.router.navigate(['/main']).then(() => {
    window.location.reload();
  });
      }

    } catch (err: any) {

        this.toast.error("Login failed");
    } finally {

    }
  }

    get username() {
    return this.loginForm?.get('username') ;
  }
  get password() { return this.loginForm.get('loginPass'); }




}
