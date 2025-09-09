import { Component } from '@angular/core';
import { UserApiService } from '../../../_core/http/userApi.services';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
})
export class LoginComponent {
  constructor(
    private readonly userService: UserApiService,
    private readonly toaster: ToastrService,
    private readonly route:Router
  ) {}
public loading=false;
  public loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });
  public login() {
    this.loading=true;
    this.userService.login(this.loginForm.value).subscribe({
      next: (res) => {
        localStorage.setItem('isLoggedIn', 'true');
      this.route.navigate(['/']);
        this.toaster.success('Login Successful');
      },
      error: (err) => {
        console.error(err);
        alert('Login failed. Please check your credentials and try again.');
        this.loading=false;
      },complete:()=>{
        this.loading=false;
      }
    });
  }
    showPassword: boolean = false;
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
