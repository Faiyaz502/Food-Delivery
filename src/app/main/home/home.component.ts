
import { fromEvent, Subject, switchMap, takeUntil, tap, timer } from 'rxjs';
import { Component, OnInit, ElementRef, ViewChild, Renderer2, EventEmitter, Output, HostListener } from '@angular/core';
import { User } from 'src/app/Models/Users/user.models';
import { CartService } from 'src/app/services/Orders/order.service';

// Define the structure for a carousel item
interface CarouselItem {
  id: number;
  image: string;
  title: string;
  topic: string;
  des: string;
  detailTitle: string;
  detailDes: string;
  specifications: { label: string, value: string }[];
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
 
}

