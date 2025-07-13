import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenService } from 'src/app/services/token.service';
import { ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-historial-clinico-cliente',
  templateUrl: './historial-clinico-cliente.component.html',
  styleUrls: ['./historial-clinico-cliente.component.css'],
  standalone: false,
})
export class HistorialClinicoClienteComponent implements OnInit {
  
  cargando = false;
  numeroDocumento = '';
  mascotas: any[] = [];
  mascotaSeleccionada: any = null;
  historialClinico: any[] = [];
  historialDetallado: any = null;
  
  // Modal de detalle
  mostrarModalDetalle = false;
  registroSeleccionado: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.obtenerDatosCliente();
    this.verificarParametrosRuta();
    this.cargarMascotas();
  }

  private obtenerDatosCliente(): void {
    const userData = this.tokenService.getUserData();
    if (userData) {
      this.numeroDocumento = userData.numeroDocumento || userData.identificacion;
    }
  }

  private verificarParametrosRuta(): void {
    this.route.params.subscribe(params => {
      if (params['mascotaId']) {
        const mascotaId = parseInt(params['mascotaId']);
        this.cargarHistorialMascota(mascotaId);
      }
    });
  }

  private cargarMascotas(): void {
    this.cargando = true;
    
    this.clienteService.getMisMascotas(this.numeroDocumento).subscribe({
      next: (mascotas) => {
        this.mascotas = mascotas.filter(m => m.estado === 'A');
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar mascotas:', error);
        this.cargando = false;
        this.mostrarError('Error al cargar las mascotas');
      }
    });
  }

  // === SELECCIÓN DE MASCOTA ===

  seleccionarMascota(mascota: any): void {
    this.mascotaSeleccionada = mascota;
    this.cargarHistorialMascota(mascota.id);
  }

  private cargarHistorialMascota(mascotaId: number): void {
    this.cargando = true;
    this.historialClinico = [];
    
    this.clienteService.getHistorialMascota(this.numeroDocumento, mascotaId).subscribe({
      next: (historial) => {
        this.historialClinico = historial.sort((a, b) => 
          new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()
        );
        
        // Si hay una mascota específica en la ruta, seleccionarla
        if (!this.mascotaSeleccionada) {
          this.mascotaSeleccionada = this.mascotas.find(m => m.id === mascotaId);
        }
        
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.cargando = false;
        this.mostrarError('Error al cargar el historial clínico');
      }
    });
  }

  // === DETALLES DEL HISTORIAL ===

  verDetalleHistorial(registro: any): void {
    this.registroSeleccionado = registro;
    this.cargarHistorialCompleto(registro);
  }

  private cargarHistorialCompleto(registro: any): void {
    this.clienteService.getHistorialCompleto(
      this.numeroDocumento, 
      this.mascotaSeleccionada.id, 
      registro.id
    ).subscribe({
      next: (historialCompleto) => {
        this.historialDetallado = historialCompleto;
        this.mostrarModalDetalle = true;
      },
      error: (error) => {
        console.error('Error al cargar historial completo:', error);
        this.mostrarError('Error al cargar los detalles del historial');
      }
    });
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.historialDetallado = null;
    this.registroSeleccionado = null;
  }

  // === ACCIONES ===

  agendarNuevaCita(): void {
    if (this.mascotaSeleccionada) {
      this.router.navigate(['/dashboard-cliente/citas/nueva'], {
        queryParams: { mascotaId: this.mascotaSeleccionada.id }
      });
    } else {
      this.router.navigate(['/dashboard-cliente/citas/nueva']);
    }
  }

  verCitasMascota(): void {
    if (this.mascotaSeleccionada) {
      this.router.navigate(['/dashboard-cliente/citas/mascota', this.mascotaSeleccionada.id]);
    }
  }

  editarMascota(): void {
    if (this.mascotaSeleccionada) {
      this.router.navigate(['/dashboard-cliente/mascotas/editar', this.mascotaSeleccionada.id]);
    }
  }

  // === MÉTODOS DE FORMATO ===

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatearFechaCorta(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatearHora(hora: string): string {
    if (!hora) return '';
    const [horas, minutos] = hora.split(':');
    const horasNum = parseInt(horas);
    const ampm = horasNum >= 12 ? 'PM' : 'AM';
    const horas12 = horasNum % 12 || 12;
    return `${horas12}:${minutos} ${ampm}`;
  }

  getTiempoTranscurrido(fecha: string): string {
    const ahora = new Date();
    const fechaRegistro = new Date(fecha);
    const diferencia = ahora.getTime() - fechaRegistro.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    if (dias < 365) return `Hace ${Math.floor(dias / 30)} meses`;
    return `Hace ${Math.floor(dias / 365)} años`;
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

  getColorEstadoHistorial(estado: number): string {
    const colores = {
      1: '#ffc107', // Borrador
      2: '#28a745', // Completado
      3: '#dc3545'  // Cancelado
    };
    return colores[estado as keyof typeof colores] || '#6c757d';
  }

  getNombreEstadoHistorial(estado: number): string {
    const estados = {
      1: 'Borrador',
      2: 'Completado',
      3: 'Cancelado'
    };
    return estados[estado as keyof typeof estados] || 'Desconocido';
  }

  // === NAVEGACIÓN ===

  volver(): void {
    if (this.mascotaSeleccionada && this.route.snapshot.params['mascotaId']) {
      this.router.navigate(['/dashboard-cliente/mascotas/cliente', this.numeroDocumento]);
    } else {
      this.router.navigate(['/dashboard-cliente']);
    }
  }

  // === UTILIDADES ===

  hayHistorialDisponible(): boolean {
    return this.historialClinico && this.historialClinico.length > 0;
  }

  getResumenHistorial(): { total: number; recientes: number; ultimaVisita: string } {
    const total = this.historialClinico.length;
    const treintaDiasAtras = new Date();
    treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);
    
    const recientes = this.historialClinico.filter(h => 
      new Date(h.fechaRegistro) >= treintaDiasAtras
    ).length;
    
    const ultimaVisita = this.historialClinico.length > 0 
      ? this.formatearFecha(this.historialClinico[0].fechaRegistro)
      : 'No hay registros';
    
    return { total, recientes, ultimaVisita };
  }

  // === MENSAJES ===

  private mostrarError(mensaje: string): void {
    // Implementar notificación de error
    alert(mensaje); // Temporal, usar toast o similar
  }
}