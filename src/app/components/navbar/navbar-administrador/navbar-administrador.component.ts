import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token.service';

@Component({
  selector: 'app-navbar-administrador',
  templateUrl: './navbar-administrador.component.html',
  styleUrls: ['./navbar-administrador.component.css'],
  standalone: false,
})
export class NavbarAdministradorComponent implements OnInit {
  scrolled = false;
  menuVisible = false;
  nombreUsuario: string | null = null ;
  avatarUrl = '';

  constructor(
    private router: Router,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    // Obtener el nombre de usuario desde el TokenService
    this.nombreUsuario = this.tokenService.getUserName() ;
    // this.avatarUrl = 'ruta-a-la-imagen'; // Si tienes una imagen de perfil
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.scrolled = window.scrollY > 50;
  }

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }

  cerrarSesion() {
    // Lógica para cerrar sesión
    this.tokenService.removeToken();
    this.router.navigate(['/login']);
  }
}
