import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/environment';
import { BehaviorSubject, catchError, from, map, Observable, of } from 'rxjs';
import { User as AppUser } from '../../shared/models/user.model';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  private currentUsrSubject = new BehaviorSubject<AppUser | null>(null);
  public currentUsr$ = this.currentUsrSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    this.supabase.auth.onAuthStateChange((_event, session) => {
      const appUser = this.toAppUser(session?.user);
      this.currentUsrSubject.next(appUser);
    });
  }

  private toAppUser(user: SupabaseUser | null | undefined): AppUser | null {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email ?? '',
      created_at: user.created_at ?? '',
    };
  }

  registration(
    email: string,
    password: string,
    confirmPassword: string,
  ): Observable<{ user: AppUser | null; error?: any }> {
    if (password !== confirmPassword) {
      return of({ user: null, error: { message: 'Passwords not match!' } });
    }

    const promise = this.supabase.auth.signUp({ email, password });

    return from(promise).pipe(
      map(({ data, error }) => {
        if (error) {
          return { user: null, error };
        }
        const appUser = this.toAppUser(data.user);
        return { user: appUser, error: null };
      }),
      catchError((err) => {
        return of({ user: null, error: err });
      }),
    );
  }

  login(email: string, password: string): Observable<{ user: AppUser | null; error?: any }> {
    const promise = this.supabase.auth.signInWithPassword({ email, password });

    return from(promise).pipe(
      map(({ data, error }) => {
        if (error) {
          return { user: null, error };
        }
        const appUser = this.toAppUser(data.user);
        return { user: appUser, error: null };
      }),
      catchError((err) => {
        return of({ user: null, error: err });
      }),
    );
  }

  logout(): Observable<void> {
    const promise = this.supabase.auth.signOut();

    return from(promise).pipe(
      map(() => undefined),
      catchError(() => of(undefined)),
    );
  }

  getCurrentUser(): Observable<AppUser | null> {
    const promise = this.supabase.auth.getUser();

    return from(promise).pipe(map(({ data }) => this.toAppUser(data.user)));
  }

  // supabaseAuth.service.ts
  getCurrentUserValue(): AppUser | null {
    return this.currentUsrSubject.getValue();
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }
}
