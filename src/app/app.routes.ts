import { Routes } from '@angular/router';
import { PerfilEmpresaComponent } from './perfil-empresa'; // Ajusta la ruta si está en una carpeta

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./app').then(m => m.AppComponent),
  },

  // ── Diagnóstico de Madurez (HU-006/007/008) ───────────────────────────────
  // Nota: el path principal es subruta de registro porque el diagnóstico es
  // el paso 3 del onboarding. Cuando el back exista, debe protegerse con
  // un AuthGuard que valide que el usuario completó las etapas 1 y 2.
  {
    path: 'registro/:tipo/diagnostico',
    loadComponent: () =>
      import('./diagnostico-runner').then(m => m.DiagnosticoRunnerComponent),
  },
  {
    path: 'registro/:tipo/diagnostico/exito',
    loadComponent: () =>
      import('./diagnostico-exito').then(m => m.DiagnosticoExitoComponent),
  },

  // ── Perfiles (HU-009/010/011) ─────────────────────────────────────────────
  {
    path: 'perfil/voluntario',
    loadComponent: () =>
      import('./perfil-voluntario').then(m => m.PerfilVoluntarioComponent),
  },
  {
    path: 'perfil/organizacion',
    loadComponent: () =>
      import('./perfil-organizacion').then(m => m.PerfilOrganizacionComponent),
  },

  { path: 'perfil-empresa', component: PerfilEmpresaComponent },
  // TODO: 'perfil/empresa' cuando se cree el componente correspondiente

  {
    path: '**',
    redirectTo: '',
  },
];