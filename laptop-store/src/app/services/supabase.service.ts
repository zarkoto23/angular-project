import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // Следим за промени в auth state
    this.supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = this.toAppUser(session.user);
        this.currentUserSubject.next(user);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  private toAppUser(supabaseUser: SupabaseUser | null): User | null {
    if (!supabaseUser) return null;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      created_at: supabaseUser.created_at ?? '',
    };
  }

  login(email: string, password: string): Observable<{ user: User | null; error?: any }> {
  console.log('🔐 Login опит за:', email);
  
  const promise = this.supabase.auth.signInWithPassword({ email, password });
  
  return from(promise).pipe(
    map(({ data, error }) => {
      console.log('📡 Supabase отговор:', { data, error });
      
      if (error) {
        console.error('❌ Грешка при вход:', error.message);
        return { user: null, error: error };
      }
      
      const user = this.toAppUser(data.user);
      console.log('✅ Успешен вход:', user?.email);
      return { user, error: null };
    }),
    catchError((err) => {
      console.error('💥 CatchError:', err);
      return of({ user: null, error: err });
    })
  );
}

  logout(): Observable<void> {
    const promise = this.supabase.auth.signOut();
    return from(promise).pipe(
      map(() => {
        this.currentUserSubject.next(null);
      })
    );
  }

  // 👇 ТОЗИ МЕТОД ЛИПСВАШЕ - ДОБАВИ ГО
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.getValue();
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }
}