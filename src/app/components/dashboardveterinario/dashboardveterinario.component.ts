import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-dashboardveterinario',
  templateUrl: './dashboardveterinario.component.html',
  styleUrls: ['./dashboardveterinario.component.css']
})
export class DashboardveterinarioComponent implements OnInit  {
  nombreUsuario: string | null = null;
  
  constructor(
    public router: Router,
    private tokenService: TokenService
  ) { }

  ngOnInit() {
    // Obtener el nombre de usuario desde el TokenService
    this.nombreUsuario = this.tokenService.getUserName();
    
    // Verificar si el usuario tiene el rol de veterinario
    if (!this.tokenService.hasRole('VETERINARIO')) {
      // Redirigir si no tiene el rol adecuado
      this.router.navigate(['/login']);
    }
  }
}
