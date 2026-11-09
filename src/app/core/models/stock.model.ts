export interface StockItem {
  id: number;
  pharmacyId: number;
  medicineName: string;
  price: number;
  quantity: number;
}

export type StockRequest = Omit<StockItem, 'id' | 'pharmacyId'>;