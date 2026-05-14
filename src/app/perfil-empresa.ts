import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PersonaService } from './persona.service';
import { SelectorArchivosComponent } from './selector-archivos'; // Importante para HU-005
import { UploadService } from './upload.service';

@Component({
  selector: 'app-perfil-empresa',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    SelectorArchivosComponent // <-- Esto quita el error de app-selector-archivos
  ],
  templateUrl: './perfil-empresa.html'
})
export class PerfilEmpresaComponent implements OnInit {
  formTab1!: FormGroup;
  
  // Variables para checks legales (HU-004)
  aceptaTerminos = false;
  aceptaHabeasData = false;

  // Contenedor para archivos de IA (HU-005)
  documentosParaIA: { [key: string]: File } = {};

  constructor(
    private _fb: FormBuilder,
    private _snack: MatSnackBar,
    private _personaService: PersonaService,
    private _uploadService: UploadService
  ) {}

  ngOnInit() {
    this.formTab1 = this._fb.group({
      nit: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      razonSocial: ['', Validators.required],
      repNombre: ['', Validators.required],
      repTipoDoc: ['', Validators.required],
      repNumDoc: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  // Método que conecta con la validación de IA antes del registro
  procesarRegistroEmpresa() {
    const nit = this.formTab1.get('nit')?.value;

    // Validar que se subieron los 3 documentos obligatorios (HU-005)
    if (!this.documentosParaIA['rut'] || !this.documentosParaIA['camara'] || !this.documentosParaIA['cedula_rep']) {
      this._snack.open('⚠️ Debe subir todos los documentos en PDF para validación con IA', 'OK');
      return;
    }

    // Simulamos validación con el RUT primero
    this._uploadService.subirDocumento(this.documentosParaIA['rut'], 'rut', nit).subscribe({
      next: () => this.publicarPerfil(),
      error: () => this._snack.open('❌ La IA detectó inconsistencias en los documentos', 'Cerrar')
    });
  }

  publicarPerfil() {
    if (this.formTab1.invalid || !this.aceptaHabeasData || !this.aceptaTerminos) {
      this._snack.open('⚠️ Revisa los datos y acepta los términos legales', 'OK');
      return;
    }

    const datosParaEnviar = {
      ...this.formTab1.value,
      tipoDocumento: 'NIT',
      numeroDocumento: this.formTab1.value.nit,
      nit: this.formTab1.value.nit,
      tipoActor: 'EMPRESA',
      fechaRegistro: new Date().toISOString()
    };

    this._personaService.registrarPersona(datosParaEnviar).subscribe({
      next: () => {
        this._snack.open('🚀 Empresa verificada y registrada con éxito', 'Cerrar');
      },
      error: (fallo) => {
        const msg = fallo.error?.message || 'Error de conexión';
        this._snack.open(`🚫 ${msg}`, 'Entendido');
      }
    });
  }
}