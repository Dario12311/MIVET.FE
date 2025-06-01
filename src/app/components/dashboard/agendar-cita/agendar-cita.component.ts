import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CitaService, CrearCitaDto, VeterinarioDisponibleDto, HoraDisponibleDto } from 'src/app/services/cita.service';
import { PersonaclienteService, PersonaCliente } from 'src/app/services/personacliente.service';
import { MascotasService } from 'src/app/services/mascotas.service';
import { MedicoveterinarioService, MedicoVeterinario } from 'src/app/services/medicoveterinario.service';

@Component({
  selector: 'app-agendar-cita',
  templateUrl: './agendar-cita.component.html',
  styleUrls: ['./agendar-cita.component.css'],
  standalone: false,
})
export class AgendarCitaComponent implements OnInit {
  citaForm: FormGroup;
  cargando = false;
  guardando = false;

  // Configuración de usuario
  esAdministrador = true; // Esto debería venir del servicio de autenticación
  clienteActual: PersonaCliente | null = null; // Cliente logueado
  usuarioActual = ''; // Documento del usuario logueado

  // Modal de clientes
  mostrarModalClientes = false;
  cargandoClientes = false;
  clientes: PersonaCliente[] = [];
  clientesFiltrados: PersonaCliente[] = [];
  filtroClientes = '';
  clienteSeleccionado: PersonaCliente | null = null;

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
  tiposCita = this.citaService.getTiposCita();
  duracionesDisponibles: number[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private citaService: CitaService,
    private clienteService: PersonaclienteService,
    private mascotaService: MascotasService,
    private medicoService: MedicoveterinarioService
  ) {
    this.citaForm = this.createForm();
    this.configurarFechas();
  }

  ngOnInit(): void {
    this.inicializarComponente();
  }

  private inicializarComponente(): void {
    // Aquí debería venir del servicio de autenticación
    this.esAdministrador = this.determinarTipoUsuario();
    this.usuarioActual = this.obtenerUsuarioActual();

    if (this.esAdministrador) {
      this.cargarClientes();
    } else {
      this.cargarClienteActual();
    }
  }

  private determinarTipoUsuario(): boolean {
    // Implementar lógica para determinar el tipo de usuario
    // Por ahora retornamos true para administrador
    return true;
  }

  private obtenerUsuarioActual(): string {
    // Implementar lógica para obtener el usuario actual
    // Por ahora retornamos un valor por defecto
    return '1234567890';
  }

