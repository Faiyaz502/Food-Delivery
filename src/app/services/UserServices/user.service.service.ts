import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRole, UserStatus } from 'src/app/Enums/profileEnums';
import { environment } from 'src/app/Envirment/environment';
import { UserCreateDTO, PaginatedResponse, UserUpdateDTO, PasswordChangeDTO, User } from 'src/app/Models/Users/user.models';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

   private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  createUser(user: UserCreateDTO): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/email/${email}`);
  }

  getAllUsers(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'DESC'): Observable<PaginatedResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<PaginatedResponse<User>>(this.apiUrl, { params });
  }

    getAllUserswithoutPage(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`);
  }

  getUsersByRole(role: UserRole, page = 0, size = 10): Observable<PaginatedResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/role/${role}`, { params });
  }

  getUsersByStatus(status: UserStatus, page = 0, size = 10): Observable<PaginatedResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/status/${status}`, { params });
  }

  updateUser(id: number, user: UserUpdateDTO): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }


  changePassword(id: number, passwords: PasswordChangeDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/password`, passwords);
  }

  updateUserStatus(id: number, status: UserStatus): Observable<User> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<User>(`${this.apiUrl}/${id}/status`, null, { params });
  }
  uploadProfileImage(userId: number, file: FormData): Observable<User> {
  return this.http.post<User>(`${this.apiUrl}/${userId}/profile-image`, file);
}

  verifyUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/verify`, null);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  checkEmailExists(email: string): Observable<boolean> {
    const params = new HttpParams().set('email', email);
    return this.http.get<boolean>(`${this.apiUrl}/check-email`, { params });
  }

  checkPhoneExists(phoneNumber: string): Observable<boolean> {
    const params = new HttpParams().set('phoneNumber', phoneNumber);
    return this.http.get<boolean>(`${this.apiUrl}/check-phone`, { params });
  }
}
