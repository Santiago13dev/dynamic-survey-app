export interface Question {
  id: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'rating' | 'yes-no';
  text: string;
  options?: string[];
  required: boolean;
  order: number;
}

export interface SurveyAnswer {
  questionId: string;
  answer: string | string[] | number;
}

export interface Survey {
  id: string;
  titulo: string;
  descripcion?: string;
  categoria: string;
  duracionEstimada: number;
  esAnonima: boolean;
  permiteMultiplesRespuestas: boolean;
  preguntas: Question[];
  status: 'active' | 'draft' | 'archived';
  fechaCreacion: Date;
  respuestas: number;
  completadas: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respuestas: SurveyAnswer[];
  completada: boolean;
  fechaRespuesta: Date;
}

export interface SurveyStats {
  totalResponses: number;
  completedResponses: number;
  averageTime: number;
  completionRate: number;
}

export interface AnalyticsData {
  totalSurveys: number;
  totalResponses: number;
  averageCompletion: number;
  popularCategories: { name: string; count: number }[];
  responsesTrend: { date: string; responses: number }[];
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  responseRate: number;
  averageRating?: number;
  topAnswers: { answer: string; count: number; percentage: number }[];
}

export interface UserEngagement {
  newUsers: number;
  returningUsers: number;
  averageTimeSpent: number;
  bounceRate: number;
}

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  includeQuestions: boolean;
  includeResponses: boolean;
  includeStats: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}