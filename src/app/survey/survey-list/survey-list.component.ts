import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, takeUntil, debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { SurveyService } from '../../services/survey.service';
import { Survey } from '../../models/survey.model';

@Component({
  selector: 'app-survey-list',
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.scss']
})
export class SurveyListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  surveys$ = this.surveyService.getSurveys();
  filteredSurveys$!: Observable<Survey[]>;
  
  // Form controls for filters
  searchControl = new FormControl('');
  statusControl = new FormControl('');
  
  // UI state
  viewMode: 'grid' | 'table' = 'grid';
  selectedStatus = '';
  searchTerm = '';
  
  // Mock data for demonstration
  displayedColumns: string[] = ['titulo', 'status', 'respuestas', 'fechaCreacion', 'actions'];
  
  statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'active', label: 'Activas' },
    { value: 'draft', label: 'Borradores' },
    { value: 'archived', label: 'Archivadas' }
  ];

  constructor(
    private surveyService: SurveyService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilters(): void {
    // Create search observable with debounce
    const search$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    );

    // Create status filter observable
    const status$ = this.statusControl.valueChanges.pipe(
      startWith('')
    );

    // Combine filters with surveys data
    this.filteredSurveys$ = combineLatest([
      this.surveys$,
      search$,
      status$
    ]).pipe(
      map(([surveys, searchTerm, status]) => {
        let filtered = surveys;

        // Apply search filter
        if (searchTerm && searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          filtered = filtered.filter(survey => 
            survey.titulo.toLowerCase().includes(term) ||
            (survey.descripcion && survey.descripcion.toLowerCase().includes(term))
          );
        }

        // Apply status filter
        if (status) {
          filtered = filtered.filter(survey => survey.status === status);
        }

        return filtered;
      }),
      takeUntil(this.destroy$)
    );
  }

  // Event handlers
  onSearchChange(): void {
    this.searchControl.setValue(this.searchTerm);
  }

  onFilterChange(): void {
    this.statusControl.setValue(this.selectedStatus);
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'table' : 'grid';
  }

  // Navigation methods
  createSurvey(): void {
    this.router.navigate(['/survey/create']);
  }

  editSurvey(survey: Survey): void {
    this.router.navigate(['/survey/edit', survey.id]);
  }

  takeSurvey(survey: Survey): void {
    this.router.navigate(['/survey/take', survey.id]);
  }

  viewResults(survey: Survey): void {
    this.router.navigate(['/survey/results', survey.id]);
  }

  // Survey actions
  duplicateSurvey(survey: Survey): void {
    const duplicatedSurvey = {
      titulo: `${survey.titulo} (Copia)`,
      descripcion: survey.descripcion,
      categoria: survey.categoria,
      duracionEstimada: survey.duracionEstimada,
      esAnonima: survey.esAnonima,
      permiteMultiplesRespuestas: survey.permiteMultiplesRespuestas,
      preguntas: survey.preguntas,
      status: 'draft' as const,
      respuestas: 0,
      completadas: 0
    };

    this.surveyService.addSurvey(duplicatedSurvey).subscribe({
      next: () => {
        this.snackBar.open('Encuesta duplicada exitosamente', 'Cerrar', {
          duration: 3000
        });
      },
      error: (error) => {
        this.snackBar.open('Error al duplicar la encuesta', 'Cerrar', {
          duration: 3000
        });
        console.error('Error duplicating survey:', error);
      }
    });
  }

  changeStatus(survey: Survey, newStatus: 'active' | 'archived'): void {
    const updatedSurvey = { ...survey, status: newStatus };
    
    this.surveyService.updateSurvey(updatedSurvey).subscribe({
      next: () => {
        const statusText = newStatus === 'active' ? 'activada' : 'archivada';
        this.snackBar.open(`Encuesta ${statusText} exitosamente`, 'Cerrar', {
          duration: 3000
        });
      },
      error: (error) => {
        this.snackBar.open('Error al cambiar el estado', 'Cerrar', {
          duration: 3000
        });
        console.error('Error changing status:', error);
      }
    });
  }

  deleteSurvey(survey: Survey): void {
    if (confirm(`¿Estás seguro de que quieres eliminar la encuesta "${survey.titulo}"?`)) {
      this.surveyService.deleteSurvey(survey.id).subscribe({
        next: () => {
          this.snackBar.open('Encuesta eliminada exitosamente', 'Cerrar', {
            duration: 3000
          });
        },
        error: (error) => {
          this.snackBar.open('Error al eliminar la encuesta', 'Cerrar', {
            duration: 3000
          });
          console.error('Error deleting survey:', error);
        }
      });
    }
  }

  // Helper methods
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'draft': return 'status-draft';
      case 'archived': return 'status-archived';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Activa';
      case 'draft': return 'Borrador';
      case 'archived': return 'Archivada';
      default: return status;
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES');
  }

  trackByFn(index: number, item: Survey): string {
    return item.id;
  }
}