import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { SurveyService } from '../../services/survey.service';
import { Survey, Question, SurveyAnswer } from '../../models/survey.model';

@Component({
  selector: 'app-survey-take',
  templateUrl: './survey-take.component.html',
  styleUrls: ['./survey-take.component.scss']
})
export class SurveyTakeComponent implements OnInit {
  survey$!: Observable<Survey | undefined>;
  responseForm!: FormGroup;
  currentQuestionIndex = 0;
  isSubmitted = false;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const surveyId = this.route.snapshot.paramMap.get('id');
    if (surveyId) {
      this.loadSurvey(surveyId);
    } else {
      this.router.navigate(['/surveys']);
    }
  }

  private loadSurvey(surveyId: string): void {
    this.survey$ = this.surveyService.getSurvey(surveyId);
    
    this.survey$.subscribe(survey => {
      if (survey) {
        this.initializeForm(survey);
        this.isLoading = false;
      } else {
        this.snackBar.open('Encuesta no encontrada', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/surveys']);
      }
    });
  }

  private initializeForm(survey: Survey): void {
    const formControls: { [key: string]: any } = {};
    
    survey.preguntas.forEach(question => {
      const validators = question.required ? [Validators.required] : [];
      
      if (question.type === 'checkbox') {
        // For checkbox questions, create a FormGroup with controls for each option
        const checkboxControls: { [key: string]: any } = {};
        question.options?.forEach((option, index) => {
          checkboxControls[`option_${index}`] = [false];
        });
        formControls[question.id] = this.fb.group(checkboxControls);
      } else {
        formControls[question.id] = ['', validators];
      }
    });

    this.responseForm = this.fb.group(formControls);
  }

  getCurrentQuestion(survey: Survey): Question | null {
    return survey.preguntas[this.currentQuestionIndex] || null;
  }

  nextQuestion(): void {
    this.currentQuestionIndex++;
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  canGoNext(survey: Survey): boolean {
    return this.currentQuestionIndex < survey.preguntas.length - 1;
  }

  canGoPrevious(): boolean {
    return this.currentQuestionIndex > 0;
  }

  onSubmit(survey: Survey): void {
    if (this.responseForm.valid) {
      const answers: SurveyAnswer[] = [];
      
      survey.preguntas.forEach(question => {
        const value = this.responseForm.get(question.id)?.value;
        
        if (question.type === 'checkbox') {
          // Handle checkbox questions
          const selectedOptions: string[] = [];
          Object.keys(value).forEach(key => {
            if (value[key]) {
              const optionIndex = parseInt(key.split('_')[1]);
              if (question.options && question.options[optionIndex]) {
                selectedOptions.push(question.options[optionIndex]);
              }
            }
          });
          answers.push({
            questionId: question.id,
            answer: selectedOptions
          });
        } else {
          answers.push({
            questionId: question.id,
            answer: value
          });
        }
      });

      const responseData = {
        surveyId: survey.id,
        respuestas: answers,
        completada: true
      };

      this.surveyService.addResponse(responseData).subscribe({
        next: () => {
          this.isSubmitted = true;
          this.snackBar.open('Respuesta enviada exitosamente', 'Cerrar', {
            duration: 3000
          });
        },
        error: (error) => {
          this.snackBar.open('Error al enviar la respuesta', 'Cerrar', {
            duration: 3000
          });
          console.error('Error submitting response:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Por favor, completa todas las preguntas requeridas', 'Cerrar', {
        duration: 3000
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.responseForm.controls).forEach(key => {
      const control = this.responseForm.get(key);
      control?.markAsTouched();
    });
  }

  goToSurveys(): void {
    this.router.navigate(['/surveys']);
  }

  // Helper methods for template
  isFieldInvalid(questionId: string): boolean {
    const field = this.responseForm.get(questionId);
    return !!(field && field.invalid && field.touched);
  }

  getProgressPercentage(survey: Survey): number {
    return ((this.currentQuestionIndex + 1) / survey.preguntas.length) * 100;
  }

  getRatingArray(max: number = 5): number[] {
    return Array.from({ length: max }, (_, i) => i + 1);
  }
}