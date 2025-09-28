import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { SurveyService } from '../../services/survey.service';
import { Survey, SurveyResponse, Question, AnalyticsData, QuestionAnalytics, UserEngagement } from '../../models/survey.model';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

interface TrendData {
  period: string;
  responses: number;
  completions: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly analytics$ = combineLatest([
    this.surveyService.surveys$,
    this.surveyService.responses$
  ]).pipe(
    map(([surveys, responses]) => this.calculateAnalytics(surveys, responses)),
    shareReplay(1)
  );

  constructor(private surveyService: SurveyService) {}

  getAnalyticsData(): Observable<AnalyticsData> {
    return this.analytics$;
  }

  getSurveyAnalytics(surveyId: string): Observable<QuestionAnalytics[]> {
    return combineLatest([
      this.surveyService.getSurvey(surveyId),
      this.surveyService.getResponsesForSurvey(surveyId)
    ]).pipe(
      map(([survey, responses]) => {
        if (!survey) return [];
        return this.calculateQuestionAnalytics(survey, responses);
      })
    );
  }

  getUserEngagementData(): Observable<UserEngagement> {
    return this.surveyService.responses$.pipe(
      map(responses => this.calculateUserEngagement(responses))
    );
  }

  getResponseTrends(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Observable<TrendData[]> {
    return this.surveyService.responses$.pipe(
      map(responses => this.calculateTrends(responses, period))
    );
  }

  getTopPerformingSurveys(limit: number = 5): Observable<Survey[]> {
    return this.surveyService.surveys$.pipe(
      map(surveys => 
        surveys
          .sort((a, b) => (b.completadas || 0) - (a.completadas || 0))
          .slice(0, limit)
      )
    );
  }

  getCategoryDistribution(): Observable<ChartData> {
    return this.surveyService.surveys$.pipe(
      map(surveys => {
        const categoryCount: { [key: string]: number } = {};
        
        surveys.forEach(survey => {
          const category = this.getCategoryLabel(survey.categoria);
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        return {
          labels: Object.keys(categoryCount),
          datasets: [{
            label: 'Encuestas por Categoría',
            data: Object.values(categoryCount),
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
            ]
          }]
        };
      })
    );
  }

  getCompletionRateChart(): Observable<ChartData> {
    return this.surveyService.surveys$.pipe(
      map(surveys => {
        const labels = surveys.map(s => s.titulo.substring(0, 20) + '...');
        const completionRates = surveys.map(s => {
          const rate = s.respuestas > 0 ? (s.completadas / s.respuestas) * 100 : 0;
          return Math.round(rate);
        });

        return {
          labels,
          datasets: [{
            label: 'Tasa de Completación (%)',
            data: completionRates,
            backgroundColor: '#36A2EB',
            borderColor: '#36A2EB',
            fill: false
          }]
        };
      })
    );
  }

  private calculateAnalytics(surveys: Survey[], responses: SurveyResponse[]): AnalyticsData {
    const totalSurveys = surveys.length;
    const totalResponses = responses.length;
    const completedResponses = responses.filter(r => r.completada).length;
    const averageCompletion = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;

    // Calculate popular categories
    const categoryCount: { [key: string]: number } = {};
    surveys.forEach(survey => {
      const category = this.getCategoryLabel(survey.categoria);
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const popularCategories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate responses trend (last 30 days)
    const responsesTrend = this.calculateResponsesTrend(responses);

    return {
      totalSurveys,
      totalResponses,
      averageCompletion: Math.round(averageCompletion),
      popularCategories,
      responsesTrend
    };
  }

  private calculateQuestionAnalytics(survey: Survey, responses: SurveyResponse[]): QuestionAnalytics[] {
    return survey.preguntas.map((question: Question) => {
      const questionResponses = responses
        .map(r => r.respuestas.find((resp: any) => resp.questionId === question.id))
        .filter(answer => answer !== undefined);

      const responseRate = responses.length > 0 ? (questionResponses.length / responses.length) * 100 : 0;

      // Calculate top answers
      const answerCounts: { [key: string]: number } = {};
      questionResponses.forEach(answer => {
        if (answer) {
          const answerStr = Array.isArray(answer.answer) 
            ? answer.answer.join(', ') 
            : String(answer.answer);
          answerCounts[answerStr] = (answerCounts[answerStr] || 0) + 1;
        }
      });

      const totalAnswers = Object.values(answerCounts).reduce((sum: number, count: number) => sum + count, 0);
      const topAnswers = Object.entries(answerCounts)
        .map(([answer, count]) => ({
          answer,
          count: count as number,
          percentage: totalAnswers > 0 ? ((count as number) / totalAnswers) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        questionId: question.id,
        questionText: question.text,
        responseRate: Math.round(responseRate),
        topAnswers
      };
    });
  }

  private calculateUserEngagement(responses: SurveyResponse[]): UserEngagement {
    // Mock implementation - in real app, would track user sessions
    const totalUsers = new Set(responses.map(r => r.id)).size;
    const userResponseCounts: { [userId: string]: number } = {};
    
    responses.forEach(response => {
      const userId = response.id; // Using response ID as mock user ID
      userResponseCounts[userId] = (userResponseCounts[userId] || 0) + 1;
    });

    const newUsers = Object.values(userResponseCounts).filter((count: number) => count === 1).length;
    const returningUsers = Object.values(userResponseCounts).filter((count: number) => count > 1).length;

    return {
      newUsers,
      returningUsers,
      averageTimeSpent: 4.5, // Mock data
      bounceRate: 15 // Mock data
    };
  }

  private calculateResponsesTrend(responses: SurveyResponse[]): { date: string; responses: number }[] {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => {
      const dayResponses = responses.filter(r => {
        const responseDate = new Date(r.fechaRespuesta).toISOString().split('T')[0];
        return responseDate === date;
      }).length;

      return {
        date,
        responses: dayResponses
      };
    });
  }

  private calculateTrends(responses: SurveyResponse[], period: 'daily' | 'weekly' | 'monthly'): TrendData[] {
    const groupedData: { [key: string]: { responses: number; completions: number } } = {};

    responses.forEach(response => {
      const date = new Date(response.fechaRespuesta);
      let periodKey: string;

      switch (period) {
        case 'daily':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const week = this.getWeekNumber(date);
          periodKey = `${date.getFullYear()}-W${week}`;
          break;
        case 'monthly':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          periodKey = date.toISOString().split('T')[0];
      }

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = { responses: 0, completions: 0 };
      }

      const data = groupedData[periodKey];
      data.responses += 1;
      if (response.completada) {
        data.completions += 1;
      }
    });

    return Object.entries(groupedData)
      .map(([period, data]) => ({
        period,
        responses: data.responses,
        completions: data.completions
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'customer-satisfaction': 'Satisfacción del Cliente',
      'employee-feedback': 'Feedback de Empleados',
      'market-research': 'Investigación de Mercado',
      'product-feedback': 'Feedback de Producto',
      'event-feedback': 'Feedback de Evento',
      'other': 'Otra'
    };
    return labels[category] || category;
  }

  // Export methods
  exportAnalyticsData(format: 'csv' | 'json' = 'csv'): Observable<string> {
    return this.analytics$.pipe(
      map(data => {
        if (format === 'json') {
          return JSON.stringify(data, null, 2);
        } else {
          // CSV format
          let csv = 'Metric,Value\n';
          csv += `Total Surveys,${data.totalSurveys}\n`;
          csv += `Total Responses,${data.totalResponses}\n`;
          csv += `Average Completion,${data.averageCompletion}%\n`;
          return csv;
        }
      })
    );
  }
}