import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  exhaustMap,
  map,
  shareReplay,
} from 'rxjs/operators';
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
  private checkStatus$ = new Subject<void>();

  isLoading$: Observable<boolean>;
  isLoggedIn$: Observable<boolean>;
  token$: Observable<string | undefined>;
  user$: Observable<AuthUser | undefined>;

  constructor(private apiService: AuthApiService) {
    this.isLoading$ = this.state$.pipe(
      map((state) => state.status === 'loading'),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.isLoggedIn$ = this.state$.pipe(
      map((state) => {
        const hasSucceded = state.status === 'success';
        return hasSucceded && !!state.data?.token;
      }),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.user$ = this.state$.pipe(
      map((state) => state.data?.user),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.token$ = this.state$.pipe(
      map((state) => state.data?.token),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.checkStatusEffect();
  }

  checkStatus() {
    this.checkStatus$.next();
  }

  private checkStatusEffect() {
    this.checkStatus$
      .pipe(
        exhaustMap(() => {
          this.setState({ status: 'loading' });
          return this.apiService.status();
        })
      )
      .subscribe({
        next: (result) => {
          this.setState({ status: 'success', data: result });
        },
        error: (error) => {
          console.error('Error authenticating', error);
        },
      });
  }

  private setState(newState: Partial<AuthState>) {
    this.state$.next({ ...this.state$.value, ...newState });
  }
}
