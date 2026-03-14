import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToasterService } from '../../shared/components/toaster/toaster.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toaster = inject(ToasterService);
  const auth = inject(AuthService);

  // Determine if this request is the login endpoint
  const isLoginRequest = req.url.includes('/auth/login');

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let message = 'Something went wrong.';

      if (err.error?.error?.message) {
        message = err.error.error.message;
      } else if (err.error?.detail) {
        if (Array.isArray(err.error.detail)) {
          message = err.error.detail
            .map((d: any) => `${d.loc?.[d.loc.length - 1] || 'Error'}: ${d.msg}`)
            .join('; ');
        } else {
          message = String(err.error.detail);
        }
      } else if (err.message) {
        message = err.message;
      }

      switch (err.status) {
        case 0:
          message = 'Unable to reach the server. Check your connection.';
          toaster.error(message);
          break;
        case 401:
          // Do NOT auto-logout when the login request itself returns 401
          // (wrong credentials — user should stay on the login page)
          if (!isLoginRequest) {
            auth.logout();
            toaster.error('Session expired or unauthorized. Please sign in again.');
          }
          break;
        case 403:
          toaster.warning('You do not have permission for this action.');
          break;
        case 404:
          if (!isLoginRequest) {
            toaster.warning('The requested resource was not found.');
          }
          break;
        case 422:
          toaster.warning(message);
          break;
        case 500:
          toaster.error('Server error. Please try again later.');
          break;
        default:
          if (!isLoginRequest) {
            toaster.error(message);
          }
      }

      // Re-throw as a plain Error so callers can read err.message cleanly
      return throwError(() => new Error(message));
    }),
  );
};
