import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
  customizations: {
    borderRadius: number;
    elevation: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'app-theme';
  private readonly defaultTheme: ThemeConfig = {
    mode: 'light',
    primaryColor: '#1976d2',
    accentColor: '#ff4081',
    customizations: {
      borderRadius: 8,
      elevation: 4
    }
  };

  private themeSubject = new BehaviorSubject<ThemeConfig>(this.loadTheme());
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = this.loadTheme();
    this.applyTheme(savedTheme);
  }

  private loadTheme(): ThemeConfig {
    try {
      const saved = localStorage.getItem(this.THEME_STORAGE_KEY);
      return saved ? { ...this.defaultTheme, ...JSON.parse(saved) } : this.defaultTheme;
    } catch (error) {
      console.error('Error loading theme:', error);
      return this.defaultTheme;
    }
  }

  private saveTheme(theme: ThemeConfig): void {
    try {
      localStorage.setItem(this.THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }

  getCurrentTheme(): ThemeConfig {
    return this.themeSubject.value;
  }

  setThemeMode(mode: ThemeMode): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme = { ...currentTheme, mode };
    this.updateTheme(newTheme);
  }

  setCustomColors(primaryColor: string, accentColor: string): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme = { ...currentTheme, primaryColor, accentColor };
    this.updateTheme(newTheme);
  }

  updateCustomizations(customizations: Partial<ThemeConfig['customizations']>): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme = {
      ...currentTheme,
      customizations: { ...currentTheme.customizations, ...customizations }
    };
    this.updateTheme(newTheme);
  }

  private updateTheme(theme: ThemeConfig): void {
    this.saveTheme(theme);
    this.applyTheme(theme);
    this.themeSubject.next(theme);
  }

  private applyTheme(theme: ThemeConfig): void {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('light-theme', 'dark-theme');
    
    // Apply new theme
    if (theme.mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    } else {
      body.classList.add(`${theme.mode}-theme`);
    }

    // Apply custom CSS properties
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);
    document.documentElement.style.setProperty('--border-radius', `${theme.customizations.borderRadius}px`);
    document.documentElement.style.setProperty('--elevation', theme.customizations.elevation.toString());
  }

  isDarkMode(): boolean {
    const theme = this.getCurrentTheme();
    if (theme.mode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme.mode === 'dark';
  }

  toggleTheme(): void {
    const currentMode = this.getCurrentTheme().mode;
    const newMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
    this.setThemeMode(newMode);
  }

  resetToDefault(): void {
    this.updateTheme(this.defaultTheme);
  }
}