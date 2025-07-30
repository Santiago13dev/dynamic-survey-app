import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Survey, SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-survey-list',
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.scss']
})
export class SurveyListComponent implements OnInit {
  surveys$!: Observable<Survey[]>;
  displayedColumns: string[] = ['titulo', 'acciones'];

  constructor(private surveyService: SurveyService, private router: Router) {}

  ngOnInit(): void {
    this.surveys$ = this.surveyService.surveys$;
  }

  createSurvey() {
    this.router.navigate(['/surveys/new']);
  }

  takeSurvey(id: number) {
    this.router.navigate(['/surveys', id]);
  }

  viewResults(id: number) {
    this.router.navigate(['/surveys', id, 'results']);
  }
}
