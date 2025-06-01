import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CitaService, CitaDto, CancelarCitaDto } from 'src/app/services/cita.service';

interface TimelineItem {
  estado: string;
  fecha: string;
  descripcion?: string;
  clase: string;
}

@Component({
  selector: 'app-detalle-cita',
  templateUrl: './detalle-cita.component.html',
  styleUrls: ['./detalle-cita.component.css'],
  standalone: false,
})
export class DetalleCitaComponent implements OnInit {
  cita: CitaDto | null = null;
  cargando = false;
  error = '';
  citaId: number = 0;

  // Timeline de estados
  timelineEstados: TimelineItem[] = [];

  // Usuario actual
  usuarioActual = '';
  esAdministrador = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citaService: CitaService
  ) { }

  ngOnInit(): void {
    this.obtenerUsuarioActual();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.citaId = +params['id'];
        this.cargarCita();
      } else {
        this.error = 'ID de cita no válido';
      }
    });
  }

  private obtenerUsuarioActual(): void {
    // Implementar lógica para obtener el usuario actual
    this.usuarioActual = '1234567890'; // Valor por defecto
    this.esAdministrador = true; // Valor por defecto
  }

  cargarCita(): void {
    if (!this.citaId) return;

    this.cargando = true;
    this.error = '';

    this.citaService.getCitaById(this.citaId).subscribe(
      (cita: CitaDto) => {
        this.cita = cita;
        this.generarTimelineEstados();
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
      descripcion: `Creada por ${this.cita.creadoPor}`,
      clase: 'programada'
    });

    // Estados posteriores según el estado actual
    if (this.cita.estadoCita >= 2) {
      this.timelineEstados.push({
        estado: 'Cita Confirmada',
        fecha: this.formatearFecha(this.cita.fechaCreacion), // Aquí debería ser la fecha de confirmación
        clase: 'confirmada'
      });
    }

    if (this.cita.estadoCita >= 3) {
      this.timelineEstados.push({
        estado: 'Consulta Iniciada',
        fecha: this.formatearFecha(this.cita.fechaCreacion), // Aquí debería ser la fecha de inicio
        clase: 'en-curso'
      });
    }

    if (this.cita.estadoCita === 4) {
      this.timelineEstados.push({
        estado: 'Consulta Completada',
        fecha: this.formatearFecha(this.cita.fechaCreacion), // Aquí debería ser la fecha de completado
        clase: 'completada'
      });
    } else if (this.cita.estadoCita === 5) {
      this.timelineEstados.push({
        estado: 'Cita Cancelada',
        fecha: this.formatearFecha(this.cita.fechaCreacion), // Aquí debería ser la fecha de cancelación
        clase: 'cancelada'
      });
    } else if (this.cita.estadoCita === 6) {
      this.timelineEstados.push({
        estado: 'No Asistió',
        fecha: this.formatearFecha(this.cita.fechaCita),
        clase: 'no-asistio'
      });
    }

    // Invertir para mostrar más reciente primero
    this.timelineEstados.reverse();
  }

  // === MÉTODOS DE FORMATO ===

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '';
    return this.citaService.formatearFecha(fecha);
  }

  formatearHora(hora: string | undefined): string {
    if (!hora) return '';
    return this.citaService.formatearHora(hora);
  }

  getNombreEstado(): string {
    if (!this.cita) return '';
    return this.citaService.getNombreEstadoCita(this.cita.estadoCita);
  }

  getColorEstado(): string {
    if (!this.cita) return '#6c757d';
    return this.citaService.getColorEstadoCita(this.cita.estadoCita);
  }

  getNombreTipoCita(): string {
    if (!this.cita) return '';
    return this.citaService.getNombreTipoCita(this.cita.tipoCita);
  }

  obtenerDocumentoCliente(): string {
    // Esta información no está en CitaDto, tendría que obtenerse por separado
    // Por ahora retornamos un placeholder
    return 'No disponible';
  }

  obtenerTipoUsuarioCreador(): string {
    if (!this.cita) return '';
    return this.cita.tipoUsuarioCreador === 1 ? 'Administrador' : 'Cliente';
  }

  // === VALIDACIONES ===

  puedeEditar(): boolean {
    if (!this.cita) return false;
    return [1, 2].includes(this.cita.estadoCita);
  }

  mostrarAccionesRapidas(): boolean {
    if (!this.cita) return false;
    return [1, 2, 3].includes(this.cita.estadoCita);
  }

  mostrarTimeline(): boolean {
    return this.timelineEstados.length > 1;
  }

  // === ACCIONES ===

  volver(): void {
    this.router.navigate(['/dashboard/citas']);
  }

  editarCita(): void {
    if (this.cita && this.puedeEditar()) {
      this.router.navigate(['/dashboard/citas/editar', this.cita.id]);
    }
  }

  imprimirCita(): void {
    window.print();
  }

  // === CAMBIOS DE ESTADO ===

  confirmarCita(): void {
    if (!this.cita) return;

    if (confirm(`¿Confirmar la cita de ${this.cita.nombreCliente}?`)) {
      this.citaService.confirmarCita(this.cita.id).subscribe(
        () => {
          if (this.cita) {
            this.cita.estadoCita = 2; // Confirmada
            this.generarTimelineEstados();
          }
          this.mostrarMensajeExito('Cita confirmada exitosamente');
        },
        (error: any) => {
          console.error('Error al confirmar cita', error);
          this.mostrarMensajeError('Error al confirmar la cita');
        }
      );
    }
  }

  iniciarCita(): void {
    if (!this.cita) return;

    if (confirm(`¿Iniciar la consulta de ${this.cita.nombreCliente}?`)) {
      // Aquí se podría implementar un endpoint específico para cambiar a "En Curso"
      if (this.cita) {
        this.cita.estadoCita = 3; // En Curso
        this.generarTimelineEstados();
      }
      this.mostrarMensajeExito('Consulta iniciada');
    }
  }

  completarCita(): void {
    if (!this.cita) return;

    if (confirm(`¿Marcar como completada la cita de ${this.cita.nombreCliente}?`)) {
      this.citaService.completarCita(this.cita.id).subscribe(
        () => {
          if (this.cita) {
            this.cita.estadoCita = 4; // Completada
            this.generarTimelineEstados();
          }
          this.mostrarMensajeExito('Cita completada exitosamente');
        },
        (error: any) => {
          console.error('Error al completar cita', error);
          this.mostrarMensajeError('Error al completar la cita');
        }
      );
    }
  }

  reprogramarCita(): void {
    if (!this.cita) return;
    // Redirigir a la página de edición en modo reprogramación
    this.router.navigate(['/dashboard/citas/editar', this.cita.id], {
      queryParams: { modo: 'reprogramar' }
    });
  }

  cancelarCita(): void {
    if (!this.cita) return;

    const motivo = prompt('Ingrese el motivo de la cancelación:');
    if (motivo && motivo.trim()) {
      const datos: CancelarCitaDto = {
        motivoCancelacion: motivo.trim(),
        canceladoPor: this.usuarioActual
      };

      this.citaService.cancelarCita(this.cita.id, datos).subscribe(
        () => {
          if (this.cita) {
            this.cita.estadoCita = 5; // Cancelada
            this.generarTimelineEstados();
          }
          this.mostrarMensajeExito('Cita cancelada exitosamente');
        },
        (error: any) => {
          console.error('Error al cancelar cita', error);
          this.mostrarMensajeError('Error al cancelar la cita');
        }
      );
    }
  }

  // === NAVEGACIÓN A OTROS MÓDULOS ===

  verCliente(): void {
    // Obtener documento del cliente desde la cita y navegar
    // Como no tenemos el documento en CitaDto, tendríamos que implementar una búsqueda
    this.router.navigate(['/dashboard/clientes']);
  }

  verMascotasCliente(): void {
    // Navegar a las mascotas del cliente
    this.router.navigate(['/dashboard/mascotas']);
  }

  verMascota(): void {
    if (this.cita) {
      this.router.navigate(['/dashboard/mascotas/editar', this.cita.mascotaId]);
    }
  }

  verHistorialMascota(): void {
    if (this.cita) {
      this.router.navigate(['/dashboard/citas/mascota', this.cita.mascotaId]);
    }
  }

  verVeterinario(): void {
    if (this.cita) {
      this.router.navigate(['/dashboard/medicoveterinario']);
    }
  }

  verAgendaVeterinario(): void {
    if (this.cita) {
      this.router.navigate(['/dashboard/citas/veterinario', this.cita.medicoVeterinarioNumeroDocumento]);
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