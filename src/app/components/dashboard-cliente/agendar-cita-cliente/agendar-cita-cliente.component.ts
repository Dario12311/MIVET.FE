import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService, CrearCitaClienteDto } from 'src/app/services/cliente.service';
import { TokenService } from 'src/app/services/token.service';
import { CitaService, VeterinarioDisponibleDto, HoraDisponibleDto } from 'src/app/services/cita.service';

@Component({
  selector: 'app-agendar-cita-cliente',
  templateUrl: './agendar-cita-cliente.component.html',
  styleUrls: ['./agendar-cita-cliente.component.css'],
  standalone: false,
})
export class AgendarCitaClienteComponent implements OnInit {
  citaForm: FormGroup;
  cargando = false;
  guardando = false;

  // Datos del cliente logueado
  clienteActual: any = null;
  numeroDocumento = '';

  // Mascotas del cliente
  mascotasCliente: any[] = [];
  cargandoMascotas = false;

  // Veterinarios disponibles
  veterinariosDisponibles: VeterinarioDisponibleDto[] = [];
  cargandoVeterinarios = false;
  veterinarioSeleccionado: VeterinarioDisponibleDto | null = null;
  horaSeleccionada = '';

  // Fechas
  fechaMinima = '';
  fechaMaxima = '';

  // Tipos de cita y duraciones
  tiposCita = this.clienteService.getTiposCitaCliente();
  duracionesDisponibles: number[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private clienteService: ClienteService,
    private citaService: CitaService,
    private tokenService: TokenService
  ) {
    this.citaForm = this.createForm();
    this.configurarFechas();
  }

  ngOnInit(): void {
    this.inicializarComponente();
  }

  private inicializarComponente(): void {
    this.obtenerDatosClienteLogueado();
    this.cargarMascotasCliente();
  }

