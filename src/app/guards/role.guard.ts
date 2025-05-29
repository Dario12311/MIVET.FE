import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Verificar si el usuario está autenticado
    if (!this.tokenService.isAuthenticated()) {
      this.router.navigate(['/Login']);
      return false;
    }

    // Obtener los roles permitidos para la ruta
    const allowedRoles = route.data['roles'] as Array<string>;
    
    // Si no hay roles definidos, permitir acceso
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    // Verificar si el usuario tiene alguno de los roles permitidos
    if (!this.tokenService.hasAnyRole(allowedRoles)) {
      // Si el usuario tiene múltiples roles pero no el requerido para esta ruta
      const userRoles = this.tokenService.getUserRole();
      if (userRoles && userRoles.length > 1) {
        this.router.navigate(['/role-selector']);
      } else {
        // Redirigir según el rol del usuario
        this.redirectBasedOnRole(userRoles ? userRoles[0] : null);
      }
      return false;
    }

    // Verificar si el rol seleccionado coincide con la ruta
    const selectedRole = localStorage.getItem('selectedRole');
    if (selectedRole && !allowedRoles.includes(selectedRole)) {
      this.router.navigate(['/role-selector']);
      return false;
    }

    return true;
  }

  /**
   * Redirige al usuario a la página correspondiente según su rol
   * @param role Rol del usuario
   */
  private redirectBasedOnRole(role: string | null): void {
    console.log('Redirigiendo basado en rol:', role);
    
    switch (role) {
      case 'ADMINISTRADOR':
        this.router.navigate(['/dashboard']);
        break;
      case 'RECEPCIONISTA':
        this.router.navigate(['/dashboard-recepcionista']);
        break;
      default:
        console.log('Rol no reconocido, redirigiendo a Inicio');
        this.router.navigate(['/Inicio']);
        break;
    }
  }
}