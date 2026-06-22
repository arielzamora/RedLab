import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  
  // Set withCredentials: true to ensure cookies are sent with HTTP requests
  const cloneConfig: any = {
    withCredentials: true
  };
  
  if (token) {
    cloneConfig.setHeaders = {
      Authorization: `Bearer ${token}`
    };
  }
  
  const cloned = req.clone(cloneConfig);
  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
