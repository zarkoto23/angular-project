import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enviroment } from '../../../enviroments/enviroment';
import { Login } from '../../shared/models/login.model';
import { Observable } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { Register } from '../../shared/models/register.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = enviroment.apiUrl;

  login(data: Login): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/api/login`, data);
  }

  register(data:Register):Observable<User>{
    return this.http.post<User>('')
  }
}
