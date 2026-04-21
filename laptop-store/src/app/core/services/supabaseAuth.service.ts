import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/environment';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})

export class SupabaseService{
  private supabase:SupabaseClient

  private currentUsrSubject=new BehaviorSubject<User|null>(null)
  public currentUsr$=this.currentUsrSubject.asObservable()
  

  constructor(){
    this.supabase=createClient(
      environment.supabaseKey,
      environment.supabaseUrl
    )

    this.supabase.auth.onAuthStateChange((_event, session)=>{
      this.currentUsrSubject.next(session?.user || null)
    })
  }
}







//   // ============ АВТЕНТИКАЦИЯ ============
  
//   // Регистрация
//   async signUp(email: string, password: string): Promise<{ user: User | null; error: any }> {
//     const { data, error } = await this.supabase.auth.signUp({
//       email,
//       password
//     });
//     return { user: data.user, error };
//   }

//   // Вход
//   async signIn(email: string, password: string): Promise<{ user: User | null; error: any }> {
//     const { data, error } = await this.supabase.auth.signInWithPassword({
//       email,
//       password
//     });
//     return { user: data.user, error };
//   }

//   // Изход
//   async signOut(): Promise<void> {
//     await this.supabase.auth.signOut();
//   }

//   // Вземане на текущия потребител (като Promise - за еднократно четене)
//   async getCurrentUser(): Promise<User | null> {
//     const { data: { user } } = await this.supabase.auth.getUser();
//     return user;
//   }

//   // ============ ЛАПТОПИ (CRUD) ============
  
//   // Вземане на всички лаптопи
//   async getLaptops(): Promise<any[]> {
//     const { data, error } = await this.supabase
//       .from('laptops')
//       .select('*');
    
//     if (error) throw error;
//     return data;
//   }

//   // Вземане само на моите лаптопи (по ownerID)
//   async getMyLaptops(ownerId: string): Promise<any[]> {
//     const { data, error } = await this.supabase
//       .from('laptops')
//       .select('*')
//       .eq('ownerID', ownerId);
    
//     if (error) throw error;
//     return data;
//   }

//   // Създаване на лаптоп
//   async createLaptop(ownerID: string, laptopData: any): Promise<any> {
//     const { data, error } = await this.supabase
//       .from('laptops')
//       .insert({ ownerID, data: laptopData })
//       .select();
    
//     if (error) throw error;
//     return data;
//   }

//   // Актуализиране на лаптоп
//   async updateLaptop(laptopId: string, updatedData: any): Promise<any> {
//     const { data, error } = await this.supabase
//       .from('laptops')
//       .update({ data: updatedData })
//       .eq('id', laptopId);
    
//     if (error) throw error;
//     return data;
//   }

//   // Харесване на лаптоп
//   async likeLaptop(laptopId: string, userId: string, currentData: any): Promise<any> {
//     const updatedLikedBy = [...(currentData.likedBy || []), userId];
//     return this.updateLaptop(laptopId, { ...currentData, likedBy: updatedLikedBy });
//   }

//   // Премахване на харесване
//   async unlikeLaptop(laptopId: string, userId: string, currentData: any): Promise<any> {
//     const updatedLikedBy = (currentData.likedBy || []).filter((id: string) => id !== userId);
//     return this.updateLaptop(laptopId, { ...currentData, likedBy: updatedLikedBy });
//   }

//   // Изтриване на лаптоп
//   async deleteLaptop(laptopId: string): Promise<void> {
//     const { error } = await this.supabase
//       .from('laptops')
//       .delete()
//       .eq('id', laptopId);
    
//     if (error) throw error;
//   }

//   // ============ ПОЛЕЗНИ МЕТОДИ ============
  
//   // Директен достъп до supabase клиента (ако ти трябва за нещо специфично)
//   getSupabaseClient(): SupabaseClient {
//     return this.supabase;
//   }
// }