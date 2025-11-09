import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanLoad {

   constructor(private auth: AuthServiceService, private router: Router) {}

 private checkRoles(requiredRoles: string[], routePath: string, dataLoginUrl?: string): boolean {
  // Determine login URL: priority -> route.data.loginUrl -> route path prefix
  const loginUrl = dataLoginUrl || `/${routePath.split('/')[0] || 'login'}`;

  // Not logged in → redirect to login page
  if (!this.auth.isLoggedIn()) {
    this.router.navigate([loginUrl]);
    return false;
  }

  // Get user roles
  const userRoles = this.auth.getUserRoles().map(r => r.replace(/^ROLE_/, ''));

  // No roles required → allow
  if (!requiredRoles || requiredRoles.length === 0) return true;

  // Check if user has any required role
  const allowed = requiredRoles.some(role => userRoles.includes(role));
  if (!allowed) {
    this.router.navigate(['/unauthorized']);
  }

  return allowed;
}

canActivate(route: ActivatedRouteSnapshot): boolean {
  const roles = route.data?.['roles'] as string[] || [];
  const loginUrl = route.data?.['loginUrl'];
  return this.checkRoles(roles, route.routeConfig?.path || '', loginUrl);
}

canLoad(route: Route, segments: UrlSegment[]): boolean {
  const roles = route.data?.['roles'] as string[] || [];
  const loginUrl = route.data?.['loginUrl'];
  return this.checkRoles(roles, route.path || '', loginUrl);
}
}
