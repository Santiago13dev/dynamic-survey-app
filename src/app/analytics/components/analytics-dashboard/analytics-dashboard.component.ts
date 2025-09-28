import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SurveyService } from '../../../services/survey.service';
import { Survey } from '../../../models/survey.model';
import { AnalyticsService } from '../../services/analytics.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface DashboardStats {
  totalSurveys: number;
  totalResponses: number;
  averageCompletion: number;
  activeSurveys: number;
}

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss']
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  stats$!: Observable<DashboardStats>;
  surveys$!: Observable<Survey[]>;
  categoryChart: any;
  completionChart: any;
  trendsChart: any;
  
  selectedPeriod = 'daily';
  isLoading = true;

  chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };

  constructor(
    private surveyService: SurveyService,
    private analyticsService: AnalyticsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadCharts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.surveys$ = this.surveyService.getSurveys();
    
    this.stats$ = this.analyticsService.getAnalyticsData().pipe(
      takeUntil(this.destroy$)
    );

    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  private loadCharts(): void {
    // Load category distribution chart
    this.analyticsService.getCategoryDistribution()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.categoryChart = data;
      });

    // Load completion rate chart
    this.analyticsService.getCompletionRateChart()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.completionChart = data;
      });

    // Load trends chart
    this.loadTrendsChart();
  }

  private loadTrendsChart(): void {
    this.analyticsService.getResponseTrends(this.selectedPeriod as 'daily' | 'weekly' | 'monthly')
      .pipe(takeUntil(this.destroy$))
      .subscribe(trends => {
        this.trendsChart = {
          labels: trends.map(t => t.period),
          datasets: [
            {
              label: 'Respuestas',
              data: trends.map(t => t.responses),
              borderColor: '#36A2EB',
              backgroundColor: 'rgba(54, 162, 235, 0.1)',
              fill: true
            },
            {
              label: 'Completadas',
              data: trends.map(t => t.completions),
              borderColor: '#4BC0C0',
              backgroundColor: 'rgba(75, 192, 192, 0.1)',
              fill: true
            }
          ]
        };
      });
  }

  onPeriodChange(): void {
    this.loadTrendsChart();
  }

  exportData(format: 'csv' | 'json'): void {
    this.analyticsService.exportAnalyticsData(format)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.downloadFile(data, `analytics.${format}`, format === 'csv' ? 'text/csv' : 'application/json');
          this.snackBar.open(`Datos exportados en formato ${format.toUpperCase()}`, 'Cerrar', {
            duration: 3000
          });
        },
        error: (error) => {
          this.snackBar.open('Error al exportar datos', 'Cerrar', {
            duration: 3000
          });
          console.error('Export error:', error);
        }
      });
  }

  private downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  refreshData(): void {
    this.isLoading = true;
    this.loadDashboardData();
    this.loadCharts();
  }
}