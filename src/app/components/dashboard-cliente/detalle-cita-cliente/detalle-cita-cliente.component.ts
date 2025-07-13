import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService, CancelarCitaClienteDto, ReprogramarCitaClienteDto } from 'src/app/services/cliente.service';
import { TokenService } from 'src/app/services/token.service';
import { CitaService, HoraDisponibleDto } from 'src/app/services/cita.service';

interface TimelineItem {
  estado: string;
  fecha: string;
  descripcion?: string;
  clase: string;
}

@Component({
  selector: 'app-detalle-cita-cliente',
  templateUrl: './detalle-cita-cliente.component.html',
  styleUrls: ['./detalle-cita-cliente.component.css'],
  standalone: false,
})
export class DetalleCitaClienteComponent implements OnInit {
  cita: any = null;
  cargando = false;
  error = '';
  citaId: number = 0;

  // Datos del cliente
  numeroDocumento = '';
  clienteActual: any = null;

  // Timeline de estados
  timelineEstados: TimelineItem[] = [];

  // Modal para acciones
  mostrarModalCancelar = false;
  mostrarModalReprogramar = false;
  motivoCancelacion = '';

  // Reprogramación
  nuevaFecha = '';
  nuevaHora = '';
  horasDisponiblesReprogramacion: HoraDisponibleDto[] = [];
  cargandoHorasReprogramacion = false;
  fechaMinima = '';
  fechaMaxima = '';

