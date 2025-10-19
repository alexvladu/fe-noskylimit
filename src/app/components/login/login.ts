import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  onSubmit() {
    if (!this.email || !this.password) {
      alert('Te rog completează toate câmpurile!');
      return;
    }
    console.log('Email:', this.email);
    console.log('Parola:', this.password);
    alert('Login efectuat cu succes!');
  }
}
