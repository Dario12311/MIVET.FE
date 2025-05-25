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
      // Redirigir según el rol del usuario
      const userRole = this.tokenService.getUserRole();
      this.redirectBasedOnRole(userRole ? userRole[0] : null);
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
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'VETERINARIO':
        this.router.navigate(['/dashboard/veterinario']);
        break;
      case 'CLIENTE':
        this.router.navigate(['/dashboard/cliente']);
        break;
      default:
        console.log('Rol no reconocido, redirigiendo a Inicio');
        this.router.navigate(['/Inicio']);
        break;
    }
  }
}