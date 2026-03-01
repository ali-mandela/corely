import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToasterService } from '../../shared/components/toaster/toaster.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toaster = inject(ToasterService);
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let message = 'Something went wrong.';

      if (err.error?.error?.message) {
        message = err.error.error.message;
      } else if (err.message) {
        message = err.message;
      }

      switch (err.status) {
        case 0:
          message = 'Unable to reach the server. Check your connection.';
          toaster.error(message);
          break;
        case 401:
          toaster.error('Session expired. Please sign in again.');
          auth.logout();
          break;
        case 403:
          toaster.warning('You do not have permission for this action.');
          break;
        case 404:
          toaster.warning('The requested resource was not found.');
          break;
        case 422:
          toaster.error(message);
          break;
        case 500:
          toaster.error('Server error. Please try again later.');
          break;
        default:
          toaster.error(message);
      }

      return throwError(() => err);
    }),
  );
};
