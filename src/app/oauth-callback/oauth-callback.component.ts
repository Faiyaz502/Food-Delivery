import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthServiceService } from '../services/authService/auth-service.service';

@Component({
  selector: 'app-oauth-callback',
  templateUrl: './oauth-callback.component.html',
  styleUrls: ['./oauth-callback.component.scss']
})
export class OAuthCallbackComponent {
constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthServiceService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    // 🔍 Extract `token` and `userId` from query params
    const token = this.route.snapshot.queryParamMap.get('token');
    const userIdStr = this.route.snapshot.queryParamMap.get('userId');

    if (!token) {
      this.toast.error('Login failed: No token received');
      this.router.navigate(['/login']);
      return;
    }

    const userId = userIdStr ? +userIdStr : undefined;

    try {
      //  Use your existing handler — saves token, userId, username, etc.
      this.auth.handleAuthResponse({ jwt: token, userId });

      //  Clean URL (remove token from history)
      window.history.replaceState({}, document.title, '/oauth-callback');

      //  Check roles (same as in login())
      const roles = this.auth.getUserRoles();
      const allowedRoles = ['ROLE_CUSTOMER'];
      const hasAllowedRole = roles.some(role => allowedRoles.includes(role));

      if (!hasAllowedRole) {
        this.auth.logout();
        this.toast.error('Access denied. Only customers can log in.');
        this.router.navigate(['/login']);
        return;
      }

      // ✅ Success — go to main
      this.toast.success('Signed in with Google!');
      this.router.navigate(['/main']).then(() => {
        window.location.reload(); // if needed for layout init
      });
    } catch (err) {
      console.error('OAuth callback error:', err);
      this.toast.error('Authentication failed. Please try again.');
      this.router.navigate(['/login']);
    }
  }
}
