import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { SurveyService } from '../../services/survey.service';
import { Survey, SurveyResponse, SurveyStats, Question } from '../../models/survey.model';

interface QuestionResult {
  questionId: string;
  questionText: string;
  questionType: string;
  responses: {
    answer: string;
    count: number;
    percentage: number;
  }[];
}

@Component({
  selector: 'app-survey-results',
  templateUrl: './survey-results.component.html',
  styleUrls: ['./survey-results.component.scss']
})
export class SurveyResultsComponent implements OnInit {
  survey$!: Observable<Survey | undefined>;
  responses$!: Observable<SurveyResponse[]>;
  stats$!: Observable<SurveyStats>;
  results$!: Observable<QuestionResult[]>;
  
  surveyId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyService: SurveyService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.surveyId = id;
      this.loadSurveyResults();
    } else {
      this.router.navigate(['/surveys']);
    }
  }

  private loadSurveyResults(): void {
    this.survey$ = this.surveyService.getSurvey(this.surveyId);
    this.responses$ = this.surveyService.getResponsesForSurvey(this.surveyId);
    this.stats$ = this.surveyService.getSurveyStats(this.surveyId);
    
    this.results$ = combineLatest([
      this.survey$,
      this.responses$
    ]).pipe(
      map(([survey, responses]) => {
        if (!survey) return [];
        return this.processResults(survey, responses);
      })
    );
  }

  private processResults(survey: Survey, responses: SurveyResponse[]): QuestionResult[] {
    const results: QuestionResult[] = [];
    
    survey.preguntas.forEach((question: Question) => {
      const questionResponses = responses
        .map(response => response.respuestas.find((r: any) => r.questionId === question.id))
        .filter(answer => answer !== undefined)
        .map(answer => answer!.answer);
      
      const answerCounts: { [key: string]: number } = {};
      
      questionResponses.forEach(answer => {
        if (Array.isArray(answer)) {
          // Handle checkbox questions (multiple answers)
          answer.forEach(option => {
            answerCounts[option] = (answerCounts[option] || 0) + 1;
          });
        } else {
          // Handle single answer questions
          const answerStr = String(answer);
          answerCounts[answerStr] = (answerCounts[answerStr] || 0) + 1;
        }
      });
      
      const totalResponses = question.type === 'checkbox' 
        ? Object.values(answerCounts).reduce((sum, count) => sum + count, 0)
        : questionResponses.length;
      
      const responseData = Object.entries(answerCounts).map(([answer, count]) => ({
        answer,
        count,
        percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0
      }));
      
      // Sort by count (descending)
      responseData.sort((a, b) => b.count - a.count);
      
      results.push({
        questionId: question.id,
        questionText: question.text,
        questionType: question.type,
        responses: responseData
      });
    });
    
    return results;
  }

  exportToCSV(): void {
    combineLatest([
      this.survey$,
      this.results$
    ]).subscribe(([survey, results]) => {
      if (!survey) return;
      
      let csvContent = 'Pregunta,Respuesta,Cantidad,Porcentaje\n';
      
      results.forEach(result => {
        result.responses.forEach(response => {
          csvContent += `"${result.questionText}","${response.answer}",${response.count},${response.percentage.toFixed(2)}%\n`;
        });
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${survey.titulo}_resultados.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }

  exportToPDF(): void {
    // Implementation would require a PDF library like jsPDF
    console.log('PDF export functionality would be implemented here');
  }

  goBack(): void {
    this.router.navigate(['/surveys']);
  }

  // Helper methods for template
  getQuestionTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'text': 'Texto libre',
      'multiple-choice': 'Opción múltiple',
      'checkbox': 'Casillas de verificación',
      'rating': 'Calificación',
      'yes-no': 'Sí/No'
    };
    return labels[type] || type;
  }

  getChartData(result: QuestionResult): any {
    return {
      labels: result.responses.map(r => r.answer),
      datasets: [{
        data: result.responses.map(r => r.count),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }]
    };
  }

  getChartOptions(): any {
    return {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };
  }
}