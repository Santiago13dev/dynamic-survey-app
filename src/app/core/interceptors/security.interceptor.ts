import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class SecurityInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Clone the request to add security headers
    const secureRequest = request.clone({
      setHeaders: this.getSecurityHeaders(request.url)
    });

    return next.handle(secureRequest);
  }

  private getSecurityHeaders(url: string): { [name: string]: string } {
    const headers: { [name: string]: string } = {};

    // Add Content Security Policy
    headers['Content-Security-Policy'] = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https:",
      "connect-src 'self'"
    ].join('; ');

    // Add X-Frame-Options to prevent clickjacking
    headers['X-Frame-Options'] = 'DENY';

    // Add X-Content-Type-Options to prevent MIME type sniffing
    headers['X-Content-Type-Options'] = 'nosniff';

    // Add Referrer Policy
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

    // Add Permissions Policy
    headers['Permissions-Policy'] = [
      'camera=()',
      'microphone=()',
      'geolocation=()'
    ].join(', ');

    // Add API key for internal API calls
    if (this.isInternalApiCall(url)) {
      headers['X-API-Key'] = environment.apiUrl || '';
      headers['Authorization'] = this.getAuthToken();
    }

    // Add CSRF protection for state-changing operations
    if (this.isStateChangingOperation(request.method)) {
      headers['X-CSRF-Token'] = this.getCSRFToken();
    }

    return headers;
  }

  private isInternalApiCall(url: string): boolean {
    const apiUrl = environment.apiUrl;
    if (!apiUrl) return false;
    
    return url.startsWith('/api') ||
           (typeof apiUrl === 'string' && url.startsWith(apiUrl));
  }

  private isStateChangingOperation(method: string): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  }

  private getAuthToken(): string {
    // Get token from localStorage or sessionStorage
    return localStorage.getItem('authToken') || '';
  }

  private getCSRFToken(): string {
    // Generate or retrieve CSRF token
    let token = sessionStorage.getItem('csrfToken');
    if (!token) {
      token = this.generateCSRFToken();
      sessionStorage.setItem('csrfToken', token);
    }
    return token;
  }

  private generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}