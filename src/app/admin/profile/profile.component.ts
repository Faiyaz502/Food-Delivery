import { Component, ElementRef, ViewChild } from '@angular/core';
import { TeamMember } from 'src/app/Models/team-member.model';
import { AdminProfile } from 'src/app/Models/Users/profile.model';
import { User } from 'src/app/Models/Users/user.models';
import { ApiService } from 'src/app/services/api.service';
import { TokenService } from 'src/app/services/authService/token.service';
import { AdminProfileService } from 'src/app/services/UserServices/admin-profile.service';
import { UserServiceService } from 'src/app/services/UserServices/user.service.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  currentAdmin!: AdminProfile ;

  teamMembers: TeamMember[] = [];
  editMode: boolean = false;
  editedProfile: AdminProfile = {...this.currentAdmin};
  activeTab: 'profile' | 'security' | 'team' | 'notifications' = 'profile';
   id : any;
  // Form data
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Notification settings
  notifications = {
    email_orders: true,
    email_reviews: true,
    email_users: false,
    push_orders: true,
    push_reviews: true,
    push_alerts: true,
    sms_critical: true
  };

  constructor(private apiService: ApiService,private adminService: AdminProfileService,
     private token: TokenService,
     private userService: UserServiceService

    ) {}

  ngOnInit() {

   this.id = this.token.getId();

    this.loadAdmin()
    this.loadTeamMembers();

  }

  loadTeamMembers() {
    this.apiService.getTeamMembers().subscribe(members => {
      this.teamMembers = members;
    });
  }

 async loadAdmin(){


    this.adminService.getAdminProfileByUserId(this.id).subscribe((x)=>{

      console.log(x);


        this.currentAdmin = x ;


    })


  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.editedProfile = {...this.currentAdmin};
    }
  }

  saveProfile() {
    // In a real app, call API to update profile
    this.currentAdmin = {...this.editedProfile};
    this.editMode = false;
  }

  cancelEdit() {
    this.editMode = false;
    this.editedProfile = {...this.currentAdmin};
  }

  changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (this.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    // In a real app, call API to change password
    alert('Password changed successfully');
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  updateNotificationSettings() {
    // In a real app, call API to update notification preferences
    alert('Notification settings updated successfully');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'away': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

permissions: Array<{ key: keyof AdminProfile; label: string }> = [
  { key: 'canApproveRestaurants', label: 'Approve Restaurants' },
  { key: 'canManageUsers', label: 'Manage Users' },
  { key: 'canManageOrders', label: 'Manage Orders' },
  { key: 'canManagePayments', label: 'Manage Payments' },
  { key: 'canManageDrones', label: 'Manage Drones' },
  { key: 'canViewAnalytics', label: 'View Analytics' }
];


  getRoleColor(role: string): string {
    switch (role.toLowerCase()) {
      case 'super admin': return 'text-purple-600 bg-purple-100';
      case 'operations manager': return 'text-blue-600 bg-blue-100';
      case 'customer support': return 'text-green-600 bg-green-100';
      case 'data analyst': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        this.currentAdmin.adminImg = e.target.result; // Update preview
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

    this.userService.uploadProfileImage(this.currentAdmin.id, formData).subscribe({
      next: (updatedUser: User) => {
        // Optional: Update full user object if backend returns it
        this.currentAdmin = { ...this.currentAdmin, ...updatedUser };
        console.log('Profile image uploaded successfully');
      },
      error: (err) => {
        console.error('Profile image upload failed', err);
        alert('Failed to upload profile picture. Please try again.');
        // Revert to previous image if needed
      }
    });


  }

}
