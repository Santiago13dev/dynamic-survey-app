import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-survey-create',
  templateUrl: './survey-create.component.html',
  styleUrls: ['./survey-create.component.scss']
})
export class SurveyCreateComponent implements OnInit {
  basicInfoForm: FormGroup;
  questionsForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.basicInfoForm = this.createBasicInfoForm();
    this.questionsForm = this.createQuestionsForm();
  }

  ngOnInit(): void {
    // Cargar datos guardados si existen
    this.loadDraftData();
  }

  /**
   * Creates the basic information form
   */
  private createBasicInfoForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      category: ['other'],
      estimatedDuration: [5, [Validators.min(1), Validators.max(60)]],
      isAnonymous: [true],
      allowMultipleResponses: [false]
    });
  }

  /**
   * Creates the questions form
   */
  private createQuestionsForm(): FormGroup {
    return this.fb.group({
      questions: this.fb.array([this.createQuestion()])
    });
  }

  /**
   * Creates a new question form group
   */
  private createQuestion(): FormGroup {
    return this.fb.group({
      text: ['', [Validators.required, Validators.maxLength(200)]],
      type: ['text', Validators.required],
      required: [true],
      options: this.fb.array([])
    });
  }

  /**
   * Creates a new option form control
   */
  private createOption(value: string = ''): AbstractControl {
    return this.fb.control(value, [Validators.required, Validators.maxLength(100)]);
  }

  /**
   * Gets the questions form array
   */
  get questions(): FormArray {
    return this.questionsForm.get('questions') as FormArray;
  }

  /**
   * Gets the options array for a specific question
   */
  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  /**
   * Gets the description length
   */
  getDescriptionLength(): number {
    return this.basicInfoForm.get('description')?.value?.length || 0;
  }

  /**
   * Gets the question text length
   */
  getQuestionTextLength(index: number): number {
    return this.questions.at(index).get('text')?.value?.length || 0;
  }

  /**
   * Gets the question type label
   */
  getQuestionTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'text': 'Texto libre',
      'radio': 'Opción única',
      'checkbox': 'Múltiple selección',
      'scale': 'Escala numérica'
    };
    return labels[type] || 'Texto libre';
  }

  /**
   * Adds a new question to the form
   */
  addQuestion(): void {
    if (this.questions.length < 20) {
      this.questions.push(this.createQuestion());
      this.saveDraftData();
    }
  }

  /**
   * Removes a question from the form
   */
  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
      this.saveDraftData();
      this.showSuccessMessage('Pregunta eliminada');
    }
  }

  /**
   * Duplicates a question
   */
  duplicateQuestion(index: number): void {
    if (this.questions.length < 20) {
      const originalQuestion = this.questions.at(index);
      const duplicatedQuestion = this.createQuestion();
      
      // Copy values from original question
      duplicatedQuestion.patchValue(originalQuestion.value);
      
      // Copy options if they exist
      if (originalQuestion.get('options') && originalQuestion.get('options')?.value) {
        const optionsArray = duplicatedQuestion.get('options') as FormArray;
        originalQuestion.get('options')?.value.forEach((option: string) => {
          optionsArray.push(this.createOption(option));
        });
      }
      
      this.questions.insert(index + 1, duplicatedQuestion);
      this.saveDraftData();
      this.showSuccessMessage('Pregunta duplicada');
    }
  }

  /**
   * Handles question type change
   */
  onTypeChange(questionIndex: number): void {
    const question = this.questions.at(questionIndex);
    const type = question.get('type')?.value;
    const optionsArray = question.get('options') as FormArray;

    // Clear existing options
    optionsArray.clear();

    // Add default options for radio and checkbox types
    if (type === 'radio' || type === 'checkbox') {
      optionsArray.push(this.createOption('Opción 1'));
      optionsArray.push(this.createOption('Opción 2'));
    }

    this.saveDraftData();
  }

  /**
   * Adds an option to a question
   */
  addOption(questionIndex: number): void {
    const optionsArray = this.getOptions(questionIndex);
    if (optionsArray.length < 10) {
      optionsArray.push(this.createOption(`Opción ${optionsArray.length + 1}`));
      this.saveDraftData();
    }
  }

  /**
   * Removes an option from a question
   */
  removeOption(questionIndex: number, optionIndex: number): void {
    const optionsArray = this.getOptions(questionIndex);
    if (optionsArray.length > 2) {
      optionsArray.removeAt(optionIndex);
      this.saveDraftData();
    }
  }

  /**
   * Saves draft data to localStorage
   */
  private saveDraftData(): void {
    const draftData = {
      basicInfo: this.basicInfoForm.value,
      questions: this.questionsForm.value,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('survey-draft', JSON.stringify(draftData));
  }

  /**
   * Loads draft data from localStorage
   */
  private loadDraftData(): void {
    const draftData = localStorage.getItem('survey-draft');
    if (draftData) {
      try {
        const parsed = JSON.parse(draftData);
        
        // Load basic info
        if (parsed.basicInfo) {
          this.basicInfoForm.patchValue(parsed.basicInfo);
        }

        // Load questions
        if (parsed.questions && parsed.questions.questions) {
          this.questions.clear();
          parsed.questions.questions.forEach((questionData: any) => {
            const question = this.createQuestion();
            question.patchValue({
              text: questionData.text,
              type: questionData.type,
              required: questionData.required
            });

            // Add options if they exist
            if (questionData.options && questionData.options.length > 0) {
              const optionsArray = question.get('options') as FormArray;
              questionData.options.forEach((option: string) => {
                optionsArray.push(this.createOption(option));
              });
            }

            this.questions.push(question);
          });
        }
      } catch (error) {
        console.warn('Error loading draft data:', error);
      }
    }
  }

  /**
   * Saves survey as draft
   */
  saveDraft(): void {
    if (this.basicInfoForm.valid && this.questionsForm.valid) {
      this.isLoading = true;
      
      const surveyData = {
        ...this.basicInfoForm.value,
        questions: this.questionsForm.value.questions,
        status: 'draft',
        id: this.generateId(),
        fechaCreacion: new Date(),
        respuestas: 0,
        completadas: 0
      };

      setTimeout(() => {
        this.surveyService.saveDraft(surveyData).subscribe({
          next: () => {
            this.clearDraftData();
            this.showSuccessMessage('Borrador guardado exitosamente');
            this.router.navigate(['/surveys']);
          },
          error: () => {
            this.showErrorMessage('Error al guardar el borrador');
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }, 1000);
    } else {
      this.showErrorMessage('Por favor completa todos los campos requeridos');
    }
  }

  /**
   * Submits the survey form
   */
  onSubmit(): void {
    if (this.basicInfoForm.valid && this.questionsForm.valid) {
      this.isLoading = true;
      
      const surveyData = {
        titulo: this.basicInfoForm.value.title,
        descripcion: this.basicInfoForm.value.description,
        categoria: this.basicInfoForm.value.category,
        duracionEstimada: this.basicInfoForm.value.estimatedDuration,
        esAnonima: this.basicInfoForm.value.isAnonymous,
        permiteMultiplesRespuestas: this.basicInfoForm.value.allowMultipleResponses,
        preguntas: this.questionsForm.value.questions,
        status: 'active',
        id: this.generateId(),
        fechaCreacion: new Date(),
        respuestas: 0,
        completadas: 0
      };

      // Simular delay para mejor UX
      setTimeout(() => {
        this.surveyService.addSurvey(surveyData).subscribe({
          next: () => {
            this.clearDraftData();
            this.showSuccessMessage('¡Encuesta creada exitosamente!');
            this.router.navigate(['/surveys']);
          },
          error: () => {
            this.showErrorMessage('Error al crear la encuesta');
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }, 1500);
    } else {
      this.showErrorMessage('Por favor completa todos los campos requeridos');
      this.markAllFieldsAsTouched();
    }
  }

  /**
   * Marks all form fields as touched to show validation errors
   */
  private markAllFieldsAsTouched(): void {
    this.basicInfoForm.markAllAsTouched();
    this.questionsForm.markAllAsTouched();
  }

  /**
   * Clears draft data from localStorage
   */
  private clearDraftData(): void {
    localStorage.removeItem('survey-draft');
  }

  /**
   * Generates a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Shows success message
   */
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Shows error message
   */
  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
