import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { AuthUser } from '../models/auth-user.model';
import { AuthApiService } from './api.service';

interface AuthState {
  status: 'idle' | 'loading' | 'success';
  data?: {
    token: string;
    user: AuthUser;
  };
}

@Injectable()
export class AuthStateService {
  private state$ = new BehaviorSubject<AuthState>({ status: 'idle' });

  get isLoading$() {
    return this.state$.pipe(map((state) => state.status === 'loading'));
  }

  get isLoggedIn$() {
    return this.state$.pipe(map((state) => state.status === 'success'));
  }

  private get authData$() {
    return this.state$.pipe(
      map((state) => {
        if (state.status === 'success') {
          return state.data;
        }
        return null;
      })
    );
  }

  get token$() {
    return this.authData$.pipe(map((data) => data?.token));
  }

  get user$() {
    return this.authData$.pipe(map((data) => data?.user));
  }

  constructor(private apiService: AuthApiService) {}

  authenticate() {
    this.isLoading$
      .pipe(
        first(),
        switchMap((isLoading) => {
          if (isLoading) {
            return EMPTY;
          }

          return this.checkStatus();
        })
      )
      .subscribe({
        next: (result) => {
          this.state$.next({ status: 'success', data: result });
        },
        error: (error) => {
          console.error('Error authenticating', error);
          this.apiService.redirectToLogin();
        },
      });
  }

  private checkStatus() {
    this.state$.next({ status: 'loading' });
    return this.apiService.status();
  }
}
