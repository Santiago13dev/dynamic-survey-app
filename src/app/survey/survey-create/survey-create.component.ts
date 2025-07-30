import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-survey-create',
  templateUrl: './survey-create.component.html',
  styleUrls: ['./survey-create.component.scss']
})
export class SurveyCreateComponent implements OnInit {
  surveyForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.surveyForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      questions: this.fb.array([])
    });
    this.addQuestion();
  }

  /**
   * Getter for the questions FormArray
   */
  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  /**
   * Create a new question form group. The default type is text.
   */
  private createQuestion(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      type: ['text', Validators.required],
      options: this.fb.array([])
    });
  }

  /**
   * Add a new question to the form.
   */
  addQuestion() {
    this.questions.push(this.createQuestion());
  }

  /**
   * Remove a question at the given index.
   */
  removeQuestion(index: number) {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  /**
   * Getter for the options FormArray of a specific question.
   */
  getOptions(questionIndex: number): FormArray {
    return (this.questions.at(questionIndex) as FormGroup).get('options') as FormArray;
  }

  /**
   * Add an option to a multiple choice question.
   */
  addOption(questionIndex: number) {
    this.getOptions(questionIndex).push(this.fb.control('', Validators.required));
  }

  /**
   * Remove an option from a multiple choice question.
   */
  removeOption(questionIndex: number, optionIndex: number) {
    const opts = this.getOptions(questionIndex);
    if (opts.length > 1) {
      opts.removeAt(optionIndex);
    }
  }

  /**
   * Called when the question type changes. Clears options if not a radio type.
   */
  onTypeChange(questionIndex: number) {
    const question = this.questions.at(questionIndex) as FormGroup;
    const type = question.get('type')?.value;
    const options = question.get('options') as FormArray;
    if (type === 'radio') {
      if (options.length === 0) {
        // initialise with two empty options
        options.push(this.fb.control('', Validators.required));
        options.push(this.fb.control('', Validators.required));
      }
    } else {
      // Clear options for text questions
      while (options.length !== 0) {
        options.removeAt(0);
      }
    }
  }

  /**
   * Submit handler. Transforms the reactive form into the Survey format and calls
   * the survey service to persist it.
   */
  onSubmit() {
    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      return;
    }
    const rawSurvey = this.surveyForm.value;
    this.surveyService.addSurvey({
      title: rawSurvey.title,
      description: rawSurvey.description,
      questions: rawSurvey.questions.map((q: any) => ({
        text: q.text,
        type: q.type,
        options: q.type === 'radio' ? q.options : undefined
      }))
    });
    this.snackBar.open('Encuesta creada', 'Cerrar', { duration: 3000 });
    this.router.navigate(['/surveys']);
  }
}