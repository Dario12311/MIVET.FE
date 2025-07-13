import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/services/token.service';
import { ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-navbar-cliente',
  templateUrl: './navbar-cliente.component.html',
  styleUrls: ['./navbar-cliente.component.css'],
  standalone: false,
})
export class NavbarClienteComponent implements OnInit {
  
  clienteInfo: any = {};
  numeroDocumento = '';
  proximasCitas = 0;
  notificaciones = 0;
  showUserMenu = false;

  constructor(
    public router: Router,
    private tokenService: TokenService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.cargarDatosCliente();
    this.cargarNotificaciones();
  }

  private cargarDatosCliente(): void {
    const userData = this.tokenService.getUserData();
    if (userData) {
      this.numeroDocumento = userData.numeroDocumento || userData.identificacion;
      this.clienteInfo = {
        nombre: userData.nombre || 'Cliente',
        primerNombre: userData.primerNombre || 'Cliente',
        documento: this.numeroDocumento,
        email: userData.email || ''
      };
    }
  }

  private cargarNotificaciones(): void {
    // Cargar próximas citas para mostrar en notificaciones
    this.clienteService.getProximasCitas(this.numeroDocumento).subscribe({
      next: (citas) => {
        this.proximasCitas = citas.length;
        
        // Calcular notificaciones (citas próximas en las siguientes 24 horas)
        const ahora = new Date();
        const en24Horas = new Date(ahora.getTime() + (24 * 60 * 60 * 1000));
        
        this.notificaciones = citas.filter(cita => {
          const fechaCita = new Date(cita.fechaCita);
          return fechaCita >= ahora && fechaCita <= en24Horas;
        }).length;
      },
      error: (error) => {
        console.error('Error al cargar notificaciones:', error);
      }
    });
  }

  irAInicio(): void {
    this.router.navigate(['/dashboard-cliente']);
  }

  irAPerfil(): void {
    this.router.navigate(['/dashboard-cliente/perfil']);
  }

  irAMascotas(): void {
    this.router.navigate(['/dashboard-cliente/mascotas/cliente', this.numeroDocumento]);
  }

  irACitas(): void {
    this.router.navigate(['/dashboard-cliente/citas']);
  }

  agendarCita(): void {
    this.router.navigate(['/dashboard-cliente/citas/nueva']);
  }

  verNotificaciones(): void {
    // Implementar vista de notificaciones
    console.log('Ver notificaciones');
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.tokenService.removeToken();
      localStorage.removeItem('selectedRole');
      this.router.navigate(['/Login']);
    }
  }

  // Método para mostrar nombre corto
  getNombreCorto(): string {
    if (this.clienteInfo.primerNombre) {
      return this.clienteInfo.primerNombre;
    }
    return this.clienteInfo.nombre || 'Cliente';
  }

  // Método para obtener iniciales
  getIniciales(): string {
    const nombre = this.clienteInfo.nombre || 'Cliente';
    const palabras = nombre.split(' ');
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return palabras[0][0].toUpperCase();
  }

  // Toggle del menú de usuario
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  // Cerrar menú de usuario
  closeUserMenu(): void {
    this.showUserMenu = false;
  }
}