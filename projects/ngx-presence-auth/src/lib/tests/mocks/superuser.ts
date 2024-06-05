import { AuthUser } from '../../models/auth-user.model';

export const createSuperuser = (overrides?: Partial<AuthUser>): AuthUser => {
  return {
    uuid: 'superuser-uuid',
    username: 'superuser',
    created: '2021-01-01T00:00:00Z',
    is_superuser: true,
    groups: [],
    ...overrides,
  };
};
