import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  form;
  error = signal('');
  loading = signal(false);
  showPassword = signal(false);

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.nonNullable.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      role: ['Customer' as 'Customer' | 'PharmacyOwner', Validators.required],
    });
  }

  selectRole(role: 'Customer' | 'PharmacyOwner') {
    this.form.patchValue({ role });
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  submit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set('');

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => {
        this.loading.set(false);
        this.error.set(err.message);
      },
    });
  }
}
