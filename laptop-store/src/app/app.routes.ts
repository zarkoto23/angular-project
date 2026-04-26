// app.routes.ts
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Register } from './components/register/register';
import { Login } from './components/login/login'; // 👈 ПРОВЕРЕТЕ ТОЗИ ИМПОРТ
import { CreateNew } from './components/create-new/create-new';
import { About } from './components/static/about/about';
import { NotFound } from './components/static/not-found/not-found';
import { Profile } from './components/profile/profile';
import { PublicGuard } from './guards/public.guard';
import { AuthGuard } from './guards/auth.guard';
import { LaptopsComponent } from './components/laptops/laptops';
import { DetailsCart } from './components/shared/details-cart/details-cart';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'laptops/:id', component: DetailsCart },
  { path: 'laptops', component: LaptopsComponent },

  { path: 'register', component: Register, canActivate: [PublicGuard] },
  { path: 'login', component: Login, canActivate: [PublicGuard] }, // 👈 СЪЩОТО КАТО REGISTER
  { path: 'create', component: CreateNew, canActivate: [AuthGuard] },
  { path: 'about', component: About },
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },

  
  { path: '**', component: NotFound },
];