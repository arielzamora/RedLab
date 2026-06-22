import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = `${environment.apiUrl}/auth`;
  sessionStarted = new Subject<void>();

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        const resData = response.data || response;
        if (resData) {
          if (resData.user) {
            localStorage.setItem('currentUser', JSON.stringify(resData.user));
          }
          if (resData.access_token) {
            localStorage.setItem('token', resData.access_token);
          }
          this.sessionStarted.next();
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
    return this.getCurrentUser() !== null;
  }

  autorizar(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/autorizar`, {}).pipe(
      tap((response: any) => {
        const resData = response.data || response;
        if (resData) {
          localStorage.setItem('currentUser', JSON.stringify(resData));
          this.sessionStarted.next();
        }
      })
    );
  }

  refrescar(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refrescar`, {}).pipe(
      tap((response: any) => {
        const resData = response.data || response;
        if (resData) {
          if (resData.access_token) {
            localStorage.setItem('token', resData.access_token);
          }
          if (resData.user) {
            localStorage.setItem('currentUser', JSON.stringify(resData.user));
          }
          this.sessionStarted.next();
        }
      })
    );
  }
}
