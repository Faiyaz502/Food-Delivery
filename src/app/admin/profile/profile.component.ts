import { Component } from '@angular/core';
import { TeamMember } from 'src/app/Models/team-member.model';
import { ApiService } from 'src/app/services/api.service';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone?: string;
  department?: string;
  joined_date: string;
  permissions: string[];
  last_login: string;
  status: 'active' | 'away' | 'offline';
  bio?: string;
  location?: string;
  timezone?: string;
}
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  currentAdmin: AdminProfile = {
    id: '1',
    name: 'John Admin',
    email: 'john@fooddelivery.com',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
    phone: '+1-555-0100',
    department: 'Operations',
    joined_date: '2023-01-15T09:00:00Z',
    permissions: ['manage_users', 'manage_orders', 'manage_restaurants', 'manage_reviews', 'view_analytics'],
    last_login: new Date().toISOString(),
    status: 'active',
    bio: 'Experienced administrator with 5+ years in food delivery operations.',
    location: 'New York, NY',
    timezone: 'EST (UTC-5)'
  };

  teamMembers: TeamMember[] = [];
  editMode: boolean = false;
  editedProfile: AdminProfile = {...this.currentAdmin};
  activeTab: 'profile' | 'security' | 'team' | 'notifications' = 'profile';

  // Form data
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

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

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadTeamMembers();
  }

  loadTeamMembers() {
    this.apiService.getTeamMembers().subscribe(members => {
      this.teamMembers = members;
    });
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

}
