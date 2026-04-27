import { LaptopData } from "./laptop-data.model";

export interface Laptop {
  id: string;              
  created_at: string;  
  owner_id: string;

  data:LaptopData
}