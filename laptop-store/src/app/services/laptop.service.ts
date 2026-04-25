// laptop.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { Laptop } from '../models/laptop.model';

@Injectable({
  providedIn: 'root'
})
export class LaptopService {
  private supabaseService = inject(SupabaseService);
  private supabase = this.supabaseService.getSupabaseClient();

  // GET ALL - всички лаптопи
  getAll(): Observable<{ data: Laptop[] | null; error: any }> {
    return from(
      this.supabase.from('laptops').select('*')
    );
  }

  // GET ONE - един лаптоп по ID
  getOne(id: string): Observable<{ data: Laptop | null; error: any }> {
    return from(
      this.supabase
        .from('laptops')
        .select('*')
        .eq('id', id)
        .single()
    );
  }

  // CREATE - създаване на нов лаптоп
  create(laptopData: Laptop['data']): Observable<{ data: Laptop | null; error: any }> {
    const currentUser = this.supabaseService.getCurrentUserValue();
    
    if (!currentUser) {
      return of({ data: null, error: { message: 'Трябва да сте логнати за да добавяте лаптопи' } });
    }

    const newLaptop = {
      owner_id: currentUser.id,
      data: laptopData
    };

    return from(
      this.supabase
        .from('laptops')
        .insert([newLaptop])
        .select()
        .single()
    );
  }

  // EDIT - редакция на лаптоп (само собственика)
  edit(id: string, updatedData: Partial<Laptop['data']>): Observable<{ data: Laptop | null; error: any }> {
    const currentUser = this.supabaseService.getCurrentUserValue();
    
    if (!currentUser) {
      return of({ data: null, error: { message: 'Трябва да сте логнати' } });
    }

    return from(
      this.supabase
        .from('laptops')
        .update({ data: updatedData })
        .eq('id', id)
        .eq('owner_id', currentUser.id)
        .select()
        .single()
    );
  }

  // DELETE - изтриване на лаптоп (само собственика)
  delete(id: string): Observable<{ error: any }> {
    const currentUser = this.supabaseService.getCurrentUserValue();
    
    if (!currentUser) {
      return of({ error: { message: 'Трябва да сте логнати' } });
    }

    return from(
      this.supabase
        .from('laptops')
        .delete()
        .eq('id', id)
        .eq('owner_id', currentUser.id)
    );
  }

  // ADD TO CART - добавяне в количката
  addToCart(laptopId: string): Observable<{ data: Laptop | null; error: any }> {
    const currentUser = this.supabaseService.getCurrentUserValue();
    
    if (!currentUser) {
      return of({ data: null, error: { message: 'Трябва да сте логнати за да добавяте в количка' } });
    }

    return from(
      this.supabase
        .from('laptops')
        .select('data')
        .eq('id', laptopId)
        .single()
    ).pipe(
      switchMap(response => {
        if (response.error) {
          return of({ data: null, error: response.error });
        }
        
        const currentCart = response.data?.data?.inCartIn || [];
        
        if (currentCart.includes(currentUser.id)) {
          return of({ data: null, error: { message: 'Лаптопът вече е в количката' } });
        }
        
        const newCart = [...currentCart, currentUser.id];
        
        return from(
          this.supabase
            .from('laptops')
            .update({ data: { ...response.data.data, inCartIn: newCart } })
            .eq('id', laptopId)
            .select()
            .single()
        );
      })
    );
  }

  // REMOVE FROM CART - премахване от количката
  removeFromCart(laptopId: string): Observable<{ data: Laptop | null; error: any }> {
    const currentUser = this.supabaseService.getCurrentUserValue();
    
    if (!currentUser) {
      return of({ data: null, error: { message: 'Трябва да сте логнати' } });
    }

    return from(
      this.supabase
        .from('laptops')
        .select('data')
        .eq('id', laptopId)
        .single()
    ).pipe(
      switchMap(response => {
        if (response.error) {
          return of({ data: null, error: response.error });
        }
        
        const currentCart = response.data?.data?.inCartIn || [];
        const newCart = currentCart.filter((id: string) => id !== currentUser.id);
        
        return from(
          this.supabase
            .from('laptops')
            .update({ data: { ...response.data.data, inCartIn: newCart } })
            .eq('id', laptopId)
            .select()
            .single()
        );
      })
    );
  }

  // GET USER CART - всички лаптопи в количката на текущия потребител
  getUserCart(): Observable<{ data: Laptop[] | null; error: any }> {
    const currentUser = this.supabaseService.getCurrentUserValue();
    
    if (!currentUser) {
      return of({ data: null, error: { message: 'Трябва да сте логнати' } });
    }

    return from(
      this.supabase
        .from('laptops')
        .select('*')
        .contains('data->inCartIn', [currentUser.id])
    );
  }
}