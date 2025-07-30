import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Dynamic Survey App';

  constructor(public authService: AuthService, private router: Router) {}

  /**
   * Handle click on the logout button. Clears the session and navigates to the login page.
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}