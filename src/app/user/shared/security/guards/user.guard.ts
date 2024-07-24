import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const userGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  //const role = authService.getLoggedInUserDetails().UserType;
  //if (authService.isLoggedIn() && role == 'User') {
  if (authService.isLoggedIn() ) {
    return true;
  } else {
    router.navigate(['']);
    return false;
  }
};
