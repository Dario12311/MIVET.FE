import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/environments';

// Interfaces para DTOs
export interface CrearCitaDto {
  mascotaId: number;
  medicoVeterinarioNumeroDocumento: string;
  fechaCita: string;
  horaInicio: string;
  duracionMinutos: number;
  tipoCita: number;
  motivoConsulta: string;
  observaciones?: string;
  creadoPor: string;
  tipoUsuarioCreador: number;
}

export interface CitaDto {
  id: number;
  mascotaId: number;
  medicoVeterinarioNumeroDocumento: string;
  nombreVeterinario: string;
  fechaCita: string;
  horaInicio: string;
  horaFin: string;
  duracionMinutos: number;
  tipoCita: number;
  estadoCita: number;
  motivoConsulta: string;
  observaciones?: string;
  nombreMascota: string;
  nombreCliente: string;
  fechaCreacion: string;
  creadoPor: string;
  tipoUsuarioCreador: number;
}

export interface VerificarDisponibilidadDto {
  medicoVeterinarioNumeroDocumento: string;
  fechaCita: string;
  horaInicio: string;
  duracionMinutos: number;
}

export interface HoraDisponibleDto {
  hora: string;
  disponible: boolean;
  motivoNoDisponible?: string;
}

export interface VeterinarioDisponibleDto {
  numeroDocumento: string;
  nombre: string;
  especialidad: string;
  horasDisponibles: HoraDisponibleDto[];
}

export interface BuscarCitasDto {
  medicoVeterinarioNumeroDocumento?: string;
  fechaInicio?: string;
  fechaFin?: string;
  tipoCita?: number;
  estadoCita?: number;
  soloActivas?: boolean;
}

export interface AgendaDiariaDto {
  medicoVeterinarioNumeroDocumento: string;
  nombreVeterinario: string;
  fecha: string;
  tieneHorarioConfigurado: boolean;
  horarioInicio: string;
  horarioFin: string;
  slotsDisponibles: number;
  slotsOcupados: number;
  citas: CitaDto[];
}

export interface CancelarCitaDto {
  motivoCancelacion: string;
  canceladoPor: string;
}

// Enums
export enum TipoCita {
  Normal = 1,
  Operacion = 2,
  Vacunacion = 3,
  Emergencia = 4,
  Control = 5,
  Cirugia = 6,
}

