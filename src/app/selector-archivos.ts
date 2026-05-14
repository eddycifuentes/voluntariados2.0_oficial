import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-selector-archivos',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="upload-box" [class.upload-success]="archivoSeleccionado">
      <mat-icon class="upload-icon">{{ archivoSeleccionado ? 'picture_as_pdf' : 'cloud_upload' }}</mat-icon>
      <div class="upload-info">
        <span class="upload-label">{{ titulo }}</span>
        <span class="upload-filename" *ngIf="archivoSeleccionado">{{ archivoSeleccionado.name }}</span>
        <span class="upload-hint" *ngIf="!archivoSeleccionado">Solo formato PDF (Máx 5MB)</span>
      </div>
      <input type="file" #fileInput hidden accept="application/pdf" (change)="onFileSelected($event)">
      <button mat-stroked-button (click)="fileInput.click()" type="button">
        {{ archivoSeleccionado ? 'Cambiar' : 'Seleccionar' }}
      </button>
    </div>
  `,
  styles: [`
    .upload-box { border: 2px dashed #e0e0e0; padding: 15px; border-radius: 8px; display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
    .upload-success { border-color: #4caf50; background-color: #f1f8e9; }
    .upload-icon { font-size: 32px; width: 32px; height: 32px; color: #ff671b; }
    .upload-info { display: flex; flex-direction: column; flex-grow: 1; }
    .upload-label { font-weight: bold; font-size: 14px; }
    .upload-filename { color: #4caf50; font-size: 12px; }
    .upload-hint { color: #888; font-size: 11px; }
  `]
})
export class SelectorArchivosComponent {
  @Input() titulo: string = 'Documento';
  @Output() fileChanged = new EventEmitter<File>();
  archivoSeleccionado: File | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.archivoSeleccionado = file;
      this.fileChanged.emit(file);
    } else {
      alert('⚠️ Por favor sube un archivo en formato PDF únicamente.');
    }
  }
}