import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CitaService, CitaDto, CancelarCitaDto, HoraDisponibleDto } from 'src/app/services/cita.service';

@Component({
  selector: 'app-lista-citas',
  templateUrl: './lista-citas.component.html',
  styleUrls: ['./lista-citas.component.css'],
  standalone: false,
})
export class ListaCitasComponent implements OnInit {
  citas: CitaDto[] = [];
  citasFiltradas: CitaDto[] = [];
  cargando = false;

  // Filtros
  filtroFecha = '';
  filtroEstado: number | null = null;
  filtroVeterinario = '';
  filtroCliente = '';
  soloActivas = true;

  // Estados y tipos
  estadosCita = this.citaService.getEstadosCita();
  tiposCita = this.citaService.getTiposCita();

  // Modales
  mostrarModalCancelar = false;
  mostrarModalReprogramar = false;
  citaSeleccionada: CitaDto | null = null;
  motivoCancelacion = '';

  // Reprogramación
  nuevaFecha = '';
  nuevaHora = '';
  horasDisponiblesReprogramacion: HoraDisponibleDto[] = [];
  cargandoHorasReprogramacion = false;
  fechaMinima = '';
  fechaMaxima = '';

  // Parámetros de ruta
  filtroEspecial = '';
  valorFiltroEspecial = '';

  constructor(
    private citaService: CitaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.configurarFechas();
  }

  ngOnInit(): void {
    this.verificarParametrosRuta();
    this.cargarCitas();
  }

  private configurarFechas(): void {
    const hoy = new Date();
    const unAno = new Date();
    unAno.setFullYear(hoy.getFullYear() + 1);

    this.fechaMinima = hoy.toISOString().split('T')[0];
    this.fechaMaxima = unAno.toISOString().split('T')[0];
  }

  private verificarParametrosRuta(): void {
    this.route.params.subscribe(params => {
      if (params['numeroDocumento']) {
        // Determinar si es cliente o veterinario basado en la URL
        const url = this.router.url;
        if (url.includes('/cliente/')) {
          this.filtroEspecial = 'cliente';
          this.valorFiltroEspecial = params['numeroDocumento'];
        } else if (url.includes('/veterinario/')) {
          this.filtroEspecial = 'veterinario';
          this.valorFiltroEspecial = params['numeroDocumento'];
        }
      } else if (params['mascotaId']) {
        this.filtroEspecial = 'mascota';
        this.valorFiltroEspecial = params['mascotaId'];
      }
    });

    // Verificar si es "mis citas" para veterinario
    if (this.router.url.includes('/mis-citas')) {
      this.filtroEspecial = 'veterinario';
      this.valorFiltroEspecial = this.obtenerUsuarioActual();
    }
  }

  private obtenerUsuarioActual(): string {
    // Implementar lógica para obtener el usuario actual
    // Por ahora retornamos un valor por defecto
    return '1234567890';
  }

  cargarCitas(): void {
    this.cargando = true;

    let observable;

    // Seleccionar el método apropiado según el filtro especial
    switch (this.filtroEspecial) {
      case 'cliente':
        observable = this.citaService.getCitasPorCliente(this.valorFiltroEspecial);
        break;
      case 'veterinario':
        observable = this.citaService.getCitasPorVeterinario(this.valorFiltroEspecial);
        break;
      case 'mascota':
        observable = this.citaService.getCitasPorMascota(parseInt(this.valorFiltroEspecial));
        break;
      default:
        observable = this.citaService.getCitas();
    }

    observable.subscribe(
      (citas: CitaDto[]) => {
        this.citas = citas.sort((a, b) => {
          // Ordenar por fecha y hora, más recientes primero
          const fechaA = new Date(`${a.fechaCita}T${a.horaInicio}`);
          const fechaB = new Date(`${b.fechaCita}T${b.horaInicio}`);
          return fechaB.getTime() - fechaA.getTime();
        });
        this.aplicarFiltros();
        this.cargando = false;
      },
      (error: any) => {
        console.error('Error al cargar citas', error);
        this.citas = [];
        this.citasFiltradas = [];
        this.cargando = false;
      }
    );
  }

