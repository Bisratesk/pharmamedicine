export type PharmacyStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Pharmacy {
  id: number;
  ownerId: number;
  name: string;
  address: string;
  phone: string;
  licenseNumber: string;
  openingTime: string;
  closingTime: string;
  status: PharmacyStatus;
}

export type PharmacyRequest = Omit<Pharmacy, 'id' | 'ownerId' | 'status'>;
