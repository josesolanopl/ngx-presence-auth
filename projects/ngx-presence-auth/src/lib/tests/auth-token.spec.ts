import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthModule } from '../auth.module';
import { AuthApiService } from '../services/api.service';
import { createSuperuser } from './mocks/superuser';
import { CurrentUserService } from '../services/current-user.service';
import { AuthStateService } from '../services/state.service';
import { AuthConfig } from '../services/config.service';

interface SetUpOptions {
  token?: string;
  includeToken?: AuthConfig['includeToken'];
}

const setUp = ({ token, includeToken }: SetUpOptions) => {
  const apiUrl = 'http://api.test';

  TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      AuthModule.forRoot({
        apiUrl,
        includeToken,
      }),
    ],
    teardown: {
      destroyAfterEach: true,
    },
  });

  const httpTestingController = TestBed.inject(HttpTestingController);

  const authReq = httpTestingController.expectOne(
    AuthApiService.buildStatusUrl(apiUrl)
  );
  if (token) {
    authReq.flush({ token, user: createSuperuser() });
  } else {
    authReq.flush('Invalid credentials', {
      status: 401,
      statusText: 'Unauthorized',
    });
  }

  const apiService = TestBed.inject(AuthApiService);
  const authState = TestBed.inject(AuthStateService);
  const currentUserService = TestBed.inject(CurrentUserService);
  const httpClient = TestBed.inject(HttpClient);

  return {
    apiService,
    authState,
    currentUserService,
    httpClient,
    httpTestingController,
  };
};

describe('Auth token handling', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('Adds JWT header if token found', () => {
    const TOKEN = 'TOKEN';
    const { httpTestingController, httpClient } = setUp({
      token: TOKEN,
    });

    httpClient.get('/test').subscribe();

    const testReq = httpTestingController.expectOne('/test');
    expect(testReq.request.headers.has('authorization')).toBe(true);
    expect(testReq.request.headers.get('authorization')).toBe(`JWT ${TOKEN}`);

    httpTestingController.verify();
  });

  it('Includes JWT if url provided in includeToken', () => {
    const TOKEN = 'TOKEN';
    const { httpTestingController, httpClient } = setUp({
      token: TOKEN,
      includeToken: [/\/test/i],
    });

    httpClient.get('/test').subscribe();

    const testReq = httpTestingController.expectOne('/test');
    expect(testReq.request.headers.has('authorization')).toBe(true);
    expect(testReq.request.headers.get('authorization')).toBe(`JWT ${TOKEN}`);

    httpTestingController.verify();
  });

  it("doesn't include JWT if url not provided in includeToken", () => {
    const TOKEN = 'TOKEN';
    const { httpTestingController, httpClient } = setUp({
      token: TOKEN,
      includeToken: [/\/not-test/i],
    });

    httpClient.get('/test').subscribe();

    const testReq = httpTestingController.expectOne('/test');
    expect(testReq.request.headers.has('authorization')).toBe(false);

    httpTestingController.verify();
  });

  it('401 without token should redirect to login', () => {
    const { apiService, httpClient, httpTestingController } = setUp({});

    httpClient.get('/test').subscribe();

    expect(window.location).toBeAt(
      `${apiService.loginUrl}?next=http://localhost/`
    );

    httpTestingController.verify();
  });

  it('401 with token to status url should redirect to login', () => {
    const TOKEN = 'TOKEN';
    const { apiService, httpTestingController } = setUp({ token: TOKEN });

    apiService.status().subscribe();

    const testReq = httpTestingController.expectOne(apiService.statusUrl);
    testReq.flush('Invalid credentials', {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(window.location).toBeAt(
      `${apiService.loginUrl}?next=http://localhost/`
    );

    httpTestingController.verify();
  });

  it('401 with token to no status url should refresh token', () => {
    const TOKEN = 'TOKEN';
    const { apiService, httpTestingController, httpClient } = setUp({
      token: TOKEN,
    });

    httpClient.get('/test').subscribe();

    const testReq = httpTestingController.expectOne('/test');
    testReq.flush('Invalid credentials', {
      status: 401,
      statusText: 'Unauthorized',
    });

    httpTestingController.expectOne(apiService.statusUrl);

    httpTestingController.verify();
  });
});
