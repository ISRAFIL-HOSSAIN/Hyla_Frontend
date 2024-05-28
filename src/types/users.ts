export interface Users {
    idp_id: string;
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: number;
    isSuperUser?: boolean;
    organization?: string;
  }