import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/environments';

// Interfaces para los DTOs del cliente
export interface CrearCitaClienteDto {
  mascotaId: number;
  medicoVeterinarioNumeroDocumento: string;
  fechaCita: string;
  horaInicio: string;
  duracionMinutos: number;
  tipoCita: number;
  motivoConsulta: string;
  observaciones?: string;
}

export interface ReprogramarCitaClienteDto {
  nuevaFecha: string;
  nuevaHora: string;
}

export interface CancelarCitaClienteDto {
  motivoCancelacion: string;
}

export interface ActualizarPerfilDto {
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  correoElectronico: string;
  telefono?: string;
  celular: string;
  direccion: string;
  ciudad: string;
  departamento?: string;
  pais?: string;
}

export interface MascotaClienteDto {
  id?: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  genero: string;
  numeroDocumento: string;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  
  private apiUrl = environment.endpoint + 'api/Cliente';

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
  }

  // === GESTIÓN DE PERFIL ===

  // Obtener perfil del cliente
  getPerfil(numeroDocumento: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil/${numeroDocumento}`);
  }

  // Actualizar perfil del cliente
  actualizarPerfil(perfil: ActualizarPerfilDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, perfil, this.getHttpOptions());
  }

  // === GESTIÓN DE MASCOTAS ===

  // Obtener mascotas del cliente
  getMisMascotas(numeroDocumento: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${numeroDocumento}/mascotas`);
  }

  // Registrar nueva mascota
  registrarMascota(numeroDocumento: string, mascota: MascotaClienteDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/${numeroDocumento}/mascotas`, mascota, this.getHttpOptions());
  }

  // Actualizar mascota
  actualizarMascota(numeroDocumento: string, mascotaId: number, mascota: MascotaClienteDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${numeroDocumento}/mascotas/${mascotaId}`, mascota, this.getHttpOptions());
  }

  // === GESTIÓN DE CITAS ===

  // Obtener todas las citas del cliente
  getMisCitas(numeroDocumento: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${numeroDocumento}/citas`);
  }

  // Obtener próximas citas del cliente
  getProximasCitas(numeroDocumento: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${numeroDocumento}/citas/proximas`);
  }

  // Agendar nueva cita
  agendarCita(numeroDocumento: string, cita: CrearCitaClienteDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/${numeroDocumento}/citas`, cita, this.getHttpOptions());
  }

  // Reprogramar cita
  reprogramarCita(numeroDocumento: string, citaId: number, datos: ReprogramarCitaClienteDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${numeroDocumento}/citas/${citaId}/reprogramar`, datos, this.getHttpOptions());
  }

  // Cancelar cita
  cancelarCita(numeroDocumento: string, citaId: number, datos: CancelarCitaClienteDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${numeroDocumento}/citas/${citaId}/cancelar`, datos, this.getHttpOptions());
  }

  // === HISTORIA CLÍNICA ===

  // Obtener historia clínica de una mascota
  getHistorialMascota(numeroDocumento: string, mascotaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${numeroDocumento}/mascotas/${mascotaId}/historial`);
  }

  // Obtener historial completo
  getHistorialCompleto(numeroDocumento: string, mascotaId: number, historialId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${numeroDocumento}/mascotas/${mascotaId}/historial/${historialId}`);
  }

  // === MÉTODOS DE UTILIDAD ===

  // Validar si el cliente puede editar una mascota
  puedeEditarMascota(numeroDocumento: string, mascotaNumeroDocumento: string): boolean {
    return numeroDocumento === mascotaNumeroDocumento;
  }

  // Validar si el cliente puede gestionar una cita
  puedeGestionarCita(numeroDocumento: string, cita: any): boolean {
    // Aquí deberías verificar que la cita pertenezca a una mascota del cliente
    return true; // Simplificado por ahora
  }

  // Formatear fecha para mostrar
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  // Obtener estado de mascota formateado
  getEstadoMascota(estado: string): { texto: string; clase: string } {
    return estado === 'A' 
      ? { texto: 'Activa', clase: 'success' }
      : { texto: 'Inactiva', clase: 'danger' };
  }

  // Obtener tipos de cita disponibles para cliente
  getTiposCitaCliente(): { id: number; nombre: string; duracionMinima: number; descripcion: string }[] {
    return [
      { id: 1, nombre: 'Consulta General', duracionMinima: 30, descripcion: 'Revisión general de salud' },
      { id: 3, nombre: 'Vacunación', duracionMinima: 15, descripcion: 'Aplicación de vacunas' },
      { id: 4, nombre: 'Emergencia', duracionMinima: 30, descripcion: 'Atención de emergencia' },
      { id: 5, nombre: 'Control', duracionMinima: 20, descripcion: 'Consulta de seguimiento' }
    ];
  }

  // Obtener estados de cita
  getEstadosCita(): { id: number; nombre: string; color: string; descripcion: string }[] {
    return [
      { id: 1, nombre: 'Programada', color: '#ffc107', descripcion: 'Cita agendada, pendiente de confirmación' },
      { id: 2, nombre: 'Confirmada', color: '#28a745', descripcion: 'Cita confirmada por el veterinario' },
      { id: 3, nombre: 'En Curso', color: '#007bff', descripcion: 'Consulta en progreso' },
      { id: 4, nombre: 'Completada', color: '#6f42c1', descripcion: 'Consulta finalizada' },
      { id: 5, nombre: 'Cancelada', color: '#dc3545', descripcion: 'Cita cancelada' },
      { id: 6, nombre: 'No Asistió', color: '#6c757d', descripcion: 'Cliente no asistió a la cita' }
    ];
  }

  // Obtener nombre del estado de cita
  getNombreEstadoCita(estadoCita: number): string {
    const estados = this.getEstadosCita();
    return estados.find(e => e.id === estadoCita)?.nombre || 'Desconocido';
  }

  // Obtener color del estado de cita
  getColorEstadoCita(estadoCita: number): string {
    const estados = this.getEstadosCita();
    return estados.find(e => e.id === estadoCita)?.color || '#6c757d';
  }

  // Validar si una cita se puede cancelar
  puedeCancelarCita(cita: any): boolean {
    const estadosPermitidos = [1, 2]; // Programada, Confirmada
    const fechaCita = new Date(cita.fechaCita);
    const ahora = new Date();
    const horasHastaaCita = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    
    return estadosPermitidos.includes(cita.estadoCita) && horasHastaaCita > 2; // Mínimo 2 horas antes
  }

  // Validar si una cita se puede reprogramar
  puedeReprogramarCita(cita: any): boolean {
    const estadosPermitidos = [1, 2]; // Programada, Confirmada
    const fechaCita = new Date(cita.fechaCita);
    const ahora = new Date();
    const horasHastaaCita = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    
    return estadosPermitidos.includes(cita.estadoCita) && horasHastaaCita > 4; // Mínimo 4 horas antes
  }

  // Validar horario de atención
  esHorarioValido(hora: string): boolean {
    const [horas, minutos] = hora.split(':').map(Number);
    const minutosEnHora = horas * 60 + minutos;
    
    // Horario de atención: 6:00 AM - 8:00 PM
    return minutosEnHora >= 360 && minutosEnHora <= 1200 && minutos % 15 === 0;
  }

  // Validar fecha de cita
  esFechaValidaParaCita(fecha: string): boolean {
    const fechaCita = new Date(fecha);
    const hoy = new Date();
    const unMesEnFuturo = new Date();
    unMesEnFuturo.setMonth(hoy.getMonth() + 2); // Máximo 2 meses adelante
    
    hoy.setHours(0, 0, 0, 0);
    fechaCita.setHours(0, 0, 0, 0);
    
    return fechaCita >= hoy && fechaCita <= unMesEnFuturo;
  }

  // Obtener especies disponibles
  getEspeciesDisponibles(): string[] {
    return ['Perro', 'Gato', 'Ave', 'Reptil', 'Pez', 'Hámster', 'Conejo', 'Otro'];
  }

  // Obtener géneros disponibles
  getGenerosDisponibles(): { valor: string; texto: string }[] {
    return [
      { valor: 'M', texto: 'Macho' },
      { valor: 'F', texto: 'Hembra' }
    ];
  }
}