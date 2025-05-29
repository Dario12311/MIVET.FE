import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/environments';

export interface MedicoVeterinario {
  id: number;
  nombre: string;
  numeroDocumento: string;
  estadoCivil: number;
  tipoDocumentoId: number;
  especialidad: string;
  telefono: string;
  correoElectronico: string;
  direccion: string;
  fechaRegistro: string;
  universidadGraduacion: string;
  fechaNacimiento: string;
  añoGraduacion: string;
  genero: string;
  estado: string;
  nacionalidad: string;
  ciudad: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicoveterinarioService {
  private apiUrl = environment.endpoint + 'api/MedicoVeterinarioControllers';

  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
  }

  getMedicos(): Observable<MedicoVeterinario[]> {
    return this.http.get<MedicoVeterinario[]>(this.apiUrl);
  }

  getMedicoById(numeroDocumento: string ): Observable<MedicoVeterinario> {
    return this.http.get<MedicoVeterinario>(`${this.apiUrl}/${numeroDocumento}`);
  }

  getMedicoByDocumento(numeroDocumento: string): Observable<MedicoVeterinario> {
    return this.http.get<MedicoVeterinario>(`${this.apiUrl}/documento/${numeroDocumento}`);
  }

  crearMedico(medico: MedicoVeterinario): Observable<any> {
    return this.http.post(this.apiUrl, medico, this.getHttpOptions());
  }

  actualizarMedico(medico: MedicoVeterinario): Observable<any> {
    return this.http.put(`${this.apiUrl}`, medico, this.getHttpOptions());
  }

  desactivarMedico(numeroDocumento: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${numeroDocumento}`);
  }
}
