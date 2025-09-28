import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interceptor de seguridad para añadir headers de protección
 * y validar requests salientes
 */
@Injectable()
export class SecurityInterceptor implements HttpInterceptor {
  private readonly securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Validar que la URL es segura
    if (!this.isUrlSafe(req.url)) {
      throw new Error('URL no permitida por razones de seguridad');
    }

    // Añadir headers de seguridad
    let secureReq = req;
    
    // Solo añadir headers si es una request a nuestra API
    if (this.isInternalApi(req.url)) {
      secureReq = req.clone({
        setHeaders: {
          ...this.securityHeaders,
          'Content-Security-Policy': this.getCSPHeader(),
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
    }

    // Sanitizar parámetros si es necesario
    if (req.method === 'POST' || req.method === 'PUT') {
      secureReq = this.sanitizeRequestBody(secureReq);
    }

    return next.handle(secureReq);
  }

  private isUrlSafe(url: string): boolean {
    // Lista de dominios permitidos
    const allowedDomains = [
      'localhost',
      '127.0.0.1',
      environment.apiUrl || '',
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ].filter(Boolean);

    // Si es una URL relativa, es segura
    if (!url.startsWith('http')) {
      return true;
    }

    try {
      const urlObj = new URL(url);
      return allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  }

  private isInternalApi(url: string): boolean {
    return url.startsWith('/api') || 
           (environment.apiUrl && url.startsWith(environment.apiUrl));
  }

  private getCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }

  private sanitizeRequestBody(req: HttpRequest<any>): HttpRequest<any> {
    if (!req.body || typeof req.body !== 'object') {
      return req;
    }

    const sanitizedBody = this.deepSanitize(req.body);
    return req.clone({ body: sanitizedBody });
  }

  private deepSanitize(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepSanitize(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.deepSanitize(value);
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    // Remover caracteres potencialmente peligrosos
    return str
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
}