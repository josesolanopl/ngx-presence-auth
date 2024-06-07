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
      return this.handleStatusRequest(req, next);
    }

    return this.handleRequestWithToken(req, next);
  }

  private handleStatusRequest(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(() =>
        this.authState.token$.pipe(
          first(),
          switchMap((existingToken) => {
            if (existingToken) {
              this.apiService.redirectToLogin();
            }
            return EMPTY;
          })
        )
      )
    );
  }

  private handleRequestWithToken(
    req: HttpRequest<any>,
    next: HttpHandler,
    isRefresh = false
  ): Observable<HttpEvent<any>> {
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

            return this.handle401Response(nextReq, next, isRefresh);
          })
        );
      })
    );
  }

  private handle401Response(
    req: HttpRequest<any>,
    next: HttpHandler,
    isRefresh = false
  ) {
    if (isRefresh) {
      this.apiService.redirectToLogin();
      return EMPTY;
    }
    return this.handleRefresh(req, next);
  }

  private handleRefresh(req: HttpRequest<any>, next: HttpHandler) {
    this.authState.checkStatus();
    return this.handleRequestWithToken(req, next, true);
  }

  private applyTokenToReq(req: HttpRequest<any>, token?: string) {
    if (!token) {
      return req;
    }

    const shouldAddToken = this.shouldIncludeToken(req);
    if (!shouldAddToken) {
      return req;
    }

    return req.clone({
      setHeaders: { authorization: `JWT ${token}` },
    });
  }

  private shouldIncludeToken(req: HttpRequest<any>) {
    if (!this.config.shouldIncludeToken) {
      return true;
    }
    return this.config.shouldIncludeToken(req);
  }

  private getToken() {
    return this.authState.isLoading$.pipe(
      filter((isLoading) => !isLoading),
      switchMap(() => this.authState.token$),
      first()
    );
  }
}
