import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TokenService, parseJwt } from './token.service';
import { environment } from 'src/app/Envirment/environment';

export interface LoginResponse { jwt: string; id?: number; }

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  // update baseUrl if required
  private baseUrl = environment.apiUrl;


  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) { }



  async login(username: string, password: string): Promise<void> {
    const resp = await firstValueFrom(this.http.post<LoginResponse>(`${this.baseUrl}/login`, { username, password }));
    console.log(resp);

    this.handleAuthResponse(resp);
  }

  logout() {
    this.tokenService.removeToken();

  }

  isLoggedIn(): boolean {
    return this.tokenService.isLoggedIn();
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

getUserRoles(): string[] {
  const token = this.getToken();
  if (!token) return [];

  try {
    const payload = parseJwt(token);
    if (payload.roles && Array.isArray(payload.roles)) return payload.roles;
    return [];
  } catch {
    return [];
  }
}

  // common handler to save token + optional username
  private handleAuthResponse(resp: LoginResponse) {
    if (!resp || !resp.jwt) throw new Error('No token returned from server');
    this.tokenService.setToken(resp.jwt);
    // parse username from token if present
    try {
      const payload = parseJwt(resp.jwt);


      if (payload.sub) this.tokenService.setUsername(payload.sub);
      else if (payload.username) this.tokenService.setUsername(payload.username);
    } catch { /* ignore */ }
  }

  // OAuth popup flow. providerName e.g. "google" or "github"
  async oauthLogin(providerName: 'google' | 'github'): Promise<void> {
    const popup = this.openPopup(`${this.baseUrl}/oauth2/authorization/${providerName}`, 'oauth2', 600, 700);

    // Poll until popup loads content containing JSON token
    return new Promise<void>((resolve, reject) => {
      const timeout = 1000 * 60; // 60s
      const intervalMs = 500;
      let elapsed = 0;

      const timer = setInterval(() => {
        elapsed += intervalMs;
        try {
          if (!popup || popup.closed) {
            clearInterval(timer);
            reject(new Error('OAuth popup closed by user'));
            return;
          }

          // try to access popup document text (same-origin only if backend returned JSON in popup's final response)
          const doc = popup.document;
          const bodyText = doc?.body?.innerText;
          if (bodyText && bodyText.trim()) {
            // attempt parse JSON
            try {
              const data = JSON.parse(bodyText);
              if (data && data.token) {
                this.handleAuthResponse(data);
                popup.close();
                clearInterval(timer);
                resolve();
                return;
              } else {
                // maybe backend returned under different fields, try common shapes
                if (data?.accessToken) {
                  this.handleAuthResponse({ jwt: data.accessToken });
                  popup.close();
                  clearInterval(timer);
                  resolve();
                  return;
                }
              }
            } catch (err) {
              // not JSON yet — ignore
            }
          }
        } catch (err) {
          // cross-origin access while redirecting to provider; ignore until final JSON is same-origin
        }

        if (elapsed > timeout) {
          clearInterval(timer);
          try { popup?.close(); } catch {}
          reject(new Error('OAuth popup timed out'));
        }
      }, intervalMs);
    });
  }

  private openPopup(url: string, title: string, w: number, h: number): Window | null {
    const left = window.screenX + (window.innerWidth - w) / 2;
    const top = window.screenY + (window.innerHeight - h) / 2;
    const opts = `width=${w},height=${h},left=${left},top=${top},status=0,toolbar=0,menubar=0`;
    return window.open(url, title, opts);
  }
}
