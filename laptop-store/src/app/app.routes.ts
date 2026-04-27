import { Routes } from '@angular/router';
import { PublicGuard } from './guards/public.guard';
import { AuthGuard } from './guards/auth.guard';
import { OwnerGuard } from './guards/owner.guard';
import { Home } from './components/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'laptops',
    loadComponent: () => import('./components/laptops/laptops').then((m) => m.LaptopsComponent),
  },
  {
    path: 'laptops/:id',
    loadComponent: () =>
      import('./components/shared/details-cart/details-cart').then((m) => m.DetailsCart),
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/edit/edit').then((m) => m.Edit),
    canActivate: [AuthGuard, OwnerGuard],
  },
  {
    path: 'create',
    loadComponent: () => import('./components/create-new/create-new').then((m) => m.CreateNew),
    canActivate: [AuthGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then((m) => m.Register),
    canActivate: [PublicGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then((m) => m.Login),
    canActivate: [PublicGuard],
  },
  {
    path: 'about',
    loadComponent: () => import('./components/static/about/about').then((m) => m.About),
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile').then((m) => m.Profile),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    loadComponent: () => import('./components/static/not-found/not-found').then((m) => m.NotFound),
  },
];