  private obtenerDatosClienteLogueado(): void {
    const userData = this.tokenService.getUserData();
    if (userData) {
      this.numeroDocumento = userData.numeroDocumento || userData.identificacion;
      this.clienteActual = {
        nombre: userData.nombre || 'Cliente',
        numeroDocumento: this.numeroDocumento,
        email: userData.email || ''
      };
    } else {
      // Si no hay datos de usuario, redirigir al login
      this.router.navigate(['/Login']);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      mascotaId: ['', Validators.required],
      fechaCita: ['', [Validators.required, this.validarFecha.bind(this)]],
      tipoCita: ['', Validators.required],
      duracionMinutos: [30, [Validators.required, Validators.min(15)]],
      motivoConsulta: ['', [Validators.required, Validators.minLength(10)]],
      observaciones: ['']
    });
  }

  private configurarFechas(): void {
    const hoy = new Date();
    const dosAños = new Date();
    dosAños.setFullYear(hoy.getFullYear() + 2);

    this.fechaMinima = hoy.toISOString().split('T')[0];
    this.fechaMaxima = dosAños.toISOString().split('T')[0];
  }

  // Validador personalizado para fecha
  validarFecha(control: any) {
    if (!control.value) return null;
    
    const fecha = new Date(control.value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fecha < hoy) {
      return { fechaInvalida: true };
    }
    
    return null;
  }

  // === GESTIÓN DE MASCOTAS ===

  cargarMascotasCliente(): void {
    if (!this.numeroDocumento) return;

    this.cargandoMascotas = true;
    this.clienteService.getMisMascotas(this.numeroDocumento).subscribe(
      (mascotas: any[]) => {
        this.mascotasCliente = mascotas.filter(m => m.estado === 'A');
        this.cargandoMascotas = false;
      },
      (error: any) => {
        console.error('Error al cargar mascotas', error);
        this.mascotasCliente = [];
        this.cargandoMascotas = false;
        this.mostrarMensajeError('Error al cargar las mascotas');
      }
    );
  }

  // === GESTIÓN DE FECHAS Y TIPOS ===

  onFechaCambio(): void {
    const fecha = this.citaForm.get('fechaCita')?.value;
    if (fecha && this.citaForm.get('tipoCita')?.value) {
      this.buscarVeterinariosDisponibles();
    }
    this.limpiarSeleccionVeterinario();
  }

  onTipoCitaCambio(): void {
    const tipoCita = this.citaForm.get('tipoCita')?.value;
    if (tipoCita) {
      this.configurarDuracionesPorTipo(parseInt(tipoCita));
      if (this.citaForm.get('fechaCita')?.value) {
        this.buscarVeterinariosDisponibles();
      }
    }
    this.limpiarSeleccionVeterinario();
  }

  configurarDuracionesPorTipo(tipoCita: number): void {
    const tipo = this.tiposCita.find(t => t.id === tipoCita);
    const duracionMinima = tipo?.duracionMinima || 15;
    
    // Generar duraciones disponibles en múltiplos de 15 minutos
    this.duracionesDisponibles = [];
    for (let i = duracionMinima; i <= 240; i += 15) { // Máximo 4 horas
      this.duracionesDisponibles.push(i);
    }
    
    // Establecer duración por defecto
    this.citaForm.patchValue({
      duracionMinutos: duracionMinima
    });
  }

  // === GESTIÓN DE VETERINARIOS ===

  buscarVeterinariosDisponibles(): void {
    const fecha = this.citaForm.get('fechaCita')?.value;
    const tipoCita = this.citaForm.get('tipoCita')?.value;
    
    if (!fecha || !tipoCita) return;

    this.cargandoVeterinarios = true;
    this.veterinariosDisponibles = [];
    
    const tipo = this.tiposCita.find(t => t.id === parseInt(tipoCita));
    const duracionMinutos = tipo?.duracionMinima || 30;

    this.citaService.buscarVeterinariosDisponibles(fecha, undefined, duracionMinutos).subscribe(
      (respuesta: any[]) => {
        this.veterinariosDisponibles = respuesta.map((v: any) => ({
          numeroDocumento: v.medicoVeterinarioNumeroDocumento,
          nombre: v.nombreVeterinario,
          especialidad: v.especialidadVeterinario || 'General',
          horasDisponibles: (v.slotsDisponibles || [])
            .filter((slot: any) => slot.esDisponible)
            .map((slot: any) => ({
              hora: slot.horaInicio,
              disponible: slot.esDisponible,
              motivoNoDisponible: slot.razonNoDisponible || ''
            }))
        }));
    
        this.cargandoVeterinarios = false;
      },
      (error: any) => {
        console.error('Error al buscar veterinarios disponibles', error);
        this.veterinariosDisponibles = [];
        this.cargandoVeterinarios = false;
        this.mostrarMensajeError('Error al buscar veterinarios disponibles');
      }
    );
  }

  seleccionarVeterinario(veterinario: VeterinarioDisponibleDto): void {
    this.veterinarioSeleccionado = veterinario;
    this.horaSeleccionada = ''; // Limpiar hora seleccionada
  }

  seleccionarHora(hora: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.horaSeleccionada = hora;
  }

  limpiarSeleccionVeterinario(): void {
    this.veterinarioSeleccionado = null;
    this.horaSeleccionada = '';
    this.veterinariosDisponibles = [];
  }

  // === GETTERS PARA TEMPLATE ===

  get mostrarResumen(): boolean {
    return !!(
      this.clienteActual &&
      this.citaForm.get('mascotaId')?.value &&
      this.citaForm.get('fechaCita')?.value &&
      this.citaForm.get('tipoCita')?.value &&
      this.veterinarioSeleccionado &&
      this.horaSeleccionada &&
      this.citaForm.get('motivoConsulta')?.value
    );
  }

  obtenerNombreClienteCompleto(): string {
    return this.clienteActual?.nombre || '';
  }

  obtenerNombreMascota(): string {
    const mascotaId = this.citaForm.get('mascotaId')?.value;
    const mascota = this.mascotasCliente.find(m => m.id == mascotaId);
    return mascota ? `${mascota.nombre} (${mascota.especie})` : '';
  }

  obtenerNombreTipoCita(): string {
    const tipoCitaId = this.citaForm.get('tipoCita')?.value;
    const tipo = this.tiposCita.find(t => t.id === parseInt(tipoCitaId));
    return tipo?.nombre || '';
  }

  formatearFechaResumen(): string {
    const fecha = this.citaForm.get('fechaCita')?.value;
    return fecha ? this.clienteService.formatearFecha(fecha) : '';
  }

  formatearHora(hora: string): string {
    return this.clienteService.formatearHora(hora);
  }

  // === GUARDAR CITA ===

  guardarCita(): void {
    if (this.citaForm.invalid || !this.mostrarResumen) {
      this.marcarCamposComoTocados();
      return;
    }

    this.guardando = true;
    
    const formData = this.citaForm.value;
    
    const nuevaCita: CrearCitaClienteDto = {
      mascotaId: parseInt(formData.mascotaId),
      medicoVeterinarioNumeroDocumento: this.veterinarioSeleccionado!.numeroDocumento,
      fechaCita: formData.fechaCita,
      horaInicio: this.formatearHoraParaEnvio(this.horaSeleccionada),
      duracionMinutos: formData.duracionMinutos,
      tipoCita: parseInt(formData.tipoCita),
      motivoConsulta: formData.motivoConsulta.trim(),
      observaciones: formData.observaciones?.trim() || ''
    };

    // Verificar disponibilidad antes de crear
    this.citaService.verificarDisponibilidad({
      medicoVeterinarioNumeroDocumento: nuevaCita.medicoVeterinarioNumeroDocumento,
      fechaCita: nuevaCita.fechaCita,
      horaInicio: nuevaCita.horaInicio,
      duracionMinutos: nuevaCita.duracionMinutos
    }).subscribe(
      (verificacion) => {
        if (verificacion.disponible) {
          this.crearCita(nuevaCita);
        } else {
          this.guardando = false;
          this.mostrarMensajeError(`No se puede agendar la cita: ${verificacion.mensaje || 'Horario no disponible'}`);
          this.buscarVeterinariosDisponibles(); // Refrescar disponibilidad
        }
      },
      (error) => {
        console.error('Error al verificar disponibilidad', error);
        this.guardando = false;
        this.mostrarMensajeError('Error al verificar la disponibilidad del horario');
      }
    );
  }

  private crearCita(cita: CrearCitaClienteDto): void {
    this.clienteService.agendarCita(this.numeroDocumento, cita).subscribe(
      (citaCreada) => {
        this.guardando = false;
        this.mostrarMensajeExito('¡Cita agendada exitosamente!');
        this.router.navigate(['/dashboard-cliente/citas']);
      },
      (error) => {
        console.error('Error al crear la cita', error);
        this.guardando = false;
        
        let mensaje = 'Error al agendar la cita';
        if (error.error?.message) {
          mensaje = error.error.message;
        } else if (typeof error.error === 'string') {
          mensaje = error.error;
        }
        
        this.mostrarMensajeError(mensaje);
      }
    );
  }

  private formatearHoraParaEnvio(hora: string): string {
    // Asegurar formato HH:mm:ss
    if (hora.length === 5) return hora + ":00";
    return hora;
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.citaForm.controls).forEach(key => {
      const control = this.citaForm.get(key);
      control?.markAsTouched();
    });
  }

  // === NAVEGACIÓN ===

  volver(): void {
    this.router.navigate(['/dashboard-cliente/citas']);
  }

  irARegistrarMascota(): void {
    this.router.navigate(['/dashboard-cliente/nuevamascota']);
  }

  // === MÉTODOS DE UTILIDAD ===

  private mostrarMensajeExito(mensaje: string): void {
    // Implementar sistema de notificaciones o usar alert temporalmente
    alert(mensaje);
  }

  private mostrarMensajeError(mensaje: string): void {
    // Implementar sistema de notificaciones o usar alert temporalmente
    alert(mensaje);
  }
}