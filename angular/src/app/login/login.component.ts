import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { XtreamService } from '../services/xtream.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private xtreamService = inject(XtreamService);
  private router = inject(Router);

  loginForm = this.fb.group({
    url: [(import.meta as any).env?.NG_APP_DEFAULT_URL || '', Validators.required],
    username: [(import.meta as any).env?.NG_APP_DEFAULT_USERNAME || '', Validators.required],
    password: [(import.meta as any).env?.NG_APP_DEFAULT_PASSWORD || '', Validators.required]
  });

  error = '';
  loading = false;

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';

    // safe cast since validators ensure they are not null/undefined for the purpose of the API
    const credentials = {
      url: this.loginForm.get('url')?.value!,
      username: this.loginForm.get('username')?.value!,
      password: this.loginForm.get('password')?.value!
    };

    this.xtreamService.login(credentials).subscribe({
      next: (response) => {
        if (response.user_info?.auth === 1) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error = 'Login failed: ' + (response.user_info?.message || 'Unknown error');
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Connection failed. Please check URL and credentials.';
        this.loading = false;
      }
    });
  }
}
