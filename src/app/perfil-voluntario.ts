import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Component as NgComponent } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { getDepartamentos, getMunicipios } from './dane.data';
import { ODS_LIST } from './diagnostico.data';
import { cargarResultado } from './diagnostico-storage';
import { PersonaService } from './persona.service';


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
        Agrega información adicional para mejorar tu experiencia y conectar mejor
        con las organizaciones sociales.
      </p>
      <div class="dialog-actions">
        <button mat-stroked-button class="dialog-btn-secondary" (click)="omitir()">
          Ahora no
        </button>
        <button mat-flat-button class="dialog-btn" (click)="completar()">
          Completar perfil
        </button>
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
  completar() { this.dialogRef.close('completar'); }
  omitir()    { this.dialogRef.close('omitir'); }
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface PerfilVoluntario {
  tipoDoc: string; numDoc: string; nombres: string; fechaNac: string;
  empresa: string; arl: string;
  email: string; celular: string; eps: string; departamento: string; municipio: string;
  foto: File | null; fotoUrl: string;
  cargo: string; restricciones: string; nivelEducativo: string; genero: string;
  mostrarFoto: boolean; mostrarCargo: boolean; mostrarRestricciones: boolean;
  mostrarEducacion: boolean; mostrarGenero: boolean;
  nivel: string; puntaje: number; odsTop3: number[];
  habilidad: string; disponibilidad: string; motivacion: string;
}

// ─── Componente principal ─────────────────────────────────────────────────────
@Component({
  selector: 'app-perfil-voluntario',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatTabsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatCardModule,
    MatDialogModule, MatSlideToggleModule, MatSnackBarModule,
  ],
  templateUrl: './perfil-voluntario.html',
  styleUrl: './perfil-voluntario.css',
})
export class PerfilVoluntarioComponent implements OnInit {

  tabActiva = 0;

  // Datos no editables (vendrían del onboarding / API)
  datosNoEditables = {
    tipoDoc:  'CC',
    numDoc:   '1103938',
    nombres:  'Juan Pérez García',
    fechaNac: '1990-05-12',
    empresa:  'Davivienda S.A.',
    arl:      'Sura ARL',
  };

  // Datos del diagnóstico — niveles ALINEADOS con HU-008 (v2.0):
  // Explorador (0-35) / Especialista (36-75) / Líder (76-100)
  // Estos valores se sobrescriben en ngOnInit() si hay un resultado guardado.
  datosDiagnostico = {
    nivel:    'Especialista',
    puntaje:  62,
    odsTop3:  [3, 4, 10],
    habilidad: 'Aporte profesional técnico',
    disponibilidad: 'Lunes y miércoles — Mañana (Virtual)',
    motivacion: 'Poner mis conocimientos profesionales al servicio de una causa.',
  };

  formTab1!: FormGroup;
  formTab2!: FormGroup;

  toggles = {
    foto: false, cargo: false, restricciones: false, educacion: false, genero: false,
  };

  fotoPreview = '';
  guardadoMsg = '';

  departamentos: string[] = getDepartamentos();
  municipios: string[] = [];

  epsList = [
    'Aliansalud EPS', 'Asmet Salud', 'Cajacopi Atlántico',
    'Capresoca EPS', 'Comfenalco Valle EPS', 'Compensar EPS',
    'EPS Familiar de Colombia', 'EPS Sanitas', 'EPS Sura',
    'Famisanar', 'Mutual SER', 'Nueva EPS', 'Salud Total EPS',
    'Salud Vida EPS', 'SOS', 'Unimec', 'Coosalud EPS',
  ];

  nivelesEducativos = [
    'Secundaria', 'Universitario', 'Especialista', 'Máster', 'Doctorado',
  ];

  generosOpciones = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'];

  readonly ODS_LIST = ODS_LIST;

  aceptaTerminos: boolean = false;
  aceptaHabeasData: boolean = false;
  tipoActor: string = 'VOLUNTARIO'; //

  constructor(
    private _fb: FormBuilder,
    private _dialog: MatDialog,
    private _snack: MatSnackBar,
    private _router: Router,
    private _personaService: PersonaService // <--- Inyectado
  ) {}

