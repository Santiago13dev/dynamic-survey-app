import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { Survey, SurveyResponse, Question, SurveyStats } from '../models/survey.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private readonly STORAGE_KEY = 'surveys';
  private readonly RESPONSES_KEY = 'survey-responses';
  
  private surveysSubject = new BehaviorSubject<Survey[]>(this.loadSurveys());
  private responsesSubject = new BehaviorSubject<SurveyResponse[]>(this.loadResponses());
  
  surveys$ = this.surveysSubject.asObservable();
  responses$ = this.responsesSubject.asObservable();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData(): void {
    const surveys = this.loadSurveys();
    if (surveys.length === 0) {
      const defaultSurveys: Survey[] = [
        {
          id: '1',
          titulo: 'Satisfacción del Cliente',
          descripcion: 'Encuesta para medir la satisfacción de nuestros clientes',
          categoria: 'customer-satisfaction',
          duracionEstimada: 5,
          esAnonima: true,
          permiteMultiplesRespuestas: false,
          preguntas: [
            {
              id: '1',
              type: 'rating',
              text: '¿Qué tan satisfecho está con nuestro servicio?',
              required: true,
              order: 1
            },
            {
              id: '2',
              type: 'text',
              text: '¿Qué podríamos mejorar?',
              required: false,
              order: 2
            }
          ],
          status: 'active',
          fechaCreacion: new Date(),
          respuestas: 15,
          completadas: 12
        }
      ];
      this.saveSurveys(defaultSurveys);
      this.surveysSubject.next(defaultSurveys);
    }
  }

  private loadSurveys(): Survey[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading surveys:', error);
      return [];
    }
  }

  private loadResponses(): SurveyResponse[] {
    try {
      const data = localStorage.getItem(this.RESPONSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading responses:', error);
      return [];
    }
  }

  private saveSurveys(surveys: Survey[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(surveys));
    } catch (error) {
      console.error('Error saving surveys:', error);
    }
  }

  private saveResponses(responses: SurveyResponse[]): void {
    try {
      localStorage.setItem(this.RESPONSES_KEY, JSON.stringify(responses));
    } catch (error) {
      console.error('Error saving responses:', error);
    }
  }

  getSurveys(): Observable<Survey[]> {
    return this.surveys$;
  }

  getSurvey(id: string): Observable<Survey | undefined> {
    return this.surveys$.pipe(
      map(surveys => surveys.find(survey => survey.id === id))
    );
  }

  addSurvey(surveyData: Omit<Survey, 'id' | 'fechaCreacion'>): Observable<Survey> {
    const newSurvey: Survey = {
      ...surveyData,
      id: this.generateId(),
      fechaCreacion: new Date()
    };

    const currentSurveys = this.surveysSubject.value;
    const updatedSurveys = [...currentSurveys, newSurvey];
    
    this.saveSurveys(updatedSurveys);
    this.surveysSubject.next(updatedSurveys);
    
    return of(newSurvey);
  }

  updateSurvey(survey: Survey): Observable<Survey> {
    const currentSurveys = this.surveysSubject.value;
    const index = currentSurveys.findIndex(s => s.id === survey.id);
    
    if (index !== -1) {
      currentSurveys[index] = survey;
      this.saveSurveys(currentSurveys);
      this.surveysSubject.next([...currentSurveys]);
    }
    
    return of(survey);
  }

  deleteSurvey(id: string): Observable<boolean> {
    const currentSurveys = this.surveysSubject.value;
    const filteredSurveys = currentSurveys.filter(survey => survey.id !== id);
    
    this.saveSurveys(filteredSurveys);
    this.surveysSubject.next(filteredSurveys);
    
    return of(true);
  }

  addResponse(responseData: Omit<SurveyResponse, 'id' | 'fechaRespuesta'>): Observable<SurveyResponse> {
    const newResponse: SurveyResponse = {
      ...responseData,
      id: this.generateId(),
      fechaRespuesta: new Date()
    };

    const currentResponses = this.responsesSubject.value;
    const updatedResponses = [...currentResponses, newResponse];
    
    this.saveResponses(updatedResponses);
    this.responsesSubject.next(updatedResponses);
    
    // Update survey response count
    this.updateSurveyResponseCount(responseData.surveyId);
    
    return of(newResponse);
  }

  getResponsesForSurvey(surveyId: string): Observable<SurveyResponse[]> {
    return this.responses$.pipe(
      map(responses => responses.filter(response => response.surveyId === surveyId))
    );
  }

  getSurveyStats(surveyId: string): Observable<SurveyStats> {
    return this.getResponsesForSurvey(surveyId).pipe(
      map(responses => {
        const totalResponses = responses.length;
        const completedResponses = responses.filter(r => r.completada).length;
        const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;
        
        return {
          totalResponses,
          completedResponses,
          averageTime: 5, // Mock data
          completionRate
        };
      })
    );
  }

  private updateSurveyResponseCount(surveyId: string): void {
    const currentSurveys = this.surveysSubject.value;
    const surveyIndex = currentSurveys.findIndex(s => s.id === surveyId);
    
    if (surveyIndex !== -1) {
      currentSurveys[surveyIndex].respuestas += 1;
      this.saveSurveys(currentSurveys);
      this.surveysSubject.next([...currentSurveys]);
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Helper methods for filtering
  searchSurveys(term: string): Observable<Survey[]> {
    return this.surveys$.pipe(
      map(surveys => 
        surveys.filter(survey => 
          survey.titulo.toLowerCase().includes(term.toLowerCase()) ||
          (survey.descripcion && survey.descripcion.toLowerCase().includes(term.toLowerCase()))
        )
      )
    );
  }

  filterByStatus(status: string): Observable<Survey[]> {
    return this.surveys$.pipe(
      map(surveys => 
        status ? surveys.filter(survey => survey.status === status) : surveys
      )
    );
  }

  filterSurveys(searchTerm: string, status: string): Observable<Survey[]> {
    return this.surveys$.pipe(
      map(surveys => {
        let filtered = surveys;
        
        if (searchTerm) {
          filtered = filtered.filter(survey => 
            survey.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (survey.descripcion && survey.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        if (status) {
          filtered = filtered.filter(survey => survey.status === status);
        }
        
        return filtered;
      })
    );
  }
}