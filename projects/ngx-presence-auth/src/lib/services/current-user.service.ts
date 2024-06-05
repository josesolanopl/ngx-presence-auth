import { Injectable } from '@angular/core';
import { AuthModule } from '../auth.module';
import { AuthStateService } from './state.service';
import { filter, first, map } from 'rxjs/operators';

@Injectable({ providedIn: AuthModule })
export class CurrentUserService {
  get user$() {
    return this.authState.user$;
  }

  get isLoggedIn$() {
    return this.authState.isLoggedIn$;
  }

  constructor(private authState: AuthStateService) {}

  onLoggedIn() {
    return this.isLoggedIn$.pipe(
      filter((isLoggedIn) => isLoggedIn),
      map(() => undefined),
      first()
    );
  }
}
