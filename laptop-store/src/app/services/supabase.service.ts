// services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isInitialized = new BehaviorSubject<boolean>(false);
  public isInitialized$ = this.isInitialized.asObservable();

  constructor() {
    console.log('🚀 [SupabaseService] Инициализация на SupabaseService');
    console.log('🚀 [SupabaseService] Supabase URL:', environment.supabaseUrl);
    
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // Проверка за съществуваща сесия при стартиране
    console.log('🔍 [SupabaseService] Проверка за съществуваща сесия...');
    this.supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ [SupabaseService] Грешка при проверка на сесия:', error);
      }
      
      console.log('📋 [SupabaseService] Намерена сесия:', session?.user?.email || 'Няма сесия');
      
      if (session?.user) {
        const user = this.toAppUser(session.user);
        console.log('👤 [SupabaseService] Потребител зареден от съществуваща сесия:', {
          id: user?.id,
          email: user?.email,
          created_at: user?.created_at
        });
        this.currentUserSubject.next(user);
      } else {
        console.log('👤 [SupabaseService] Няма активна сесия');
        this.currentUserSubject.next(null);
      }
      
      this.isInitialized.next(true);
      console.log('✅ [SupabaseService] Инициализацията завърши');
    });

    // Слушане за промени в auth state
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log(`🔄 [SupabaseService] Auth state променен - Event: ${event}`);
      console.log('🔄 [SupabaseService] Session user:', session?.user?.email || 'Няма потребител');
      
      if (session?.user) {
        const user = this.toAppUser(session.user);
        console.log('👤 [SupabaseService] Потребител обновен:', {
          id: user?.id,
          email: user?.email,
          event: event
        });
        this.currentUserSubject.next(user);
      } else {
        console.log('👤 [SupabaseService] Потребител излязъл (null)');
        this.currentUserSubject.next(null);
      }
    });
  }

  private toAppUser(supabaseUser: SupabaseUser | null): User | null {
    if (!supabaseUser) {
      console.log('⚠️ [SupabaseService] toAppUser получи null');
      return null;
    }
    
    const appUser = {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      created_at: supabaseUser.created_at ?? '',
    };
    
    console.log('🔄 [SupabaseService] Конвертиране на Supabase user към App user:', {
      from: supabaseUser.email,
      to: appUser.email
    });
    
    return appUser;
  }

  login(email: string, password: string): Observable<{ user: User | null; error?: any }> {
    console.log('🔐 [SupabaseService] Опит за login с email:', email);
    
    const promise = this.supabase.auth.signInWithPassword({ email, password });

    return from(promise).pipe(
      tap(({ data, error }) => {
        if (error) {
          console.error('❌ [SupabaseService] Login грешка:', {
            email: email,
            error: error.message,
            status: error.status
          });
        } else {
          console.log('✅ [SupabaseService] Login успешен за:', data.user?.email);
        }
      }),
      map(({ data, error }) => {
        if (error) {
          return { user: null, error: error };
        }

        const user = this.toAppUser(data.user);
        console.log('👤 [SupabaseService] Login - потребител след конвертиране:', user?.email);
        return { user, error: null };
      }),
      catchError((err) => {
        console.error('💥 [SupabaseService] Login exception:', err);
        return of({ user: null, error: err });
      }),
    );
  }

  register(email: string, password: string): Observable<{ user: User | null; error?: any }> {
    console.log('📝 [SupabaseService] Опит за регистрация с email:', email);
    
    const promise = this.supabase.auth.signUp({
      email,
      password,
    });

    return from(promise).pipe(
      tap(({ data, error }) => {
        if (error) {
          console.error('❌ [SupabaseService] Регистрация грешка:', {
            email: email,
            error: error.message
          });
        } else {
          console.log('✅ [SupabaseService] Регистрация успешна за:', data.user?.email);
        }
      }),
      map(({ data, error }) => {
        if (error) {
          return { user: null, error: error };
        }

        const user = this.toAppUser(data.user);
        console.log('👤 [SupabaseService] Регистрация - потребител след конвертиране:', user?.email);
        return { user, error: null };
      }),
      catchError((err) => {
        console.error('💥 [SupabaseService] Register exception:', err);
        return of({ user: null, error: err });
      }),
    );
  }

// services/supabase.service.ts
// services/supabase.service.ts
logout(): Observable<void> {
  console.log('🚪 [SupabaseService] Опит за logout');
  
  const promise = this.supabase.auth.signOut();
  return from(promise).pipe(
    map(() => {
      console.log('✅ [SupabaseService] Logout успешен');
      this.currentUserSubject.next(null);
      return void 0;
    }),
    catchError((err) => {
      console.error('❌ [SupabaseService] Logout грешка:', err);
      return of(void 0);
    })
  );
}
  getCurrentUserValue(): User | null {
    const currentValue = this.currentUserSubject.getValue();
    console.log('🔍 [SupabaseService] getCurrentUserValue() върна:', currentValue?.email || 'null');
    return currentValue;
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }
  
  // Помощен метод за дебъгване - показва текущото състояние
  debugState(): void {
    console.log('🐛 [SupabaseService] DEBUG STATE ==================');
    console.log('🐛 Текущ потребител:', this.currentUserSubject.getValue()?.email || 'null');
    console.log('🐛 Инициализиран:', this.isInitialized.getValue());
    console.log('🐛 Subscribers:', this.currentUserSubject.observed);
    console.log('🐛 ===========================================');
  }
}