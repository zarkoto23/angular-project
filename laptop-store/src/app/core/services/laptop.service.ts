import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabaseAuth.service';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { Laptop } from '../../shared/models/laptop.model';

@Injectable({
  providedIn: 'root',
})
export class LaptopService {
  private supabaseService = inject(SupabaseService);
  private supabase = this.supabaseService.getSupabaseClient();

  private transformToLaptop(data: any): Laptop {
    return {
      id: data.id,
      ownerID: data.ownerID,
      createdAt: data.createdAt,
      brand: data.data.brand,
      model: data.data.model,
      imageUrl: data.data.imageUrl,
      price: data.data.price,
      processor: data.data.processor,
      ram: data.data.ram,
      storage: data.data.storage,
      displaySize: data.data.displaySize,
      operatingSystem: data.data.operatingSystem,
      description: data.data.description,
      inCartByUserIds: data.data.inCartByUserIds || [],
    };
  }

  private transformToLaptops(data: any[]): Laptop[] {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    return data.map((item) => this.transformToLaptop(item));
  }

  getAll(): Observable<Laptop[]> {
    const promise = this.supabase.from('laptops').select('*');

    return from(promise).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return this.transformToLaptops(data || []);
      }),
      catchError((err) => {
        console.error('Error fetching laptops:', err);
        return of([]);
      }),
    );
  }

  getOne(id: string): Observable<Laptop | null> {
    const promise = this.supabase.from('laptops').select('*').eq('id', id).single();

    return from(promise).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data ? this.transformToLaptop(data) : null;
      }),
      catchError((err) => {
        console.error('Error fetching laptop:', err);
        return of(null);
      }),
    );
  }

  owned(): Observable<Laptop[]> {
    return this.supabaseService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) return of([]);

        const promise = this.supabase.from('laptops').select('*').eq('ownerID', user.id);

        return from(promise).pipe(
          map(({ data, error }) => {
            if (error) throw error;
            return this.transformToLaptops(data || []);
          }),
        );
      }),
      catchError((err) => {
        console.error('Error fetching owned laptops:', err);
        return of([]);
      }),
    );
  }

  inCart(): Observable<Laptop[]> {
    return this.supabaseService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) return of([]);

        const promise = this.supabase.from('laptops').select('*');

        return from(promise).pipe(
          map(({ data, error }) => {
            if (error) throw error;
            const allLaptops = this.transformToLaptops(data || []);
            return allLaptops.filter((laptop) => laptop.inCartByUserIds?.includes(user.id));
          }),
        );
      }),
      catchError((err) => {
        console.error('Error fetching cart laptops:', err);
        return of([]);
      }),
    );
  }

  create(
    laptopData: Omit<Laptop, 'id' | 'ownerID' | 'createdAt' | 'inCartByUserIds'>,
  ): Observable<Laptop | null> {
    return this.supabaseService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) throw new Error('Няма логнат потребител');

        const dbData = {
          ownerID: user.id,
          data: {
            brand: laptopData.brand,
            model: laptopData.model,
            imageUrl: laptopData.imageUrl,
            price: laptopData.price,
            processor: laptopData.processor,
            ram: laptopData.ram,
            storage: laptopData.storage,
            displaySize: laptopData.displaySize,
            operatingSystem: laptopData.operatingSystem,
            description: laptopData.description,
            inCartByUserIds: [],
          },
        };

        const promise = this.supabase.from('laptops').insert(dbData).select();

        return from(promise).pipe(
          map(({ data, error }) => {
            if (error) throw error;
            return data?.[0] ? this.transformToLaptop(data[0]) : null;
          }),
        );
      }),
      catchError((err) => {
        console.error('Error creating laptop:', err);
        return of(null);
      }),
    );
  }

  update(id: string, laptopData: Partial<Laptop>): Observable<Laptop | null> {
    return this.getOne(id).pipe(
      switchMap((existingLaptop) => {
        if (!existingLaptop) throw new Error('Лаптопът не съществува');

        const updatedData = {
          ...existingLaptop,
          ...laptopData,
        };

        const dbData = {
          data: {
            brand: updatedData.brand,
            model: updatedData.model,
            imageUrl: updatedData.imageUrl,
            price: updatedData.price,
            processor: updatedData.processor,
            ram: updatedData.ram,
            storage: updatedData.storage,
            displaySize: updatedData.displaySize,
            operatingSystem: updatedData.operatingSystem,
            description: updatedData.description,
            inCartByUserIds: updatedData.inCartByUserIds || [],
          },
        };

        const promise = this.supabase.from('laptops').update(dbData).eq('id', id).select();

        return from(promise).pipe(
          map(({ data, error }) => {
            if (error) throw error;
            return data?.[0] ? this.transformToLaptop(data[0]) : null;
          }),
        );
      }),
      catchError((err) => {
        console.error('Error updating laptop:', err);
        return of(null);
      }),
    );
  }

  // 7. DELETE - изтриване на лаптоп
  delete(id: string): Observable<boolean> {
    return this.supabaseService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) throw new Error('Няма логнат потребител');

        const promise = this.supabase.from('laptops').delete().eq('id', id).eq('ownerID', user.id);

        return from(promise).pipe(
          map(({ error }) => {
            if (error) throw error;
            return true;
          }),
        );
      }),
      catchError((err) => {
        console.error('Error deleting laptop:', err);
        return of(false);
      }),
    );
  }

  addToCart(laptopId: string): Observable<Laptop | null> {
    return this.supabaseService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) throw new Error('Няма логнат потребител');

        return this.getOne(laptopId).pipe(
          switchMap((laptop) => {
            if (!laptop) throw new Error('Лаптопът не съществува');

            if (laptop.inCartByUserIds?.includes(user.id)) {
              return of(laptop);
            }

            const updatedInCart = [...(laptop.inCartByUserIds || []), user.id];
            return this.update(laptopId, { inCartByUserIds: updatedInCart });
          }),
        );
      }),
      catchError((err) => {
        console.error('Error adding to cart:', err);
        return of(null);
      }),
    );
  }

  removeFromCart(laptopId: string): Observable<Laptop | null> {
    return this.supabaseService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) throw new Error('Няма логнат потребител');

        return this.getOne(laptopId).pipe(
          switchMap((laptop) => {
            if (!laptop) throw new Error('Лаптопът не съществува');

            const updatedInCart = (laptop.inCartByUserIds || []).filter((id) => id !== user.id);
            return this.update(laptopId, { inCartByUserIds: updatedInCart });
          }),
        );
      }),
      catchError((err) => {
        console.error('Error removing from cart:', err);
        return of(null);
      }),
    );
  }
}
