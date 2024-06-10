import { HttpEvent, HttpHandler, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const authConfigInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is logged in but not authorized and redirect if needed
  if (authService.isLoggedIn() && !authService.isUserAuthorized()) {
    authService.removeToken();
    router.navigate(['/']);
    return throwError(() => new Error('Unauthorized access')); // Throw error to stop request chain
  }

  // Add authorization header if token exists
  const authToken = authService.getUserToken();
  if (authToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  }

  return next(req);
};
