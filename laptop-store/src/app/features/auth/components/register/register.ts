// src/app/test-register/test-register.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../core/services/supabase.service'; 

@Component({
  selector: 'app-test-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
      <h2>Тест Регистрация</h2>
      
      <div style="margin-bottom: 15px;">
        <label>Email:</label>
        <input 
          type="email" 
          [(ngModel)]="email" 
          style="width: 100%; padding: 8px; margin-top: 5px;"
          placeholder="test@example.com">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label>Парола:</label>
        <input 
          type="password" 
          [(ngModel)]="password" 
          style="width: 100%; padding: 8px; margin-top: 5px;"
          placeholder="******">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label>Потвърди парола:</label>
        <input 
          type="password" 
          [(ngModel)]="confirmPassword" 
          style="width: 100%; padding: 8px; margin-top: 5px;"
          placeholder="******">
      </div>
      
      <button 
        (click)="register()" 
        [disabled]="loading"
        style="width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
        {{ loading ? 'Регистриране...' : 'Регистрация' }}
      </button>
      
      <!-- Резултат -->
      @if (success) {
        <div style="margin-top: 15px; padding: 10px; background: #d4edda; color: #155724; border-radius: 4px;">
          ✅ Успешна регистрация!<br>
          Email: {{ user?.email }}<br>
          ID: {{ user?.id }}
        </div>
      }
      
      @if (error) {
        <div style="margin-top: 15px; padding: 10px; background: #f8d7da; color: #721c24; border-radius: 4px;">
          ❌ {{ error }}
        </div>
      }
    </div>
  `
})
export class TestRegisterComponent {
  private supabaseService = inject(SupabaseService);
  
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  success = false;
  error = '';
  user: any = null;

  register() {
    this.loading = true;
    this.success = false;
    this.error = '';
    
    this.supabaseService.registration(this.email, this.password, this.confirmPassword)
      .subscribe({
        next: (result) => {
          this.loading = false;
          if (result.error) {
            this.error = result.error.message;
          } else {
            this.success = true;
            this.user = result.user;
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.message || 'Грешка при регистрация';
        }
      });
  }
}