import { Injectable } from '@angular/core';

const TOKEN_KEY = 'app_token';
const USERNAME_KEY = 'app_username';
const USER_ID = "user_id"
@Injectable({
  providedIn: 'root'
})
export class TokenService {

   constructor() { }

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  }

  setUsername(username: string) {
    localStorage.setItem(USERNAME_KEY, username);
  }

  getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY);
  }

  
    setId(id: string) {
    localStorage.setItem(USER_ID, id);
  }

  getId(): string | null {
    return localStorage.getItem(USER_ID);
  }



  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = decodeJwtPayload(token);
      const exp = payload.exp;
      if (!exp) return true; // no exp => treat as valid
      const now = Math.floor(Date.now()/1000);
      return exp > now;
    } catch {
      return false;
    }
  }
}

/** small JWT parser — returns payload as any. */
function decodeJwtPayload(token: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT');
  const payload = parts[1];
  // pad base64
  const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  const padded = b64 + (pad ? '='.repeat(4 - pad) : '');
  const json = atob(padded);
  return JSON.parse(json);
}

export function parseJwt(token: string) {
  return decodeJwtPayload(token);

}
