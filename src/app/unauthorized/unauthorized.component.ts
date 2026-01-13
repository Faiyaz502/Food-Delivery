import { Component, OnInit } from '@angular/core';
import { AuthServiceService } from '../services/authService/auth-service.service';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent implements OnInit {


  constructor(private au : AuthServiceService){}


  ngOnInit(): void {

    this.au.logout();



  }








}
