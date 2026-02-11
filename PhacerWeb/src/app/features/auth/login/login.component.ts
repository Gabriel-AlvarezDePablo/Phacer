import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="auth-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Sign in to Phacer</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="you@example.com">
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Invalid email format</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password">
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>
            @if (error()) {
              <div class="error-msg">{{ error() }}</div>
            }
            <button mat-flat-button color="primary" type="submit" [disabled]="loading() || form.invalid" class="full-width">
              {{ loading() ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>
        </mat-card-content>
        <mat-card-footer>
          <p>Don't have an account? <a routerLink="/register">Register</a></p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; padding: 1rem; }
    mat-card { max-width: 400px; width: 100%; }
    .full-width { width: 100%; display: block; }
    mat-form-field { margin-bottom: 0.5rem; }
    .error-msg { color: var(--mat-sys-error); margin: 0.5rem 0; font-size: 0.875rem; }
    mat-card-footer { padding: 1rem; text-align: center; }
    mat-card-footer a { color: var(--mat-sys-primary); }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    this.auth.login(this.form.value.email, this.form.value.password).subscribe({
      next: (res) => {
        this.auth.setSession(res);
        window.location.href = '/tasks';
      },
      error: (err) => {
        const msg = err.error?.message ?? err.error ?? 'Invalid email or password';
        this.error.set(typeof msg === 'string' ? msg : 'Invalid email or password');
        this.loading.set(false);
      }
    });
  }
}
