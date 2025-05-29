import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/environments';

@Injectable({
  providedIn: 'root'
})
export class MascotasService {

  private apiUrl = environment.endpoint + 'api/MascotaControllers';

  constructor(private http: HttpClient) {}

  getMascotas(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getMascotasByCliente(numeroDocumento: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/dueno/${numeroDocumento}`);
  }

  getMascotaById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearMascota(mascota: any): Observable<any> {
    return this.http.post(this.apiUrl, mascota);
  }

  actualizarMascota(mascota: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/`, mascota);
  }

  desactivarMascota(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
