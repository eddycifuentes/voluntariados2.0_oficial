import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule, ReactiveFormsModule,
  FormBuilder, FormGroup, FormArray, Validators,
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
import { Component as NgComponent } from '@angular/core';
import { getDepartamentos, getMunicipios } from './dane.data';
import { ODS_LIST } from './diagnostico.data';

// ─── Pop-up "Completa tu perfil" ─────────────────────────────────────────────
@NgComponent({
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
    CommonModule, FormsModule, ReactiveFormsModule,
    MatTabsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatCardModule,
    MatDialogModule, MatSlideToggleModule, MatSnackBarModule,
    MatCheckboxModule, MatIconModule, MatTooltipModule,
  ],
  templateUrl: './perfil-organizacion.html',
  styleUrl:    './perfil-organizacion.css',
})
export class PerfilOrganizacionComponent implements OnInit {

  tabActiva   = 0;
  guardadoMsg = '';
  logoPreview = '';

  // ── Datos no editables (vendrían del onboarding / API) ────────────────────
  datosNoEditables = {
    nit:        '900123456',
    razonSocial: 'Fundación Sembrando Futuro',
  };

  // ── Datos del diagnóstico (vendrían del resultado del onboarding) ─────────
  datosDiagnostico = {
    nivel:   'Incursionista',
    puntaje: 128,
  };

  // ── ODS ───────────────────────────────────────────────────────────────────
  readonly ODS_LIST = ODS_LIST;
  odsSeleccionados: number[] = [];          // ids seleccionados (max 3)

  // ── Toggles de visibilidad (Pestaña 2 → opcionales) ──────────────────────
  toggles = {
    paginaWeb:  false,
    redSocial:  false,
    alianzas:   false,
  };

  // ── Formularios ───────────────────────────────────────────────────────────
  formTab1!: FormGroup;   // Información básica privada (editables)
  formTab2!: FormGroup;   // Perfil público

  // ── DANE ──────────────────────────────────────────────────────────────────
  departamentos: string[] = getDepartamentos();
  municipiosDisponibles: string[] = [];

  // ── Tipos de organización ─────────────────────────────────────────────────
  tiposOrg = [
    'Fundación', 'Corporación', 'Asociación',
    'Cooperativa', 'Entidad Religiosa', 'Otra',
  ];

  // ── Alianzas (máx 4) ──────────────────────────────────────────────────────
  alianzas: Alianza[] = [];

  constructor(
    private _fb:     FormBuilder,
    private _dialog: MatDialog,
    private _snack:  MatSnackBar,
  ) {}

  ngOnInit() {
    this._initForms();
    this._mostrarPopup();
  }

  // ── Inicialización de formularios ─────────────────────────────────────────
  private _initForms() {
    this.formTab1 = this._fb.group({
      repNombre:    ['María Torres Herrera', Validators.required],
      repCorreo:    ['rep@sembrandofuturo.org', [Validators.required, Validators.email]],
      repCelular:   ['3109876543', Validators.required],
      gestorNombre: ['Carlos Ruiz Mendez', Validators.required],
      gestorCargo:  ['Coordinador de Voluntariado', Validators.required],
      gestorArea:   ['Gestión Social', Validators.required],
      gestorCorreo: ['cruiz@sembrandofuturo.org', [Validators.required, Validators.email]],
      gestorCelular:['3001234567', Validators.required],
    });

    this.formTab2 = this._fb.group({
      coberturaDeptos: [[] as string[]],
      tipoOrg:         ['Fundación', Validators.required],
      paginaWeb:       ['https://www.sembrandofuturo.org'],
      redSocial:       ['https://instagram.com/sembrandofuturo'],
    });

    // Cobertura: cargar municipios del primer depto seleccionado si aplica
    this.municipiosDisponibles = [];

    // Precarga de ODS de ejemplo
    this.odsSeleccionados = [1, 4, 10];
  }

  // ── Pop-up inicial ────────────────────────────────────────────────────────
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

  // ── Cobertura: ciudades/municipios DANE ───────────────────────────────────
  coberturaSeleccionada: string[] = [];   // municipios seleccionados

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

  // ── Guardar pestaña 1 ─────────────────────────────────────────────────────
  guardarTab1() {
    if (this.formTab1.invalid) return;
    this._snack.open('✅ Información actualizada', '', { duration: 3000, panelClass: 'fbd-snack' });
  }

  // ── Publicar perfil ───────────────────────────────────────────────────────
  publicarPerfil() {
    if (this.odsSeleccionados.length === 0) {
      this._snack.open('⚠️ Selecciona al menos 1 ODS antes de publicar', '', { duration: 3000, panelClass: 'fbd-snack' });
      return;
    }
    if (!this.formTab2.get('tipoOrg')?.value) {
      this._snack.open('⚠️ Indica el tipo de organización', '', { duration: 3000, panelClass: 'fbd-snack' });
      return;
    }
    this._snack.open('🚀 ¡Perfil publicado en el Marketplace!', '', { duration: 3500, panelClass: 'fbd-snack' });
  }

  // ── Utilidades ────────────────────────────────────────────────────────────
  getFieldError(form: FormGroup, field: string): string {
    const ctrl = form.get(field);
    if (!ctrl?.invalid || !ctrl.touched) return '';
    if (ctrl.errors?.['required']) return 'Este campo es obligatorio';
    if (ctrl.errors?.['email'])    return 'Ingresa un correo válido';
    return '';
  }

  get nivelIcono(): string {
    const nivel = this.datosDiagnostico.nivel;
    if (nivel === 'Pionera')       return '🌳';
    if (nivel === 'Incursionista') return '🌿';
    return '🌱';
  }
}
