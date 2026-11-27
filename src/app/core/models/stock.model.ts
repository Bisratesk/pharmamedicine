export interface StockItem {
  id: number;
  pharmacyId: number;
  medicineName: string;
  price: number;
  quantity: number;
}
export interface AdminStockRow extends StockItem {
  pharmacyName: string;
}
export type StockRequest = Omit<StockItem, 'id' | 'pharmacyId'>;