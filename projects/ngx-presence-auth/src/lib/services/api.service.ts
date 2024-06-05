import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AuthUser } from '../models/auth-user.model';
import { AUTH_CONFIG, AuthConfig } from './config.service';

interface AuthStatusResponse {
  token: string;
  user: AuthUser;
}

@Injectable()
export class AuthApiService {
  static buildStatusUrl(apiUrl: string) {
    return `${apiUrl}/api/v1/status/`;
  }

  get statusUrl() {
    return AuthApiService.buildStatusUrl(this.config.apiUrl);
  }

  get loginUrl() {
    return `${this.config.apiUrl}/login/`;
  }

  get logoutUrl() {
    return `${this.config.apiUrl}/logout/`;
  }

  constructor(
    @Inject(AUTH_CONFIG) private config: AuthConfig,
    private httpClient: HttpClient
  ) {}

  status() {
    return this.httpClient.get<AuthStatusResponse>(this.statusUrl);
  }

  redirectToLogin() {
    window.location.href = `${this.loginUrl}?next=${window.location.href}`;
  }

  redirectToLogout() {
    window.location.href = `${this.logoutUrl}/?next=${window.location.origin}`;
  }
}
