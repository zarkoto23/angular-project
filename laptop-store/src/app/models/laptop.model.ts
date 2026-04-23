// models/laptop.model.ts
export interface Laptop {
  id: string;              // това идва от firebase ID
  createdAt: string;       // това идва от firebase createdAt
  ownerId: string;
  
  brand: string;
  model: string;
  imageUrl: string;
  price: number;
  processor: string;
  ram: string;
  storage: string;
  displaySize: number;
  operatingSystem: 'Windows 11'|'Windows 10'|'Linux'|'macOS'|'ChromeOS'|'Друга';
  description: string;
  backlight: boolean;
  class: 'Business' | 'Gaming' | 'Student' | 'Premium';
  inCartByUserIds?: string[];
}