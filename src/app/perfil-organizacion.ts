import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectorArchivosComponent } from './selector-archivos';
import { UploadService } from './upload.service';
import {
  FormsModule, ReactiveFormsModule,
  FormBuilder, FormGroup, Validators,
} from '@angular/forms';
import { MatTabsModule }        from '@angular/material/tabs';
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatInputModule }       from '@angular/material/input';
import { MatSelectModule }      from '@angular/material/select';
import { MatButtonModule }      from '@angular/material/button';
import { MatCardModule }        from '@angular/material/card';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule }    from '@angular/material/checkbox';
import { MatIconModule }        from '@angular/material/icon';
import { MatTooltipModule }     from '@angular/material/tooltip';
import { getDepartamentos, getMunicipios } from './dane.data';
import { ODS_LIST } from './diagnostico.data';
import { cargarResultado } from './diagnostico-storage';
import { PersonaService } from './persona.service';

// ─── Pop-up "Completa tu perfil" ─────────────────────────────────────────────
@Component({
  selector: 'app-completar-org-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-emoji">✏️</div>
      <h2 class="dialog-title">¡Completa tu perfil!</h2>
      <p class="dialog-message">
        Agrega la información de tu organización para conectar con empresas
        aliadas y voluntarios en el Marketplace.
      </p>
      <div class="dialog-actions">
        <button mat-stroked-button class="dialog-btn-secondary" (click)="omitir()">Ahora no</button>
        <button mat-flat-button class="dialog-btn" (click)="completar()">Completar perfil</button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container  { text-align:center; padding:28px 32px; max-width:380px; }
    .dialog-emoji      { font-size:48px; margin-bottom:12px; }
    .dialog-title      { font-size:1.3rem; font-weight:700; margin:0 0 12px; color:#1a1a2e; }
    .dialog-message    { color:#6b6b80; line-height:1.6; margin-bottom:24px; font-size:0.92rem; }
    .dialog-actions    { display:flex; gap:12px; justify-content:center; }
    .dialog-btn        { background-color:#ff671b !important; color:white !important; border-radius:20px !important; padding:8px 24px !important; }
    .dialog-btn-secondary { border-color:#e0e0e8 !important; color:#6b6b80 !important; border-radius:20px !important; padding:8px 24px !important; }
  `],
})
export class CompletarOrgDialogComponent {
  constructor(public dialogRef: MatDialogRef<CompletarOrgDialogComponent>) {}
  completar() { this.dialogRef.close('completar'); }
  omitir()    { this.dialogRef.close('omitir'); }
}

// ─── Interfaz alianza ─────────────────────────────────────────────────────────
export interface Alianza {
  nombre:   string;
  objeto:   string;
  fechaInicio: string;
  fechaFin:    string;
  vigente:     boolean;
}

// ─── Componente principal ─────────────────────────────────────────────────────
@Component({
  selector: 'app-perfil-organizacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    SelectorArchivosComponent
    ],
  templateUrl: './perfil-organizacion.html',
  styleUrl:    './perfil-organizacion.css',
})
export class PerfilOrganizacionComponent implements OnInit {

  // --- Variables para Cumplimiento Legal (HU-004) ---
  aceptaTerminos: boolean = false;
  aceptaHabeasData: boolean = false;

  tabActiva   = 0;
  guardadoMsg = '';
  logoPreview = '';

  datosNoEditables = {
    nit:        '900123456',
    razonSocial: 'Fundación Sembrando Futuro',
  };

  // Datos del diagnóstico — niveles ALINEADOS con HU-006 (v2.0):
  // Emergente (0-40) / Consolidada (41-70) / Partner Estratégica (71-100)
  // Estos valores se sobrescriben en ngOnInit() si hay un resultado guardado.
  datosDiagnostico = {
    nivel:   'Consolidada',
    puntaje: 58,
  };

  readonly ODS_LIST = ODS_LIST;
  odsSeleccionados: number[] = [];

  toggles = {
    paginaWeb:  false,
    redSocial:  false,
    alianzas:   false,
  };

  formTab1!: FormGroup;
  formTab2!: FormGroup;

  departamentos: string[] = getDepartamentos();
  municipiosDisponibles: string[] = [];

  tiposOrg = [
    'Fundación', 'Corporación', 'Asociación',
    'Cooperativa', 'Entidad Religiosa', 'Otra',
  ];

  alianzas: Alianza[] = [];

  coberturaSeleccionada: string[] = [];

  constructor(
    private _fb:     FormBuilder,
    private _dialog: MatDialog,
    private _snack:  MatSnackBar,
    private _personaService: PersonaService,
    private _uploadService: UploadService,
  ) {}

  ngOnInit() {
    this._initForms();
    this._cargarResultadoDiagnostico();
    this._mostrarPopup();
  }

private _initForms() {
  this.formTab1 = this._fb.group({
    // --- BLOQUE 1: Identificación (HU-001) ---
    nit: ['', [
      Validators.required, 
      Validators.pattern('^[0-9]{9}$'), // Validación estricta: solo 9 números
      Validators.minLength(9),
      Validators.maxLength(9)
    ]],
    razonSocial: ['', Validators.required],

    // --- BLOQUE 2: Datos representante legal ---
    repNombre:    ['', Validators.required],
    repCorreo:    ['', [Validators.required, Validators.email]],
    repCelular:   ['', Validators.required],

    // --- BLOQUE 3: Datos gestor ---
    gestorNombre: ['', Validators.required],
    gestorCargo:  ['', Validators.required],
    gestorArea:   ['', Validators.required],
    gestorCorreo: ['', [Validators.required, Validators.email]],
    gestorCelular:['', Validators.required],
  });

  this.formTab2 = this._fb.group({
    coberturaDeptos: [[] as string[]],
    tipoOrg:         ['', Validators.required],
    paginaWeb:       [''],
    redSocial:       [''],
  });

  this.municipiosDisponibles = [];
  this.odsSeleccionados = []; // Lo dejamos vacío para que el usuario elija
}

  /** Lee el resultado real del diagnóstico si existe en sessionStorage. */
  private _cargarResultadoDiagnostico() {
    const resultado = cargarResultado('organizacion');
    if (resultado) {
      this.datosDiagnostico.nivel   = resultado.nivel;
      this.datosDiagnostico.puntaje = resultado.puntaje;
    }
  }

  private _mostrarPopup() {
    setTimeout(() => {
      const ref = this._dialog.open(CompletarOrgDialogComponent, {
        width: '420px',
        panelClass: 'fbd-dialog',
        disableClose: true,
      });
      ref.afterClosed().subscribe(result => {
        if (result === 'completar') this.tabActiva = 1;
      });
    }, 400);
  }

  // ── ODS: toggle selección (máx 3) ────────────────────────────────────────
  toggleOds(id: number) {
    const idx = this.odsSeleccionados.indexOf(id);
    if (idx >= 0) {
      this.odsSeleccionados.splice(idx, 1);
    } else {
      if (this.odsSeleccionados.length >= 3) {
        this._snack.open('Máximo 3 ODS permitidos', '', { duration: 2000, panelClass: 'fbd-snack' });
        return;
      }
      this.odsSeleccionados.push(id);
    }
    this._mostrarGuardado();
  }

  odsSeleccionado(id: number): boolean {
    return this.odsSeleccionados.includes(id);
  }

  get odsTop3Items() {
    return this.ODS_LIST.filter(o => this.odsSeleccionados.includes(o.id));
  }

  // ── Logo ──────────────────────────────────────────────────────────────────
  onLogoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    if (!file.type.includes('png')) {
      this._snack.open('⚠️ Solo se acepta formato PNG', '', { duration: 3000, panelClass: 'fbd-snack' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { this.logoPreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  // ── Alianzas ──────────────────────────────────────────────────────────────
  get puedeAgregarAlianza(): boolean { return this.alianzas.length < 4; }

  agregarAlianza() {
    if (!this.puedeAgregarAlianza) return;
    this.alianzas.push({ nombre: '', objeto: '', fechaInicio: '', fechaFin: '', vigente: false });
  }

  eliminarAlianza(i: number) {
    this.alianzas.splice(i, 1);
  }

  // ── Cobertura DANE ────────────────────────────────────────────────────────
  agregarCobertura(municipio: string) {
    if (municipio && !this.coberturaSeleccionada.includes(municipio)) {
      this.coberturaSeleccionada.push(municipio);
      this._mostrarGuardado();
    }
  }

  quitarCobertura(m: string) {
    this.coberturaSeleccionada = this.coberturaSeleccionada.filter(x => x !== m);
    this._mostrarGuardado();
  }

  onDeptoCobertura(depto: string) {
    this.municipiosDisponibles = getMunicipios(depto).sort((a, b) => a.localeCompare(b, 'es'));
  }

  // ── Toggles ───────────────────────────────────────────────────────────────
  onToggleChange(_campo: string) { this._mostrarGuardado(); }

  private _mostrarGuardado() {
    this.guardadoMsg = '✓ Cambio guardado';
    setTimeout(() => { this.guardadoMsg = ''; }, 2000);
  }

  guardarTab1() {
    if (this.formTab1.invalid) return;
    this._snack.open('✅ Información actualizada', '', { duration: 3000, panelClass: 'fbd-snack' });
  }

  // Variable nueva
documentosParaIA: { [key: string]: File } = {};

// Nuevo método que "envuelve" al anterior
procesarRegistroConIA() {
  const nit = this.formTab1.get('nit')?.value;

  if (!this.documentosParaIA['rut'] || !this.documentosParaIA['camara']) {
    this._snack.open('⚠️ Sube RUT y Cámara de Comercio para validar', 'OK');
    return;
  }

  this._uploadService.subirDocumento(this.documentosParaIA['rut'], 'rut', nit).subscribe({
    next: () => this.publicarPerfil(), // Si la IA dice OK, llama al original
    error: () => alert('❌ Error: Documento no coincide con el NIT')
  });
}

publicarPerfil() {
  // 1. Validaciones previas que ya tenías
  if (this.odsSeleccionados.length === 0) {
    this._snack.open('⚠️ Selecciona al menos 1 ODS antes de publicar', '', { duration: 3000, panelClass: 'fbd-snack' });
    return;
  }
  if (!this.formTab2.get('tipoOrg')?.value) {
    this._snack.open('⚠️ Indica el tipo de organización', '', { duration: 3000, panelClass: 'fbd-snack' });
    return;
  }

  // 2. Nueva validación de seguridad (Épica 1 - HU-004)
  if (!this.aceptaHabeasData || !this.aceptaTerminos) {
    this._snack.open('⚠️ Debes aceptar los términos legales y la Ley 1581', '', { duration: 3000, panelClass: 'fbd-snack' });
    return;
  }

  // 3. Preparación de datos para el Backend
  // Dentro de publicarPerfil()
  const datosParaEnviar = {
  ...this.formTab1.value,
  ...this.formTab2.value,
  
  // Datos de la Organización
  nit: this.formTab1.value.nit,
  
  // Datos específicos del Representante para que el Back los valide
  repTipoDoc: this.formTab1.value.repTipoDoc, // CC, CE, etc.
  repNumDoc: this.formTab1.value.repNumDoc,   // Número de cédula
  
  tipoActor: 'ORGANIZACION', // o 'EMPRESA'
  // ... resto de campos
  };
  
  // 4. Envío real a la IP 10.225.133.3 mediante el servicio
  this._personaService.registrarPersona(datosParaEnviar).subscribe({
    next: (respuesta: any) => {
      this._snack.open('🚀 ¡Perfil publicado y guardado en base de datos!', 'OK', { 
        duration: 5000, 
        panelClass: 'fbd-snack-success' 
      });
      console.log('Registro exitoso:', respuesta);
    },
    error: (fallo) => {
      this._snack.open('❌ Error al conectar con el servidor de desarrollo', 'Reintentar', { duration: 5000 });
      console.error('Error en el registro:', fallo);
    }
  });
}

  getFieldError(form: FormGroup, field: string): string {
    const ctrl = form.get(field);
    if (!ctrl?.invalid || !ctrl.touched) return '';
    if (ctrl.errors?.['required']) return 'Este campo es obligatorio';
    if (ctrl.errors?.['email'])    return 'Ingresa un correo válido';
    return '';
  }

  /**
   * Insignia visual del nivel — alineada con HU-006 (v2.0):
   * Emergente / Consolidada / Partner Estratégica.
   */
  get nivelIcono(): string {
    const map: Record<string, string> = {
      'Emergente':            '🌱',
      'Consolidada':          '🌿',
      'Partner Estratégica':  '🌳',
    };
    return map[this.datosDiagnostico.nivel] ?? '🌱';
  }
}