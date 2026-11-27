export type Role = 'Admin' | 'PharmacyOwner' | 'Customer';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'PharmacyOwner' | 'Customer';
}