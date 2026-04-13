import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router, RouterModule } from '@angular/router';

import { getDepartamentos, getMunicipios } from './dane.data';

import {
  DIAGNOSTICO_ORGANIZACION,
  DIAGNOSTICO_EMPRESA,
  DIAGNOSTICO_VOLUNTARIO,
  DiagnosticoConfig,
  PreguntaDiagnostico,
  NivelMadurez,
  calcularNivel,
  ODS_LIST,
  HABILIDADES_VOLUNTARIO,
} from './diagnostico.data';

import { Component as NgComponent } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type EstadoDoc = 'sin_cargar' | 'pendiente' | 'verificando' | 'verificado' | 'rechazado';

export interface DocumentoState {
  nombre: string;
  vigencia: string;
  archivo: File | null;
  estado: EstadoDoc;
}

// ── Estado SARLAFT ────────────────────────────────────────────────────────────
export type EstadoSarlaft =
  | 'pendiente'        // Sin iniciar
  | 'consultando'      // En proceso (spinner)
  | 'sin_novedad'      // OK — puede avanzar
  | 'con_novedad';     // Hay coincidencia — queda en revisión admin

// ─── Pop-up voluntario no encontrado ─────────────────────────────────────────
@NgComponent({
  selector: 'app-voluntario-not-found-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-emoji">🚫</div>
      <h2 class="dialog-title">No encontrado en esta jornada</h2>
      <p class="dialog-message">
        Usted no figura en la base de esta jornada.<br>
        Contacte a su empresa para unirse a nuestro equipo de talentos y generar impacto.
      </p>
      <button mat-flat-button class="dialog-btn" (click)="close()">Entendido</button>
    </div>
  `,
  styles: [`
    .dialog-container { text-align: center; padding: 24px 32px; }
    .dialog-emoji { font-size: 48px; margin-bottom: 12px; }
    .dialog-title { font-size: 1.3rem; font-weight: 700; margin: 0 0 12px; color: #2c2c2c; }
    .dialog-message { color: #555; line-height: 1.6; margin-bottom: 24px; }
    .dialog-btn { background-color: #ff671b !important; color: white !important; border-radius: 20px !important; padding: 8px 32px !important; }
  `]
})
export class VoluntarioNotFoundDialogComponent {
  constructor(public dialogRef: MatDialogRef<VoluntarioNotFoundDialogComponent>) {}
  close() { this.dialogRef.close(); }
}

// ─── Pop-up "Completa tu perfil" ─────────────────────────────────────────────
@NgComponent({
  selector: 'app-completar-perfil-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-emoji">✏️</div>
      <h2 class="dialog-title">¡Completa tu perfil!</h2>
      <p class="dialog-message">
        Agrega información adicional para mejorar tu experiencia y conectar mejor con las organizaciones sociales.
      </p>
      <div class="dialog-actions">
        <button mat-stroked-button class="dialog-btn-secondary" [mat-dialog-close]="'omitir'">Ahora no</button>
        <button mat-flat-button class="dialog-btn" [mat-dialog-close]="'completar'">Completar perfil</button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container { text-align: center; padding: 28px 32px; max-width: 380px; }
    .dialog-emoji { font-size: 48px; margin-bottom: 12px; }
    .dialog-title { font-size: 1.3rem; font-weight: 700; margin: 0 0 12px; color: #1a1a2e; }
    .dialog-message { color: #6b6b80; line-height: 1.6; margin-bottom: 24px; font-size: 0.92rem; }
    .dialog-actions { display: flex; gap: 12px; justify-content: center; }
    .dialog-btn { background-color: #ff671b !important; color: white !important; border-radius: 20px !important; padding: 8px 24px !important; }
    .dialog-btn-secondary { border-color: #e0e0e8 !important; color: #6b6b80 !important; border-radius: 20px !important; padding: 8px 24px !important; }
  `]
})
export class CompletarPerfilDialogComponent {
  constructor(public dialogRef: MatDialogRef<CompletarPerfilDialogComponent>) {}
}

// ─── Componente principal ─────────────────────────────────────────────────────
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatCardModule, MatStepperModule,
    MatSelectModule, MatCheckboxModule,
    MatDialogModule, MatSnackBarModule, MatProgressBarModule,
    MatTabsModule, MatSlideToggleModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {

  @ViewChild('stepper') stepper!: MatStepper;

  // ── Selección de actor ─────────────────────────────────────────────────────
  selectedActor: string = '';
  actors = [
    { value: 'Organización Social', desc: 'Gestiona ofertas de voluntariado y recibe talento corporativo.' },
    { value: 'Empresa',             desc: 'Conecta a tu equipo con causas sociales de impacto.' },
    { value: 'Voluntario',          desc: 'Encuentra jornadas que se ajusten a tu perfil y disponibilidad.' },
  ];

  // ── Formularios por step ───────────────────────────────────────────────────
  step1BasicInfo!: FormGroup;
  step2Docs!:      FormGroup;
  step3Tyc!:       FormGroup;
  step4Diag!:      FormGroup;

  // ── DANE ───────────────────────────────────────────────────────────────────
  departamentos: string[] = getDepartamentos();
  municipios: string[] = [];

  // ── EPS ────────────────────────────────────────────────────────────────────
  epsList = [
    'Aliansalud EPS', 'Asmet Salud', 'Cajacopi Atlántico',
    'Capresoca EPS', 'Comfenalco Valle EPS', 'Compensar EPS',
    'EPS Familiar de Colombia', 'EPS Sanitas', 'EPS Sura',
    'Famisanar', 'Mutual SER', 'Nueva EPS', 'Salud Total EPS',
    'Salud Vida EPS', 'SOS', 'Unimec', 'Coosalud EPS'
  ];

  // ── Tipos de documento ─────────────────────────────────────────────────────
  tiposDoc = ['CC', 'CE', 'PA', 'TI', 'PEP'];

  // ── HU-004: Estado de documentos ──────────────────────────────────────────
  documentos: DocumentoState[] = [
    { nombre: 'RUT',                vigencia: 'Vigencia: menor a 30 días', archivo: null, estado: 'sin_cargar' },
    { nombre: 'Cámara de Comercio', vigencia: 'Vigencia: menor a 90 días', archivo: null, estado: 'sin_cargar' },
    { nombre: 'Estados Financieros',vigencia: 'Último año fiscal',         archivo: null, estado: 'sin_cargar' },
  ];

  // ── SARLAFT — Org y Empresa (nuevo) ───────────────────────────────────────
  sarlaftEstado: EstadoSarlaft = 'pendiente';
  sarlaftNombre: string = '';  // Nombre consultado (rep. legal o gestor)

  get sarlaftPuedeConsultar(): boolean {
    // Permite consultar solo si todos los docs están verificados
    return this.documentos.every(d => d.estado === 'verificado');
  }

  get sarlaftPuedeAvanzar(): boolean {
    return this.sarlaftEstado === 'sin_novedad';
  }

  iniciarConsultaSarlaft(): void {
    this.sarlaftNombre = this.step1BasicInfo.get('repNombre')?.value || 'el representante legal';
    // TODO: reemplazar con llamada real al API de listas restrictivas
    this.sarlaftEstado = 'sin_novedad';
  }

  resetSarlaft(): void {
    this.sarlaftEstado = 'pendiente';
    this.sarlaftNombre = '';
  }

  get algunDocumentoCargado(): boolean {
    return this.documentos.some(d => d.estado !== 'sin_cargar');
  }

  onArchivoSeleccionado(event: Event, idx: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this._snack.open('⚠️ Solo se permiten archivos PDF', '', { duration: 3000, panelClass: 'fbd-snack' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this._snack.open('⚠️ El archivo no puede superar 10MB', '', { duration: 3000, panelClass: 'fbd-snack' });
      return;
    }

    this.documentos[idx].archivo = file;
    this.documentos[idx].estado = 'verificado';

    // Resetear SARLAFT si se vuelve a cargar un documento
    this.resetSarlaft();
  }

  eliminarDocumento(idx: number) {
    this.documentos[idx].archivo = null;
    this.documentos[idx].estado = 'sin_cargar';
    // Si se elimina un doc, se resetea SARLAFT ya que los docs cambiaron
    this.resetSarlaft();
  }

  getEstadoLabel(estado: EstadoDoc): string {
    const labels: Record<EstadoDoc, string> = {
      sin_cargar:  'Sin cargar',
      pendiente:   '⏳ Pendiente',
      verificando: '🔍 Verificando...',
      verificado:  '✅ Verificado',
      rechazado:   '❌ Rechazado',
    };
    return labels[estado];
  }

  getEstadoClass(estado: EstadoDoc): string {
    const classes: Record<EstadoDoc, string> = {
      sin_cargar:  'estado-sin-cargar',
      pendiente:   'estado-pendiente',
      verificando: 'estado-verificando',
      verificado:  'estado-verificado',
      rechazado:   'estado-rechazado',
    };
    return classes[estado];
  }

  // ── Diagnósticos ──────────────────────────────────────────────────────────
  diagConfig: DiagnosticoConfig | null = null;
  diagPreguntaActual = 0;
  diagRespuestas: (number | number[] | null)[] = [];
  diagMultipleSeleccion: boolean[][] = [];
  diagMotivacionOtro = '';
  diagTalentoOtro = '';
  diagModalidadSeleccionada: 'virtual' | 'presencial' | null = null;
  diagCompletado = false;
  diagNivelResultado: NivelMadurez | null = null;
  diagPuntajeTotal = 0;

  readonly ODS_LIST = ODS_LIST;
  readonly HABILIDADES = HABILIDADES_VOLUNTARIO;

  constructor(
    private _fb: FormBuilder,
    private _dialog: MatDialog,
    private _snack: MatSnackBar,
    private _router: Router,
  ) {}

  ngOnInit() {
    this._initForms();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORMULARIOS
  // ─────────────────────────────────────────────────────────────────────────

  private _initForms() {
    this.step1BasicInfo = this._fb.group({
      tipoDoc:          ['CC'],
      nit:              [''],
      razonSocial:      [''],
      repNombre:        [''],
      repTipoDoc:       ['CC'],
      repDoc:           [''],
      repEmail:         [''],
      repCelular:       [''],
      gestorNombre:     [''],
      gestorCargo:      [''],
      gestorArea:       [''],
      gestorEmail:      [''],
      gestorCelular:    [''],
      fechaNacimiento:  [''],
      eps:              [''],
      departamento:     [''],
      municipio:        [''],
      email:            [''],
      celular:          [''],
    });

    this.step2Docs = this._fb.group({});

    this.step3Tyc = this._fb.group({
      aceptaTyc:   [false, Validators.requiredTrue],
      aceptaDatos: [false, Validators.requiredTrue],
    });

    this.step4Diag = this._fb.group({
      completado: [false, Validators.requiredTrue],
    });
  }

  private _resetFormulario() {
    this.step1BasicInfo.reset({
      tipoDoc: 'CC',
      nit: '', razonSocial: '',
      repNombre: '', repTipoDoc: 'CC', repDoc: '', repEmail: '', repCelular: '',
      gestorNombre: '', gestorCargo: '', gestorArea: '',
      gestorEmail: '', gestorCelular: '',
      fechaNacimiento: '', eps: '',
      departamento: '', municipio: '',
      email: '', celular: '',
    });
    this.step3Tyc.reset({ aceptaTyc: false, aceptaDatos: false });
    this.step4Diag.reset({ completado: false });
    this.municipios = [];

    if (this.stepper) {
      this.stepper.reset();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SELECCIÓN DE ACTOR
  // ─────────────────────────────────────────────────────────────────────────

  onActorSelect(actor: string) {
    this.selectedActor = actor;
    this._resetFormulario();
    this._actualizarValidadores();

    if (actor === 'Voluntario') {
      this.diagConfig = DIAGNOSTICO_VOLUNTARIO;
    } else if (actor === 'Empresa') {
      this.diagConfig = DIAGNOSTICO_EMPRESA;
    } else {
      this.diagConfig = DIAGNOSTICO_ORGANIZACION;
    }

    this._resetDiagnostico();
    this._resetDocumentos();
  }

  private _actualizarValidadores() {
    const c = this.step1BasicInfo.controls;

    Object.values(c).forEach(ctrl => ctrl.clearValidators());

    c['razonSocial'].setValidators([Validators.required]);
    c['nit'].setValidators([Validators.required]);

    if (this.selectedActor === 'Voluntario') {
      c['tipoDoc'].setValidators([Validators.required]);
      c['nit'].setValidators([Validators.required, Validators.pattern(/^\d{6,11}$/)]);
      c['fechaNacimiento'].setValidators([Validators.required]);
      c['eps'].setValidators([Validators.required]);
      c['departamento'].setValidators([Validators.required]);
      c['municipio'].setValidators([Validators.required]);
      c['email'].setValidators([Validators.required, Validators.email]);
      c['celular'].setValidators([Validators.required]);
    } else {
      c['nit'].setValidators([Validators.required, Validators.pattern(/^\d{9}$/)]);
      c['repNombre'].setValidators([Validators.required]);
      c['repTipoDoc'].setValidators([Validators.required]);
      c['repDoc'].setValidators([Validators.required]);
      c['repEmail'].setValidators([Validators.required, Validators.email]);
      c['repCelular'].setValidators([Validators.required]);
      c['gestorNombre'].setValidators([Validators.required]);
      c['gestorEmail'].setValidators([Validators.required, Validators.email]);
      c['gestorCelular'].setValidators([Validators.required]);
      c['email'].clearValidators();
      c['celular'].clearValidators();
    }

    Object.values(c).forEach(ctrl => ctrl.updateValueAndValidity());
  }

  private _resetDocumentos() {
    this.documentos = [
      { nombre: 'RUT',                vigencia: 'Vigencia: menor a 30 días', archivo: null, estado: 'sin_cargar' },
      { nombre: 'Cámara de Comercio', vigencia: 'Vigencia: menor a 90 días', archivo: null, estado: 'sin_cargar' },
      { nombre: 'Estados Financieros',vigencia: 'Último año fiscal',         archivo: null, estado: 'sin_cargar' },
    ];
    this.resetSarlaft();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DANE
  // ─────────────────────────────────────────────────────────────────────────

  onDepartamentoChange() {
    const depto = this.step1BasicInfo.get('departamento')?.value;
    this.municipios = getMunicipios(depto).sort((a, b) => a.localeCompare(b, 'es'));
    this.step1BasicInfo.get('municipio')?.setValue('');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VOLUNTARIO — verificación en base (simulada)
  // ─────────────────────────────────────────────────────────────────────────

  verificarVoluntario() {
    const doc = this.step1BasicInfo.get('nit')?.value;
    if (!doc || doc.length < 6) return;
    const encontrado = !doc.endsWith('0');
    if (!encontrado) {
      this._dialog.open(VoluntarioNotFoundDialogComponent, {
        width: '420px',
        panelClass: 'fbd-dialog',
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GUARDADO AUTOMÁTICO
  // ─────────────────────────────────────────────────────────────────────────

  guardarProgreso() {
    // En producción: llamada al API para persistir el estado actual
    console.log('Progreso guardado:', {
      actor: this.selectedActor,
      step1: this.step1BasicInfo.value,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DIAGNÓSTICO
  // ─────────────────────────────────────────────────────────────────────────

  private _resetDiagnostico() {
    this.diagPreguntaActual = 0;
    this.diagCompletado = false;
    this.diagNivelResultado = null;
    this.diagPuntajeTotal = 0;
    this.diagMotivacionOtro = '';
    this.diagTalentoOtro = '';
    this.diagModalidadSeleccionada = null;

    if (this.diagConfig) {
      this.diagRespuestas = this.diagConfig.preguntas.map(() => null);
      this.diagMultipleSeleccion = this.diagConfig.preguntas.map(p =>
        p.opciones.map(() => false)
      );
    }
  }

  get diagPregunta(): PreguntaDiagnostico | null {
    return this.diagConfig?.preguntas[this.diagPreguntaActual] ?? null;
  }

  get diagProgresoPct(): number {
    if (!this.diagConfig) return 0;
    return Math.round((this.diagPreguntaActual / this.diagConfig.preguntas.length) * 100);
  }

  get diagPuedeSiguiente(): boolean {
    if (!this.diagPregunta) return false;
    const resp = this.diagRespuestas[this.diagPreguntaActual];
    if (this.diagPregunta.tipoSeleccion === 'unica') return resp !== null;
    return this.diagMultipleSeleccion[this.diagPreguntaActual]?.some(v => v) ?? false;
  }

  seleccionarOpcion(idx: number) {
    this.diagRespuestas[this.diagPreguntaActual] = idx;
  }

  toggleMultiple(pregIdx: number, opIdx: number) {
    const pregunta = this.diagConfig!.preguntas[pregIdx];
    const max = pregunta.maxOpciones ?? 99;
    const sel = this.diagMultipleSeleccion[pregIdx];
    const yaSeleccionados = sel.filter(v => v).length;
    if (!sel[opIdx] && yaSeleccionados >= max) return;
    sel[opIdx] = !sel[opIdx];
  }

  diagAnterior() {
    if (this.diagPreguntaActual > 0) this.diagPreguntaActual--;
  }

  diagSiguiente() {
    if (!this.diagPuedeSiguiente) return;
    const total = this.diagConfig!.preguntas.length;
    if (this.diagPreguntaActual < total - 1) {
      this.diagPreguntaActual++;
    } else {
      this.finalizarDiagnostico();
    }
  }

  finalizarDiagnostico() {
    if (!this.diagConfig) return;
    let puntaje = 0;
    this.diagConfig.preguntas.forEach((preg, pi) => {
      if (preg.tipoSeleccion === 'unica') {
        const idx = this.diagRespuestas[pi] as number | null;
        if (idx !== null) puntaje += preg.opciones[idx].puntos;
      } else {
        this.diagMultipleSeleccion[pi].forEach((sel, oi) => {
          if (sel) puntaje += preg.opciones[oi].puntos;
        });
      }
    });
    this.diagPuntajeTotal = puntaje;
    this.diagNivelResultado = calcularNivel(this.diagConfig, puntaje);
    this.diagCompletado = true;
    this.step4Diag.get('completado')?.setValue(true);
  }

  mostrarPerfil = false;

  irAlPerfil() {
    if (this.esVoluntario) {
      this.mostrarPerfil = true;
      setTimeout(() => {
        const ref = this._dialog.open(CompletarPerfilDialogComponent, {
          width: '420px',
          panelClass: 'fbd-dialog',
          disableClose: false,
        });
        ref.afterClosed().subscribe(result => {
          if (result === 'completar') {
            this.tabPerfilActiva = 1;
          }
        });
      }, 300);
    } else if (this.esOrganizacion) {
      window.location.href = '/perfil/organizacion';
    } else if (this.esEmpresa) {
      window.location.href = '/perfil/empresa';
    }
  }

  tabPerfilActiva = 0;
  togglesPerfil = {
    foto: false, cargo: false, restricciones: false, educacion: false, genero: false,
  };
  fotoPreviewPerfil = '';
  guardadoMsgPerfil = '';

  datosNoEditables = {
    tipoDoc: 'CC', numDoc: '1103938', nombres: 'Juan Pérez García',
    fechaNac: '1990-05-12', empresa: 'Davivienda S.A.', arl: 'Sura ARL',
  };

  epsList2 = [
    'Aliansalud EPS','Asmet Salud','Cajacopi Atlántico','Capresoca EPS',
    'Comfenalco Valle EPS','Compensar EPS','EPS Familiar de Colombia',
    'EPS Sanitas','EPS Sura','Famisanar','Mutual SER','Nueva EPS',
    'Salud Total EPS','Salud Vida EPS','SOS','Unimec','Coosalud EPS',
  ];

  nivelesEducativos = ['Secundaria','Técnico','Tecnólogo','Universitario','Especialista','Máster','Doctorado'];
  generosOpciones   = ['Masculino','Femenino','Otro','Prefiero no decir'];

  datosDiagnostico = {
    nivel: 'Bronce', puntaje: 85, odsTop3: [3, 4, 10],
    habilidad: 'Salud y Bienestar',
    disponibilidad: 'Lunes y miércoles — Mañana (Virtual)',
    motivacion: 'Contribuir al desarrollo educativo de comunidades vulnerables',
  };

  get odsTop3Items() {
    return ODS_LIST.filter(o => this.datosDiagnostico.odsTop3.includes(o.id));
  }

  onFotoSeleccionadaPerfil(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { this.fotoPreviewPerfil = reader.result as string; };
    reader.readAsDataURL(file);
  }

  onTogglePerfilChange() {
    this.guardadoMsgPerfil = '✓ Cambio guardado';
    setTimeout(() => { this.guardadoMsgPerfil = ''; }, 2000);
  }

  guardarCambiosPerfil() {
    this._snack.open('✅ Información actualizada', '', { duration: 3000, panelClass: 'fbd-snack' });
  }

  publicarPerfil() {
    this._snack.open('🚀 ¡Perfil publicado en el Marketplace!', '', { duration: 3500, panelClass: 'fbd-snack' });
  }

  volverAlInicio() {
    this.mostrarPerfil = false;
    this.selectedActor = '';
    this._resetFormulario();
    this._resetDiagnostico();
    this._resetDocumentos();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LABELS DINÁMICOS DEL STEPPER
  // ─────────────────────────────────────────────────────────────────────────

  get stepLabel2(): string {
    return this.selectedActor === 'Voluntario' ? 'Tratamiento y TyC' : 'Documentos y Validación';
  }

  get stepLabel3(): string {
    return this.selectedActor === 'Voluntario' ? 'Listas Restrictivas' : 'Tratamiento y TyC';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  get esVoluntario(): boolean   { return this.selectedActor === 'Voluntario'; }
  get esEmpresa(): boolean      { return this.selectedActor === 'Empresa'; }
  get esOrganizacion(): boolean { return this.selectedActor === 'Organización Social'; }

  getFieldError(form: FormGroup, field: string): string {
    const ctrl = form.get(field);
    if (!ctrl?.invalid || !ctrl.touched) return '';
    if (ctrl.errors?.['required']) return 'Este campo es obligatorio';
    if (ctrl.errors?.['email'])    return 'Ingresa un correo válido';
    if (ctrl.errors?.['pattern'])  return field === 'nit'
      ? (this.esVoluntario ? 'Ingresa entre 6 y 11 dígitos' : 'El NIT debe tener exactamente 9 dígitos')
      : 'Formato inválido';
    return '';
  }

  get arlNoAceptada(): boolean {
    if (!this.esEmpresa || !this.diagConfig) return false;
    return this.diagRespuestas[0] === null;
  }
}