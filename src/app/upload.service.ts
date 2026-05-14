import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  // IP de desarrollo configurada en el .env
  private readonly API_URL = 'http://10.225.133.3:3000/personas/upload';

  constructor(private http: HttpClient) {}

  /**
   * Envía el documento al Back para validación con IA
   * @param file Archivo PDF
   * @param tipoDoc 'rut', 'camara', 'estados_financieros'
   * @param nit NIT de la entidad para cruce de datos
   */
  subirDocumento(file: File, tipoDoc: string, nit: string): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('tipoDocumento', tipoDoc);
    formData.append('nit', nit);

    return this.http.post(this.API_URL, formData);
  }
}