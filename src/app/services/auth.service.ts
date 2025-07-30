import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * A very simple authentication service that stores a logged‑in user in memory.
 * In a real application you would integrate with a backend API and exchange a JWT.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<string | null>;
  public currentUser$: Observable<string | null>;

  constructor() {
    const stored = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<string | null>(stored);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Attempt to log in with the provided credentials. For demonstration
   * purposes this simply checks for a hard‑coded username/password pair.
   * @param username The user name
   * @param password The password
   * @returns true if the login succeeded
   */
  login(username: string, password: string): boolean {
    // In a real app you'd call your backend API here. We accept any non‑empty
    // credentials and store the username as the logged‑in user.
    if (username && password) {
      // Persist to localStorage so the session is remembered across reloads
      localStorage.setItem('currentUser', username);
      this.currentUserSubject.next(username);
      return true;
    }
    return false;
  }

  /**
   * Log out the current user and clear the session.
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * Return the current user synchronously.
   */
  get currentUser(): string | null {
    return this.currentUserSubject.value;
  }

  /**
   * Whether a user is currently authenticated.
   */
  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
}