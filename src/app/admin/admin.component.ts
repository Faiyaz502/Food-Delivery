import { Component } from '@angular/core';
import { AuthServiceService } from '../services/authService/auth-service.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  constructor(private authService:AuthServiceService ){}

}
