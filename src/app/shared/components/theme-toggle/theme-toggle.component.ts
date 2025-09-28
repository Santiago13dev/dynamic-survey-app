import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemeService, ThemeMode, ThemeConfig } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentTheme: ThemeConfig;
  isDarkMode = false;
  
  themeOptions = [
    { value: 'light' as ThemeMode, label: 'Claro', icon: 'light_mode' },
    { value: 'dark' as ThemeMode, label: 'Oscuro', icon: 'dark_mode' },
    { value: 'auto' as ThemeMode, label: 'Auto', icon: 'brightness_auto' }
  ];

  constructor(private themeService: ThemeService) {
    this.currentTheme = this.themeService.getCurrentTheme();
    this.isDarkMode = this.themeService.isDarkMode();
  }

  ngOnInit(): void {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme: ThemeConfig) => {
        this.currentTheme = theme;
        this.isDarkMode = this.themeService.isDarkMode();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  setThemeMode(mode: ThemeMode): void {
    this.themeService.setThemeMode(mode);
  }

  getCurrentIcon(): string {
    const option = this.themeOptions.find(opt => opt.value === this.currentTheme.mode);
    return option?.icon || 'brightness_auto';
  }

  getCurrentLabel(): string {
    const option = this.themeOptions.find(opt => opt.value === this.currentTheme.mode);
    return option?.label || 'Auto';
  }
}