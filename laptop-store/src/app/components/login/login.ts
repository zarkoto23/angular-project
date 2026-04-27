import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../services/supabase.service';
import { ErrorModal } from '../static/error-modal/error-modal';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, ErrorModal],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit, OnDestroy {
  email: string = '';
  password: string = '';

  showErrorModal: boolean = false;
  errorModalMessage: string = '';
  modalType: 'error' | 'success' = 'error';
  
  private subscription: Subscription = new Subscription();
  private redirecting: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const currentUser = this.supabaseService.getCurrentUserValue();
    
    if (currentUser && !this.redirecting) {
      this.redirecting = true;
      this.router.navigate(['/']);
      return;
    }
    
    this.subscription.add(
      this.supabaseService.currentUser$.subscribe(user => {
        if (user && !this.redirecting) {
          this.redirecting = true;
          this.router.navigate(['/']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.showError('Моля, попълнете имейл и парола');
      this.password = '';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showError('Невалиден имейл');
      this.email = '';
      this.password = '';
      return;
    }

    this.supabaseService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.error) {
          this.showError('Грешен имейл или парола');
          this.password = '';
          this.cdr.detectChanges();
        } else if (response.user) {
          this.router.navigate(['/']);
        } else {
          this.showError('Нещо се обърка, опитай пак');
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.showError(`Възникна грешка: ${err.message || err}`);
        this.cdr.detectChanges();
      },
    });
  }

  showError(message: string, type: 'error' | 'success' = 'error') {
    this.errorModalMessage = message;
    this.showErrorModal = true;
    this.modalType = type;
    this.cdr.detectChanges();
  }

  closeErrorModal() {
    this.showErrorModal = false;
    this.errorModalMessage = '';
    this.cdr.detectChanges();
  }

  private isValidEmail(email: string): boolean {
    const atIndex = email.indexOf('@');
    const dotIndex = email.lastIndexOf('.');
    return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < email.length - 1;
  }
}