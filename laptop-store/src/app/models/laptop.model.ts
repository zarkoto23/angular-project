import { LaptopData } from "./laptop-data.model";

// models/laptop.model.ts
export interface Laptop {
  id: string;              
  created_at: string;  
  owner_id: string;

  data:LaptopData
}