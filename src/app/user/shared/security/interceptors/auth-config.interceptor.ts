import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, delay, from, mergeMap, of, retryWhen, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { SpotifyAuthorizationService } from '../../../../spotify/shared/services/spotify-authorization.service';

export const authConfigInterceptor: HttpInterceptorFn = (req, next) => {
  const spotifyAuthService = inject(SpotifyAuthorizationService);
  //spotifyAuthService.checkExpiryAndRefreshToken();
  const url: string = req.url;

  //for not spotify api calls
  if (!(url.includes('accounts.spotify.com') || url.includes('api.spotify.com') || url.includes('www.strava.com/api'))) {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Check if user is logged in but not authorized and redirect if needed
    if (authService.isLoggedIn() && !authService.isUserAuthorized()) {
      authService.removeToken();
      router.navigate(['/']);
      return throwError(() => new Error('Unauthorized access')); // Throw error to stop request chain
    }

    // Add authorization header if token exists
    const authToken = authService.getAccessToken();
    if (authToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    }
  };
  if ((url.includes('accounts.spotify.com')) || (url.includes('api.spotify.com'))) {
    //console.log('spotify api called !');

    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 errors specifically
        if (error.status === 401) {

          spotifyAuthService.refreshSpotifyAccessToken();
          // debugger;

          console.log('spotify token expired !');

          return next(req);



        } else {
          // If the error is not 401, propagate it further
          return throwError(error);
        }
      })
    );


  }

  return next(req);
};
