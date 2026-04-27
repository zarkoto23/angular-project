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
  styleUrls: ['./details-cart.css'],
})
export class DetailsCart {
  laptop$: Observable<Laptop | null>;
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);
  isInCart$: Observable<boolean> = of(false);
  currentUserId: string | null = null;
  private isAddingToCart = false;
  private isRemovingFromCart = false;

  isDescriptionExpanded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private laptopService: LaptopService,
    private supabaseService: SupabaseService,
  ) {
    this.currentUserId = this.supabaseService.getCurrentUserValue()?.id || null;

    this.laptop$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (!id) {
          this.router.navigate(['/laptops']);
          return of(null);
        }
        return this.laptopService.getOne(id).pipe(map((response) => response.data));
      }),
    );

    this.isInCart$ = this.refreshTrigger$.pipe(
      switchMap(() => this.laptop$),
      switchMap((laptop) => {
        if (laptop && this.currentUserId) {
          return this.laptopService.getOne(laptop.id!).pipe(
            map((response) => {
              const cartArray = response.data?.data?.in_cart_to || [];
              return cartArray.includes(this.currentUserId!);
            }),
          );
        }
        return of(false);
      }),
    );
  }

  editLaptop(laptopId: string | undefined): void {
    if (!laptopId) return;
    this.router.navigate(['/edit', laptopId]);
  }

  deleteLaptop(laptopId: string | undefined): void {
    if (!laptopId) return;
    if (confirm('Сигурни ли сте, че искате да изтриете този лаптоп?')) {
      this.laptopService.delete(laptopId).subscribe({
        next: () => {
          this.router.navigate(['/laptops']);
        },
      });
    }
  }

  addToCart(laptopId: string | undefined): void {
    if (!laptopId || this.isAddingToCart) return;

    this.isAddingToCart = true;
    this.laptopService.addToCart(laptopId).subscribe({
      next: () => {
        this.refreshTrigger$.next();
        this.isAddingToCart = false;
      },
      error: () => {
        this.isAddingToCart = false;
      },
    });
  }

  removeFromCart(laptopId: string | undefined): void {
    if (!laptopId || this.isRemovingFromCart) return;

    this.isRemovingFromCart = true;
    this.laptopService.removeFromCart(laptopId).subscribe({
      next: () => {
        this.refreshTrigger$.next();
        this.isRemovingFromCart = false;
      },
      error: () => {
        this.isRemovingFromCart = false;
      },
    });
  }

  toggleDescription(): void {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  getDisplayedDescription(description: string | undefined): string {
    if (!description) return '';

    const maxLength = 150;
    if (this.isDescriptionExpanded || description.length <= maxLength) {
      return description;
    }

    return description.substring(0, maxLength) + '...';
  }

  shouldShowReadMore(description: string | undefined): boolean {
    return !!description && description.length > 150 && !this.isDescriptionExpanded;
  }

  shouldShowReadLess(description: string | undefined): boolean {
    return this.isDescriptionExpanded && !!description && description.length > 150;
  }
}
