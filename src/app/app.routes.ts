import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./app').then(m => m.AppComponent),
  },
  {
    path: 'perfil/voluntario',
    loadComponent: () => import('./perfil-voluntario').then(m => m.PerfilVoluntarioComponent),
  },
  {
    path: 'perfil/organizacion',
    loadComponent: () => import('./perfil-organizacion').then(m => m.PerfilOrganizacionComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
