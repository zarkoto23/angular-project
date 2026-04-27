import { Injectable } from '@angular/core';
import {
  AuthSession,
  createClient,
  SupabaseClient,
  User as SupabaseUser,
} from '@supabase/supabase-js';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    this.supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user = this.toAppUser(session.user);
        this.currentUserSubject.next(user);
      } else {
        this.currentUserSubject.next(null);
      }

      this.isInitialized.next(true);
    });

    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user = this.toAppUser(session.user);
        this.currentUserSubject.next(user);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  private toAppUser(supabaseUser: SupabaseUser | null): User | null {
    if (!supabaseUser) {
      return null;
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      created_at: supabaseUser.created_at ?? '',
    };
  }

  login(email: string, password: string): Observable<{ user: User | null; error?: any }> {
    const promise = this.supabase.auth.signInWithPassword({ email, password });

    return from(promise).pipe(
      map(({ data, error }) => {
        if (error) {
          return { user: null, error: error };
        }

        const user = this.toAppUser(data.user);
        return { user, error: null };
      }),
      catchError((err) => {
        return of({ user: null, error: err });
      }),
    );
  }

  register(email: string, password: string): Observable<{ user: User | null; error?: any }> {
    const promise = this.supabase.auth.signUp({
      email,
      password,
    });

    return from(promise).pipe(
      map(({ data, error }) => {
        if (error) {
          return { user: null, error: error };
        }

        const user = this.toAppUser(data.user);
        return { user, error: null };
      }),
      catchError((err) => {
        return of({ user: null, error: err });
      }),
    );
  }

  logout(): Observable<void> {
    const promise = this.supabase.auth.signOut();
    return from(promise).pipe(
      map(() => {
        this.currentUserSubject.next(null);
        return void 0;
      }),
      catchError((err) => {
        return of(void 0);
      }),
    );
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.getValue();
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }

  async getSession(): Promise<AuthSession | null> {
    const {
      data: { session },
      error,
    } = await this.supabase.auth.getSession();
    if (error) {
      return null;
    }
    return session;
  }
}
