import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, startWith } from 'rxjs/operators';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SurveyService, Survey } from '../../../services/survey.service';
import { 
  AnalyticsService, 
  AnalyticsData, 
  SurveyDetailedAnalytics,
  TrendData 
} from '../../services/analytics.service';
import { ExportService } from '../../services/export.service';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss']
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data properties
  analyticsData: AnalyticsData | null = null;
  selectedSurveyAnalytics: SurveyDetailedAnalytics | null = null;
  surveys: Survey[] = [];
  
  // UI state
  isLoading = false;
  selectedPeriod = '30d';
  selectedSurveyId: string | null = null;
  selectedTabIndex = 0;
  
  // Chart configurations
  trendsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Fecha'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Cantidad'
        },
        beginAtZero: true
      }
    }
  };
  
  categoryChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };
  
  timelineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Fecha'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Respuestas'
        },
        beginAtZero: true
      }
    }
  };
  
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };
  
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  constructor(
    private surveyService: SurveyService,
    private analyticsService: AnalyticsService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.setupDataSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.setPeriodDates();
  }

  private setupDataSubscriptions(): void {
    // Subscribe to analytics data
    this.analyticsService.getAnalyticsData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.analyticsData = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading analytics data:', error);
          this.isLoading = false;
        }
      });
    
    // Subscribe to surveys list
    this.surveyService.getSurveys()
      .pipe(takeUntil(this.destroy$))
      .subscribe(surveys => {
        this.surveys = surveys;
        if (surveys.length > 0 && !this.selectedSurveyId) {
          this.selectedSurveyId = surveys[0].id;
          this.loadSurveyAnalytics();
        }
      });
  }

  private setPeriodDates(): void {
    const end = new Date();
    let start: Date;
    
    switch (this.selectedPeriod) {
      case '7d':
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    this.analyticsService.setDateRange(start, end);
  }

  private loadSurveyAnalytics(): void {
    if (!this.selectedSurveyId) return;
    
    this.analyticsService.getSurveyDetailedAnalytics(this.selectedSurveyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analytics) => {
          this.selectedSurveyAnalytics = analytics;
        },
        error: (error) => {
          console.error('Error loading survey analytics:', error);
        }
      });
  }

  // Event handlers
  onPeriodChange(): void {
    this.isLoading = true;
    this.setPeriodDates();
    this.analyticsService.refreshData();
  }

  onSurveySelect(): void {
    this.loadSurveyAnalytics();
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.selectedTabIndex = event.index;
  }

  refreshData(): void {
    this.isLoading = true;
    this.analyticsService.refreshData();
  }

  exportData(): void {
    if (this.analyticsData) {
      this.exportService.exportAnalyticsData(this.analyticsData, this.selectedPeriod);
    }
  }

  // Chart data methods
  getTrendsChartData(): ChartConfiguration['data'] {
    if (!this.analyticsData?.trendsData) {
      return { labels: [], datasets: [] };
    }

    const labels = this.analyticsData.trendsData.map(trend => trend.date);
    
    return {
      labels,
      datasets: [
        {
          label: 'Respuestas',
          data: this.analyticsData.trendsData.map(trend => trend.responses),
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4
        },
        {
          label: 'Completadas',
          data: this.analyticsData.trendsData.map(trend => trend.completions),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        },
        {
          label: 'Nuevas Encuestas',
          data: this.analyticsData.trendsData.map(trend => trend.newSurveys),
          borderColor: '#FF9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  getCategoryChartData(): ChartConfiguration['data'] {
    if (!this.analyticsData?.completionRateByCategory) {
      return { labels: [], datasets: [] };
    }

    return {
      labels: this.analyticsData.completionRateByCategory.map(cat => cat.category),
      datasets: [{
        data: this.analyticsData.completionRateByCategory.map(cat => cat.completionRate),
        backgroundColor: [
          '#2196F3',
          '#4CAF50', 
          '#FF9800',
          '#9C27B0',
          '#F44336',
          '#607D8B'
        ]
      }]
    };
  }

  getTimelineChartData(): ChartConfiguration['data'] {
    if (!this.selectedSurveyAnalytics?.responseTimeline) {
      return { labels: [], datasets: [] };
    }

    const labels = this.selectedSurveyAnalytics.responseTimeline.map(item => item.date);
    
    return {
      labels,
      datasets: [
        {
          label: 'Respuestas',
          data: this.selectedSurveyAnalytics.responseTimeline.map(item => item.responses),
          backgroundColor: '#2196F3'
        },
        {
          label: 'Completadas',
          data: this.selectedSurveyAnalytics.responseTimeline.map(item => item.completions),
          backgroundColor: '#4CAF50'
        }
      ]
    };
  }

  getAgeDistributionData(): ChartConfiguration['data'] {
    if (!this.selectedSurveyAnalytics?.demographicsBreakdown?.ageGroups) {
      return { labels: [], datasets: [] };
    }

    const ageGroups = this.selectedSurveyAnalytics.demographicsBreakdown.ageGroups;
    
    return {
      labels: ageGroups.map(group => group.group),
      datasets: [{
        data: ageGroups.map(group => group.count),
        backgroundColor: [
          '#2196F3',
          '#4CAF50',
          '#FF9800',
          '#9C27B0',
          '#F44336'
        ]
      }]
    };
  }

  getLocationDistributionData(): ChartConfiguration['data'] {
    if (!this.selectedSurveyAnalytics?.demographicsBreakdown?.locations) {
      return { labels: [], datasets: [] };
    }

    const locations = this.selectedSurveyAnalytics.demographicsBreakdown.locations;
    
    return {
      labels: locations.map(loc => loc.location),
      datasets: [{
        label: 'Respuestas por ubicación',
        data: locations.map(loc => loc.count),
        backgroundColor: '#2196F3'
      }]
    };
  }

  getDeviceDistributionData(): ChartConfiguration['data'] {
    if (!this.selectedSurveyAnalytics?.demographicsBreakdown?.devices) {
      return { labels: [], datasets: [] };
    }

    const devices = this.selectedSurveyAnalytics.demographicsBreakdown.devices;
    
    return {
      labels: devices.map(device => device.device),
      datasets: [{
        data: devices.map(device => device.count),
        backgroundColor: [
          '#2196F3',
          '#4CAF50',
          '#FF9800'
        ]
      }]
    };
  }

  getDemographicsTableData(): any[] {
    if (!this.selectedSurveyAnalytics?.demographicsBreakdown) {
      return [];
    }

    const data: any[] = [];
    const demo = this.selectedSurveyAnalytics.demographicsBreakdown;

    // Add age groups
    demo.ageGroups.forEach(group => {
      data.push({
        category: 'Edad',
        value: group.group,
        count: group.count,
        percentage: group.percentage
      });
    });

    // Add locations
    demo.locations.forEach(location => {
      data.push({
        category: 'Ubicación',
        value: location.location,
        count: location.count,
        percentage: location.percentage
      });
    });

    // Add devices
    demo.devices.forEach(device => {
      data.push({
        category: 'Dispositivo',
        value: device.device,
        count: device.count,
        percentage: device.percentage
      });
    });

    return data;
  }

  // Helper methods
  getTopSurveys() {
    return this.analyticsData?.topPerformingSurveys?.slice(0, 5) || [];
  }

  getResponsesTrend(): { value: number; direction: 'up' | 'down' | 'stable' } {
    // Mock trend calculation
    return { value: 12.5, direction: 'up' };
  }

  getCompletionTrend(): { value: number; direction: 'up' | 'down' | 'stable' } {
    return { value: 8.3, direction: 'up' };
  }

  getTimeTrend(): { value: number; direction: 'up' | 'down' | 'stable' } {
    return { value: 2.1, direction: 'down' };
  }

  getUsersTrend(): { value: number; direction: 'up' | 'down' | 'stable' } {
    return { value: 15.7, direction: 'up' };
  }

  getTrendClass(value: number): string {
    if (value > 80) return 'trend-high';
    if (value > 60) return 'trend-medium';
    return 'trend-low';
  }

  getTrendIcon(value: number): string {
    if (value > 80) return 'trending_up';
    if (value > 60) return 'trending_flat';
    return 'trending_down';
  }

  getSkipRateClass(rate: number): string {
    if (rate > 30) return 'high-skip';
    if (rate > 15) return 'medium-skip';
    return 'low-skip';
  }

  getDropoffRateClass(rate: number): string {
    if (rate > 30) return 'high-dropoff';
    if (rate > 15) return 'medium-dropoff';
    return 'low-dropoff';
  }
}