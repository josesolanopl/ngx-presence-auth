export interface AuthUser {
  uuid: string;
  username: string;
  created: string;
  is_superuser: boolean;
  groups: string[];

  email?: string;
  first_name?: string;
  last_name?: string;
  last_login?: string;
}
