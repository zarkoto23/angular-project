import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ErrorModal } from '../static/error-modal/error-modal';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, ErrorModal],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit, OnDestroy {
  email: string = '';
  password: string = '';
  rePass: string = '';

  showErrorModal: boolean = false;
  errorModalMessage: string = '';
  modalType: 'error' | 'success' = 'error';

  private subscription: Subscription = new Subscription();
  private redirecting: boolean = false;
  private isLoading: boolean = true;

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

    this.isLoading = false;
    this.cdr.detectChanges();

    this.subscription.add(
      this.supabaseService.currentUser$.subscribe((user) => {
        if (user && !this.redirecting) {
          this.redirecting = true;
          this.router.navigate(['/']);
        }
      }),
    );

    this.subscription.add(
      this.supabaseService.isInitialized$.subscribe((initialized) => {
        if (initialized && !this.redirecting) {
          const user = this.supabaseService.getCurrentUserValue();
          if (user) {
            this.redirecting = true;
            this.router.navigate(['/']);
          } else {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onRegister() {
    if (this.redirecting) {
      return;
    }

    if (!this.email || !this.password || !this.rePass) {
      this.showError('Попълнете всички полета!', 'error');
      this.password = '';
      this.rePass = '';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showError('Невалиден имейл', 'error');
      this.email = '';
      this.password = '';
      this.rePass = '';
      return;
    }

    if (this.password.length < 6) {
      this.showError('Паролата трябва да съдържа най-малко 6 символа', 'error');
      this.password = '';
      this.rePass = '';
      return;
    }

    if (this.password !== this.rePass) {
      this.showError('Паролите не съвпадат', 'error');
      this.password = '';
      this.rePass = '';
      return;
    }

    this.supabaseService.register(this.email, this.password).subscribe({
      next: (response) => {
        if (response.error) {
          let errorMessage = 'Грешка при регистрация';
          if (response.error.message?.includes('already registered')) {
            errorMessage = 'Този имейл вече е регистриран';
          } else if (response.error.message?.includes('password')) {
            errorMessage = 'Паролата не отговаря на изискванията';
          }
          this.showError(errorMessage, 'error');
          this.password = '';
          this.rePass = '';
          this.cdr.detectChanges();
        } else if (response.user) {
          this.showError('Профилът е успешно създаден!', 'success');
          this.cdr.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.showError('Нещо се обърка, опитай пак', 'error');
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.showError(`Възникна грешка: ${err.message || err}`, 'error');
        this.cdr.detectChanges();
      },
    });
  }

  showError(message: string, type: 'error' | 'success' = 'error') {
    this.errorModalMessage = message;
    this.showErrorModal = true;
    this.modalType = type;
    this.cdr.detectChanges();

    if (type === 'success') {
      setTimeout(() => {
        if (this.showErrorModal) {
          this.closeErrorModal();
        }
      }, 3000);
    }
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
