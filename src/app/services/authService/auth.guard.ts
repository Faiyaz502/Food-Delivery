import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {
constructor(private auth: AuthServiceService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.auth.isLoggedIn()) return true;

    const loginUrl = route.data?.['loginUrl'] || '/login';
    this.router.navigate([loginUrl], { queryParams: { returnUrl: state.url } });
    return false;
  }

  canLoad(route: Route, segments: UrlSegment[]) {
    if (this.auth.isLoggedIn()) return true;

    const loginUrl = route.data?.['loginUrl'] || '/login';
    this.router.navigate([loginUrl]);
    return false;
  }
}
