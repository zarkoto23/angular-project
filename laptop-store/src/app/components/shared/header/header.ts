// components/header/header.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Първоначална синхронна стойност
    this.currentUser = this.supabaseService.getCurrentUserValue();
    console.log('Header - initial user:', this.currentUser?.email || 'No user');
    
    // Слушаме за промени в потребителя
    this.subscription.add(
      this.supabaseService.currentUser$.subscribe(user => {
        console.log('Header - user changed:', user?.email || 'No user');
        this.currentUser = user;
        this.cdr.detectChanges(); // Принудително обновяване на изгледа
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  logout(): void {
    console.log('Header - logout() called');
    
    this.supabaseService.logout().subscribe({
      next: () => {
        console.log('Header - logout successful, redirecting to home');
        // Пренасочване към началната страница
        this.router.navigate(['/']).then(() => {
          console.log('Header - navigation to / completed');
        });
      },
      error: (err) => {
        console.error('Header - logout error:', err);
      }
    });
  }
}