import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ClienteService, ReprogramarCitaClienteDto, CancelarCitaClienteDto } from 'src/app/services/cliente.service';
import { TokenService } from 'src/app/services/token.service';
import { CitaService, HoraDisponibleDto } from 'src/app/services/cita.service';

@Component({
  selector: 'app-lista-citas-cliente',
  templateUrl: './lista-citas-cliente.component.html',
  styleUrls: ['./lista-citas-cliente.component.css'],
  standalone: false,
})
export class ListaCitasClienteComponent implements OnInit {
  citas: any[] = [];
  citasFiltradas: any[] = [];
  cargando = false;

  // Datos del cliente
  numeroDocumento = '';
  clienteActual: any = null;

  // Filtros
  filtroFecha = '';
  filtroEstado: number | null = null;
  filtroMascota = '';
  soloProximas = false;

  // Estados y tipos
  estadosCita = this.clienteService.getEstadosCita();
  tiposCita = this.clienteService.getTiposCitaCliente();

  // Modales
  mostrarModalCancelar = false;
  mostrarModalReprogramar = false;
  citaSeleccionada: any = null;
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
    private clienteService: ClienteService,
    private citaService: CitaService,
    private tokenService: TokenService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.configurarFechas();
  }

  ngOnInit(): void {
    this.inicializarComponente();
    this.verificarParametrosRuta();
    this.cargarCitas();
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

  private verificarParametrosRuta(): void {
    this.route.params.subscribe(params => {
      if (params['mascotaId']) {
        this.filtroEspecial = 'mascota';
        this.valorFiltroEspecial = params['mascotaId'];
      }
    });

    // Verificar si es "mis próximas citas"
    if (this.router.url.includes('/proximas')) {
      this.soloProximas = true;
    }
  }

  cargarCitas(): void {
    if (!this.numeroDocumento) return;

    this.cargando = true;

    let observable;
    
    if (this.soloProximas) {
      observable = this.clienteService.getProximasCitas(this.numeroDocumento);
    } else {
      observable = this.clienteService.getMisCitas(this.numeroDocumento);
    }

    observable.subscribe(
      (citas: any[]) => {
        this.citas = citas.sort((a, b) => {
          // Ordenar por fecha y hora, más recientes primero
          const fechaA = new Date(`${a.fechaCita}T${a.horaInicio}`);
          const fechaB = new Date(`${b.fechaCita}T${b.horaInicio}`);
          return fechaB.getTime() - fechaA.getTime();
        });

        // Si hay filtro de mascota específica, aplicarlo
        if (this.filtroEspecial === 'mascota') {
          this.citas = this.citas.filter(c => c.mascotaId == this.valorFiltroEspecial);
        }

        this.aplicarFiltros();
        this.cargando = false;
      },
      (error: any) => {
        console.error('Error al cargar citas', error);
        this.citas = [];
        this.citasFiltradas = [];
        this.cargando = false;
        this.mostrarMensajeError('Error al cargar las citas');
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

      // Filtro por mascota (nombre)
      if (this.filtroMascota && !cita.nombreMascota?.toLowerCase().includes(this.filtroMascota.toLowerCase())) {
        return false;
      }

      return true;
    });
  }

  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroEstado = null;
    this.filtroMascota = '';
    this.aplicarFiltros();
  }

  tieneFlitrosActivos(): boolean {
    return !!(this.filtroFecha || this.filtroEstado !== null || this.filtroMascota);
  }

  // === ACCIONES DE CITA ===

  nuevaCita(): void {
    this.router.navigate(['/dashboard-cliente/citas/nueva']);
  }

  verDetalles(cita: any): void {
    this.router.navigate(['/dashboard-cliente/citas/detalle', cita.id]);
  }

  editarCita(cita: any): void {
    if (this.puedeEditar(cita)) {
      this.router.navigate(['/dashboard-cliente/citas/editar', cita.id]);
    }
  }

  puedeEditar(cita: any): boolean {
    // Solo se pueden editar citas programadas o confirmadas
    // Y debe faltar más de 2 horas para la cita
    if (![1, 2].includes(cita.estadoCita)) return false;
    
    const fechaCita = new Date(`${cita.fechaCita}T${cita.horaInicio}`);
    const ahora = new Date();
    const horasHastaCita = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    
    return horasHastaCita > 2;
  }

  // === CANCELAR CITA ===

  cancelarCita(cita: any): void {
    if (!this.clienteService.puedeCancelarCita(cita)) {
      this.mostrarMensajeError('No puedes cancelar esta cita. Debe faltar más de 2 horas para la cita.');
      return;
    }

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

    const datos: CancelarCitaClienteDto = {
      motivoCancelacion: this.motivoCancelacion.trim()
    };

    this.clienteService.cancelarCita(this.numeroDocumento, this.citaSeleccionada.id, datos).subscribe(
      () => {
        if (this.citaSeleccionada) {
          this.citaSeleccionada.estadoCita = 5; // Cancelada
        }
        this.aplicarFiltros();
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

  reprogramarCita(cita: any): void {
    if (!this.clienteService.puedeReprogramarCita(cita)) {
      this.mostrarMensajeError('No puedes reprogramar esta cita. Debe faltar más de 4 horas para la cita.');
      return;
    }

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
        this.mostrarMensajeError('Error al cargar horarios disponibles');
      }
    );
  }

  confirmarReprogramacion(): void {
    if (!this.citaSeleccionada || !this.nuevaFecha || !this.nuevaHora) {
      return;
    }

    const datos: ReprogramarCitaClienteDto = {
      nuevaFecha: this.nuevaFecha,
      nuevaHora: this.nuevaHora
    };

    this.clienteService.reprogramarCita(this.numeroDocumento, this.citaSeleccionada.id, datos).subscribe(
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
        this.mostrarMensajeExito('Cita reprogramada exitosamente');
      },
      (error: any) => {
        console.error('Error al reprogramar cita', error);
        this.mostrarMensajeError('Error al reprogramar la cita');
      }
    );
  }

  // === NAVEGACIÓN ===

  verMascota(mascotaId: number): void {
    this.router.navigate(['/dashboard-cliente/mascotas/editar', mascotaId]);
  }

  verHistorialMascota(mascotaId: number): void {
    this.router.navigate(['/dashboard-cliente/historial/mascota', mascotaId]);
  }

  // === MÉTODOS DE FORMATO ===

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '';
    return this.clienteService.formatearFecha(fecha);
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
    return this.clienteService.formatearHora(hora);
  }

  getNombreEstado(estadoCita: number): string {
    return this.clienteService.getNombreEstadoCita(estadoCita);
  }

  getColorEstado(estadoCita: number): string {
    return this.clienteService.getColorEstadoCita(estadoCita);
  }

  getNombreTipoCita(tipoCita: number): string {
    const tipo = this.tiposCita.find(t => t.id === tipoCita);
    return tipo?.nombre || 'Desconocido';
  }

  // === VALIDACIONES ADICIONALES ===

  puedeCancelar(cita: any): boolean {
    return this.clienteService.puedeCancelarCita(cita);
  }

  puedeReprogramar(cita: any): boolean {
    return this.clienteService.puedeReprogramarCita(cita);
  }

  esCitaProxima(cita: any): boolean {
    const fechaCita = new Date(`${cita.fechaCita}T${cita.horaInicio}`);
    const ahora = new Date();
    return fechaCita > ahora && [1, 2].includes(cita.estadoCita);
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

  // === ESTADÍSTICAS PARA EL CLIENTE ===

  get citasProximas(): number {
    return this.citas.filter(c => this.esCitaProxima(c)).length;
  }

  get citasCompletadas(): number {
    return this.citas.filter(c => c.estadoCita === 4).length;
  }

  get citasCanceladas(): number {
    return this.citas.filter(c => c.estadoCita === 5).length;
  }
}