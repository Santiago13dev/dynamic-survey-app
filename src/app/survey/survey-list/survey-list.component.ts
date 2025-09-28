import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { SurveyService } from '../../services/survey.service';

export interface Survey {
  id: string;
  titulo: string;
  descripcion?: string;
  preguntas?: any[];
  respuestas?: number;
  completadas?: number;
  fechaCreacion?: Date;
  status?: 'active' | 'draft' | 'archived';
}

@Component({
  selector: 'app-survey-list',
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.scss']
})
export class SurveyListComponent implements OnInit, OnDestroy {
  surveys$: Observable<Survey[]>;
  filteredSurveys$: Observable<Survey[]>;
  
  // Form controls
  searchTerm = '';
  selectedStatus = '';
  viewMode: 'grid' | 'table' = 'grid';
  
  // Subjects for reactive programming
  private searchSubject = new BehaviorSubject<string>('');
  private statusSubject = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();
  
  // Table configuration
  displayedColumns: string[] = ['status', 'titulo', 'stats', 'fecha', 'acciones'];

  constructor(
    private surveyService: SurveyService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.surveys$ = this.surveyService.getSurveys();
    this.setupFilteredSurveys();
  }

  ngOnInit(): void {
    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe();

    // Load view mode preference
    const savedViewMode = localStorage.getItem('surveys-view-mode');
    if (savedViewMode === 'grid' || savedViewMode === 'table') {
      this.viewMode = savedViewMode;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup filtered surveys observable
   */
  private setupFilteredSurveys(): void {
    this.filteredSurveys$ = combineLatest([
      this.surveys$,
      this.searchSubject.asObservable(),
      this.statusSubject.asObservable()
    ]).pipe(
      map(([surveys, searchTerm, status]) => {
        let filtered = surveys;

        // Apply search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          filtered = filtered.filter(survey => 
            survey.titulo.toLowerCase().includes(term) ||
            (survey.descripcion && survey.descripcion.toLowerCase().includes(term))
          );
        }

        // Apply status filter
        if (status) {
          filtered = filtered.filter(survey => 
            (survey.status || 'active') === status
          );
        }

        return filtered;
      })
    );
  }

  /**
   * Handle search input
   */
  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  /**
   * Handle filter change
   */
  onFilterChange(): void {
    this.statusSubject.next(this.selectedStatus);
  }

  /**
   * Toggle between grid and table view
   */
  toggleView(): void {
    this.viewMode = this.viewMode === 'grid' ? 'table' : 'grid';
    localStorage.setItem('surveys-view-mode', this.viewMode);
  }

  /**
   * Track function for ngFor performance
   */
  trackBySurveyId(index: number, survey: Survey): string {
    return survey.id;
  }

  /**
   * Get status label for display
   */
  getStatusLabel(status?: string): string {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'draft':
        return 'Borrador';
      case 'archived':
        return 'Archivada';
      default:
        return 'Activa';
    }
  }

  /**
   * Duplicate survey
   */
  duplicateSurvey(survey: Survey): void {
    const duplicatedSurvey = {
      ...survey,
      id: this.generateId(),
      titulo: `${survey.titulo} (Copia)`,
      respuestas: 0,
      completadas: 0,
      fechaCreacion: new Date(),
      status: 'draft' as const
    };

    this.surveyService.addSurvey(duplicatedSurvey).subscribe({
      next: () => {
        this.showSuccessMessage('Encuesta duplicada exitosamente');
      },
      error: () => {
        this.showErrorMessage('Error al duplicar la encuesta');
      }
    });
  }

  /**
   * Archive/unarchive survey
   */
  archiveSurvey(survey: Survey): void {
    const newStatus = survey.status === 'archived' ? 'active' : 'archived';
    const action = newStatus === 'archived' ? 'archivada' : 'desarchivada';
    
    this.surveyService.updateSurvey({
      ...survey,
      status: newStatus
    }).subscribe({
      next: () => {
        this.showSuccessMessage(`Encuesta ${action} exitosamente`);
      },
      error: () => {
        this.showErrorMessage(`Error al ${action.slice(0, -1)}r la encuesta`);
      }
    });
  }

  /**
   * Delete survey with confirmation
   */
  deleteSurvey(survey: Survey): void {
    const confirmed = confirm(`¿Estás seguro de que deseas eliminar la encuesta "${survey.titulo}"?`);
    
    if (confirmed) {
      this.surveyService.deleteSurvey(survey.id).subscribe({
        next: () => {
          this.showSuccessMessage('Encuesta eliminada exitosamente');
        },
        error: () => {
          this.showErrorMessage('Error al eliminar la encuesta');
        }
      });
    }
  }

  /**
   * Generate unique ID for new surveys
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Show success message
   */
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Show error message
   */
  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}