  // Estados y tipos
  estadosCita = this.clienteService.getEstadosCita();
  tiposCita = this.clienteService.getTiposCitaCliente();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    private citaService: CitaService,
    private tokenService: TokenService
  ) {
    this.configurarFechas();
  }

  ngOnInit(): void {
    this.inicializarComponente();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.citaId = +params['id'];
        this.cargarCita();
      } else {
        this.error = 'ID de cita no válido';
      }
    });
  }

  private inicializarComponente(): void {
    const userData = this.tokenService.getUserData();
    if (userData) {
      this.numeroDocumento = userData.numeroDocumento || userData.identificacion;
      this.clienteActual = {
        nombre: userData.nombre || 'Cliente',
        numeroDocumento: this.numeroDocumento,
        email: userData.email || ''
      };
    } else {
      this.router.navigate(['/Login']);
    }
  }

  private configurarFechas(): void {
    const hoy = new Date();
    const unAno = new Date();
    unAno.setFullYear(hoy.getFullYear() + 1);

    this.fechaMinima = hoy.toISOString().split('T')[0];
    this.fechaMaxima = unAno.toISOString().split('T')[0];
  }

  cargarCita(): void {
    if (!this.citaId || !this.numeroDocumento) return;

    this.cargando = true;
    this.error = '';

    // Primero obtenemos todas las citas del cliente
    this.clienteService.getMisCitas(this.numeroDocumento).subscribe(
      (citas: any[]) => {
        // Buscar la cita específica entre las citas del cliente
        this.cita = citas.find(c => c.id === this.citaId);
        
        if (this.cita) {
          this.generarTimelineEstados();
        } else {
          this.error = 'No se encontró la cita o no tienes permisos para verla';
        }
        this.cargando = false;
      },
      (error: any) => {
        console.error('Error al cargar la cita', error);
        this.error = 'No se pudo cargar la información de la cita';
        this.cargando = false;
      }
    );
  }

  private generarTimelineEstados(): void {
    if (!this.cita) return;

    this.timelineEstados = [];

    // Estado programada (siempre existe)
    this.timelineEstados.push({
      estado: 'Cita Programada',
      fecha: this.formatearFecha(this.cita.fechaCreacion),
      descripcion: 'Cita agendada exitosamente',
      clase: 'programada'
    });

    // Estados posteriores según el estado actual
    if (this.cita.estadoCita >= 2) {
      this.timelineEstados.push({
        estado: 'Cita Confirmada',
        fecha: this.formatearFecha(this.cita.fechaCreacion),
        descripcion: 'Confirmada por el veterinario',
        clase: 'confirmada'
      });
    }

    if (this.cita.estadoCita >= 3) {
      this.timelineEstados.push({
        estado: 'Consulta Iniciada',
        fecha: this.formatearFecha(this.cita.fechaCita),
        descripcion: 'La consulta ha comenzado',
        clase: 'en-curso'
      });
    }

    if (this.cita.estadoCita === 4) {
      this.timelineEstados.push({
        estado: 'Consulta Completada',
        fecha: this.formatearFecha(this.cita.fechaCita),
        descripcion: 'Consulta finalizada exitosamente',
        clase: 'completada'
      });
    } else if (this.cita.estadoCita === 5) {
      this.timelineEstados.push({
        estado: 'Cita Cancelada',
        fecha: this.formatearFecha(this.cita.fechaCita),
        descripcion: this.cita.motivoCancelacion || 'Cita cancelada',
        clase: 'cancelada'
      });
    } else if (this.cita.estadoCita === 6) {
      this.timelineEstados.push({
        estado: 'No Asistió',
        fecha: this.formatearFecha(this.cita.fechaCita),
        descripcion: 'No se presentó a la cita',
        clase: 'no-asistio'
      });
    }

    // Invertir para mostrar más reciente primero
    this.timelineEstados.reverse();
  }

  // === MÉTODOS DE FORMATO ===

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '';
    return this.clienteService.formatearFecha(fecha);
  }

  formatearHora(hora: string | undefined): string {
    if (!hora) return '';
    return this.clienteService.formatearHora(hora);
  }

  getNombreEstado(): string {
    if (!this.cita) return '';
    return this.clienteService.getNombreEstadoCita(this.cita.estadoCita);
  }

  getColorEstado(): string {
    if (!this.cita) return '#6c757d';
    return this.clienteService.getColorEstadoCita(this.cita.estadoCita);
  }

  getNombreTipoCita(): string {
    if (!this.cita) return '';
    const tipo = this.tiposCita.find(t => t.id === this.cita.tipoCita);
    return tipo?.nombre || 'Desconocido';
  }

  // === VALIDACIONES ===

  puedeCancelar(): boolean {
    if (!this.cita) return false;
    return this.clienteService.puedeCancelarCita(this.cita);
  }

  puedeReprogramar(): boolean {
    if (!this.cita) return false;
    return this.clienteService.puedeReprogramarCita(this.cita);
  }

  mostrarAcciones(): boolean {
    if (!this.cita) return false;
    return [1, 2].includes(this.cita.estadoCita);
  }

  mostrarTimeline(): boolean {
    return this.timelineEstados.length > 1;
  }

  esCitaActiva(): boolean {
    if (!this.cita) return false;
    return [1, 2, 3].includes(this.cita.estadoCita);
  }

  // === ACCIONES ===

  volver(): void {
    this.router.navigate(['/dashboard-cliente/citas']);
  }

  imprimirCita(): void {
    window.print();
  }

  // === CANCELAR CITA ===

  cancelarCita(): void {
    if (!this.puedeCancelar()) {
      this.mostrarMensajeError('No puedes cancelar esta cita. Debe faltar más de 2 horas para la cita.');
      return;
    }

    this.motivoCancelacion = '';
    this.mostrarModalCancelar = true;
  }

  cerrarModalCancelar(): void {
    this.mostrarModalCancelar = false;
    this.motivoCancelacion = '';
  }

  confirmarCancelacion(): void {
    if (!this.cita || !this.motivoCancelacion?.trim()) {
      return;
    }

    const datos: CancelarCitaClienteDto = {
      motivoCancelacion: this.motivoCancelacion.trim()
    };

    this.clienteService.cancelarCita(this.numeroDocumento, this.cita.id, datos).subscribe(
      () => {
        this.cita.estadoCita = 5; // Cancelada
        this.cita.motivoCancelacion = this.motivoCancelacion.trim();
        this.generarTimelineEstados();
        this.cerrarModalCancelar();
        this.mostrarMensajeExito('Cita cancelada exitosamente');
      },
      (error: any) => {
        console.error('Error al cancelar cita', error);
        this.mostrarMensajeError('Error al cancelar la cita');
      }
    );
  }

  // === REPROGRAMAR CITA ===

  reprogramarCita(): void {
    if (!this.puedeReprogramar()) {
      this.mostrarMensajeError('No puedes reprogramar esta cita. Debe faltar más de 4 horas para la cita.');
      return;
    }

    this.nuevaFecha = '';
    this.nuevaHora = '';
    this.horasDisponiblesReprogramacion = [];
    this.mostrarModalReprogramar = true;
  }

  cerrarModalReprogramar(): void {
    this.mostrarModalReprogramar = false;
    this.nuevaFecha = '';
    this.nuevaHora = '';
    this.horasDisponiblesReprogramacion = [];
  }

  onNuevaFechaCambio(): void {
    if (this.nuevaFecha && this.cita) {
      this.cargarHorasDisponiblesReprogramacion();
    }
  }

  private cargarHorasDisponiblesReprogramacion(): void {
    if (!this.cita || !this.nuevaFecha) return;

    this.cargandoHorasReprogramacion = true;
    this.horasDisponiblesReprogramacion = [];

    this.citaService.getHorasDisponibles(
      this.cita.medicoVeterinarioNumeroDocumento,
      this.nuevaFecha,
      this.cita.duracionMinutos
    ).subscribe(
      (horas: HoraDisponibleDto[]) => {
        this.horasDisponiblesReprogramacion = horas.filter(h => h.disponible);
        this.cargandoHorasReprogramacion = false;
      },
      (error: any) => {
        console.error('Error al cargar horas disponibles', error);
        this.horasDisponiblesReprogramacion = [];
        this.cargandoHorasReprogramacion = false;
        this.mostrarMensajeError('Error al cargar horarios disponibles');
      }
    );
  }

  confirmarReprogramacion(): void {
    if (!this.cita || !this.nuevaFecha || !this.nuevaHora) {
      return;
    }

    const datos: ReprogramarCitaClienteDto = {
      nuevaFecha: this.nuevaFecha,
      nuevaHora: this.nuevaHora
    };

    this.clienteService.reprogramarCita(this.numeroDocumento, this.cita.id, datos).subscribe(
      () => {
        // Actualizar los datos de la cita
        this.cita.fechaCita = this.nuevaFecha;
        this.cita.horaInicio = this.nuevaHora;
        
        // Calcular nueva hora fin
        const horaInicio = new Date(`2000-01-01T${this.nuevaHora}`);
        horaInicio.setMinutes(horaInicio.getMinutes() + this.cita.duracionMinutos);
        this.cita.horaFin = horaInicio.toTimeString().substring(0, 8);
        
        this.generarTimelineEstados();
        this.cerrarModalReprogramar();
        this.mostrarMensajeExito('Cita reprogramada exitosamente');
      },
      (error: any) => {
        console.error('Error al reprogramar cita', error);
        this.mostrarMensajeError('Error al reprogramar la cita');
      }
    );
  }

  // === NAVEGACIÓN A OTROS MÓDULOS ===

  verMascota(): void {
    if (this.cita) {
      this.router.navigate(['/dashboard-cliente/mascotas/editar', this.cita.mascotaId]);
    }
  }

  verHistorialMascota(): void {
    if (this.cita) {
      this.router.navigate(['/dashboard-cliente/historial/mascota', this.cita.mascotaId]);
    }
  }

  verTodasMisCitas(): void {
    this.router.navigate(['/dashboard-cliente/citas']);
  }

  agendarNuevaCita(): void {
    this.router.navigate(['/dashboard-cliente/citas/nueva']);
  }

  // === INFORMACIÓN ADICIONAL ===

  obtenerInformacionCompleta(): any {
    if (!this.cita) return null;

    return {
      cita: this.cita,
      puedeModificar: this.puedeCancelar() || this.puedeReprogramar(),
      esProxima: this.esCitaProxima(),
      tiempoRestante: this.obtenerTiempoRestante()
    };
  }

  private esCitaProxima(): boolean {
    if (!this.cita) return false;
    const fechaCita = new Date(`${this.cita.fechaCita}T${this.cita.horaInicio}`);
    const ahora = new Date();
    const unDia = 24 * 60 * 60 * 1000;
    
    return fechaCita > ahora && (fechaCita.getTime() - ahora.getTime()) <= unDia;
  }

  obtenerTiempoRestante(): string {
    if (!this.cita || ![1, 2].includes(this.cita.estadoCita)) return '';
    
    const fechaCita = new Date(`${this.cita.fechaCita}T${this.cita.horaInicio}`);
    const ahora = new Date();
    const diferencia = fechaCita.getTime() - ahora.getTime();
    
    if (diferencia <= 0) return 'Cita vencida';
    
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (dias > 0) {
      return `${dias} día${dias > 1 ? 's' : ''} y ${horas} hora${horas !== 1 ? 's' : ''}`;
    } else {
      return `${horas} hora${horas !== 1 ? 's' : ''}`;
    }
  }

  // === MÉTODOS DE UTILIDAD ===

  private mostrarMensajeExito(mensaje: string): void {
    // Implementar sistema de notificaciones
    alert(mensaje);
  }

  private mostrarMensajeError(mensaje: string): void {
    // Implementar sistema de notificaciones
    alert(mensaje);
  }
}