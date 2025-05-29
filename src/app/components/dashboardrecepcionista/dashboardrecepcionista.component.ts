import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-dashboardrecepcionista',
  templateUrl: './dashboardrecepcionista.component.html',
  styleUrls: ['./dashboardrecepcionista.component.css']
})
export class DashboardrecepcionistaComponent implements OnInit {
  nombreUsuario: string | null = null;
  
  constructor(
    public router: Router,
    private tokenService: TokenService
  ) { }

  ngOnInit() {
    // Obtener el nombre de usuario desde el TokenService
    this.nombreUsuario = this.tokenService.getUserName();
    
    // Verificar si el usuario tiene el rol de recepcionista
    if (!this.tokenService.hasRole('RECEPCIONISTA')) {
      // Redirigir si no tiene el rol adecuado
      this.router.navigate(['/login']);
    }
  }
}
