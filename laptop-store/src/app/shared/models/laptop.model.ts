export interface Laptop {
  _id?: string;
  ownerId?: string;
  created_at?: string;
  brand: string;
  model: string;
  imageUrl: string;
  price: number;
  processor: string;
  ram: string;
  storage: string;
  displaySize: number;
  operatingSystem: string;
  description: string;
  inCartByUserIds?: string[];
}