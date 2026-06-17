import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        // Mongoose backend wraps responses inside { data, statusCode } using TransformInterceptor
        const resData = response.data || response;
        if (resData && resData.user) {
          // Keep user info in localStorage for UI state, token is managed via HttpOnly cookies
          localStorage.setItem('currentUser', JSON.stringify(resData.user));
        }
      })
    );
  }

  registro(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, userData);
  }

  updateProfile(userId: string, data: any): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/users/${userId}`, data);
  }

  logout(): void {
    // Fire-and-forget server logout request to clear HttpOnly cookie
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      error: (err) => console.error('Failed to notify backend logout:', err)
    });
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    // Rely on presence of local user state cache; server handles actual route protection via cookies
    return this.getCurrentUser() !== null;
  }

  getSessionTimeRemaining(): number {
    // Dummy session remaining indicator when using cookie-based auth
    return this.isLoggedIn() ? 3600 : 0;
  }
}
