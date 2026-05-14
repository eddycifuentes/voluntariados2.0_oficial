import { Component, OnInit, ViewChild, Inject } from '@angular/core';
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
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
  getPreguntasVisibles,
  ODS_LIST,
  HABILIDADES_VOLUNTARIO,
  getEmojiNivel,
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
  intentos: number;
}

// ── Estado SARLAFT ────────────────────────────────────────────────────────────
export type EstadoSarlaft =
  | 'pendiente'
  | 'consultando'
  | 'sin_novedad'
  | 'con_novedad';

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
        Agrega información adicional para mejorar tu experiencia
        y conectar mejor con las organizaciones sociales.
      </p>
      <div class="dialog-actions">
        <button mat-stroked-button class="dialog-btn-secondary"
                [mat-dialog-close]="'omitir'">Ahora no</button>
        <button mat-flat-button class="dialog-btn"
                [mat-dialog-close]="'completar'">Completar perfil</button>
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

  sarlaftPendiente: boolean = true;
  mostrarBotonSarlaft: boolean = false;
  getEmojiNivel = getEmojiNivel;
  
  @ViewChild('stepper') stepper!: MatStepper;

  // ── Selección de actor ─────────────────────────────────────────────────────
  selectedActor: any = '';
  actors = [
    { value: 'Organización Social', desc: 'Gestiona ofertas de voluntariado y recibe talento corporativo.' },
    { value: 'Empresa',             desc: 'Conecta a tu equipo con causas sociales de impacto.' },
    { value: 'Voluntario',          desc: 'Encuentra jornadas que se ajusten a tu perfil y disponibilidad.' },
  ];

  // ── Formularios ────────────────────────────────────────────────────────────
  step1BasicInfo!: FormGroup;
  step2Docs!:      FormGroup;
  step3Tyc!:       FormGroup;
  step4Diag!:      FormGroup;
  credencialesForm!: FormGroup;

  // ── Navegación ─────────────────────────────────────────────────────────────
  stepActual: number = 1;
  mostrarPerfil: boolean = false;
  mostrarCredenciales: boolean = false;
  mostrarContrasena: boolean = false;

  // ── DANE ───────────────────────────────────────────────────────────────────
  departamentos: string[] = getDepartamentos();
  municipios: string[] = [];

  // ── EPS ────────────────────────────────────────────────────────────────────
  epsList = [
    'Aliansalud EPS', 'Asmet Salud', 'Cajacopi Atlántico',
    'Capresoca EPS', 'Comfenalco Valle EPS', 'Compensar EPS',
    'EPS Familiar de Colombia', 'EPS Sanitas', 'EPS Sura',
    'Famisanar', 'Mutual SER', 'Nueva EPS', 'Salud Total EPS',
    'Salud Vida EPS', 'SOS', 'Unimec', 'Coosalud EPS',
  ];

  epsList2 = [
    'Aliansalud EPS', 'Asmet Salud', 'Cajacopi Atlántico', 'Capresoca EPS',
    'Comfenalco Valle EPS', 'Compensar EPS', 'EPS Familiar de Colombia',
    'EPS Sanitas', 'EPS Sura', 'Famisanar', 'Mutual SER', 'Nueva EPS',
    'Salud Total EPS', 'Salud Vida EPS', 'SOS', 'Unimec', 'Coosalud EPS',
  ];

  // ── Tipos de documento ─────────────────────────────────────────────────────
  tiposDoc = ['CC', 'CE', 'PA', 'TI', 'PEP'];

  // ── Documentos ─────────────────────────────────────────────────────────────
  documentos: DocumentoState[] = [
    { nombre: 'RUT',                 vigencia: 'Vigencia: menor a 30 días', archivo: null, estado: 'sin_cargar', intentos: 0 },
    { nombre: 'Cámara de Comercio',  vigencia: 'Vigencia: menor a 90 días', archivo: null, estado: 'sin_cargar', intentos: 0 },
    { nombre: 'Estados Financieros', vigencia: 'Último año fiscal',          archivo: null, estado: 'sin_cargar', intentos: 0 },
  ];

  // ── SARLAFT ────────────────────────────────────────────────────────────────
  sarlaftEstado: EstadoSarlaft = 'pendiente';
  sarlaftNombre: string = '';

  get sarlaftPuedeConsultar(): boolean {
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
      this._snack.open('⚠️ Solo se permiten archivos PDF', '', { duration: 3000 });
      return;
    }

    const doc = this.documentos[idx];
    doc.archivo = file;
    doc.estado = 'verificado'; // Estado exitoso según HU-005 [cite: 168]
    doc.intentos += 1;

    this._snack.open(`✅ ${doc.nombre} cargado y verificado`, 'CERRAR', { duration: 2000 });

    // LLAMADA CRÍTICA PARA DESBLOQUEAR EL FLUJO
    this.verificarProgresoDocumentos(); 
    this.resetSarlaft();
  }

  eliminarDocumento(idx: number): void {
    // 1. Obtenemos el documento del listado
    const doc = this.documentos[idx];
    
    // 2. Reseteamos sus valores al estado inicial (HU-005)
    doc.archivo = null;
    doc.estado = 'sin_cargar';
    
    // 3. Notificamos al usuario
    this._snack.open(`🗑️ Se ha quitado el archivo de ${doc.nombre}`, 'OK', {
      duration: 2000
    });

    // 4. Actualizamos el progreso para que el botón "Siguiente" se bloquee si era el último
    this.verificarProgresoDocumentos();
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

  getEstadoLabel(estado: EstadoDoc): string {
    // Etiquetas de estado requeridas para la traza del proceso (HU-005) [cite: 165]
    const labels: Record<EstadoDoc, string> = {
      sin_cargar:  'Sin cargar',
      pendiente:   'Pendiente',
      verificando: 'Verificando...',
      verificado:  'Verificado',
      rechazado:   'Documento incorrecto', // Mensaje personalizado según HU-005 
    };
    return labels[estado];
  }

  // ── Diagnósticos ───────────────────────────────────────────────────────────
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
  diagPreguntasVisibles: PreguntaDiagnostico[] = [];

  readonly ODS_LIST = ODS_LIST;
  readonly HABILIDADES = HABILIDADES_VOLUNTARIO;

  // ── Perfil ─────────────────────────────────────────────────────────────────
  tabPerfilActiva = 0;
  togglesPerfil = {
    foto: false, 
    cargo: false,
    restricciones: false,
    educacion: false,
    genero: false,
    sitioWeb: false,
    redSocial: false,
  };
  fotoPreviewPerfil = '';
  guardadoMsgPerfil = '';

  datosNoEditables = {
    tipoDoc: 'CC', numDoc: '1103938', nombres: 'Juan Pérez García',
    fechaNac: '1990-05-12', empresa: 'Davivienda S.A.', arl: 'Sura ARL',
  };

  nivelesEducativos = ['Secundaria', 'Técnico', 'Tecnólogo', 'Universitario', 'Especialista', 'Máster', 'Doctorado'];
  generosOpciones   = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'];

  datosDiagnostico = {
    nivel: 'Especialista', puntaje: 60, odsTop3: [3, 4, 10],
    habilidad: 'Salud y Bienestar',
    disponibilidad: 'Lunes y miércoles — Mañana (Virtual)',
    motivacion: 'Contribuir al desarrollo educativo de comunidades vulnerables',
  };

  get odsTop3Items() {
    return ODS_LIST.filter(o => this.datosDiagnostico.odsTop3.includes(o.id));
  }

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
      tipoDoc:         ['CC'],
      nit:             [''],
      razonSocial:     [''],
      repNombre:       [''],
      repTipoDoc:      ['CC'],
      repDoc:          [''],
      repEmail:        [''],
      repCelular:      [''],
      gestorNombre:    [''],
      gestorTipoDoc:   ['CC'],
      gestorDoc:       [''],
      gestorCargo:     [''],
      gestorArea:      [''],
      gestorEmail:     [''],
      gestorCelular:   [''],
      fechaNacimiento: [''],
      eps:             [''],
      departamento:    [''],
      municipio:       [''],
      email:           [''],
      celular:         [''],
    });

    this.step2Docs = this._fb.group({});

    this.step3Tyc = this._fb.group({
      aceptaTyc:   [false, Validators.requiredTrue],
      aceptaDatos: [false, Validators.requiredTrue],
    });

    this.step4Diag = this._fb.group({
      completado: [false, Validators.requiredTrue],
    });

    this.credencialesForm = this._fb.group({
      usuario:    ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.maxLength(8)]],
    });

    // AJUSTE ÉPICA 1 (HU-001/002/003): Guardado automático por bloques en localStorage
    this.step1BasicInfo.valueChanges.subscribe(val => {
      if (this.selectedActor) {
        localStorage.setItem(`fbd_onboarding_${this.selectedActor}`, JSON.stringify(val));
      }
    });
  }

  private _resetFormulario() {
    this.step1BasicInfo.reset({
      tipoDoc: 'CC', nit: '', razonSocial: '',
      repNombre: '', repTipoDoc: 'CC', repDoc: '', repEmail: '', repCelular: '',
      gestorNombre: '', gestorTipoDoc: 'CC', gestorDoc: '', gestorCargo: '',
      gestorArea: '', gestorEmail: '', gestorCelular: '',
      fechaNacimiento: '', eps: '',
      departamento: '', municipio: '',
      email: '', celular: '',
    });
    this.step3Tyc.reset({ aceptaTyc: false, aceptaDatos: false });
    this.step4Diag.reset({ completado: false });
    this.credencialesForm.reset({ usuario: '', contrasena: '' });
    this.municipios = [];
    this.stepActual = 1;
    this.mostrarCredenciales = false;
    this.mostrarContrasena = false;

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

    // AJUSTE ÉPICA 1: Recuperar progreso previo si existe (Criterio HU-001/2/3)
    const guardado = localStorage.getItem(`fbd_onboarding_${this.selectedActor}`);
    if (guardado) {
      this.step1BasicInfo.patchValue(JSON.parse(guardado));
      this._snack.open('✓ Progreso de registro recuperado', '', { duration: 2000 });
    }

    if (actor === 'Voluntario') {
      this.diagConfig = DIAGNOSTICO_VOLUNTARIO;
    } else if (actor === 'Empresa') {
      this.diagConfig = DIAGNOSTICO_EMPRESA;
    } else {
      this.diagConfig = DIAGNOSTICO_ORGANIZACION;
    }

    this.diagPreguntasVisibles = getPreguntasVisibles(this.diagConfig);
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
      // AJUSTE ÉPICA 1: Validación estricta de NIT 9 dígitos (HU-001/002)
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
      { nombre: 'RUT',                 vigencia: 'Vigencia: menor a 30 días', archivo: null, estado: 'sin_cargar', intentos: 0 },
      { nombre: 'Cámara de Comercio',  vigencia: 'Vigencia: menor a 90 días', archivo: null, estado: 'sin_cargar', intentos: 0 },
    ];
    // Solo la ONG sube Estados Financieros (HU-001)
    if (this.esOrganizacion) {
      this.documentos.push({ nombre: 'Estados Financieros', vigencia: 'Último año fiscal', archivo: null, estado: 'sin_cargar', intentos: 0 });
    }
    this.resetSarlaft();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REGISTRO — Continuar y Credenciales
  // ─────────────────────────────────────────────────────────────────────────

  onContinuarRegistro(): void {
    this.mostrarCredenciales = true;
  }

    onAsignarContrasena(): void {
    this._dialog.open(GenericDialogComponent, {
      width: '450px',
      disableClose: true,
      data: {
        emoji: '🌟',
        titulo: '¡Registro Exitoso!',
        mensaje: 'Gracias, hemos guardado tus datos. Bienvenido a este espacio de conexión. <br><br><b>Tus credenciales se crearon con éxito.</b>',
        botonText: 'Ir a Cargue de Documentos'
      }
    }).afterClosed().subscribe(() => {
      // 1. APAGAMOS la pantalla de credenciales para que el HTML muestre el Stepper (HU-001/002/003)
      this.mostrarCredenciales = false; 
      
      // 2. ASEGURAMOS que el paso actual sea el 2 (Cargue de Documentos - HU-005)
      this.stepActual = 2;

      // 3. MOVEMOS el stepper físicamente al paso de documentos
      setTimeout(() => { 
        if (this.stepper) {
          this.stepper.selectedIndex = 1; // El índice 1 es el segundo paso
        }
      }, 100);
    });
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
    if (this.selectedActor) {
      localStorage.setItem(`fbd_onboarding_${this.selectedActor}`, JSON.stringify(this.step1BasicInfo.value));
    }
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
      this.diagPreguntasVisibles = getPreguntasVisibles(this.diagConfig);
      this.diagRespuestas = this.diagPreguntasVisibles.map(() => null);
      this.diagMultipleSeleccion = this.diagPreguntasVisibles.map(p =>
        p.opciones.map(() => false)
      );
    }
  }

  get diagPregunta(): PreguntaDiagnostico | null {
    return this.diagPreguntasVisibles[this.diagPreguntaActual] ?? null;
  }

  get diagProgresoPct(): number {
    if (!this.diagPreguntasVisibles.length) return 0;
    return Math.round((this.diagPreguntaActual / this.diagPreguntasVisibles.length) * 100);
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
    const pregunta = this.diagPreguntasVisibles[pregIdx];
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
    const total = this.diagPreguntasVisibles.length;
    if (this.diagPreguntaActual < total - 1) {
      this.diagPreguntaActual++;
    } else {
      this.finalizarDiagnostico();
    }
  }

  finalizarDiagnostico() {
    if (!this.diagConfig) return;
    let puntaje = 0;
    this.diagPreguntasVisibles.forEach((preg, pi) => {
      if (preg.tipoSeleccion === 'unica') {
        const idx = this.diagRespuestas[pi] as number | null;
        if (idx !== null) puntaje += preg.opciones[idx].puntos;
      } else {
        this.diagMultipleSeleccion[pi].forEach((sel, oi) => {
          if (sel) puntaje += preg.opciones[oi].puntos;
        });
      }
    });
    this.diagPuntajeTotal = Math.round(puntaje);
    this.diagNivelResultado = calcularNivel(this.diagConfig, this.diagPuntajeTotal);
    this.diagCompletado = true;
    this.step4Diag.get('completado')?.setValue(true);
  }

  irAlPerfil() {
    // HU-009, HU-010, HU-011: Gestión de perfil mediante pestañas
    this.mostrarPerfil = true; 

    // Lanzamos el pop-up de bienvenida/completar perfil (Criterio HU-009, 010, 011)
    setTimeout(() => {
      const mensaje = this.esVoluntario 
        ? 'Completa tu perfil para mejorar experiencia' 
        : 'Complete su perfil para conectar con empresas aliadas';

      const ref = this._dialog.open(CompletarPerfilDialogComponent, {
        width: '420px',
        panelClass: 'fbd-dialog',
        data: { mensaje: mensaje } 
      });

      ref.afterClosed().subscribe(result => {
        if (result === 'completar') {
          this.tabPerfilActiva = 1; // Lleva a la pestaña de Perfil Público
        }
      });
    }, 300);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PERFIL
  // ─────────────────────────────────────────────────────────────────────────

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

  // Labels dinámicos (compatibilidad)
  get stepLabel2(): string {
    return this.esVoluntario ? 'Diagnóstico' : 'Documentos';
  }

  get stepLabel3(): string {
    return 'Diagnóstico';
  }

  // ── VALIDACIÓN DE FLUJO (HU-005) ──────────────────────────────────────────
  
  verificarProgresoDocumentos(): void {
    const self = this as any;
    const docs = self.documentos || [];
    
    // Verifica si todos están en 'verificado' [cite: 168]
    const todosListos = docs.length > 0 && docs.every((d: any) => d.estado === 'verificado');

    if (todosListos) {
      // Habilitamos la validación Sarlaft (HU-005) [cite: 172]
      self.sarlaftPendiente = false;
      self.mostrarBotonSarlaft = true;
      
      if (self._snack) {
        self._snack.open('✅ Documentación validada. Iniciando SARLAFT...', 'OK', { 
          duration: 3000 
        });
      }
    }
  }
}
@Component({
  selector: 'app-generic-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, CommonModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-emoji">{{ data.emoji }}</div>
      <h2 class="dialog-title">{{ data.titulo }}</h2>
      <p class="dialog-message" [innerHTML]="data.mensaje"></p>
      <button mat-flat-button class="dialog-btn" [mat-dialog-close]="true">
        {{ data.botonText || 'Continuar' }}
      </button>
    </div>
  `,
  styles: [`
    .dialog-container { text-align: center; padding: 30px; max-width: 400px; font-family: 'Lexend', sans-serif; }
    .dialog-emoji { font-size: 60px; margin-bottom: 10px; }
    .dialog-title { color: #1a1a2e; font-weight: 700; font-size: 24px; margin-bottom: 15px; }
    .dialog-message { color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 25px; }
    .dialog-btn { background-color: #ff671b !important; color: white !important; border-radius: 25px !important; padding: 8px 35px !important; font-weight: 600; }
  `]
})
export class GenericDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}