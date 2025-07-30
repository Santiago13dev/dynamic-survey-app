import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Question {
  id: number;
  text: string;
  type: 'text' | 'radio';
  options?: string[];
}

export interface Survey {
  id: number;
  title: string;
  description?: string;
  questions: Question[];
}

export interface SurveyResponse {
  surveyId: number;
  answers: { questionId: number; answer: string | string[] }[];
}

/**
 * A simple in‑memory survey store. Surveys and responses are persisted to
 * localStorage so data survives page reloads. In a real application
 * surveys and responses would be loaded and stored on a backend server.
 */
@Injectable({ providedIn: 'root' })
export class SurveyService {
  private surveysSubject = new BehaviorSubject<Survey[]>([]);
  surveys$ = this.surveysSubject.asObservable();

  private responsesSubject = new BehaviorSubject<SurveyResponse[]>([]);
  responses$ = this.responsesSubject.asObservable();

  private surveyIdCounter = 0;
  private questionIdCounter = 0;

  constructor() {
    // Load from localStorage on startup
    const surveys = localStorage.getItem('surveys');
    const responses = localStorage.getItem('surveyResponses');
    if (surveys) {
      this.surveysSubject.next(JSON.parse(surveys));
      // compute next id based on highest existing id
      const maxId = JSON.parse(surveys).reduce((max: number, s: Survey) => Math.max(max, s.id), 0);
      this.surveyIdCounter = maxId;
      const maxQId = JSON.parse(surveys).reduce((max: number, s: Survey) => {
        const qmax = s.questions.reduce((mq, q) => Math.max(mq, q.id), 0);
        return Math.max(max, qmax);
      }, 0);
      this.questionIdCounter = maxQId;
    }
    if (responses) {
      this.responsesSubject.next(JSON.parse(responses));
    }
  }

  /**
   * Add a new survey. IDs are automatically assigned. Persists surveys to localStorage.
   */
  addSurvey(survey: Omit<Survey, 'id' | 'questions'> & { questions: Omit<Question, 'id'>[] }): void {
    const newSurvey: Survey = {
      ...survey,
      id: ++this.surveyIdCounter,
      questions: survey.questions.map(q => ({ ...q, id: ++this.questionIdCounter }))
    };
    const updated = [...this.surveysSubject.value, newSurvey];
    this.surveysSubject.next(updated);
    localStorage.setItem('surveys', JSON.stringify(updated));
  }

  /**
   * Return a survey by id.
   */
  getSurvey(id: number): Survey | undefined {
    return this.surveysSubject.value.find(s => s.id === id);
  }

  /**
   * Add a response for a survey. Persists responses to localStorage.
   */
  addResponse(response: SurveyResponse): void {
    const updated = [...this.responsesSubject.value, response];
    this.responsesSubject.next(updated);
    localStorage.setItem('surveyResponses', JSON.stringify(updated));
  }

  /**
   * Get all responses for a given survey.
   */
  getResponsesForSurvey(surveyId: number): SurveyResponse[] {
    return this.responsesSubject.value.filter(r => r.surveyId === surveyId);
  }
}