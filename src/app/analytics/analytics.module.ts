import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ReactiveFormsModule } from '@angular/forms';

// Chart.js imports
import { NgChartsModule } from 'ng2-charts';

// Components
import { AnalyticsDashboardComponent } from './components/analytics-dashboard/analytics-dashboard.component';
import { SurveyAnalyticsComponent } from './components/survey-analytics/survey-analytics.component';
import { ResponsesOverviewComponent } from './components/responses-overview/responses-overview.component';
import { ChartWidgetComponent } from './components/chart-widget/chart-widget.component';
import { StatsCardComponent } from './components/stats-card/stats-card.component';
import { ResponseDetailsComponent } from './components/response-details/response-details.component';
import { ExportDataComponent } from './components/export-data/export-data.component';

// Services
import { AnalyticsService } from './services/analytics.service';
import { ExportService } from './services/export.service';
import { ChartConfigService } from './services/chart-config.service';

// Pipes
import { PercentagePipe } from './pipes/percentage.pipe';
import { DurationPipe } from './pipes/duration.pipe';
import { TrendPipe } from './pipes/trend.pipe';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsDashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        component: ResponsesOverviewComponent
      },
      {
        path: 'survey/:id',
        component: SurveyAnalyticsComponent
      },
      {
        path: 'responses/:surveyId',
        component: ResponseDetailsComponent
      },
      {
        path: 'export',
        component: ExportDataComponent
      }
    ]
  }
];

@NgModule({
  declarations: [
    AnalyticsDashboardComponent,
    SurveyAnalyticsComponent,
    ResponsesOverviewComponent,
    ChartWidgetComponent,
    StatsCardComponent,
    ResponseDetailsComponent,
    ExportDataComponent,
    PercentagePipe,
    DurationPipe,
    TrendPipe
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    
    // Material Modules
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    
    // Chart.js
    NgChartsModule
  ],
  providers: [
    AnalyticsService,
    ExportService,
    ChartConfigService
  ],
  exports: [
    AnalyticsDashboardComponent,
    ChartWidgetComponent,
    StatsCardComponent
  ]
})
export class AnalyticsModule { }