import { Component } from '@angular/core';
import { User } from 'src/app/Models/user.model';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
 users: User[] = [];
  showCreateModal = false;
  showEditModal = false;
  currentUser: any = {
    name: '',
    email: '',
    phone: '',
    role: 'customer'
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.apiService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  editUser(user: User) {
    this.currentUser = { ...user };
    this.showEditModal = true;
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.apiService.deleteUser(id).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  saveUser() {
    if (this.showEditModal) {
      this.apiService.updateUser(this.currentUser.id, this.currentUser).subscribe(() => {
        this.loadUsers();
        this.closeModal();
      });
    } else {
      this.apiService.createUser(this.currentUser).subscribe(() => {
        this.loadUsers();
        this.closeModal();
      });
   

    }
  }

  closeModal() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.currentUser = {
      name: '',
      email: '',
      phone: '',
      role: 'customer'
    };
  }
}
