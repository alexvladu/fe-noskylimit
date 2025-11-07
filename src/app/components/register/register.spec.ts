import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';

  onRegister() {
    console.log('Registering user:', {
      name: this.name,
      email: this.email,
      password: this.password,
    });

    // TODO: Add your registration logic here.
    // Typically, you would:
    // 1. Send this data to an API via an AuthService.
    // 2. Handle success (redirect, token storage, etc.).
    // 3. Handle errors (show error message).
  }
}
