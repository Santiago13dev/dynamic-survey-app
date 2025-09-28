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
  isDarkMode: boolean;
  isMenuOpen = false;
  
  // Available theme modes
  themeModes: { value: ThemeMode; label: string; icon: string; description: string }[] = [
    {
      value: 'light',
      label: 'Claro',
      icon: 'light_mode',
      description: 'Tema claro para mejor visibilidad diurna'
    },
    {
      value: 'dark',
      label: 'Oscuro',
      icon: 'dark_mode',
      description: 'Tema oscuro para reducir fatiga visual'
    },
    {
      value: 'auto',
      label: 'Automático',
      icon: 'brightness_auto',
      description: 'Se adapta a las preferencias del sistema'
    }
  ];
  
  // Available density options
  densityOptions: { value: 'compact' | 'standard' | 'comfortable'; label: string; description: string }[] = [
    {
      value: 'compact',
      label: 'Compacto',
      description: 'Más contenido en menos espacio'
    },
    {
      value: 'standard',
      label: 'Estándar',
      description: 'Balance entre contenido y espaciado'
    },
    {
      value: 'comfortable',
      label: 'Cómodo',
      description: 'Más espaciado para mejor legibilidad'
    }
  ];

  constructor(private themeService: ThemeService) {
    this.currentTheme = this.themeService.currentTheme;
    this.isDarkMode = this.themeService.isDarkMode;
  }

  ngOnInit(): void {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
        this.isDarkMode = this.themeService.isDarkMode;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Toggle rápido entre claro y oscuro
   */
  quickToggle(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Cambia el modo del tema
   */
  setThemeMode(mode: ThemeMode): void {
    this.themeService.setThemeMode(mode);
  }

  /**
   * Cambia el color primario
   */
  setPrimaryColor(color: string): void {
    this.themeService.setPrimaryColor(color);
  }

  /**
   * Cambia la densidad de la interfaz
   */
  setDensity(density: 'compact' | 'standard' | 'comfortable'): void {
    this.themeService.updateCustomizations({ density });
  }

  /**
   * Resetea el tema a los valores por defecto
   */
  resetTheme(): void {
    this.themeService.resetTheme();
  }

  /**
   * Obtiene el icono actual del tema
   */
  getCurrentThemeIcon(): string {
    const mode = this.currentTheme.mode;
    if (mode === 'auto') {
      return this.isDarkMode ? 'dark_mode' : 'light_mode';
    }
    return mode === 'dark' ? 'dark_mode' : 'light_mode';
  }

  /**
   * Obtiene la descripción del modo actual
   */
  getCurrentModeDescription(): string {
    const currentMode = this.themeModes.find(mode => mode.value === this.currentTheme.mode);
    return currentMode?.description || '';
  }

  /**
   * Obtiene los colores disponibles
   */
  getAvailableColors() {
    return this.themeService.getAvailableColors();
  }

  /**
   * Verifica si un color está seleccionado
   */
  isColorSelected(color: string): boolean {
    return this.currentTheme.primaryColor.toLowerCase() === color.toLowerCase();
  }

  /**
   * Verifica si un modo está seleccionado
   */
  isModeSelected(mode: ThemeMode): boolean {
    return this.currentTheme.mode === mode;
  }

  /**
   * Verifica si una densidad está seleccionada
   */
  isDensitySelected(density: string): boolean {
    return this.currentTheme.customizations.density === density;
  }

  /**
   * Exporta la configuración del tema
   */
  exportTheme(): void {
    const themeJson = this.themeService.exportTheme();
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'survey-app-theme.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Importa una configuración de tema
   */
  importTheme(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const themeJson = e.target?.result as string;
          const success = this.themeService.importTheme(themeJson);
          
          if (success) {
            // Show success message
            console.log('Tema importado exitosamente');
          } else {
            // Show error message
            console.error('Error al importar el tema: formato inválido');
          }
        } catch (error) {
          console.error('Error al leer el archivo:', error);
        }
      };
      
      reader.readAsText(file);
    }
    
    // Reset input
    input.value = '';
  }

  /**
   * Cierra el menú al hacer clic fuera
   */
  onMenuBackdropClick(): void {
    this.isMenuOpen = false;
  }

  /**
   * Previene el cierre del menú al hacer clic dentro
   */
  onMenuClick(event: Event): void {
    event.stopPropagation();
  }
}