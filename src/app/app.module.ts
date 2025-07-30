import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Angular Material modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

// Chart library
import { NgChartsModule } from 'ng2-charts';

// App routing
import { AppRoutingModule } from './app-routing.module';

// Components
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { SurveyListComponent } from './survey/survey-list/survey-list.component';
import { SurveyCreateComponent } from './survey/survey-create/survey-create.component';
import { SurveyTakeComponent } from './survey/survey-take/survey-take.component';
import { SurveyResultsComponent } from './survey/survey-results/survey-results.component';

// Services
import { AuthService } from './services/auth.service';
import { SurveyService } from './services/survey.service';

// Guards
import { AuthGuard } from './services/auth.guard';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SurveyListComponent,
    SurveyCreateComponent,
    SurveyTakeComponent,
    SurveyResultsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    // Material modules
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatTableModule,
    // Charts
    NgChartsModule
  ],
  providers: [AuthService, SurveyService, AuthGuard, provideAnimationsAsync('noop')],
  bootstrap: [AppComponent]
})
export class AppModule { }