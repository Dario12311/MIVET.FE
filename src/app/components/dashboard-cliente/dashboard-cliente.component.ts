import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-dashboard-cliente',
  templateUrl: './dashboard-cliente.component.html',
  styleUrls: ['./dashboard-cliente.component.css'],
  standalone: false,
})
export class DashboardClienteComponent implements OnInit {
  
  selectedItem: string = '';
  clienteInfo: any = {};
  numeroDocumento: string = '';

  constructor(
    public router: Router,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.cargarDatosCliente();
  }

  private cargarDatosCliente(): void {
    // Obtener datos del cliente desde el token o servicio
    const userData = this.tokenService.getUserData();
    if (userData) {
      this.numeroDocumento = userData.numeroDocumento || userData.identificacion;
      this.clienteInfo = {
        nombre: userData.nombre || 'Cliente',
        documento: this.numeroDocumento,
        email: userData.email || '',
        rol: 'Cliente'
      };
    }
  }

  selectItem(item: string): void {
    this.selectedItem = item;
  }

  logout(): void {
    this.tokenService.removeToken();
    this.router.navigate(['/Login']);
  }
}