import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { LaptopService } from '../services/laptop.service';
import { SupabaseService } from '../services/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class OwnerGuard implements CanActivate {
  constructor(
    private laptopService: LaptopService,
    private supabaseService: SupabaseService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const laptopId = route.paramMap.get('id');
    const currentUser = this.supabaseService.getCurrentUserValue();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return of(false);
    }

    return this.laptopService.getOne(laptopId!).pipe(
      map((response) => {
        if (response.error || !response.data) {
          this.router.navigate(['/laptops']);
          return false;
        }

        const isOwner = response.data.owner_id === currentUser.id;

        if (!isOwner) {
          this.router.navigate(['/laptops', laptopId]);
          return false;
        }

        return true;
      }),
      catchError(() => {
        this.router.navigate(['/laptops']);
        return of(false);
      }),
    );
  }
}