  ngOnInit() {
    this._initForms();
    this._cargarResultadoDiagnostico();
    this._mostrarPopup();
  }

  private _initForms() {
    this.formTab1 = this._fb.group({
      email:        ['juan.perez@davivienda.com', [Validators.required, Validators.email]],
      celular:      ['3001234567', Validators.required],
      eps:          ['EPS Sura', Validators.required],
      departamento: ['BOGOTÁ D.C.', Validators.required],
      municipio:    ['Bogotá D.C.', Validators.required],
    });

    this.formTab2 = this._fb.group({
      cargo:         ['Analista de Desarrollo'],
      restricciones: ['Vegetariano'],
      nivelEducativo:['Universitario'],
      genero:        ['Masculino'],
    });

    this.municipios = getMunicipios('BOGOTÁ D.C.').sort((a, b) => a.localeCompare(b, 'es'));
  }

  /** Si el voluntario completó el diagnóstico, leemos su resultado real. */
  private _cargarResultadoDiagnostico() {
    const resultado = cargarResultado('voluntario');
    if (resultado) {
      this.datosDiagnostico.nivel   = resultado.nivel;
      this.datosDiagnostico.puntaje = resultado.puntaje;
    }
  }

  private _mostrarPopup() {
    setTimeout(() => {
      const ref = this._dialog.open(CompletarPerfilDialogComponent, {
        width: '420px',
        panelClass: 'fbd-dialog',
        disableClose: true,
      });
      ref.afterClosed().subscribe(result => {
        if (result === 'completar') this.tabActiva = 1;
      });
    }, 400);
  }

  onDepartamentoChange() {
    const depto = this.formTab1.get('departamento')?.value;
    this.municipios = getMunicipios(depto).sort((a, b) => a.localeCompare(b, 'es'));
    this.formTab1.get('municipio')?.setValue('');
  }

  onFotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { this.fotoPreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  onToggleChange(_campo: string) { this._mostrarGuardado(); }

  private _mostrarGuardado() {
    this.guardadoMsg = '✓ Cambio guardado';
    setTimeout(() => { this.guardadoMsg = ''; }, 2000);
  }

  guardarTab1() {
    if (this.formTab1.invalid) return;
    this._snack.open('✅ Información actualizada', '', { duration: 3000, panelClass: 'fbd-snack' });
  }

  publicarPerfil() {
  // 1. Validación Legal (HU-004)
  if (!this.aceptaHabeasData || !this.aceptaTerminos) {
    this._snack.open('⚠️ Debes aceptar los términos legales para continuar', '', { duration: 3000 });
    return;
  }

  // 2. Preparación de datos (HU-003)
  const datosParaEnviar = {
    ...this.formTab1.value, // Aquí van: Nombre, Cédula, EPS, etc.
    tipoActor: this.tipoActor,
    fechaRegistro: new Date().toISOString()
  };

  // 3. Envío real a la IP 10.225.133.3
  this._personaService.registrarPersona(datosParaEnviar).subscribe({
    next: (respuesta: any) => {
      this._snack.open('🚀 ¡Perfil de Voluntario publicado con éxito!', 'OK', { 
        duration: 5000, 
        panelClass: 'fbd-snack-success' 
      });
    },
    error: (fallo: any) => {
      this._snack.open('❌ Error al conectar con el servidor', 'Reintentar');
      console.error('Error:', fallo);
    }
  });
}

  get odsTop3Items() {
    return this.ODS_LIST.filter(o => this.datosDiagnostico.odsTop3.includes(o.id));
  }

  /** Insignia visual coherente con el nivel del diagnóstico voluntario (HU-008). */
  get nivelInsignia(): string {
    const map: Record<string, string> = {
      'Explorador':   '🔭',
      'Especialista': '🛠️',
      'Líder':        '⭐',
    };
    return map[this.datosDiagnostico.nivel] ?? '🎯';
  }

  getFieldError(form: FormGroup, field: string): string {
    const ctrl = form.get(field);
    if (!ctrl?.invalid || !ctrl.touched) return '';
    if (ctrl.errors?.['required']) return 'Este campo es obligatorio';
    if (ctrl.errors?.['email'])    return 'Ingresa un correo válido';
    return '';
  }
}