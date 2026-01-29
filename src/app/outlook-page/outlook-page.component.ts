import { Component } from '@angular/core';
interface ProjectLink {
  title: string;
  description: string;
  route: string;
  badge: string;
}
@Component({
  selector: 'app-outlook-page',
  templateUrl: './outlook-page.component.html',
  styleUrls: ['./outlook-page.component.scss']
})
export class OutlookPageComponent {
 projectLinks: ProjectLink[] = [
    {
      title: 'Admin Panel',
      description: 'System management, vendor approval, settlements, reports',
      route: '/admin',
      badge: 'ADMIN'
    },
    {
      title: 'Restaurant Panel',
      description: 'Restaurant management, menu control, order handling',
      route: '/vendorLogin',
      badge: 'VENDOR'
    },
    {
      title: 'Customer App',
      description: 'Food ordering, live tracking, payments',
      route: '/main',
      badge: 'CUSTOMER'
    },
    {
      title: 'Delivery Rider Panel',
      description: 'Order pickup, delivery status, earnings',
      route: '/vendorLogin',
      badge: 'RIDER'
    }
  ];

}
