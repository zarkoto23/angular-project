// app.routes.ts
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Register } from './components/register/register';
import { Login } from './components/login/login';
import { CreateNew } from './components/create-new/create-new';
import { About } from './components/static/about/about';
import { NotFound } from './components/static/not-found/not-found';
import { Profile } from './components/profile/profile';
import { PublicGuard } from './guards/public.guard';
import { AuthGuard } from './guards/auth.guard';
import { OwnerGuard } from './guards/owner.guard';
import { LaptopsComponent } from './components/laptops/laptops';
import { DetailsCart } from './components/shared/details-cart/details-cart';
import { Edit } from './components/edit/edit';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'laptops', component: LaptopsComponent },
  { path: 'laptops/:id', component: DetailsCart },
  { 
    path: 'edit/:id', 
    component: Edit, 
    canActivate: [AuthGuard, OwnerGuard]  // Двоен guard - първо проверява дали е логнат, после дали е собственик
  },
  { 
    path: 'create', 
    component: CreateNew, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'register', 
    component: Register, 
    canActivate: [PublicGuard] 
  },
  { 
    path: 'login', 
    component: Login, 
    canActivate: [PublicGuard] 
  },
  { 
    path: 'about', 
    component: About 
  },
  { 
    path: 'profile', 
    component: Profile, 
    canActivate: [AuthGuard] 
  },
  { 
    path: '**', 
    component: NotFound 
  },
];