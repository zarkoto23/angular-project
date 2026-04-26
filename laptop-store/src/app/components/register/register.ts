// components/register/register.ts
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
  private redirecting: boolean = false; // Предотвратява множествено пренасочване
  private isLoading: boolean = true; // За да скрием формата докато проверяваме

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    console.log('📝 [Register] Компонентът е създаден');
  }

  ngOnInit(): void {
    console.log('🔍 [Register] ngOnInit - ПРЯКА ПРОВЕРКА ЗА ЛОГНАТ ПОТРЕБИТЕЛ');
    
    // КРИТИЧНО: Синхронна проверка веднага
    const currentUser = this.supabaseService.getCurrentUserValue();
    console.log('🔍 [Register] Current user:', currentUser?.email || 'НЯМА ПОТРЕБИТЕЛ');
    
    if (currentUser && !this.redirecting) {
      console.log('🚫 [Register] ПОТРЕБИТЕЛЯТ Е ЛОГНАТ! ПРЕНАСОЧВАНЕ КЪМ /');
      this.redirecting = true;
      this.router.navigate(['/']);
      return;
    }
    
    // Ако няма логнат потребител, показваме формата
    this.isLoading = false;
    this.cdr.detectChanges();
    
    // Слушаме за промени в потребителя (за всеки случай)
    this.subscription.add(
      this.supabaseService.currentUser$.subscribe(user => {
        console.log('👂 [Register] currentUser$ променен:', user?.email || 'null');
        if (user && !this.redirecting) {
          console.log('🚫 [Register] ПОТРЕБИТЕЛ СЕ ПОЯВИ! ПРЕНАСОЧВАНЕ КЪМ /');
          this.redirecting = true;
          this.router.navigate(['/']);
        }
      })
    );
    
    // Проверка за инициализация
    this.subscription.add(
      this.supabaseService.isInitialized$.subscribe(initialized => {
        console.log('🔧 [Register] Supabase инициализиран:', initialized);
        if (initialized && !this.redirecting) {
          const user = this.supabaseService.getCurrentUserValue();
          if (user) {
            console.log('🚫 [Register] След инициализация - намерен е потребител, пренасочване');
            this.redirecting = true;
            this.router.navigate(['/']);
          } else {
            // Сигурни сме, че няма потребител, показваме формата
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    console.log('💀 [Register] Компонентът се унищожава');
    this.subscription.unsubscribe();
  }

  onRegister() {
    // Предотвратяваме регистрация ако вече пренасочваме
    if (this.redirecting) {
      console.log('⚠️ [Register] Вече пренасочвам, игнорирам регистрация');
      return;
    }
    
    console.log('📝 [Register] onRegister() извикан');
    console.log('📧 [Register] Email:', this.email);
    console.log('🔑 [Register] Password length:', this.password.length);
    console.log('🔄 [Register] RePassword length:', this.rePass.length);
    
    if (!this.email || !this.password || !this.rePass) {
      console.log('❌ [Register] Празни полета');
      this.showError('Попълнете всички полета!', 'error');
      this.password = '';
      this.rePass = '';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      console.log('❌ [Register] Невалиден имейл:', this.email);
      this.showError('Невалиден имейл', 'error');
      this.email = '';
      this.password = '';
      this.rePass = '';
      return;
    }

    if (this.password.length < 6) {
      console.log('❌ [Register] Паролата е твърде къса:', this.password.length);
      this.showError('Паролата трябва да съдържа най-малко 6 символа', 'error');
      this.password = '';
      this.rePass = '';
      return;
    }

    if (this.password !== this.rePass) {
      console.log('❌ [Register] Паролите не съвпадат');
      this.showError('Паролите не съвпадат', 'error');
      this.password = '';
      this.rePass = '';
      return;
    }

    console.log('📡 [Register] Изпращане на register заявка към Supabase...');
    
    this.supabaseService.register(this.email, this.password).subscribe({
      next: (response) => {
        console.log('📬 [Register] Получен отговор:', {
          hasUser: !!response.user,
          hasError: !!response.error,
          userEmail: response.user?.email,
          errorMessage: response.error?.message
        });
        
        if (response.error) {
          let errorMessage = 'Грешка при регистрация';
          if (response.error.message?.includes('already registered')) {
            errorMessage = 'Този имейл вече е регистриран';
            console.log('❌ [Register] Имейлът вече съществува:', this.email);
          } else if (response.error.message?.includes('password')) {
            errorMessage = 'Паролата не отговаря на изискванията';
            console.log('❌ [Register] Проблем с паролата');
          } else {
            console.log('❌ [Register] Друга грешка:', response.error.message);
          }
          this.showError(errorMessage, 'error');
          this.password = '';
          this.rePass = '';
          this.cdr.detectChanges();
        } else if (response.user) {
          console.log('✅ [Register] Регистрация успешна за:', response.user.email);
          this.showError('Профилът е успешно създаден!', 'success');
          this.cdr.detectChanges();
          
          // Изчакайте 2 секунди и пренасочете към login
          console.log('⏳ [Register] Изчакване 2 секунди преди пренасочване...');
          setTimeout(() => {
            console.log('🚀 [Register] Пренасочване към /login');
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          console.log('⚠️ [Register] Неочакван отговор - няма user и няма error');
          this.showError('Нещо се обърка, опитай пак', 'error');
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('💥 [Register] Грешка в observable-то:', err);
        this.showError(`Възникна грешка: ${err.message || err}`, 'error');
        this.cdr.detectChanges();
      },
    });
  }

  showError(message: string, type: 'error' | 'success' = 'error') {
    console.log('📢 [Register] Показване на съобщение:', message, type);
    this.errorModalMessage = message;
    this.showErrorModal = true;
    this.modalType = type;
    this.cdr.detectChanges();
    
    // Ако е success, автоматично затворете след 3 секунди
    if (type === 'success') {
      setTimeout(() => {
        if (this.showErrorModal) {
          this.closeErrorModal();
        }
      }, 3000);
    }
  }

  closeErrorModal() {
    console.log('🔇 [Register] Затваряне на modal');
    this.showErrorModal = false;
    this.errorModalMessage = '';
    this.cdr.detectChanges();
  }

  private isValidEmail(email: string): boolean {
    const atIndex = email.indexOf('@');
    const dotIndex = email.lastIndexOf('.');
    const isValid = atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < email.length - 1;
    console.log('🔍 [Register] Валидиране на имейл:', email, 'резултат:', isValid);
    return isValid;
  }
}