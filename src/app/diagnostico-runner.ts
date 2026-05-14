// diagnostico-runner.ts
// Componente único que renderiza el diagnóstico para Org, Empresa o Voluntario.
// Lee el parámetro :tipo de la URL → carga la configuración correcta.
// Persiste cada cambio en sessionStorage. Al finalizar navega a /exito.

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  DiagnosticoConfig,
  PreguntaDiagnostico,
  DIAGNOSTICO_ORGANIZACION,
  DIAGNOSTICO_EMPRESA,
  DIAGNOSTICO_VOLUNTARIO,
  calcularNivel,
} from './diagnostico.data';

import {
  TipoActor,
  cargarProgreso,
  guardarProgreso,
  limpiarProgreso,
  guardarResultado,
  calcularPuntaje,
} from './diagnostico-storage';

// Mapa actor → configuración del diagnóstico
const CONFIG_POR_ACTOR: Record<TipoActor, DiagnosticoConfig> = {
  organizacion: DIAGNOSTICO_ORGANIZACION,
  empresa:      DIAGNOSTICO_EMPRESA,
  voluntario:   DIAGNOSTICO_VOLUNTARIO,
};

// Etapas del tablero superior (HU-001/002/003)
const ETAPAS_TABLERO = [
  { id: 1, nombre: 'Información Básica' },
  { id: 2, nombre: 'Documentos' },
  { id: 3, nombre: 'Diagnóstico' },
  { id: 4, nombre: 'Perfil' },
];
const ETAPA_ACTUAL_ID = 3; // Estamos en la etapa de Diagnóstico

@Component({
  selector: 'app-diagnostico-runner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatRadioModule,
    MatProgressBarModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './diagnostico-runner.html',
  styleUrl: './diagnostico-runner.css',
})
export class DiagnosticoRunnerComponent implements OnInit {

  // ── Estado base ─────────────────────────────────────────────────────────────
  actor: TipoActor = 'voluntario';
  config!: DiagnosticoConfig;
  preguntasVisibles: PreguntaDiagnostico[] = [];

  preguntaActual = 0;
  respuestas: (number | null)[] = [];

  // ── Constantes UI ───────────────────────────────────────────────────────────
  etapas = ETAPAS_TABLERO;
  etapaActual = ETAPA_ACTUAL_ID;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // Detecta tipo desde la URL
    const tipoParam = this._route.snapshot.paramMap.get('tipo') as TipoActor | null;
    this.actor = this._validarActor(tipoParam);
    this.config = CONFIG_POR_ACTOR[this.actor];
    this.preguntasVisibles = this.config.preguntas.filter(p => !p.precalculada);

    // Restaura progreso si existe
    const guardado = cargarProgreso(this.actor);
    if (guardado && guardado.respuestas.length === this.preguntasVisibles.length) {
      this.preguntaActual = guardado.preguntaActual;
      this.respuestas     = [...guardado.respuestas];
      this._snack.open('✓ Progreso restaurado', '', { duration: 2000, panelClass: 'fbd-snack' });
    } else {
      this.respuestas = new Array(this.preguntasVisibles.length).fill(null);
    }
  }

  private _validarActor(tipo: string | null): TipoActor {
    if (tipo === 'organizacion' || tipo === 'empresa' || tipo === 'voluntario') return tipo;
    return 'voluntario'; // default seguro
  }

  // ── Navegación ──────────────────────────────────────────────────────────────
  get pregunta(): PreguntaDiagnostico {
    return this.preguntasVisibles[this.preguntaActual];
  }

  get esPrimera(): boolean { return this.preguntaActual === 0; }
  get esUltima(): boolean  { return this.preguntaActual === this.preguntasVisibles.length - 1; }

  get progresoPct(): number {
    return Math.round(((this.preguntaActual + 1) / this.preguntasVisibles.length) * 100);
  }

  get respuestaActual(): number | null {
    return this.respuestas[this.preguntaActual];
  }

  get puedeAvanzar(): boolean {
    // No puede avanzar si no ha respondido la actual
    if (this.respuestaActual === null) return false;

    // Gatekeeper estricto (HU-007): si la opción tiene esGatekeeper=true,
    // mostramos un aviso pero permitimos avanzar (queda restringido a virtual).
    // Nota: según HU-007, "No cubiertos" en P1 NO bloquea el avance,
    // solo limita el catálogo posterior. Si quisieras bloqueo duro, cambia
    // este return por: return !opcion?.esGatekeeper;
    return true;
  }

  onSeleccionarOpcion(idx: number): void {
    this.respuestas[this.preguntaActual] = idx;
    this._guardarProgreso();
  }

  irAnterior(): void {
    if (this.esPrimera) return;
    this.preguntaActual--;
    this._guardarProgreso();
  }

  irSiguiente(): void {
    if (!this.puedeAvanzar) return;
    if (this.esUltima) {
      this.finalizar();
      return;
    }
    this.preguntaActual++;
    this._guardarProgreso();
  }

  // ── Finalizar ───────────────────────────────────────────────────────────────
  finalizar(): void {
    if (this.respuestas.some(r => r === null)) {
      this._snack.open('⚠️ Responde todas las preguntas antes de finalizar', '', {
        duration: 3000, panelClass: 'fbd-snack',
      });
      return;
    }

    const puntaje = calcularPuntaje(this.config, this.respuestas);
    const nivel   = calcularNivel(this.config, puntaje);

    if (!nivel) {
      this._snack.open('⚠️ No se pudo calcular el nivel. Contacta soporte.', '', {
        duration: 4000, panelClass: 'fbd-snack',
      });
      return;
    }

    guardarResultado({
      actor:   this.actor,
      puntaje,
      nivel:   nivel.nombre,
      perfil:  nivel.perfil,
      fecha:   new Date().toISOString(),
    });
    limpiarProgreso(this.actor);

    this._router.navigate(['/registro', this.actor, 'diagnostico', 'exito']);
  }

  // ── Persistencia ────────────────────────────────────────────────────────────
  private _guardarProgreso(): void {
    guardarProgreso({
      actor: this.actor,
      preguntaActual: this.preguntaActual,
      respuestas: this.respuestas,
      fechaUltimaModificacion: new Date().toISOString(),
    });
  }

  // ── Helpers de UI ───────────────────────────────────────────────────────────
  get tituloActor(): string {
    return this.config?.titulo ?? 'Diagnóstico de Madurez';
  }

  // Aviso de gatekeeper en pantalla (HU-007 P1: si elige "No cubiertos")
  get muestraAvisoGatekeeper(): boolean {
    if (this.actor !== 'empresa') return false;
    if (this.preguntaActual !== 0) return false;
    if (this.respuestaActual === null) return false;
    return !!this.pregunta.opciones[this.respuestaActual]?.esGatekeeper;
  }
}