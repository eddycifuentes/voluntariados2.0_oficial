// diagnostico-storage.ts
// Helper de persistencia en sessionStorage para "Guardar progreso parcial"
// Las respuestas se borran al cerrar la pestaña (decisión MVP).
// Cuando el back esté listo, este archivo se reemplaza por un service real.

import { DiagnosticoConfig } from './diagnostico.data';

export type TipoActor = 'organizacion' | 'empresa' | 'voluntario';

export interface EstadoDiagnostico {
  actor: TipoActor;
  preguntaActual: number;          // índice de pregunta visible actual (0-based)
  respuestas: (number | null)[];   // índice de la opción elegida en cada pregunta visible
  fechaUltimaModificacion: string; // ISO timestamp
}

export interface ResultadoDiagnostico {
  actor: TipoActor;
  puntaje: number;
  nivel: string;       // nombre del nivel
  perfil: string;      // descripción del nivel
  fecha: string;       // ISO timestamp
}

const KEY_PROGRESO  = (tipo: TipoActor) => `diagnostico:progreso:${tipo}`;
const KEY_RESULTADO = (tipo: TipoActor) => `diagnostico:resultado:${tipo}`;

// ─── Progreso parcial ────────────────────────────────────────────────────────

export function guardarProgreso(estado: EstadoDiagnostico): void {
  if (typeof sessionStorage === 'undefined') return;       // SSR-safe
  try {
    const payload = { ...estado, fechaUltimaModificacion: new Date().toISOString() };
    sessionStorage.setItem(KEY_PROGRESO(estado.actor), JSON.stringify(payload));
  } catch (e) {
    console.warn('[diagnostico-storage] No se pudo guardar progreso', e);
  }
}

export function cargarProgreso(actor: TipoActor): EstadoDiagnostico | null {
  if (typeof sessionStorage === 'undefined') return null;  // SSR-safe
  try {
    const raw = sessionStorage.getItem(KEY_PROGRESO(actor));
    return raw ? JSON.parse(raw) as EstadoDiagnostico : null;
  } catch {
    return null;
  }
}

export function limpiarProgreso(actor: TipoActor): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(KEY_PROGRESO(actor));
}

// ─── Resultado final ─────────────────────────────────────────────────────────

export function guardarResultado(resultado: ResultadoDiagnostico): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(KEY_RESULTADO(resultado.actor), JSON.stringify(resultado));
  } catch (e) {
    console.warn('[diagnostico-storage] No se pudo guardar resultado', e);
  }
}

export function cargarResultado(actor: TipoActor): ResultadoDiagnostico | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY_RESULTADO(actor));
    return raw ? JSON.parse(raw) as ResultadoDiagnostico : null;
  } catch {
    return null;
  }
}

// ─── Cálculo de puntaje ──────────────────────────────────────────────────────
// Recibe las respuestas del usuario sobre las preguntas visibles
// y devuelve el puntaje total (0-100).
// Las preguntas precalculadas se ignoran (vienen de IA externa según HU-005).

export function calcularPuntaje(
  config: DiagnosticoConfig,
  respuestas: (number | null)[],
): number {
  const preguntasVisibles = config.preguntas.filter(p => !p.precalculada);

  let total = 0;
  preguntasVisibles.forEach((preg, idx) => {
    const opcionElegida = respuestas[idx];
    if (opcionElegida === null || opcionElegida === undefined) return;
    const opcion = preg.opciones[opcionElegida];
    if (opcion) total += opcion.puntos;
  });

  // Redondea a 1 decimal y limita al puntaje máximo del config
  total = Math.round(total * 10) / 10;
  return Math.min(total, config.puntajeMaximo);
}