import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';
import { SurveyService, Survey, SurveyResponse } from '../../services/survey.service';

export interface AnalyticsData {
  totalSurveys: number;
  totalResponses: number;
  averageCompletionRate: number;
  averageResponseTime: number;
  activeUsers: number;
  trendsData: TrendData[];
  topPerformingSurveys: SurveyPerformance[];
  responsesByDay: ResponsesByDay[];
  completionRateByCategory: CategoryStats[];
  userEngagementMetrics: EngagementMetrics;
}

export interface TrendData {
  date: string;
  responses: number;
  completions: number;
  newSurveys: number;
}

export interface SurveyPerformance {
  surveyId: string;
  title: string;
  responses: number;
  completionRate: number;
  averageTime: number;
  satisfaction: number;
}

export interface ResponsesByDay {
  date: string;
  count: number;
  completed: number;
}

export interface CategoryStats {
  category: string;
  surveyCount: number;
  responseCount: number;
  completionRate: number;
}

export interface EngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  returnUserRate: number;
}

export interface SurveyDetailedAnalytics {
  surveyInfo: Survey;
  responseCount: number;
  completionRate: number;
  averageTime: number;
  questionAnalytics: QuestionAnalytics[];
  demographicsBreakdown: DemographicsBreakdown;
  responseTimeline: ResponseTimeline[];
  dropoffPoints: DropoffPoint[];
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  questionType: string;
  responseCount: number;
  skipRate: number;
  averageTime: number;
  responses: QuestionResponse[];
}

export interface QuestionResponse {
  answer: string;
  count: number;
  percentage: number;
}

export interface DemographicsBreakdown {
  ageGroups: { group: string; count: number; percentage: number }[];
  locations: { location: string; count: number; percentage: number }[];
  devices: { device: string; count: number; percentage: number }[];
}

export interface ResponseTimeline {
  date: string;
  responses: number;
  completions: number;
  hour?: number;
}

export interface DropoffPoint {
  questionIndex: number;
  questionText: string;
  dropoffRate: number;
  usersDropped: number;
}

