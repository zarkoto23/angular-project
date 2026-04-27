import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { Laptop } from '../models/laptop.model';

@Injectable({
  providedIn: 'root',
})
export class LaptopService {
  private supabaseService = inject(SupabaseService);
  private supabase = this.supabaseService.getSupabaseClient();

 getAll(): Observable<{ data: Laptop[] | null; error: any }> {
    return from(this.supabase.from('laptops').select('*').order('created_at', { ascending: false }));
}

  getOne(id: string): Observable<{ data: Laptop | null; error: any }> {
    return from(this.supabase.from('laptops').select('*').eq('id', id).single());
  }

  create(laptopData: Laptop['data']): Observable<{ data: Laptop | null; error: any }> {
    const currentUser = this.supabaseService.getCurrentUserValue();

    if (!currentUser) {
      return of({ data: null, error: { message: 'Трябва да сте логнати за да добавяте лаптопи' } });
    }

    const newLaptop = {
      owner_id: currentUser.id,
      data: laptopData,
    };

    return from(this.supabase.from('laptops').insert([newLaptop]).select().single());
  }

  edit(
    id: string,
    updatedData: Partial<Laptop['data']>,
  ): Observable<{ data: Laptop | null; error: any }> {
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
        .single(),
    );
  }

  delete(id: string): Observable<{ error: any }> {
    const currentUser = this.supabaseService.getCurrentUserValue();

    if (!currentUser) {
      return of({ error: { message: 'Трябва да сте логнати' } });
    }

    return from(this.supabase.from('laptops').delete().eq('id', id).eq('owner_id', currentUser.id));
  }

// laptop.service.ts - оправен addToCart
// laptop.service.ts - оправен addToCart
addToCart(laptopId: string): Observable<{ data: Laptop | null; error: any }> {
  const currentUser = this.supabaseService.getCurrentUserValue();

  if (!currentUser) {
    return of({
      data: null,
      error: { message: 'Трябва да сте логнати за да добавяте в количка' },
    });
  }

  return from(this.supabase.from('laptops').select('*').eq('id', laptopId).single()).pipe(
    switchMap((response) => {
      if (response.error) {
        return of({ data: null, error: response.error });
      }

      const laptop = response.data as Laptop;
      const currentCart = laptop.data.in_cart_to || [];
      
      // Ако вече е в количката, просто връщаме успех без промяна
      if (currentCart.includes(currentUser.id)) {
        return of({ data: laptop, error: null });
      }

      const newCart = [...currentCart, currentUser.id];
      const updatedData = { ...laptop.data, in_cart_to: newCart };

      return from(
        this.supabase
          .from('laptops')
          .update({ data: updatedData })
          .eq('id', laptopId)
          .select()
          .single()
      ).pipe(
        map((updateResponse) => {
          if (updateResponse.error) {
            return { data: null, error: updateResponse.error };
          }
          return { data: updateResponse.data as Laptop, error: null };
        })
      );
    }),
  );
}
 // laptop.service.ts - оправен removeFromCart
removeFromCart(laptopId: string): Observable<{ data: Laptop | null; error: any }> {
  const currentUser = this.supabaseService.getCurrentUserValue();

  if (!currentUser) {
    return of({ data: null, error: { message: 'Трябва да сте логнати' } });
  }

  return from(this.supabase.from('laptops').select('*').eq('id', laptopId).single()).pipe(
    switchMap((response) => {
      if (response.error) {
        return of({ data: null, error: response.error });
      }

      const laptop = response.data as Laptop;
      const currentCart = laptop.data.in_cart_to || [];
      const newCart = currentCart.filter((id: string) => id !== currentUser.id);

      const updatedData = { ...laptop.data, in_cart_to: newCart };

      return from(
        this.supabase
          .from('laptops')
          .update({ data: updatedData })
          .eq('id', laptopId)
          .select()
          .single()
      ).pipe(
        map((updateResponse) => {
          if (updateResponse.error) {
            return { data: null, error: updateResponse.error };
          }
          return { data: updateResponse.data as Laptop, error: null };
        })
      );
    }),
  );
}
  // laptop.service.ts

  getUserCart(): Observable<{ data: Laptop[] | null; error: any }> {
  const currentUser = this.supabaseService.getCurrentUserValue();

  if (!currentUser) {
    return of({ data: null, error: { message: 'Трябва да сте логнати' } });
  }

  // Вариант 1: Вземаме всички лаптопи и филтрираме в JavaScript
  return from(this.supabase.from('laptops').select('*')).pipe(
    map((response) => {
      if (response.error) {
        return { data: null, error: response.error };
      }
      
      const laptops = response.data as Laptop[];
      const filteredLaptops = laptops.filter(laptop => 
        laptop.data.in_cart_to?.includes(currentUser.id)
      );
      
      return { data: filteredLaptops, error: null };
    })
  );
}

  getLatestProducts(limit: number = 5): Observable<Laptop[]> {
    return from(
      this.supabase
        .from('laptops')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Грешка:', error);
          return [];
        }
        return (data as Laptop[]) || [];
      }),
      catchError((err) => {
        console.error('Грешка:', err);
        return of([]);
      }),
    );
  }

  // laptop.service.ts - добави този метод

isLaptopInCart(laptopId: string): Observable<boolean> {
  const currentUser = this.supabaseService.getCurrentUserValue();
  
  if (!currentUser) {
    return of(false);
  }
  
  return this.getOne(laptopId).pipe(
    map(response => {
      const laptop = response.data;
      // Използвай правилното име на полето - в твоя случай 'inCartIn'
      return laptop?.data?.in_cart_to?.includes(currentUser.id) || false;
    })
  );
}


}