import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/services/token.service';
import { ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-inicio-dashboard-cliente',
  templateUrl: './inicio-dashboard-cliente.component.html',
  styleUrls: ['./inicio-dashboard-cliente.component.css'],
  standalone: false,
})
export class InicioDashboardClienteComponent implements OnInit {
  
  cargando = false;
  numeroDocumento = '';
  clienteInfo: any = {};
  
  // Estadísticas del cliente
  totalMascotas = 0;
  proximasCitas = 0;
  citasCompletadas = 0;
  ultimaVisita = '';

  // Datos para mostrar
  mascotas: any[] = [];
  citasProximas: any[] = [];
  actividadReciente: any[] = [];

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.cargarDatosCliente();
    this.cargarEstadisticas();
  }

  private cargarDatosCliente(): void {
    const userData = this.tokenService.getUserData();
    if (userData) {
      this.numeroDocumento = userData.numeroDocumento || userData.identificacion;
      this.clienteInfo = {
        nombre: userData.nombre || 'Cliente',
        documento: this.numeroDocumento,
        email: userData.email || ''
      };
    }
  }

  private cargarEstadisticas(): void {
    this.cargando = true;
    
    // Cargar mascotas
    this.clienteService.getMisMascotas(this.numeroDocumento).subscribe({
      next: (mascotas) => {
        this.mascotas = mascotas.slice(0, 3); // Solo las primeras 3 para el dashboard
        this.totalMascotas = mascotas.length;
      },
      error: (error) => console.error('Error al cargar mascotas:', error)
    });

    // Cargar próximas citas
    this.clienteService.getProximasCitas(this.numeroDocumento).subscribe({
      next: (citas) => {
        this.citasProximas = citas.slice(0, 3); // Solo las primeras 3
        this.proximasCitas = citas.length;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.cargando = false;
      }
    });

    // Cargar todas las citas para estadísticas
    this.clienteService.getMisCitas(this.numeroDocumento).subscribe({
      next: (todasLasCitas) => {
        this.citasCompletadas = todasLasCitas.filter(c => c.estadoCita === 4).length;
        
        // Última visita
        const citasCompletadas = todasLasCitas
          .filter(c => c.estadoCita === 4)
          .sort((a, b) => new Date(b.fechaCita).getTime() - new Date(a.fechaCita).getTime());
        
        if (citasCompletadas.length > 0) {
          this.ultimaVisita = this.formatearFecha(citasCompletadas[0].fechaCita);
        }

        // Generar actividad reciente
        this.generarActividadReciente(todasLasCitas);
      },
      error: (error) => console.error('Error al cargar estadísticas de citas:', error)
    });
  }

  private generarActividadReciente(citas: any[]): void {
    const actividades: any[] = [];

    // Agregar citas recientes
    citas.slice(0, 5).forEach(cita => {
      let icono = 'fas fa-calendar-check';
      let descripcion = '';
      
      switch (cita.estadoCita) {
        case 1:
          icono = 'fas fa-calendar-plus';
          descripcion = `Cita programada para ${cita.nombreMascota}`;
          break;
        case 2:
          icono = 'fas fa-check-circle';
          descripcion = `Cita confirmada para ${cita.nombreMascota}`;
          break;
        case 4:
          icono = 'fas fa-clipboard-check';
          descripcion = `Consulta completada para ${cita.nombreMascota}`;
          break;
        case 5:
          icono = 'fas fa-times-circle';
          descripcion = `Cita cancelada para ${cita.nombreMascota}`;
          break;
      }

      actividades.push({
        icono,
        descripcion,
        tiempo: this.formatearTiempoRelativo(cita.fechaCreacion)
      });
    });

    this.actividadReciente = actividades;
  }

  // Métodos de navegación
  verTodasLasMascotas(): void {
    this.router.navigate(['/dashboard-cliente/mascotas/cliente', this.numeroDocumento]);
  }

  verTodasLasCitas(): void {
    this.router.navigate(['/dashboard-cliente/citas']);
  }

  agendarNuevaCita(): void {
    this.router.navigate(['/dashboard-cliente/citas/nueva']);
  }

  verMascota(mascotaId: number): void {
    this.router.navigate(['/dashboard-cliente/mascotas', mascotaId]);
  }

  verCita(citaId: number): void {
    this.router.navigate(['/dashboard-cliente/citas/detalle', citaId]);
  }

  // Métodos de formato
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
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

  formatearTiempoRelativo(fecha: string): string {
    const ahora = new Date();
    const fechaCreacion = new Date(fecha);
    const diferencia = ahora.getTime() - fechaCreacion.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    return `Hace ${Math.floor(dias / 30)} meses`;
  }

  getNombreEstadoCita(estado: number): string {
    const estados = {
      1: 'Programada',
      2: 'Confirmada', 
      3: 'En Curso',
      4: 'Completada',
      5: 'Cancelada',
      6: 'No Asistió'
    };
    return estados[estado as keyof typeof estados] || 'Desconocido';
  }

  getColorEstadoCita(estado: number): string {
    const colores = {
      1: '#ffc107',
      2: '#28a745',
      3: '#007bff', 
      4: '#6f42c1',
      5: '#dc3545',
      6: '#6c757d'
    };
    return colores[estado as keyof typeof colores] || '#6c757d';
  }
}