  private createForm(): FormGroup {
    return this.fb.group({
      clienteNumeroDocumento: ['', this.esAdministrador ? Validators.required : ''],
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
    const unAno = new Date();
    unAno.setFullYear(hoy.getFullYear() + 1);

    this.fechaMinima = hoy.toISOString().split('T')[0];
    this.fechaMaxima = unAno.toISOString().split('T')[0];
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

  // === GESTIÓN DE CLIENTES ===

  cargarClientes(): void {
    this.cargandoClientes = true;
    this.clienteService.getClientes().subscribe(
      (clientes: PersonaCliente[]) => {
        this.clientes = clientes.filter(c => c.estado === 'A');
        this.clientesFiltrados = [...this.clientes];
        this.cargandoClientes = false;
      },
      (error: any) => {
        console.error('Error al cargar clientes', error);
        this.cargandoClientes = false;
      }
    );
  }

  cargarClienteActual(): void {
    // Si no es administrador, cargar datos del cliente logueado
    this.clienteService.getClienteByDocumento(this.usuarioActual).subscribe(
      (cliente: PersonaCliente) => {
        this.clienteActual = cliente;
        this.citaForm.patchValue({
          clienteNumeroDocumento: cliente.numeroDocumento
        });
        this.cargarMascotasCliente(cliente.numeroDocumento);
      },
      (error: any) => {
        console.error('Error al cargar cliente actual', error);
      }
    );
  }

  abrirModalClientes(): void {
    if (!this.clientes.length) {
      this.cargarClientes();
    }
    this.mostrarModalClientes = true;
  }

  cerrarModalClientes(): void {
    this.mostrarModalClientes = false;
    this.filtroClientes = '';
    this.filtrarClientes();
  }

  filtrarClientes(): void {
    if (!this.filtroClientes.trim()) {
      this.clientesFiltrados = [...this.clientes];
      return;
    }

    const filtro = this.filtroClientes.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(cliente => 
      cliente.primerNombre?.toLowerCase().includes(filtro) ||
      cliente.segundoNombre?.toLowerCase().includes(filtro) ||
      cliente.primerApellido?.toLowerCase().includes(filtro) ||
      cliente.segundoApellido?.toLowerCase().includes(filtro) ||
      cliente.numeroDocumento.includes(filtro) ||
      cliente.correoElectronico?.toLowerCase().includes(filtro)
    );
  }

  seleccionarCliente(cliente: PersonaCliente): void {
    this.clienteSeleccionado = cliente;
    this.citaForm.patchValue({
      clienteNumeroDocumento: cliente.numeroDocumento,
      mascotaId: '' // Limpiar mascota seleccionada
    });
    
    this.cargarMascotasCliente(cliente.numeroDocumento);
    this.cerrarModalClientes();
    
    // Limpiar selecciones posteriores
    this.limpiarSeleccionesPosteriores();
  }

  quitarClienteSeleccionado(): void {
    this.clienteSeleccionado = null;
    this.mascotasCliente = [];
    this.citaForm.patchValue({
      clienteNumeroDocumento: '',
      mascotaId: ''
    });
    this.limpiarSeleccionesPosteriores();
  }

  // === GESTIÓN DE MASCOTAS ===

  cargarMascotasCliente(numeroDocumento: string): void {
    this.cargandoMascotas = true;
    this.mascotaService.getMascotasByCliente(numeroDocumento).subscribe(
      (mascotas: any[]) => {
        this.mascotasCliente = mascotas.filter(m => m.estado === 'A');
        this.cargandoMascotas = false;
      },
      (error: any) => {
        console.error('Error al cargar mascotas', error);
        this.mascotasCliente = [];
        this.cargandoMascotas = false;
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
    for (let i = duracionMinima; i <= 480; i += 15) {
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

  limpiarSeleccionesPosteriores(): void {
    this.limpiarSeleccionVeterinario();
    this.citaForm.patchValue({
      fechaCita: '',
      tipoCita: '',
      duracionMinutos: 30
    });
  }

  // === GETTERS PARA TEMPLATE ===

  get mostrarResumen(): boolean {
    return !!(
      (this.clienteSeleccionado || this.clienteActual) &&
      this.citaForm.get('mascotaId')?.value &&
      this.citaForm.get('fechaCita')?.value &&
      this.citaForm.get('tipoCita')?.value &&
      this.veterinarioSeleccionado &&
      this.horaSeleccionada &&
      this.citaForm.get('motivoConsulta')?.value
    );
  }

  obtenerNombreClienteCompleto(): string {
    const cliente = this.clienteSeleccionado || this.clienteActual;
    if (!cliente) return '';
    
    return `${cliente.primerNombre} ${cliente.segundoNombre || ''} ${cliente.primerApellido} ${cliente.segundoApellido || ''}`.trim();
  }

  obtenerNombreMascota(): string {
    const mascotaId = this.citaForm.get('mascotaId')?.value;
    const mascota = this.mascotasCliente.find(m => m.id == mascotaId);
    return mascota ? `${mascota.nombre} (${mascota.especie})` : '';
  }

  obtenerNombreTipoCita(): string {
    const tipoCitaId = this.citaForm.get('tipoCita')?.value;
    return this.citaService.getNombreTipoCita(parseInt(tipoCitaId));
  }

  formatearFechaResumen(): string {
    const fecha = this.citaForm.get('fechaCita')?.value;
    return fecha ? this.citaService.formatearFecha(fecha) : '';
  }

  formatearHora(hora: string): string {
    return this.citaService.formatearHora(hora);
  }

  // === GUARDAR CITA ===

  guardarCita(): void {
    if (this.citaForm.invalid || !this.mostrarResumen) {
      this.marcarCamposComoTocados();
      return;
    }

    this.guardando = true;
    
    const formData = this.citaForm.value;
    const cliente = this.clienteSeleccionado || this.clienteActual;
    
    const nuevaCita: CrearCitaDto = {
      mascotaId: parseInt(formData.mascotaId),
      medicoVeterinarioNumeroDocumento: this.veterinarioSeleccionado!.numeroDocumento,
      fechaCita: formData.fechaCita,
      horaInicio: this.formatearHoraParaEnvio(this.horaSeleccionada),
      duracionMinutos: formData.duracionMinutos,
      tipoCita: parseInt(formData.tipoCita),
      motivoConsulta: formData.motivoConsulta.trim(),
      observaciones: formData.observaciones?.trim() || '',
      creadoPor: this.usuarioActual,
      tipoUsuarioCreador: this.esAdministrador ? 1 : 2 // 1=Admin, 2=Cliente
    };

    // Verificar disponibilidad antes de crear
    this.citaService.verificarDisponibilidad({
      medicoVeterinarioNumeroDocumento: nuevaCita.medicoVeterinarioNumeroDocumento,
      fechaCita: nuevaCita.fechaCita,
      horaInicio: this.formatearHoraParaEnvio(nuevaCita.horaInicio), // asegura formato HH:mm:ss
      duracionMinutos: nuevaCita.duracionMinutos
    }).subscribe(
      (verificacion) => {
        if (verificacion.disponible) {
          this.crearCita(nuevaCita);
        } else {
          this.guardando = false;
          alert(`No se puede agendar la cita: ${verificacion.mensaje || 'Horario no disponible'}`);
          this.buscarVeterinariosDisponibles(); // Refrescar disponibilidad
        }
      },
      (error) => {
        console.error('Error al verificar disponibilidad', error);
        this.guardando = false;
        alert('Error al verificar la disponibilidad del horario');
      }
    );
  }

  private crearCita(cita: CrearCitaDto): void {
    this.citaService.crearCita(cita).subscribe(
      (citaCreada) => {
        this.guardando = false;
        alert('¡Cita agendada exitosamente!');
        this.router.navigate(['/dashboard/citas']); // Ajustar ruta según necesidad
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
        
        alert(mensaje);
      }
    );
  }

  private formatearHoraParaEnvio(hora: string): string {
    // Ya está en HH:mm o HH:mm:ss
    if (hora.length === 5) return hora + ":00"; // Ej: "16:00" → "16:00:00"
    return hora; // Si ya tiene los segundos no lo modifiques
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.citaForm.controls).forEach(key => {
      const control = this.citaForm.get(key);
      control?.markAsTouched();
    });
  }

  // === NAVEGACIÓN ===

  volver(): void {
    this.router.navigate(['/dashboard/citas']); // Ajustar ruta según necesidad
  }
}