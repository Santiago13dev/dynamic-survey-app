import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SurveyService } from '../../services/survey.service';
import { Question, Survey } from '../../models/survey.model';

@Component({
  selector: 'app-survey-create',
  templateUrl: './survey-create.component.html',
  styleUrls: ['./survey-create.component.scss']
})
export class SurveyCreateComponent implements OnInit {
  basicInfoForm!: FormGroup;
  questionsForm!: FormGroup;
  
  questionTypes = [
    { value: 'text', label: 'Texto libre' },
    { value: 'multiple-choice', label: 'Opción múltiple' },
    { value: 'checkbox', label: 'Casillas de verificación' },
    { value: 'rating', label: 'Calificación' },
    { value: 'yes-no', label: 'Sí/No' }
  ];
  
  categories = [
    { value: 'customer-satisfaction', label: 'Satisfacción del Cliente' },
    { value: 'employee-feedback', label: 'Feedback de Empleados' },
    { value: 'market-research', label: 'Investigación de Mercado' },
    { value: 'product-feedback', label: 'Feedback de Producto' },
    { value: 'event-feedback', label: 'Feedback de Evento' },
    { value: 'other', label: 'Otra' }
  ];

  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['', Validators.required],
      estimatedDuration: [5, [Validators.required, Validators.min(1)]],
      isAnonymous: [true],
      allowMultipleResponses: [false]
    });

    this.questionsForm = this.fb.group({
      questions: this.fb.array([this.createQuestionFormGroup()])
    });
  }

  get questions(): FormArray {
    return this.questionsForm.get('questions') as FormArray;
  }

  createQuestionFormGroup(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      type: ['text', Validators.required],
      options: this.fb.array([]),
      required: [true]
    });
  }

  addQuestion(): void {
    this.questions.push(this.createQuestionFormGroup());
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  getQuestionOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addOption(questionIndex: number): void {
    const options = this.getQuestionOptions(questionIndex);
    options.push(this.fb.control('', Validators.required));
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.getQuestionOptions(questionIndex);
    if (options.length > 1) {
      options.removeAt(optionIndex);
    }
  }

  onQuestionTypeChange(questionIndex: number): void {
    const question = this.questions.at(questionIndex);
    const type = question.get('type')?.value;
    const options = this.getQuestionOptions(questionIndex);
    
    // Clear existing options
    while (options.length > 0) {
      options.removeAt(0);
    }
    
    // Add default options for types that need them
    if (type === 'multiple-choice' || type === 'checkbox') {
      this.addOption(questionIndex);
      this.addOption(questionIndex);
    }
  }

  getDescriptionLength(): number {
    return this.basicInfoForm.get('description')?.value?.length || 0;
  }

  onSubmit(): void {
    if (this.basicInfoForm.valid && this.questionsForm.valid) {
      const basicInfo = this.basicInfoForm.value;
      const questionsData = this.questionsForm.value.questions;
      
      const questions: Question[] = questionsData.map((q: any, index: number) => ({
        id: (index + 1).toString(),
        type: q.type,
        text: q.text,
        options: q.options || [],
        required: q.required,
        order: index + 1
      }));

      const surveyData = {
        titulo: basicInfo.title,
        descripcion: basicInfo.description,
        categoria: basicInfo.category,
        duracionEstimada: basicInfo.estimatedDuration,
        esAnonima: basicInfo.isAnonymous,
        permiteMultiplesRespuestas: basicInfo.allowMultipleResponses,
        preguntas: questions,
        status: 'draft' as const,
        respuestas: 0,
        completadas: 0
      };

      this.surveyService.addSurvey(surveyData).subscribe({
        next: (survey) => {
          this.snackBar.open('Encuesta creada exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.router.navigate(['/surveys']);
        },
        error: (error) => {
          this.snackBar.open('Error al crear la encuesta', 'Cerrar', {
            duration: 3000
          });
          console.error('Error creating survey:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.basicInfoForm);
      this.markFormGroupTouched(this.questionsForm);
      this.snackBar.open('Por favor, completa todos los campos requeridos', 'Cerrar', {
        duration: 3000
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/surveys']);
  }

  // Helper methods for template
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `El valor debe ser mayor a ${field.errors['min'].min}`;
      }
    }
    return '';
  }
}