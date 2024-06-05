import { Inject, Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, filter, first, switchMap } from 'rxjs/operators';

import { AuthStateService } from './state.service';
import { AuthApiService } from './api.service';
import { AuthConfig, AUTH_CONFIG } from './config.service';

interface HandleRefreshWithTokenOptions {
  next: HttpHandler;
  req: HttpRequest<any>;
  isRefresh?: boolean;
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    @Inject(AUTH_CONFIG) private config: AuthConfig,
    private authState: AuthStateService,
    private apiService: AuthApiService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const isStatus = req.url.includes(this.apiService.statusUrl);

    if (isStatus) {
      return next.handle(req).pipe(
        catchError((error) => {
          console.error('Error authenticating', error);
          this.apiService.redirectToLogin();
          return EMPTY;
        })
      );
    }

    return this.handleRequestWithToken({ next, req });
  }

  private handleRequestWithToken({
    req,
    next,
    isRefresh,
  }: HandleRefreshWithTokenOptions): Observable<HttpEvent<any>> {
    return this.getToken().pipe(
      switchMap((token) => {
        const nextReq = this.applyTokenToReq(req, token);
        return next.handle(nextReq).pipe(
          catchError((error) => {
            const isUnauthenticated =
              error instanceof HttpErrorResponse && error.status === 401;
            if (!isUnauthenticated) {
              return throwError(() => error);
            }

            if (!token || isRefresh) {
              this.apiService.redirectToLogin();
              return EMPTY;
            }

            return this.handleRefresh(next, nextReq);
          })
        );
      })
    );
  }

  private handleRefresh(next: HttpHandler, req: HttpRequest<any>) {
    this.authState.authenticate();
    return this.handleRequestWithToken({ next, req, isRefresh: true });
  }

  private applyTokenToReq(req: HttpRequest<any>, token?: string) {
    if (!token) {
      return req;
    }

    const shouldAddToken = this.config.includeToken
      ? this.config.includeToken.some((regex) => regex.test(req.url))
      : true;

    if (!shouldAddToken) {
      return req;
    }

    return req.clone({
      setHeaders: { authorization: `JWT ${token}` },
    });
  }

  private getToken() {
    return this.authState.isLoading$.pipe(
      filter((isLoading) => !isLoading),
      switchMap(() => this.authState.token$),
      first()
    );
  }
}
