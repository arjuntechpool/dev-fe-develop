import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    // add authorization header with basic auth credentials if available        
    const token = sessionStorage.getItem('token');
    if (token) {
      request = request.clone({
        setHeaders: {
          "Authorization": 'Bearer ' + token
        }
      });
    }
    return next.handle(request);
  }

}