/**
 * Servicio avanzado de análisis y métricas para encuestas
 * Proporciona datos procesados y visualizaciones para el dashboard
 */
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private refreshSubject = new BehaviorSubject<void>(undefined);
  private selectedDateRange = new BehaviorSubject<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });

  constructor(private surveyService: SurveyService) {}

  /**
   * Obtiene datos generales de analytics
   */
  getAnalyticsData(): Observable<AnalyticsData> {
    return combineLatest([
      this.surveyService.getSurveys(),
      this.surveyService.responses$,
      this.selectedDateRange.asObservable(),
      this.refreshSubject.asObservable()
    ]).pipe(
      map(([surveys, responses, dateRange]) => {
        const filteredResponses = this.filterResponsesByDateRange(responses, dateRange);
        
        return {
          totalSurveys: surveys.length,
          totalResponses: filteredResponses.length,
          averageCompletionRate: this.calculateAverageCompletionRate(surveys, filteredResponses),
          averageResponseTime: this.calculateAverageResponseTime(filteredResponses),
          activeUsers: this.calculateActiveUsers(filteredResponses),
          trendsData: this.generateTrendsData(surveys, filteredResponses, dateRange),
          topPerformingSurveys: this.getTopPerformingSurveys(surveys, responses),
          responsesByDay: this.getResponsesByDay(filteredResponses),
          completionRateByCategory: this.getCompletionRateByCategory(surveys, responses),
          userEngagementMetrics: this.calculateEngagementMetrics(filteredResponses)
        };
      }),
      shareReplay(1)
    );
  }

  /**
   * Obtiene análisis detallado de una encuesta específica
   */
  getSurveyDetailedAnalytics(surveyId: string): Observable<SurveyDetailedAnalytics> {
    return combineLatest([
      this.surveyService.getSurvey(surveyId),
      this.surveyService.getResponsesForSurvey(surveyId)
    ]).pipe(
      map(([survey, responses]) => {
        if (!survey) {
          throw new Error('Survey not found');
        }

        return {
          surveyInfo: survey,
          responseCount: responses.length,
          completionRate: this.calculateCompletionRate(responses),
          averageTime: this.calculateAverageResponseTime(responses),
          questionAnalytics: this.analyzeQuestions(survey, responses),
          demographicsBreakdown: this.analyzeDemographics(responses),
          responseTimeline: this.generateResponseTimeline(responses),
          dropoffPoints: this.calculateDropoffPoints(survey, responses)
        };
      })
    );
  }

  /**
   * Actualiza el rango de fechas para filtrar datos
   */
  setDateRange(start: Date, end: Date): void {
    this.selectedDateRange.next({ start, end });
  }

  /**
   * Fuerza una actualización de los datos
   */
  refreshData(): void {
    this.refreshSubject.next();
  }

  // Métodos privados para cálculos

  private filterResponsesByDateRange(responses: SurveyResponse[], dateRange: { start: Date; end: Date }): SurveyResponse[] {
    return responses.filter(response => 
      response.fechaRespuesta >= dateRange.start && 
      response.fechaRespuesta <= dateRange.end
    );
  }

  private calculateAverageCompletionRate(surveys: Survey[], responses: SurveyResponse[]): number {
    if (surveys.length === 0) return 0;
    
    const completionRates = surveys.map(survey => {
      const surveyResponses = responses.filter(r => r.surveyId === survey.id);
      return this.calculateCompletionRate(surveyResponses);
    });
    
    return completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
  }

  private calculateCompletionRate(responses: SurveyResponse[]): number {
    if (responses.length === 0) return 0;
    const completed = responses.filter(r => r.tiempoCompletado !== undefined).length;
    return (completed / responses.length) * 100;
  }

  private calculateAverageResponseTime(responses: SurveyResponse[]): number {
    const completedResponses = responses.filter(r => r.tiempoCompletado !== undefined);
    if (completedResponses.length === 0) return 0;
    
    const totalTime = completedResponses.reduce((sum, r) => sum + (r.tiempoCompletado || 0), 0);
    return Math.round(totalTime / completedResponses.length);
  }

  private calculateActiveUsers(responses: SurveyResponse[]): number {
    const uniqueUsers = new Set(responses.map(r => r.usuarioId || r.ip || 'anonymous'));
    return uniqueUsers.size;
  }

  private generateTrendsData(surveys: Survey[], responses: SurveyResponse[], dateRange: { start: Date; end: Date }): TrendData[] {
    const days: TrendData[] = [];
    const currentDate = new Date(dateRange.start);
    
    while (currentDate <= dateRange.end) {
      const dayResponses = responses.filter(r => 
        r.fechaRespuesta.toDateString() === currentDate.toDateString()
      );
      
      const dayCompletions = dayResponses.filter(r => r.tiempoCompletado !== undefined);
      
      const daySurveys = surveys.filter(s => 
        s.fechaCreacion && s.fechaCreacion.toDateString() === currentDate.toDateString()
      );
      
      days.push({
        date: currentDate.toISOString().split('T')[0],
        responses: dayResponses.length,
        completions: dayCompletions.length,
        newSurveys: daySurveys.length
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }

  private getTopPerformingSurveys(surveys: Survey[], responses: SurveyResponse[]): SurveyPerformance[] {
    return surveys
      .map(survey => {
        const surveyResponses = responses.filter(r => r.surveyId === survey.id);
        const completionRate = this.calculateCompletionRate(surveyResponses);
        const averageTime = this.calculateAverageResponseTime(surveyResponses);
        
        return {
          surveyId: survey.id,
          title: survey.titulo,
          responses: surveyResponses.length,
          completionRate,
          averageTime,
          satisfaction: this.calculateSatisfactionScore(surveyResponses)
        };
      })
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 10);
  }

  private calculateSatisfactionScore(responses: SurveyResponse[]): number {
    // Simplified satisfaction calculation
    return Math.random() * 40 + 60; // 60-100 range for demo
  }

  private getResponsesByDay(responses: SurveyResponse[]): ResponsesByDay[] {
    const grouped = responses.reduce((acc, response) => {
      const date = response.fechaRespuesta.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, completed: 0 };
      }
      acc[date].total++;
      if (response.tiempoCompletado !== undefined) {
        acc[date].completed++;
      }
      return acc;
    }, {} as { [key: string]: { total: number; completed: number } });

    return Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        count: data.total,
        completed: data.completed
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private getCompletionRateByCategory(surveys: Survey[], responses: SurveyResponse[]): CategoryStats[] {
    const categories = [...new Set(surveys.map(s => s.categoria).filter(Boolean))];
    
    return categories.map(category => {
      const categorySurveys = surveys.filter(s => s.categoria === category);
      const categoryResponses = responses.filter(r => 
        categorySurveys.some(s => s.id === r.surveyId)
      );
      
      return {
        category: category || 'Sin categoría',
        surveyCount: categorySurveys.length,
        responseCount: categoryResponses.length,
        completionRate: this.calculateCompletionRate(categoryResponses)
      };
    });
  }

  private calculateEngagementMetrics(responses: SurveyResponse[]): EngagementMetrics {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const dailyUsers = new Set(responses
      .filter(r => r.fechaRespuesta >= dayAgo)
      .map(r => r.usuarioId || r.ip)
    ).size;
    
    const weeklyUsers = new Set(responses
      .filter(r => r.fechaRespuesta >= weekAgo)
      .map(r => r.usuarioId || r.ip)
    ).size;
    
    const monthlyUsers = new Set(responses
      .filter(r => r.fechaRespuesta >= monthAgo)
      .map(r => r.usuarioId || r.ip)
    ).size;
    
    return {
      dailyActiveUsers: dailyUsers,
      weeklyActiveUsers: weeklyUsers,
      monthlyActiveUsers: monthlyUsers,
      averageSessionDuration: this.calculateAverageResponseTime(responses),
      bounceRate: this.calculateBounceRate(responses),
      returnUserRate: this.calculateReturnUserRate(responses)
    };
  }

  private calculateBounceRate(responses: SurveyResponse[]): number {
    const totalSessions = responses.length;
    const bouncedSessions = responses.filter(r => !r.tiempoCompletado).length;
    return totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;
  }

  private calculateReturnUserRate(responses: SurveyResponse[]): number {
    const userResponses = responses.reduce((acc, response) => {
      const userId = response.usuarioId || response.ip || 'anonymous';
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    const totalUsers = Object.keys(userResponses).length;
    const returnUsers = Object.values(userResponses).filter(count => count > 1).length;
    
    return totalUsers > 0 ? (returnUsers / totalUsers) * 100 : 0;
  }

  private analyzeQuestions(survey: Survey, responses: SurveyResponse[]): QuestionAnalytics[] {
    return survey.preguntas.map(question => {
      const questionResponses = responses.map(r => 
        r.respuestas.find(resp => resp.questionId === question.id)
      ).filter(Boolean);
      
      const answerCounts = questionResponses.reduce((acc, resp) => {
        const answer = String(resp?.answer || 'Sin respuesta');
        acc[answer] = (acc[answer] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      
      const totalResponses = questionResponses.length;
      
      return {
        questionId: question.id || '',
        questionText: question.text,
        questionType: question.type,
        responseCount: totalResponses,
        skipRate: responses.length > 0 ? ((responses.length - totalResponses) / responses.length) * 100 : 0,
        averageTime: Math.random() * 30 + 10, // Mock data
        responses: Object.entries(answerCounts).map(([answer, count]) => ({
          answer,
          count,
          percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0
        }))
      };
    });
  }

  private analyzeDemographics(responses: SurveyResponse[]): DemographicsBreakdown {
    // Mock demographic data for demonstration
    return {
      ageGroups: [
        { group: '18-24', count: Math.floor(responses.length * 0.2), percentage: 20 },
        { group: '25-34', count: Math.floor(responses.length * 0.35), percentage: 35 },
        { group: '35-44', count: Math.floor(responses.length * 0.25), percentage: 25 },
        { group: '45-54', count: Math.floor(responses.length * 0.15), percentage: 15 },
        { group: '55+', count: Math.floor(responses.length * 0.05), percentage: 5 }
      ],
      locations: [
        { location: 'Colombia', count: Math.floor(responses.length * 0.6), percentage: 60 },
        { location: 'México', count: Math.floor(responses.length * 0.2), percentage: 20 },
        { location: 'España', count: Math.floor(responses.length * 0.15), percentage: 15 },
        { location: 'Otros', count: Math.floor(responses.length * 0.05), percentage: 5 }
      ],
      devices: [
        { device: 'Móvil', count: Math.floor(responses.length * 0.65), percentage: 65 },
        { device: 'Desktop', count: Math.floor(responses.length * 0.25), percentage: 25 },
        { device: 'Tablet', count: Math.floor(responses.length * 0.1), percentage: 10 }
      ]
    };
  }

  private generateResponseTimeline(responses: SurveyResponse[]): ResponseTimeline[] {
    const timeline = responses.reduce((acc, response) => {
      const date = response.fechaRespuesta.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { responses: 0, completions: 0 };
      }
      acc[date].responses++;
      if (response.tiempoCompletado !== undefined) {
        acc[date].completions++;
      }
      return acc;
    }, {} as { [key: string]: { responses: number; completions: number } });

    return Object.entries(timeline)
      .map(([date, data]) => ({
        date,
        responses: data.responses,
        completions: data.completions
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateDropoffPoints(survey: Survey, responses: SurveyResponse[]): DropoffPoint[] {
    return survey.preguntas.map((question, index) => {
      const questionResponses = responses.filter(r => 
        r.respuestas.some(resp => resp.questionId === question.id)
      ).length;
      
      const totalStarted = responses.length;
      const dropoffRate = totalStarted > 0 ? ((totalStarted - questionResponses) / totalStarted) * 100 : 0;
      
      return {
        questionIndex: index,
        questionText: question.text,
        dropoffRate,
        usersDropped: totalStarted - questionResponses
      };
    });
  }
}