import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /**
   * Handle submission of the login form. Uses the AuthService to authenticate
   * the user. On success, navigate to the survey list page. On failure, show
   * an error message.
   */
  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    const { username, password } = this.loginForm.value;
    const success = this.authService.login(username, password);
    if (success) {
      this.router.navigate(['/surveys']);
    } else {
      this.snackBar.open('Credenciales inválidas', 'Cerrar', { duration: 3000 });
    }
  }
}