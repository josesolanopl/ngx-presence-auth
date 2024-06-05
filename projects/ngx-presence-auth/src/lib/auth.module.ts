import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AUTH_CONFIG, AuthConfig } from './services/config.service';
import { AuthInterceptor } from './services/interceptor.service';
import { AuthStateService } from './services/state.service';
import { AuthApiService } from './services/api.service';
import { CurrentUserService } from './services/current-user.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    AuthApiService,
    AuthStateService,
    CurrentUserService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
})
export class AuthModule {
  static forRoot(config: AuthConfig): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: [{ provide: AUTH_CONFIG, useValue: { ...config } }],
    };
  }

  constructor(
    @Optional() @SkipSelf() parentModule: AuthModule,
    authState: AuthStateService
  ) {
    if (parentModule) {
      throw new Error(
        'AuthModule is already loaded. Import it in the AppModule only'
      );
    }

    authState.authenticate();
  }
}
