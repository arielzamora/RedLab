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
        if (resData && resData.access_token) {
          localStorage.setItem('token', resData.access_token);
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
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token has expired
    const tokenPayload = this.decodeToken(token);
    if (!tokenPayload || !tokenPayload.exp) return false;
    
    const expiryTime = tokenPayload.exp * 1000;
    return Date.now() < expiryTime;
  }

  getSessionTimeRemaining(): number {
    const token = this.getToken();
    if (!token) return 0;
    
    const tokenPayload = this.decodeToken(token);
    if (!tokenPayload || !tokenPayload.exp) return 0;
    
    const expiryTime = tokenPayload.exp * 1000;
    const timeLeft = Math.max(0, expiryTime - Date.now());
    return Math.floor(timeLeft / 1000); // return seconds remaining
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }
}
