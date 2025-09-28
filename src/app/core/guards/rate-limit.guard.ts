import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

/**
 * Guard para proteger contra ataques de fuerza bruta
 * implementando rate limiting por IP/usuario
 */
@Injectable({
  providedIn: 'root'
})
export class RateLimitGuard implements CanActivate {
  private readonly rateLimits = new Map<string, RateLimitEntry>();
  private readonly maxRequests = 100; // máximo requests por ventana
  private readonly windowMs = 15 * 60 * 1000; // ventana de 15 minutos
  private readonly cleanupInterval = 5 * 60 * 1000; // cleanup cada 5 minutos

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Limpiar entradas expiradas periódicamente
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const identifier = this.getClientIdentifier();
    const now = Date.now();
    
    const entry = this.rateLimits.get(identifier);
    
    if (!entry) {
      // Primera request de este cliente
      this.rateLimits.set(identifier, {
        count: 1,
        firstRequest: now,
        lastRequest: now
      });
      return true;
    }

    // Verificar si la ventana ha expirado
    if (now - entry.firstRequest > this.windowMs) {
      // Reset contador para nueva ventana
      this.rateLimits.set(identifier, {
        count: 1,
        firstRequest: now,
        lastRequest: now
      });
      return true;
    }

    // Incrementar contador
    entry.count++;
    entry.lastRequest = now;

    if (entry.count > this.maxRequests) {
      this.handleRateLimitExceeded(identifier);
      return false;
    }

    return true;
  }

  private getClientIdentifier(): string {
    // En un entorno real, usarías la IP del cliente
    // Por ahora usamos una combinación de factores del navegador
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const platform = navigator.platform;
    const screenRes = `${screen.width}x${screen.height}`;
    
    // Hash simple para crear un identificador único
    const identifier = `${userAgent}-${language}-${platform}-${screenRes}`;
    return btoa(identifier).slice(0, 16);
  }

  private handleRateLimitExceeded(identifier: string): void {
    console.warn(`Rate limit exceeded for client: ${identifier}`);
    
    this.snackBar.open(
      'Demasiadas solicitudes. Por favor, espera unos minutos antes de intentar nuevamente.',
      'Cerrar',
      {
        duration: 5000,
        panelClass: ['error-snackbar']
      }
    );

    // Opcional: redirigir a una página de error
    // this.router.navigate(['/rate-limit-exceeded']);
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredEntries: string[] = [];

    this.rateLimits.forEach((entry, identifier) => {
      if (now - entry.lastRequest > this.windowMs) {
        expiredEntries.push(identifier);
      }
    });

    expiredEntries.forEach(identifier => {
      this.rateLimits.delete(identifier);
    });

    if (expiredEntries.length > 0) {
      console.log(`Cleaned up ${expiredEntries.length} expired rate limit entries`);
    }
  }

  /**
   * Obtiene información actual del rate limiting
   */
  getRateLimitInfo(): { totalClients: number; activeWindows: number } {
    const now = Date.now();
    let activeWindows = 0;

    this.rateLimits.forEach(entry => {
      if (now - entry.firstRequest <= this.windowMs) {
        activeWindows++;
      }
    });

    return {
      totalClients: this.rateLimits.size,
      activeWindows
    };
  }

  /**
   * Resetea el rate limit para un cliente específico (solo para testing/admin)
   */
  resetRateLimit(identifier?: string): void {
    if (identifier) {
      this.rateLimits.delete(identifier);
    } else {
      // Reset para el cliente actual
      const currentIdentifier = this.getClientIdentifier();
      this.rateLimits.delete(currentIdentifier);
    }
  }
}