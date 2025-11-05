import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanLoad {

  constructor(private auth: AuthServiceService, private router: Router) {}

  private hasRequiredRole(required: string[]): boolean {
    if (!required || required.length === 0) return true;

    // Normalize roles: strip "ROLE_" from JWT roles
    const userRoles = this.auth.getUserRoles().map(r => r.replace(/^ROLE_/, ''));

    // Check if any required role matches
    const ok = required.some(req => userRoles.includes(req));

    if (!ok) {
      // Redirect to unauthorized page if not allowed
      this.router.navigate(['/unauthorized']);
    }

    return ok;
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data?.['roles'] as string[] | undefined;
    return this.hasRequiredRole(requiredRoles || []);
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    const requiredRoles = route.data?.['roles'] as string[] | undefined;
    return this.hasRequiredRole(requiredRoles || []);
  }
}
