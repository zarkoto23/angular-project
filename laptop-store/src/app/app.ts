import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestRegisterComponent } from './features/auth/components/register/register';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TestRegisterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('laptop-store');
}
