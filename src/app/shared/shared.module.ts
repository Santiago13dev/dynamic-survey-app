import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Material Design Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

// Components
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';

// Pipes
import { TruncatePipe } from './pipes/truncate.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';

// Services
import { ThemeService } from './services/theme.service';
import { NotificationService } from './services/notification.service';

// Guards
import { AuthGuard } from './guards/auth.guard';

@NgModule({
  declarations: [
    ThemeToggleComponent,
    TruncatePipe,
    TimeAgoPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    
    // Material Design
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  exports: [
    // Components
    ThemeToggleComponent,
    
    // Pipes
    TruncatePipe,
    TimeAgoPipe,
    
    // Material modules (re-export for convenience)
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  providers: [
    ThemeService,
    NotificationService,
    AuthGuard
  ]
})
export class SharedModule { }