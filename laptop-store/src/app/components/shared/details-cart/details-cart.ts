// details-cart.ts
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, switchMap, map, of, BehaviorSubject } from 'rxjs';
import { Laptop } from '../../../models/laptop.model';
import { LaptopService } from '../../../services/laptop.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-details-cart',
  standalone: true,
  imports: [RouterLink, AsyncPipe, CommonModule],
  templateUrl: './details-cart.html',
  styleUrls: ['./details-cart.css']
})
export class DetailsCart {
  laptop$: Observable<Laptop | null>;
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);
  isInCart$: Observable<boolean> = of(false);
  currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private laptopService: LaptopService,
    private supabaseService: SupabaseService
  ) {
    this.currentUserId = this.supabaseService.getCurrentUserValue()?.id || null;
    
    this.laptop$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        return this.laptopService.getOne(id!).pipe(
          map(response => response.data)
        );
      })
    );

    // Проверка дали лаптопа е в количката
    this.isInCart$ = this.refreshTrigger$.pipe(
      switchMap(() => this.laptop$),
      switchMap(laptop => {
        if (laptop && this.currentUserId) {
          return this.laptopService.getOne(laptop.id!).pipe(
            map(response => {
              const cartArray = response.data?.data?.in_cart_to || [];
              return cartArray.includes(this.currentUserId!);
            })
          );
        }
        return of(false);
      })
    );
  }

  editLaptop(laptopId: string | undefined): void {
    this.router.navigate(['/edit', laptopId]);
  }

  deleteLaptop(laptopId: string | undefined): void {
    if (confirm('Сигурни ли сте, че искате да изтриете този лаптоп?')) {
      this.laptopService.delete(laptopId!).subscribe({
        next: () => {
          this.router.navigate(['/laptops']);
        },
        error: (error) => {
          console.error('Error:', error);
        }
      });
    }
  }

  addToCart(laptopId: string | undefined): void {
    this.laptopService.addToCart(laptopId!).subscribe({
      next: () => {
        // Просто обнови статуса, без alert
        this.refreshTrigger$.next();
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }

  removeFromCart(laptopId: string | undefined): void {
    this.laptopService.removeFromCart(laptopId!).subscribe({
      next: () => {
        // Просто обнови статуса, без alert
        this.refreshTrigger$.next();
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }
}