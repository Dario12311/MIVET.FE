import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-role-selector',
  templateUrl: './role-selector.component.html',
  styleUrls: ['./role-selector.component.css'],
})
export class RoleSelectorComponent implements OnInit {
  roles: string[] = [];
  nombreUsuario: string | null = null;

  constructor(private tokenService: TokenService, private router: Router) {}

  ngOnInit(): void {
    // Verificar si el usuario está autenticado
    if (!this.tokenService.isAuthenticated()) {
      this.router.navigate(['/Login']);
      return;
    }

    // Obtener los roles del usuario
    const userRoles = this.tokenService.getUserRole();
    if (userRoles) {
      this.roles = userRoles;
    } else {
      this.router.navigate(['/Login']);
    }

    // Obtener el nombre de usuario para mostrarlo
    this.nombreUsuario = this.tokenService.getUserName();
  }

  selectRole(role: string): void {
    // Guardar el rol seleccionado en localStorage para usarlo en otras partes de la aplicación
    localStorage.setItem('selectedRole', role);

    // Redirigir según el rol seleccionado
    switch (role) {
      case 'ADMINISTRADOR':
        this.router.navigate(['/dashboard']);
        break;
      case 'RECEPCIONISTA':
        this.router.navigate(['/dashboard-recepcionista']);
        break;
      case 'VETERINARIO':
        this.router.navigate(['/dashboard-veterinario']);
        break;
      case 'CLIENTE':
        this.router.navigate(['/dashboard-cliente']);
        break;
      default:
        this.router.navigate(['/Inicio']);
        break;
    }
  }
}
