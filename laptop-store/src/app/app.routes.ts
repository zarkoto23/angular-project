import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Laptops } from './components/laptops/laptops';
import { Register } from './components/register/register';
import { Login } from './components/login/login';
import { CreateNew } from './components/create-new/create-new';
import { About } from './components/static/about/about';
import { NotFound } from './components/static/not-found/not-found';
import { Profile } from './components/profile/profile';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'laptops', component: Laptops },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'create', component: CreateNew },
  { path: 'about', component: About },
  { path: 'profile', component: Profile },



  { path: '**', component: NotFound },
];