export enum EstadoCita {
  Programada = 1,
  Confirmada = 2,
  EnCurso = 3,
  Completada = 4,
  Cancelada = 5,
  NoAsistio = 6,
}

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private apiUrl = environment.endpoint + 'api/Cita';
  private disponibilidadUrl = environment.endpoint + 'api/Disponibilidad';

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
    };
  }

  // === OPERACIONES CRUD ===

  // Obtener todas las citas
  getCitas(): Observable<CitaDto[]> {
    return this.http.get<CitaDto[]>(this.apiUrl);
  }

  // Obtener cita por ID
  getCitaById(id: number): Observable<CitaDto> {
    return this.http.get<CitaDto>(`${this.apiUrl}/${id}`);
  }

  // Crear nueva cita
  crearCita(cita: CrearCitaDto): Observable<CitaDto> {
    return this.http.post<CitaDto>(this.apiUrl, cita, this.getHttpOptions());
  }

  // Actualizar cita
  actualizarCita(id: number, cita: CrearCitaDto): Observable<CitaDto> {
    return this.http.put<CitaDto>(
      `${this.apiUrl}/${id}`,
      cita,
      this.getHttpOptions()
    );
  }

  // Eliminar cita
  eliminarCita(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // === CONSULTAS ESPECÍFICAS ===

  // Obtener citas por mascota
  getCitasPorMascota(mascotaId: number): Observable<CitaDto[]> {
    return this.http.get<CitaDto[]>(`${this.apiUrl}/mascota/${mascotaId}`);
  }

  // Obtener citas por veterinario
  getCitasPorVeterinario(numeroDocumento: string): Observable<CitaDto[]> {
    return this.http.get<CitaDto[]>(
      `${this.apiUrl}/veterinario/${numeroDocumento}`
    );
  }

  // Obtener citas por cliente
  getCitasPorCliente(numeroDocumento: string): Observable<CitaDto[]> {
    return this.http.get<CitaDto[]>(
      `${this.apiUrl}/cliente/${numeroDocumento}`
    );
  }

  // Obtener citas por fecha
  getCitasPorFecha(fecha: string): Observable<CitaDto[]> {
    return this.http.get<CitaDto[]>(`${this.apiUrl}/fecha/${fecha}`);
  }

  // Obtener citas por estado
  getCitasPorEstado(estado: number): Observable<CitaDto[]> {
    return this.http.get<CitaDto[]>(`${this.apiUrl}/estado/${estado}`);
  }

  // Obtener solo citas activas
  getCitasActivas(): Observable<CitaDto[]> {
    return this.http.get<CitaDto[]>(`${this.apiUrl}/activas`);
  }

  // Obtener citas del día actual
  getCitasHoy(): Observable<CitaDto[]> {
    return this.http.get<CitaDto[]>(`${this.apiUrl}/hoy`);
  }

  // Obtener citas pendientes
  getCitasPendientes(): Observable<CitaDto[]> {
    return this.http.get<CitaDto[]>(`${this.apiUrl}/pendientes`);
  }

  // === GESTIÓN DE ESTADOS ===

  // Confirmar cita
  confirmarCita(id: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${id}/confirmar`,
      {},
      this.getHttpOptions()
    );
  }

  // Cancelar cita
  cancelarCita(id: number, datos: CancelarCitaDto): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${id}/cancelar`,
      datos,
      this.getHttpOptions()
    );
  }

  // Completar cita
  completarCita(id: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${id}/completar`,
      {},
      this.getHttpOptions()
    );
  }

  // Marcar como no asistió
  marcarNoAsistio(id: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${id}/no-asistio`,
      {},
      this.getHttpOptions()
    );
  }

  // Reprogramar cita
  reprogramarCita(
    id: number,
    nuevaFecha: string,
    nuevaHora: string
  ): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${id}/reprogramar`,
      {
        fechaCita: nuevaFecha,
        horaInicio: nuevaHora,
      },
      this.getHttpOptions()
    );
  }

  // === DISPONIBILIDAD ===

  // Verificar disponibilidad
  verificarDisponibilidad(
    verificacion: VerificarDisponibilidadDto
  ): Observable<{ disponible: boolean; mensaje?: string }> {
    return this.http.post<{ disponible: boolean; mensaje?: string }>(
      `${this.apiUrl}/verificar-disponibilidad`,
      verificacion, // ⬅️ directo, sin envolver
      this.getHttpOptions()
    );
  }  

  // Obtener veterinarios disponibles para una fecha
  getVeterinariosDisponibles(
    fecha: string
  ): Observable<VeterinarioDisponibleDto[]> {
    return this.http.get<VeterinarioDisponibleDto[]>(
      `${this.disponibilidadUrl}/veterinarios/${fecha}`
    );
  }

  // Obtener horas disponibles de un veterinario
  getHorasDisponibles(
    numeroDocumento: string,
    fecha: string,
    duracionMinutos: number = 30
  ): Observable<HoraDisponibleDto[]> {
    const params = new HttpParams().set(
      'duracionMinutos',
      duracionMinutos.toString()
    );
    return this.http.get<HoraDisponibleDto[]>(
      `${this.disponibilidadUrl}/horas/${numeroDocumento}/${fecha}`,
      { params }
    );
  }

  // Obtener agenda diaria completa
  getAgendaDiaria(
    numeroDocumento: string,
    fecha: string
  ): Observable<AgendaDiariaDto> {
    return this.http.get<AgendaDiariaDto>(
      `${this.disponibilidadUrl}/agenda/${numeroDocumento}/${fecha}`
    );
  }

  // Buscar veterinarios disponibles con filtros
  buscarVeterinariosDisponibles(
    fecha: string,
    horaPreferida?: string,
    duracionMinutos?: number,
    especialidad?: string
  ): Observable<VeterinarioDisponibleDto[]> {
    let params = new HttpParams().set('fecha', fecha);

    if (horaPreferida) params = params.set('horaPreferida', horaPreferida);
    if (duracionMinutos)
      params = params.set('duracionMinutos', duracionMinutos.toString());
    if (especialidad) params = params.set('especialidad', especialidad);

    return this.http.get<VeterinarioDisponibleDto[]>(
      `${this.apiUrl}/veterinarios-disponibles`,
      { params }
    );
  }

  // === BÚSQUEDA AVANZADA ===

  // Buscar citas con filtros
  buscarCitas(filtros: BuscarCitasDto): Observable<CitaDto[]> {
    return this.http.post<CitaDto[]>(
      `${this.apiUrl}/buscar`,
      filtros,
      this.getHttpOptions()
    );
  }

  // === UTILIDADES ===

  // Obtener tipos de cita
  getTiposCita(): { id: number; nombre: string; duracionMinima: number }[] {
    return [
      { id: TipoCita.Normal, nombre: 'Normal', duracionMinima: 15 },
      { id: TipoCita.Operacion, nombre: 'Operación', duracionMinima: 60 },
      { id: TipoCita.Vacunacion, nombre: 'Vacunación', duracionMinima: 15 },
      { id: TipoCita.Emergencia, nombre: 'Emergencia', duracionMinima: 30 },
      { id: TipoCita.Control, nombre: 'Control', duracionMinima: 15 },
      { id: TipoCita.Cirugia, nombre: 'Cirugía', duracionMinima: 120 },
    ];
  }

  // Obtener estados de cita
  getEstadosCita(): { id: number; nombre: string; color: string }[] {
    return [
      { id: EstadoCita.Programada, nombre: 'Programada', color: '#ffc107' },
      { id: EstadoCita.Confirmada, nombre: 'Confirmada', color: '#28a745' },
      { id: EstadoCita.EnCurso, nombre: 'En Curso', color: '#007bff' },
      { id: EstadoCita.Completada, nombre: 'Completada', color: '#6f42c1' },
      { id: EstadoCita.Cancelada, nombre: 'Cancelada', color: '#dc3545' },
      { id: EstadoCita.NoAsistio, nombre: 'No Asistió', color: '#6c757d' },
    ];
  }

  // Obtener nombre del tipo de cita
  getNombreTipoCita(tipoCita: number): string {
    const tipos = this.getTiposCita();
    return tipos.find((t) => t.id === tipoCita)?.nombre || 'Desconocido';
  }

  // Obtener nombre del estado de cita
  getNombreEstadoCita(estadoCita: number): string {
    const estados = this.getEstadosCita();
    return estados.find((e) => e.id === estadoCita)?.nombre || 'Desconocido';
  }

  // Obtener color del estado de cita
  getColorEstadoCita(estadoCita: number): string {
    const estados = this.getEstadosCita();
    return estados.find((e) => e.id === estadoCita)?.color || '#6c757d';
  }

  // Validar si una fecha es válida para cita
  esFechaValidaParaCita(fecha: string): boolean {
    const fechaCita = new Date(fecha);
    const hoy = new Date();
    const unAnoEnFuturo = new Date();
    unAnoEnFuturo.setFullYear(hoy.getFullYear() + 1);

    hoy.setHours(0, 0, 0, 0);
    fechaCita.setHours(0, 0, 0, 0);

    return fechaCita >= hoy && fechaCita <= unAnoEnFuturo;
  }

  // Validar formato de hora
  esHoraValida(hora: string): boolean {
    const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(hora)) return false;

    const [horas, minutos] = hora.split(':').map(Number);
    const minutosEnHora = horas * 60 + minutos;

    // Validar horario laboral (06:00 - 22:00)
    return minutosEnHora >= 360 && minutosEnHora <= 1320 && minutos % 15 === 0;
  }

  // Formatear fecha para mostrar
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Formatear hora para mostrar
  formatearHora(hora: string): string {
    if (!hora) return '';
    const [horas, minutos] = hora.split(':');
    const horasNum = parseInt(horas);
    const ampm = horasNum >= 12 ? 'PM' : 'AM';
    const horas12 = horasNum % 12 || 12;
    return `${horas12}:${minutos} ${ampm}`;
  }
}
