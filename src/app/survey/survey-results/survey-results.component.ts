import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Survey, SurveyResponse, SurveyService } from '../../services/survey.service';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { ChartData } from 'chart.js';

interface RadioResult {
  question: any;
  chartData: ChartData<'bar'>;
}

interface TextResult {
  question: any;
  answers: string[];
}

@Component({
  selector: 'app-survey-results',
  templateUrl: './survey-results.component.html',
  styleUrls: ['./survey-results.component.scss']
})
export class SurveyResultsComponent implements OnInit {
  survey?: Survey;
  responses: SurveyResponse[] = [];
  radioResults: RadioResult[] = [];
  textResults: TextResult[] = [];

  constructor(
    private route: ActivatedRoute,
    private surveyService: SurveyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const surveyId = idParam ? +idParam : null;
    if (!surveyId) {
      this.router.navigate(['/surveys']);
      return;
    }
    const survey = this.surveyService.getSurvey(surveyId);
    if (!survey) {
      this.router.navigate(['/surveys']);
      return;
    }
    this.survey = survey;
    this.responses = this.surveyService.getResponsesForSurvey(survey.id);
    this.calculateResults();
  }

  /**
   * Compute aggregated results for each question. Radio questions get chart data
   * while text questions simply collect all answers.
   */
  private calculateResults() {
    if (!this.survey) return;
    this.radioResults = [];
    this.textResults = [];
    for (const q of this.survey.questions) {
      if (q.type === 'radio') {
        const counts: { [key: string]: number } = {};
        this.responses.forEach(resp => {
          const ansObj = resp.answers.find(a => a.questionId === q.id);
          if (ansObj && typeof ansObj.answer === 'string') {
            counts[ansObj.answer] = (counts[ansObj.answer] || 0) + 1;
          }
        });
        const labels = Object.keys(counts);
        const data = labels.map(l => counts[l]);
        this.radioResults.push({
          question: q,
          chartData: {
            labels,
            datasets: [{ data, label: 'Respuestas' }]
          }
        });
      } else {
        const answers: string[] = [];
        this.responses.forEach(resp => {
          const ansObj = resp.answers.find(a => a.questionId === q.id);
          if (ansObj && typeof ansObj.answer === 'string') {
            answers.push(ansObj.answer);
          }
        });
        this.textResults.push({ question: q, answers });
      }
    }
  }

  /**
   * Export the survey results to a CSV file. The CSV contains one row per
   * question response.
   */
  exportCSV() {
    if (!this.survey) return;
    const rows: string[][] = [];
    rows.push(['Pregunta', 'Respuesta']);
    this.responses.forEach(resp => {
      resp.answers.forEach(answer => {
        const question = this.survey?.questions.find(q => q.id === answer.questionId);
        const questionText = question ? question.text : '';
        rows.push([questionText, Array.isArray(answer.answer) ? answer.answer.join('; ') : answer.answer as string]);
      });
    });
    const csvContent = rows.map(r => r.map(val => '"' + (val ?? '').replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `survey-${this.survey.id}-results.csv`);
  }

  /**
   * Export the survey results to a PDF file using jsPDF. Charts are not
   * embedded; instead a summary table is included.
   */
  exportPDF() {
    if (!this.survey) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Resultados de la encuesta: ${this.survey.title}`, 10, 20);
    doc.setFontSize(12);
    let y = 30;
    this.radioResults.forEach(res => {
      doc.text(`Pregunta: ${res.question.text}`, 10, y);
      y += 6;
      res.chartData.labels?.forEach((label, idx) => {
        const count = (res.chartData.datasets[0].data as number[])[idx];
        doc.text(`- ${label}: ${count}`, 12, y);
        y += 6;
      });
      y += 4;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    this.textResults.forEach(res => {
      doc.text(`Pregunta: ${res.question.text}`, 10, y);
      y += 6;
      res.answers.forEach(ans => {
        doc.text(`- ${ans}`, 12, y);
        y += 6;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      y += 4;
    });
    doc.save(`survey-${this.survey.id}-results.pdf`);
  }
}