// src/app/shared/models/register.model.ts
export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword?: string;
}