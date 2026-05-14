// diagnostico-exito.ts
// Pantalla de celebración tras completar el diagnóstico.
// Lanza confeti, muestra insignia de nivel, mensaje y recomendaciones.

import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  DIAGNOSTICO_ORGANIZACION,
  DIAGNOSTICO_EMPRESA,
  DIAGNOSTICO_VOLUNTARIO,
  DiagnosticoConfig,
  NivelMadurez,
} from './diagnostico.data';

import {
  TipoActor,
  cargarResultado,
  ResultadoDiagnostico,
} from './diagnostico-storage';

const CONFIG_POR_ACTOR: Record<TipoActor, DiagnosticoConfig> = {
  organizacion: DIAGNOSTICO_ORGANIZACION,
  empresa:      DIAGNOSTICO_EMPRESA,
  voluntario:   DIAGNOSTICO_VOLUNTARIO,
};

// Mapa actor → ruta del perfil correspondiente (HU-009/010/011)
const RUTA_PERFIL: Record<TipoActor, string> = {
  organizacion: '/perfil/organizacion',
  empresa:      '/perfil/empresa',     // creará en próximo sprint
  voluntario:   '/perfil/voluntario',
};

// Emoji/insignia por actor + nivel (los nombres vienen de diagnostico.data.ts)
const INSIGNIA_POR_NIVEL: Record<string, string> = {
  // Organización
  'Emergente':            '🌱',
  'Consolidada':          '🌿',
  'Partner Estratégica':  '🌳',
  // Empresa
  'Exploradora':              '🚀',
  'Estratégica':              '🎯',
  'Líder de Transformación':  '🏆',
  // Voluntario
  'Explorador':   '🔭',
  'Especialista': '🛠️',
  'Líder':        '⭐',
};

@Component({
  selector: 'app-diagnostico-exito',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './diagnostico-exito.html',
  styleUrl: './diagnostico-exito.css',
})
export class DiagnosticoExitoComponent implements OnInit, AfterViewInit, OnDestroy {

  actor: TipoActor = 'voluntario';
  resultado: ResultadoDiagnostico | null = null;
  nivelDetalle: NivelMadurez | null = null;
  insignia = '🎉';
  rutaPerfil = '/';

  private _confetiInterval: any = null;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    @Inject(PLATFORM_ID) private _platformId: object,
  ) {}

  ngOnInit(): void {
    const tipoParam = this._route.snapshot.paramMap.get('tipo') as TipoActor | null;
    this.actor = this._validarActor(tipoParam);
    this.rutaPerfil = RUTA_PERFIL[this.actor];

    // Cargar resultado guardado en sessionStorage
    this.resultado = cargarResultado(this.actor);

    if (!this.resultado) {
      // Si no hay resultado, redirige al inicio del diagnóstico
      this._router.navigate(['/registro', this.actor, 'diagnostico']);
      return;
    }

    // Buscar el detalle del nivel en la configuración
    const config = CONFIG_POR_ACTOR[this.actor];
    this.nivelDetalle = config.niveles.find(n => n.nombre === this.resultado!.nivel) ?? null;
    this.insignia = INSIGNIA_POR_NIVEL[this.resultado.nivel] ?? '🎉';
  }

  async ngAfterViewInit(): Promise<void> {
    // SSR-safe: solo lanzar confeti en el navegador
    if (!isPlatformBrowser(this._platformId)) return;
    if (!this.resultado) return;

    try {
      // Carga dinámica para no romper el SSR build
      const confettiModule = await import('canvas-confetti');
      const confetti = confettiModule.default;

      // Estallido inicial
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#ff671b', '#4caf50', '#1a1a2e', '#ffb300', '#ffffff'],
      });

      // Confeti lateral durante 2.5 segundos
      let count = 0;
      this._confetiInterval = setInterval(() => {
        if (count >= 5) {
          clearInterval(this._confetiInterval);
          this._confetiInterval = null;
          return;
        }
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#ff671b', '#4caf50', '#ffb300'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#ff671b', '#4caf50', '#ffb300'],
        });
        count++;
      }, 500);
    } catch (e) {
      console.warn('[diagnostico-exito] No se pudo cargar canvas-confetti', e);
    }
  }

  ngOnDestroy(): void {
    if (this._confetiInterval) {
      clearInterval(this._confetiInterval);
      this._confetiInterval = null;
    }
  }

  private _validarActor(tipo: string | null): TipoActor {
    if (tipo === 'organizacion' || tipo === 'empresa' || tipo === 'voluntario') return tipo;
    return 'voluntario';
  }

  irAPerfil(): void {
    this._router.navigate([this.rutaPerfil]);
  }

  // Texto del actor en singular para títulos
  get actorLabel(): string {
    const map: Record<TipoActor, string> = {
      organizacion: 'organización',
      empresa:      'empresa',
      voluntario:   'voluntario',
    };
    return map[this.actor];
  }
}