  aplicarFiltros(): void {
    this.citasFiltradas = this.citas.filter(cita => {
      // Filtro por fecha
      if (this.filtroFecha && cita.fechaCita !== this.filtroFecha) {
        return false;
      }

      // Filtro por estado
      if (this.filtroEstado !== null && cita.estadoCita !== this.filtroEstado) {
        return false;
      }

      // Filtro por veterinario
      if (this.filtroVeterinario && !cita.nombreVeterinario?.toLowerCase().includes(this.filtroVeterinario.toLowerCase())) {
        return false;
      }

      // Filtro por cliente
      if (this.filtroCliente && !cita.nombreCliente?.toLowerCase().includes(this.filtroCliente.toLowerCase())) {
        return false;
      }

      // Filtro solo activas
      if (this.soloActivas && [4, 5, 6].includes(cita.estadoCita)) {
        return false;
      }

      return true;
    });
  }

  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroEstado = null;
    this.filtroVeterinario = '';
    this.filtroCliente = '';
    this.soloActivas = true;
    this.aplicarFiltros();
  }

  tieneFlitrosActivos(): boolean {
    return !!(this.filtroFecha || this.filtroEstado !== null || this.filtroVeterinario || this.filtroCliente || !this.soloActivas);
  }

  // === ACCIONES DE CITA ===

  nuevaCita(): void {
    this.router.navigate(['/dashboard/citas/nueva']);
  }

  verDetalles(cita: CitaDto): void {
    // Implementar vista de detalles o mostrar modal
    console.log('Ver detalles de cita:', cita);
    // this.router.navigate(['/dashboard/citas/detalle', cita.id]);
  }

  editarCita(cita: CitaDto): void {
    if (this.puedeEditar(cita)) {
      this.router.navigate(['/dashboard/citas/editar', cita.id]);
    }
  }

  puedeEditar(cita: CitaDto): boolean {
    // Solo se pueden editar citas programadas o confirmadas
    return [1, 2].includes(cita.estadoCita);
  }

  // === CAMBIOS DE ESTADO ===

  confirmarCita(cita: CitaDto): void {
    if (confirm(`¿Confirmar la cita de ${cita.nombreCliente}?`)) {
      this.citaService.confirmarCita(cita.id).subscribe(
        () => {
          cita.estadoCita = 2; // Confirmada
          this.aplicarFiltros();
          // Mostrar mensaje de éxito
        },
        (error: any) => {
          console.error('Error al confirmar cita', error);
          alert('Error al confirmar la cita');
        }
      );
    }
  }

  iniciarCita(cita: CitaDto): void {
    if (confirm(`¿Iniciar la consulta de ${cita.nombreCliente}?`)) {
      // Cambiar estado a "En Curso" - esto podría requerir un endpoint específico
      // Por ahora usamos el endpoint genérico de actualización
      cita.estadoCita = 3; // En Curso
      this.aplicarFiltros();
    }
  }

  completarCita(cita: CitaDto): void {
    if (confirm(`¿Marcar como completada la cita de ${cita.nombreCliente}?`)) {
      this.citaService.completarCita(cita.id).subscribe(
        () => {
          cita.estadoCita = 4; // Completada
          this.aplicarFiltros();
          // Mostrar mensaje de éxito
        },
        (error: any) => {
          console.error('Error al completar cita', error);
          alert('Error al completar la cita');
        }
      );
    }
  }

  // === CANCELAR CITA ===

  cancelarCita(cita: CitaDto): void {
    this.citaSeleccionada = cita;
    this.motivoCancelacion = '';
    this.mostrarModalCancelar = true;
  }

  cerrarModalCancelar(): void {
    this.mostrarModalCancelar = false;
    this.citaSeleccionada = null;
    this.motivoCancelacion = '';
  }

  confirmarCancelacion(): void {
    if (!this.citaSeleccionada || !this.motivoCancelacion?.trim()) {
      return;
    }

    const datos: CancelarCitaDto = {
      motivoCancelacion: this.motivoCancelacion.trim(),
      canceladoPor: this.obtenerUsuarioActual()
    };

    this.citaService.cancelarCita(this.citaSeleccionada.id, datos).subscribe(
      () => {
        if (this.citaSeleccionada) {
          this.citaSeleccionada.estadoCita = 5; // Cancelada
        }
        this.aplicarFiltros();
        this.cerrarModalCancelar();
        // Mostrar mensaje de éxito
      },
      (error: any) => {
        console.error('Error al cancelar cita', error);
        alert('Error al cancelar la cita');
      }
    );
  }

  // === REPROGRAMAR CITA ===

  reprogramarCita(cita: CitaDto): void {
    this.citaSeleccionada = cita;
    this.nuevaFecha = '';
    this.nuevaHora = '';
    this.horasDisponiblesReprogramacion = [];
    this.mostrarModalReprogramar = true;
  }

  cerrarModalReprogramar(): void {
    this.mostrarModalReprogramar = false;
    this.citaSeleccionada = null;
    this.nuevaFecha = '';
    this.nuevaHora = '';
    this.horasDisponiblesReprogramacion = [];
  }

  onNuevaFechaCambio(): void {
    if (this.nuevaFecha && this.citaSeleccionada) {
      this.cargarHorasDisponiblesReprogramacion();
    }
  }

  private cargarHorasDisponiblesReprogramacion(): void {
    if (!this.citaSeleccionada || !this.nuevaFecha) return;

    this.cargandoHorasReprogramacion = true;
    this.horasDisponiblesReprogramacion = [];

    this.citaService.getHorasDisponibles(
      this.citaSeleccionada.medicoVeterinarioNumeroDocumento,
      this.nuevaFecha,
      this.citaSeleccionada.duracionMinutos
    ).subscribe(
      (horas: HoraDisponibleDto[]) => {
        this.horasDisponiblesReprogramacion = horas.filter(h => h.disponible);
        this.cargandoHorasReprogramacion = false;
      },
      (error: any) => {
        console.error('Error al cargar horas disponibles', error);
        this.horasDisponiblesReprogramacion = [];
        this.cargandoHorasReprogramacion = false;
      }
    );
  }

  confirmarReprogramacion(): void {
    if (!this.citaSeleccionada || !this.nuevaFecha || !this.nuevaHora) {
      return;
    }

    this.citaService.reprogramarCita(this.citaSeleccionada.id, this.nuevaFecha, this.nuevaHora).subscribe(
      () => {
        if (this.citaSeleccionada) {
          this.citaSeleccionada.fechaCita = this.nuevaFecha;
          this.citaSeleccionada.horaInicio = this.nuevaHora;
          // Calcular nueva hora fin
          const horaInicio = new Date(`2000-01-01T${this.nuevaHora}`);
          horaInicio.setMinutes(horaInicio.getMinutes() + this.citaSeleccionada.duracionMinutos);
          this.citaSeleccionada.horaFin = horaInicio.toTimeString().substring(0, 8);
        }
        this.aplicarFiltros();
        this.cerrarModalReprogramar();
        // Mostrar mensaje de éxito
      },
      (error: any) => {
        console.error('Error al reprogramar cita', error);
        alert('Error al reprogramar la cita');
      }
    );
  }

  // === MÉTODOS DE FORMATO ===

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '';
    return this.citaService.formatearFecha(fecha);
  }

  formatearFechaCard(fecha: string): string {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

  formatearHora(hora: string | undefined): string {
    if (!hora) return '';
    return this.citaService.formatearHora(hora);
  }

  getNombreEstado(estadoCita: number): string {
    return this.citaService.getNombreEstadoCita(estadoCita);
  }

  getColorEstado(estadoCita: number): string {
    return this.citaService.getColorEstadoCita(estadoCita);
  }

  getNombreTipoCita(tipoCita: number): string {
    return this.citaService.getNombreTipoCita(tipoCita);
  }
}