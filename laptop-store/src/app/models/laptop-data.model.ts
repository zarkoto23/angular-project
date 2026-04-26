export interface LaptopData {
  brand: string;
  model: string;
  price: number;
  image_url: string;
  processor: string;
  ram: number
  storage: number;
  in_cart_to: string[];
  display_size: number;
  operating_system: 'Windows 11' | 'Windows 10' | 'Linux' | 'macOS' | 'ChromeOS'|'FreeDOS'|'Друга',
  class: 'Business' | 'Gaming' | 'Student' | 'Premium'|'Друго';
  description: string | null;
  backlight:boolean
}
