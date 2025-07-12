import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard-cliente',
  templateUrl: './dashboard-cliente.component.html',
  styleUrls: ['./dashboard-cliente.component.css']
})
export class DashboardClienteComponent implements OnInit {
  nombreUsuario: string = 'Cliente';

  constructor() { }

  ngOnInit(): void {
    // Aquí puedes cargar el nombre del usuario desde un servicio
    // Por ejemplo: this.nombreUsuario = this.authService.getUserName();
  }
}
