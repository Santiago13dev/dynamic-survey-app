import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface Question {
  id?: string;
  text: string;
  type: 'text' | 'radio' | 'checkbox' | 'scale';
  options?: string[];
  required?: boolean;
  scaleMin?: number;
  scaleMax?: number;
}

export interface Survey {
  id: string;
  titulo: string;
  descripcion?: string;
  categoria?: string;
  duracionEstimada?: number;
  esAnonima?: boolean;
  permiteMultiplesRespuestas?: boolean;
  preguntas: Question[];
  status?: 'active' | 'draft' | 'archived';
  fechaCreacion?: Date;
  respuestas?: number;
  completadas?: number;
  autor?: string;
  tags?: string[];
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respuestas: { questionId: string; answer: string | string[] | number }[];
  fechaRespuesta: Date;
  tiempoCompletado?: number;
  usuarioId?: string;
  ip?: string;
}

export interface SurveyStats {
  totalRespuestas: number;
  totalCompletadas: number;
  promedioTiempo: number;
  tasaComplecion: number;
  ultimaRespuesta?: Date;
  respuestasPorDia: { fecha: string; cantidad: number }[];
}

/**
 * Servicio mejorado para manejar encuestas con funcionalidades avanzadas
 * Incluye persistencia en localStorage, validaciones y estadísticas
 */
