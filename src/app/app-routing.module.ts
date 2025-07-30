import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { SurveyListComponent } from './survey/survey-list/survey-list.component';
import { SurveyCreateComponent } from './survey/survey-create/survey-create.component';
import { SurveyTakeComponent } from './survey/survey-take/survey-take.component';
import { SurveyResultsComponent } from './survey/survey-results/survey-results.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'surveys',
    component: SurveyListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'surveys/new',
    component: SurveyCreateComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'surveys/:id',
    component: SurveyTakeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'surveys/:id/results',
    component: SurveyResultsComponent,
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: 'surveys', pathMatch: 'full' },
  { path: '**', redirectTo: 'surveys' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }