import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { SupabaseService } from '../services/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class PublicGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    const currentUser = this.supabaseService.getCurrentUserValue();

    if (currentUser) {
      this.router.navigate(['/']);
      return false;
    }

    return this.supabaseService.currentUser$.pipe(
      take(1),
      map((user) => {
        if (!user) {
          return true;
        } else {
          this.router.navigate(['/']);
          return false;
        }
      }),
    );
  }
}