@Injectable({ providedIn: 'root' })
export class SurveyService {
  private surveysSubject = new BehaviorSubject<Survey[]>([]);
  private responsesSubject = new BehaviorSubject<SurveyResponse[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Observables públicos
  surveys$ = this.surveysSubject.asObservable();
  responses$ = this.responsesSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  // Claves para localStorage
  private readonly SURVEYS_KEY = 'dynamic-surveys';
  private readonly RESPONSES_KEY = 'dynamic-survey-responses';
  private readonly STATS_KEY = 'dynamic-survey-stats';

  constructor() {
    this.loadInitialData();
    this.createSampleDataIfEmpty();
  }

  /**
   * Carga datos iniciales desde localStorage
   */
  private loadInitialData(): void {
    try {
      const surveys = localStorage.getItem(this.SURVEYS_KEY);
      const responses = localStorage.getItem(this.RESPONSES_KEY);

      if (surveys) {
        const parsedSurveys = JSON.parse(surveys).map((survey: any) => ({
          ...survey,
          fechaCreacion: new Date(survey.fechaCreacion)
        }));
        this.surveysSubject.next(parsedSurveys);
      }

      if (responses) {
        const parsedResponses = JSON.parse(responses).map((response: any) => ({
          ...response,
          fechaRespuesta: new Date(response.fechaRespuesta)
        }));
        this.responsesSubject.next(parsedResponses);
      }
    } catch (error) {
      console.warn('Error cargando datos desde localStorage:', error);
    }
  }

  /**
   * Crea datos de ejemplo si no existen encuestas
   */
  private createSampleDataIfEmpty(): void {
    if (this.surveysSubject.value.length === 0) {
      const sampleSurveys: Survey[] = [
        {
          id: this.generateId(),
          titulo: 'Encuesta de Satisfacción del Cliente',
          descripcion: 'Ayúdanos a mejorar nuestros servicios con tu opinión',
          categoria: 'customer-satisfaction',
          duracionEstimada: 5,
          esAnonima: true,
          permiteMultiplesRespuestas: false,
          status: 'active',
          fechaCreacion: new Date(2024, 8, 15),
          respuestas: 23,
          completadas: 20,
          preguntas: [
            {
              id: this.generateId(),
              text: '¿Cómo calificarías nuestro servicio en general?',
              type: 'radio',
              required: true,
              options: ['Excelente', 'Muy bueno', 'Bueno', 'Regular', 'Malo']
            },
            {
              id: this.generateId(),
              text: '¿Qué aspectos podríamos mejorar?',
              type: 'checkbox',
              required: false,
              options: ['Atención al cliente', 'Tiempo de respuesta', 'Calidad del producto', 'Precios', 'Comunicación']
            },
            {
              id: this.generateId(),
              text: 'Compártenos tus comentarios adicionales',
              type: 'text',
              required: false
            }
          ]
        },
        {
          id: this.generateId(),
          titulo: 'Feedback de Producto Beta',
          descripcion: 'Tu opinión sobre nuestro nuevo producto en desarrollo',
          categoria: 'product-feedback',
          duracionEstimada: 8,
          esAnonima: false,
          permiteMultiplesRespuestas: true,
          status: 'active',
          fechaCreacion: new Date(2024, 8, 20),
          respuestas: 15,
          completadas: 12,
          preguntas: [
            {
              id: this.generateId(),
              text: '¿Qué tan fácil te resultó usar el producto?',
              type: 'radio',
              required: true,
              options: ['Muy fácil', 'Fácil', 'Neutro', 'Difícil', 'Muy difícil']
            },
            {
              id: this.generateId(),
              text: 'Describe tu experiencia general',
              type: 'text',
              required: true
            }
          ]
        },
        {
          id: this.generateId(),
          titulo: 'Encuesta de Empleados Q3',
          descripcion: 'Evaluación trimestral del ambiente laboral',
          categoria: 'employee-feedback',
          duracionEstimada: 10,
          esAnonima: true,
          permiteMultiplesRespuestas: false,
          status: 'draft',
          fechaCreacion: new Date(2024, 8, 25),
          respuestas: 0,
          completadas: 0,
          preguntas: [
            {
              id: this.generateId(),
              text: '¿Te sientes satisfecho con tu trabajo actual?',
              type: 'radio',
              required: true,
              options: ['Muy satisfecho', 'Satisfecho', 'Neutro', 'Insatisfecho', 'Muy insatisfecho']
            }
          ]
        }
      ];

      this.surveysSubject.next(sampleSurveys);
      this.persistSurveys();
    }
  }

  /**
   * Obtiene todas las encuestas
   */
  getSurveys(): Observable<Survey[]> {
    return this.surveys$;
  }

  /**
   * Obtiene una encuesta por ID
   */
  getSurvey(id: string): Observable<Survey | undefined> {
    return this.surveys$.pipe(
      map(surveys => surveys.find(survey => survey.id === id))
    );
  }

  /**
   * Añade una nueva encuesta
   */
  addSurvey(surveyData: Omit<Survey, 'id' | 'fechaCreacion'>): Observable<Survey> {
    this.loadingSubject.next(true);

    return of(null).pipe(
      delay(500), // Simular delay de red
      map(() => {
        const newSurvey: Survey = {
          ...surveyData,
          id: this.generateId(),
          fechaCreacion: new Date(),
          respuestas: 0,
          completadas: 0,
          status: surveyData.status || 'active'
        };

        // Asignar IDs a las preguntas si no las tienen
        newSurvey.preguntas = newSurvey.preguntas.map(pregunta => ({
          ...pregunta,
          id: pregunta.id || this.generateId()
        }));

        const currentSurveys = this.surveysSubject.value;
        const updatedSurveys = [...currentSurveys, newSurvey];
        
        this.surveysSubject.next(updatedSurveys);
        this.persistSurveys();
        this.loadingSubject.next(false);

        return newSurvey;
      })
    );
  }

  /**
   * Actualiza una encuesta existente
   */
  updateSurvey(updatedSurvey: Survey): Observable<Survey> {
    this.loadingSubject.next(true);

    return of(null).pipe(
      delay(300),
      map(() => {
        const currentSurveys = this.surveysSubject.value;
        const index = currentSurveys.findIndex(survey => survey.id === updatedSurvey.id);
        
        if (index === -1) {
          throw new Error('Encuesta no encontrada');
        }

        const updatedSurveys = [...currentSurveys];
        updatedSurveys[index] = { ...updatedSurvey };
        
        this.surveysSubject.next(updatedSurveys);
        this.persistSurveys();
        this.loadingSubject.next(false);

        return updatedSurvey;
      })
    );
  }

  /**
   * Elimina una encuesta
   */
  deleteSurvey(surveyId: string): Observable<boolean> {
    this.loadingSubject.next(true);

    return of(null).pipe(
      delay(300),
      map(() => {
        const currentSurveys = this.surveysSubject.value;
        const updatedSurveys = currentSurveys.filter(survey => survey.id !== surveyId);
        
        // También eliminar respuestas asociadas
        const currentResponses = this.responsesSubject.value;
        const updatedResponses = currentResponses.filter(response => response.surveyId !== surveyId);
        
        this.surveysSubject.next(updatedSurveys);
        this.responsesSubject.next(updatedResponses);
        this.persistSurveys();
        this.persistResponses();
        this.loadingSubject.next(false);

        return true;
      })
    );
  }

  /**
   * Guarda un borrador de encuesta
   */
  saveDraft(draftData: any): Observable<Survey> {
    return this.addSurvey({
      ...draftData,
      status: 'draft'
    });
  }

  /**
   * Añade una respuesta a una encuesta
   */
  addResponse(response: Omit<SurveyResponse, 'id' | 'fechaRespuesta'>): Observable<SurveyResponse> {
    this.loadingSubject.next(true);

    return of(null).pipe(
      delay(200),
      map(() => {
        const newResponse: SurveyResponse = {
          ...response,
          id: this.generateId(),
          fechaRespuesta: new Date()
        };

        const currentResponses = this.responsesSubject.value;
        const updatedResponses = [...currentResponses, newResponse];
        
        this.responsesSubject.next(updatedResponses);
        this.persistResponses();

        // Actualizar estadísticas de la encuesta
        this.updateSurveyStats(response.surveyId);
        this.loadingSubject.next(false);

        return newResponse;
      })
    );
  }

  /**
   * Obtiene respuestas de una encuesta específica
   */
  getResponsesForSurvey(surveyId: string): Observable<SurveyResponse[]> {
    return this.responses$.pipe(
      map(responses => responses.filter(response => response.surveyId === surveyId))
    );
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Persiste encuestas en localStorage
   */
  private persistSurveys(): void {
    try {
      localStorage.setItem(this.SURVEYS_KEY, JSON.stringify(this.surveysSubject.value));
    } catch (error) {
      console.error('Error guardando encuestas:', error);
    }
  }

  /**
   * Persiste respuestas en localStorage
   */
  private persistResponses(): void {
    try {
      localStorage.setItem(this.RESPONSES_KEY, JSON.stringify(this.responsesSubject.value));
    } catch (error) {
      console.error('Error guardando respuestas:', error);
    }
  }

  /**
   * Actualiza las estadísticas de una encuesta
   */
  private updateSurveyStats(surveyId: string): void {
    const currentSurveys = this.surveysSubject.value;
    const surveyIndex = currentSurveys.findIndex(s => s.id === surveyId);
    
    if (surveyIndex !== -1) {
      const responses = this.responsesSubject.value.filter(r => r.surveyId === surveyId);
      const completedResponses = responses.filter(r => r.tiempoCompletado !== undefined);
      
      const updatedSurveys = [...currentSurveys];
      updatedSurveys[surveyIndex] = {
        ...updatedSurveys[surveyIndex],
        respuestas: responses.length,
        completadas: completedResponses.length
      };
      
      this.surveysSubject.next(updatedSurveys);
      this.persistSurveys();
    }
  }
}