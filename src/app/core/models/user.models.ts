export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'PharmacyOwner' | 'Customer';
}