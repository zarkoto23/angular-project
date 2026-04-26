// guards/public.guard.ts
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
    // Дебъг логове
    console.log('=========================================');
    console.log('🔒 PUBLIC GUARD CALLED');
    console.log('🔒 URL:', state.url);
    console.log('🔒 Route path:', route.routeConfig?.path);
    console.log('=========================================');
    
    const currentUser = this.supabaseService.getCurrentUserValue();
    console.log('🔒 Current user (sync):', currentUser?.email || 'NO USER');
    
    if (currentUser) {
      console.log('🔒 User is logged in! Redirecting to /');
      this.router.navigate(['/']);
      return false;
    }
    
    return this.supabaseService.currentUser$.pipe(
      take(1),
      map((user) => {
        console.log('🔒 User from observable:', user?.email || 'NO USER');
        
        if (!user) {
          console.log('✅ ACCESS GRANTED to:', state.url);
          return true;
        } else {
          console.log('❌ ACCESS DENIED, redirecting to /');
          this.router.navigate(['/']);
          return false;
        }
      }),
    );
  }
}