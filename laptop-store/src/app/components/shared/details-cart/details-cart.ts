// components/shared/details-cart/details-cart.ts
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, switchMap, map } from 'rxjs';
import { Laptop } from '../../../models/laptop.model';
import { LaptopService } from '../../../services/laptop.service';
import { AsyncPipe } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-details-cart',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './details-cart.html',
  styleUrls: ['./details-cart.css']
})
export class DetailsCart {
  laptop$: Observable<Laptop | null>;
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
        alert('Добавен в количката');
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }
}