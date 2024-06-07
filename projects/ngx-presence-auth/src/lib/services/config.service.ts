import { HttpRequest } from '@angular/common/http';
import { InjectionToken } from '@angular/core';

export interface AuthConfig {
  apiUrl: string;
  shouldIncludeToken?: (req: HttpRequest<any>) => boolean;
}

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG');
