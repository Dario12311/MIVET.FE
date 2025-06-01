import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/environments';

export interface HorarioVeterinarioDto {
  id: number;
  medicoVeterinarioNumeroDocumento: string;
  diaSemana: number; // 0=Domingo, 1=Lunes, etc.
  horaInicio: string; // "08:00:00"
  horaFin: string; // "18:00:00"
  esActivo: boolean;
  fechaCreacion: string;
  fechaModificacion?: string;
  observaciones?: string;
  fechaInicio?: string;
  fechaFin?: string;
  nombreVeterinario: string;
}

export interface CrearHorarioVeterinarioDto {
  medicoVeterinarioNumeroDocumento: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  observaciones?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ActualizarHorarioVeterinarioDto {
  diaSemana?: number;
  horaInicio?: string;
  horaFin?: string;
  esActivo?: boolean;
  observaciones?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface FiltroHorarioVeterinarioDto {
  medicoVeterinarioNumeroDocumento?: string;
  diaSemana?: number;
  esActivo?: boolean;
  fechaDesde?: string;
  fechaHasta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HorarioVeterinarioService {
  private apiUrl = environment.endpoint + 'api/HorarioVeterinario';

  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
  }

  // Obtener horario por ID
  getHorarioById(id: number): Observable<HorarioVeterinarioDto> {
    return this.http.get<HorarioVeterinarioDto>(`${this.apiUrl}/${id}`);
  }

  // Obtener todos los horarios
  getTodosHorarios(): Observable<HorarioVeterinarioDto[]> {
    return this.http.get<HorarioVeterinarioDto[]>(this.apiUrl);
  }

  // Obtener horarios por veterinario
  getHorariosPorVeterinario(numeroDocumento: string): Observable<HorarioVeterinarioDto[]> {
    return this.http.get<HorarioVeterinarioDto[]>(`${this.apiUrl}/veterinario/${numeroDocumento}`);
  }

  // Obtener horarios activos por veterinario
  getHorariosActivosPorVeterinario(numeroDocumento: string): Observable<HorarioVeterinarioDto[]> {
    return this.http.get<HorarioVeterinarioDto[]>(`${this.apiUrl}/veterinario/${numeroDocumento}/activos`);
  }

  // Obtener horarios por día de la semana
  getHorariosPorDia(diaSemana: number): Observable<HorarioVeterinarioDto[]> {
    return this.http.get<HorarioVeterinarioDto[]>(`${this.apiUrl}/dia/${diaSemana}`);
  }

  // Obtener horarios por veterinario y día específico
  getHorariosPorVeterinarioYDia(numeroDocumento: string, diaSemana: number): Observable<HorarioVeterinarioDto[]> {
    return this.http.get<HorarioVeterinarioDto[]>(`${this.apiUrl}/veterinario/${numeroDocumento}/dia/${diaSemana}`);
  }

  // Obtener horarios semanales
  getHorariosSemanalVeterinario(numeroDocumento: string): Observable<HorarioVeterinarioDto[]> {
    return this.http.get<HorarioVeterinarioDto[]>(`${this.apiUrl}/veterinario/${numeroDocumento}/semanal`);
  }

  // Obtener horarios agrupados por día
  getHorariosAgrupados(numeroDocumento: string): Observable<{[key: number]: HorarioVeterinarioDto[]}> {
    return this.http.get<{[key: number]: HorarioVeterinarioDto[]}>(`${this.apiUrl}/veterinario/${numeroDocumento}/agrupados`);
  }

  // Buscar horarios con filtros
  buscarHorarios(filtro: FiltroHorarioVeterinarioDto): Observable<HorarioVeterinarioDto[]> {
    return this.http.post<HorarioVeterinarioDto[]>(`${this.apiUrl}/buscar`, filtro, this.getHttpOptions());
  }

  // Obtener horarios por rango de fechas
  getHorariosPorRangoFecha(numeroDocumento: string, fechaInicio: string, fechaFin: string): Observable<HorarioVeterinarioDto[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    
    return this.http.get<HorarioVeterinarioDto[]>(`${this.apiUrl}/veterinario/${numeroDocumento}/rango`, { params });
  }

  // Crear horario
  crearHorario(horario: CrearHorarioVeterinarioDto): Observable<HorarioVeterinarioDto> {
    return this.http.post<HorarioVeterinarioDto>(this.apiUrl, horario, this.getHttpOptions());
  }

  // Actualizar horario
  actualizarHorario(id: number, horario: ActualizarHorarioVeterinarioDto): Observable<HorarioVeterinarioDto> {
    return this.http.put<HorarioVeterinarioDto>(`${this.apiUrl}/${id}`, horario, this.getHttpOptions());
  }

  // Eliminar horario
  eliminarHorario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Desactivar horario
  desactivarHorario(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/desactivar`, {}, this.getHttpOptions());
  }

  // Activar horario
  activarHorario(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activar`, {}, this.getHttpOptions());
  }

  // Utilidades para manejo de días de la semana
  getDiasSemanaNombres(): string[] {
    return ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  }

  getNombreDiaSemana(diaSemana: number): string {
    const dias = this.getDiasSemanaNombres();
    return dias[diaSemana] || 'Día inválido';
  }

  // Formatear tiempo para display
  formatearHora(hora: string): string {
    if (!hora) return '';
    const [horas, minutos] = hora.split(':');
    const horasNum = parseInt(horas);
    const ampm = horasNum >= 12 ? 'PM' : 'AM';
    const horas12 = horasNum % 12 || 12;
    return `${horas12}:${minutos} ${ampm}`;
  }

  // Convertir hora de 12h a 24h para envío al backend
  convertirA24h(hora: string): string {
    // Implementar conversión si es necesario
    return hora;
  }
}