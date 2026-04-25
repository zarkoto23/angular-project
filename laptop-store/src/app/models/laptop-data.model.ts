export interface LaptopData {
  ram: string;
  brand: string;
  model: string;
  price: number;
  inCartTo: string[];
  storage: number;
  imageUrl: string;
  processor: string;
  displaySize: number;
  operatingSystem: 'Windows 11' | 'Windows 10' | 'Linux' | 'macOS' | 'ChromeOS' | 'Друга';
  class: 'Business' | 'Gaming' | 'Student' | 'Premium';
  description: string | null;
  backlight:boolean
}
