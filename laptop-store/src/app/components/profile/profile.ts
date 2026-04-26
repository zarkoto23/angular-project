// components/profile/profile.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, map, Observable, combineLatest } from 'rxjs';
import { LaptopService } from '../../services/laptop.service';
import { SupabaseService } from '../../services/supabase.service';
import { Laptop } from '../../models/laptop.model';
import { ProductCard } from '../home/products/product-card/product-card';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ProductCard],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  myLaptops$: Observable<Laptop[]> = new Observable();
  cartLaptops$: Observable<Laptop[]> = new Observable();
  currentUser: any = null;

  constructor(
    private laptopService: LaptopService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.supabaseService.getCurrentUserValue();
    
    if (this.currentUser) {
      const allLaptops$ = this.laptopService.getAll().pipe(
        map(response => response.data || [])
      );
      
      this.myLaptops$ = allLaptops$.pipe(
        map(laptops => laptops.filter(l => l.owner_id === this.currentUser.id))
      );
      
      this.cartLaptops$ = allLaptops$.pipe(
        map(laptops => laptops.filter(l => l.data?.in_cart_to?.includes(this.currentUser.id)))
      );
    }
  }

  removeFromCart(laptopId: string): void {
    this.laptopService.removeFromCart(laptopId).subscribe({
      next: () => {
        this.cartLaptops$ = this.cartLaptops$.pipe(
          map(laptops => laptops.filter(l => l.id !== laptopId))
        );
      },
      error: (error) => {
        console.error('Грешка при премахване от количка:', error);
      }
    });
  }

  deleteLaptop(laptopId: string): void {
    if (confirm('Сигурни ли сте, че искате да изтриете този лаптоп?')) {
      this.laptopService.delete(laptopId).subscribe({
        next: () => {
          this.myLaptops$ = this.myLaptops$.pipe(
            map(laptops => laptops.filter(l => l.id !== laptopId))
          );
        },
        error: (error) => {
          console.error('Грешка при изтриване:', error);
        }
      });
    }
  }
}