import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Survey, SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-survey-take',
  templateUrl: './survey-take.component.html',
  styleUrls: ['./survey-take.component.scss']
})
export class SurveyTakeComponent implements OnInit {
  survey?: Survey;
  answerForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private surveyService: SurveyService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
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
    this.answerForm = this.fb.group({});
    survey.questions.forEach(q => {
      if (q.type === 'radio') {
        this.answerForm.addControl(String(q.id), this.fb.control('', Validators.required));
      } else {
        // text question
        this.answerForm.addControl(String(q.id), this.fb.control('', Validators.required));
      }
    });
  }

  /**
   * Submit handler. Transform form values into a SurveyResponse and persist it.
   */
  onSubmit() {
    if (!this.survey || this.answerForm.invalid) {
      this.answerForm.markAllAsTouched();
      return;
    }
    const answers = Object.keys(this.answerForm.value).map(key => ({
      questionId: +key,
      answer: this.answerForm.value[key]
    }));
    this.surveyService.addResponse({ surveyId: this.survey.id, answers });
    this.snackBar.open('Encuesta respondida. ¡Gracias!', 'Cerrar', { duration: 3000 });
    this.router.navigate(['/surveys']);
  }
}