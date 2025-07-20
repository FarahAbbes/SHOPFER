import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpRequest,
  HttpHandler
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly r: Router, private readonly as: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isAuth = this.as.getAuthState();

    if (!isAuth) {
      return next.handle(req); // Not authenticated → pass through
    }

    // Handle the Promise returned by getToken()
    return from(this.as.getToken()).pipe(
      switchMap(token => {
        if (token && typeof token === 'string') {
          const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
          });
          return next.handle(authReq);
        }

        // Token is null or not a string → log + pass through unmodified
        console.warn('Invalid or missing token. Proceeding without auth header.');
        return next.handle(req);
      })
    );
  }
}
