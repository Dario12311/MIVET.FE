import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenService } from 'src/app/services/token.service';
import { ClienteService, MascotaClienteDto } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-mascotas-cliente',
  templateUrl: './mascotas-cliente.component.html',
  styleUrls: ['./mascotas-cliente.component.css'],
  standalone: false,
})
export class MascotasClienteComponent implements OnInit {
  
  mascotas: any[] = [];
  cargando = false;
  numeroDocumento = '';
  clienteInfo: any = {};
  
  // Modal de nueva mascota
  mostrarModalNuevaMascota = false;
  mostrarModalEditarMascota = false;
  mascotaSeleccionada: any = null;
  
  // Formulario de mascota
  nuevaMascota: MascotaClienteDto = {
    nombre: '',
    especie: '',
    raza: '',
    edad: 0,
    genero: '',
    numeroDocumento: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.obtenerDatosCliente();
    this.cargarMascotas();
  }

  private obtenerDatosCliente(): void {
    const userData = this.tokenService.getUserData();
    if (userData) {
      this.numeroDocumento = userData.numeroDocumento || userData.identificacion;
      this.clienteInfo = {
        nombre: userData.nombre || 'Cliente',
        documento: this.numeroDocumento
      };
    }
  }

  private cargarMascotas(): void {
    this.cargando = true;
    
    this.clienteService.getMisMascotas(this.numeroDocumento).subscribe({
      next: (mascotas) => {
        this.mascotas = mascotas;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar mascotas:', error);
        this.cargando = false;
        this.mostrarError('Error al cargar las mascotas');
      }
    });
  }

  // === GESTIÓN DE MASCOTAS ===

  abrirModalNuevaMascota(): void {
    this.nuevaMascota = {
      nombre: '',
      especie: '',
      raza: '',
      edad: 0,
      genero: '',
      numeroDocumento: this.numeroDocumento
    };
    this.mostrarModalNuevaMascota = true;
  }

  cerrarModalNuevaMascota(): void {
    this.mostrarModalNuevaMascota = false;
    this.resetearFormulario();
  }

  abrirModalEditarMascota(mascota: any): void {
    this.mascotaSeleccionada = { ...mascota };
    this.nuevaMascota = {
      id: mascota.id,
      nombre: mascota.nombre,
      especie: mascota.especie,
      raza: mascota.raza,
      edad: mascota.edad,
      genero: mascota.genero,
      numeroDocumento: this.numeroDocumento,
      estado: mascota.estado
    };
    this.mostrarModalEditarMascota = true;
  }

  cerrarModalEditarMascota(): void {
    this.mostrarModalEditarMascota = false;
    this.mascotaSeleccionada = null;
    this.resetearFormulario();
  }

  registrarMascota(): void {
    if (!this.validarFormularioMascota()) {
      return;
    }

    this.clienteService.registrarMascota(this.numeroDocumento, this.nuevaMascota).subscribe({
      next: () => {
        this.mostrarExito('Mascota registrada exitosamente');
        this.cargarMascotas();
        this.cerrarModalNuevaMascota();
      },
      error: (error) => {
        console.error('Error al registrar mascota:', error);
        this.mostrarError('Error al registrar la mascota');
      }
    });
  }

  actualizarMascota(): void {
    if (!this.validarFormularioMascota() || !this.mascotaSeleccionada) {
      return;
    }

    this.clienteService.actualizarMascota(
      this.numeroDocumento, 
      this.mascotaSeleccionada.id, 
      this.nuevaMascota
    ).subscribe({
      next: () => {
        this.mostrarExito('Mascota actualizada exitosamente');
        this.cargarMascotas();
        this.cerrarModalEditarMascota();
      },
      error: (error) => {
        console.error('Error al actualizar mascota:', error);
        this.mostrarError('Error al actualizar la mascota');
      }
    });
  }

  private validarFormularioMascota(): boolean {
    if (!this.nuevaMascota.nombre.trim()) {
      this.mostrarError('El nombre es requerido');
      return false;
    }
    
    if (!this.nuevaMascota.especie) {
      this.mostrarError('La especie es requerida');
      return false;
    }
    
    if (!this.nuevaMascota.raza.trim()) {
      this.mostrarError('La raza es requerida');
      return false;
    }
    
    if (this.nuevaMascota.edad <= 0) {
      this.mostrarError('La edad debe ser mayor a 0');
      return false;
    }
    
    if (!this.nuevaMascota.genero) {
      this.mostrarError('El género es requerido');
      return false;
    }
    
    return true;
  }

  private resetearFormulario(): void {
    this.nuevaMascota = {
      nombre: '',
      especie: '',
      raza: '',
      edad: 0,
      genero: '',
      numeroDocumento: this.numeroDocumento
    };
  }

  // === ACCIONES DE MASCOTA ===

  verHistorialMascota(mascota: any): void {
    this.router.navigate(['/dashboard-cliente/historial/mascota', mascota.id]);
  }

  agendarCitaMascota(mascota: any): void {
    this.router.navigate(['/dashboard-cliente/citas/nueva'], {
      queryParams: { mascotaId: mascota.id }
    });
  }

  verCitasMascota(mascota: any): void {
    this.router.navigate(['/dashboard-cliente/citas/mascota', mascota.id]);
  }

  // === MÉTODOS DE UTILIDAD ===

  getEspeciesDisponibles(): string[] {
    return this.clienteService.getEspeciesDisponibles();
  }

  getGenerosDisponibles(): { valor: string; texto: string }[] {
    return this.clienteService.getGenerosDisponibles();
  }

  getEstadoMascota(estado: string): { texto: string; clase: string } {
    return this.clienteService.getEstadoMascota(estado);
  }

  getIconoEspecie(especie: string): string {
    const iconos: { [key: string]: string } = {
      'Perro': 'fas fa-dog',
      'Gato': 'fas fa-cat',
      'Ave': 'fas fa-dove',
      'Reptil': 'fas fa-dragon',
      'Pez': 'fas fa-fish',
      'Hámster': 'fas fa-paw',
      'Conejo': 'fas fa-rabbit',
    };
    return iconos[especie] || 'fas fa-paw';
  }

  formatearEdad(edad: number): string {
    if (edad === 1) {
      return '1 año';
    } else if (edad < 1) {
      const meses = Math.round(edad * 12);
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    } else {
      return `${edad} años`;
    }
  }

  // === NAVEGACIÓN ===

  volver(): void {
    this.router.navigate(['/dashboard-cliente']);
  }

  // === MENSAJES ===

  private mostrarExito(mensaje: string): void {
    // Implementar notificación de éxito
    alert(mensaje); // Temporal, usar toast o similar
  }

  private mostrarError(mensaje: string): void {
    // Implementar notificación de error
    alert(mensaje); // Temporal, usar toast o similar
  }
}