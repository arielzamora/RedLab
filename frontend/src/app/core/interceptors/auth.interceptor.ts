import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
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
  return next(cloned);
};
