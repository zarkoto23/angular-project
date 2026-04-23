import { Laptop } from "./laptop.model";

export interface FirebaseLaptopDoc {
  _id: string;
  createdAt: string;
  ownerId:string
  data: Laptop;  // ← сега има конкретен тип
}