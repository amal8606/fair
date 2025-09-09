import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const loggedInUser = localStorage.getItem('isLoggedIn');

     if (loggedInUser === 'true') {
      return true;
    }else{
    router.navigate(['/login']);
    return false;
  }
  }

  // On the server, just deny access
  return false;
};