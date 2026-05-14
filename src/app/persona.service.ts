import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  // IP del Backend de desarrollo (Orlando)
  private apiUrl = 'http://10.225.133.3:3000/personas';

  constructor(private http: HttpClient) {}

  // Método para enviar los datos de la Épica 1
  registrarPersona(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }
}