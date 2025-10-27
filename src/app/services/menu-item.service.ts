// menu-item.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuItem } from '../Models/MenuItem.model';


@Injectable({ providedIn: 'root' })
export class MenuItemService {


   getMenuItemsByRestaurant(restaurantId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/restaurant/${restaurantId}`);
  }

  private apiUrl = 'http://localhost:8080/api/menu-items'; // adjust as needed

  constructor(private http: HttpClient) {}

  getAllMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.apiUrl);
  }

 // ✅ Upload menu item image
  uploadMenuItemImage(menuItemId: number, formData: FormData): Observable<MenuItem> {
    return this.http.post<MenuItem>(
      `http://localhost:8080/api/menu-items/${menuItemId}/image`,
      formData
    );
  }
  getMenuItemById(id: number): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.apiUrl}/${id}`);
  }

    getMenuItemByRestaurant(id: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/restaurant/${id}`);
  }


  createMenuItem(item: MenuItem): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.apiUrl, item);
  }
  updateMenu(id : number , item : MenuItem):Observable<MenuItem>{

    return this.http.put<MenuItem>(`${this.apiUrl}/${id}`,item);
  }

 delete(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
}


}
