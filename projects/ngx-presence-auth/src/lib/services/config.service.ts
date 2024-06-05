import { InjectionToken } from '@angular/core';

export interface AuthConfig {
  apiUrl: string;
  includeToken?: RegExp[];
}

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG');
