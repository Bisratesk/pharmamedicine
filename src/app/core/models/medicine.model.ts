export interface Medicine {
  id: number;
  name: string;
  category: string;
}

export type MedicineRequest = Omit<Medicine, 'id'>;