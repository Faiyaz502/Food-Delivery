import { Component } from '@angular/core';
import { switchMap } from 'rxjs';
import { Rider } from 'src/app/Models/rider.model';
import { User } from 'src/app/Models/Users/user.models';

import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-riders',
  templateUrl: './riders.component.html',
  styleUrls: ['./riders.component.scss']
})
export class RidersComponent {

  //  riders: Rider[] = [];
  // users: User[] = [];
  // availableRiders = 0;
  // busyRiders = 0;
  // totalEarnings = 0;
  // averageEarnings = 0;
  // vehicleTypes: any[] = [];
  // currentRider : any = {

  //     name : '',
  //     vehicle_type: "motorcycle",
  //     availability: true,
  //     earnings: 1250.75,
  //     image_url: "",
  //      email: "",
  //     phone: "",


  // };

  // constructor(private apiService: ApiService) {}

  // ngOnInit() {
  //   this.loadRiders();
  //   this.loadUsers();
  // }

  // loadRiders() {
  //   this.apiService.getRiders().subscribe(riders => {
  //     this.riders = riders;
  //     this.calculateStats();
  //   });
  // }

  // loadUsers() {
  //   this.apiService.getUsers().subscribe(users => {
  //     this.users = users;
  //   });
  // }

  // calculateStats() {
  //   this.availableRiders = this.riders.filter(r => r.availabilityStatus).length;
  //   this.busyRiders = this.riders.length - this.availableRiders;
  //   this.totalEarnings = this.riders.reduce((sum, rider) => sum + rider.totalEarnings, 0);
  //   this.averageEarnings = this.riders.length ? this.totalEarnings / this.riders.length : 0;

  //   // Calculate vehicle types
  //   const vehicleCounts: {[key: string]: number} = {};
  //   this.riders.forEach(rider => {
  //     vehicleCounts[rider.vehicleType] = (vehicleCounts[rider.vehicleType] || 0) + 1;
  //   });

  //   this.vehicleTypes = Object.entries(vehicleCounts).map(([type, count]) => ({
  //     type: type.charAt(0).toUpperCase() + type.slice(1),
  //     count
  //   }));
  // }

  // getUserName(userId: number): string {
  //   const user = this.users.find(u => u.id === userId);
  //   return user ? user.firstName+" "+user.lastName : `User ${userId}`;
  // }

  // toggleAvailability(rider: Rider) {
  //   const newAvailability = !rider.availabilityStatus;
  //   this.apiService.updateRiderAvailability(rider.id, newAvailability).subscribe(() => {
  //     rider.availabilityStatus = newAvailability;
  //     this.calculateStats();
  //   });
  // }



}
