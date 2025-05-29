import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MascotasService } from 'src/app/services/mascotas.service';


interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  genero: string;
  numeroDocumento: string;
  primerNombreDueno: string;
  primerApellidoDueno: string;
  segundoApellidoDueno: string;
  estado: string;
}

@Component({
  selector: 'app-mascotas',
  templateUrl: './mascotas.component.html',
  styleUrls: ['./mascotas.component.css'],
  standalone: false,
})
export class MascotasComponent implements OnInit {
  mascotas: Mascota[] = [];
  mascotasFiltradas: Mascota[] = [];
  mascotasPorPagina = 4;
  searchTerm = "";
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];
  cargando = false;
  clienteNumeroDocumento: string | null = null;
  nombreCliente: string = '';

  constructor(
    private mascotasService: MascotasService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Verificar si hay un parámetro de cliente en la ruta
    this.route.paramMap.subscribe(params => {
      this.clienteNumeroDocumento = params.get('numeroDocumento');
      if (this.clienteNumeroDocumento) {
        this.cargarMascotasPorCliente(this.clienteNumeroDocumento);
      } else {
        this.cargarMascotas();
      }
    });
  }

  agregarMascota(): void {
    this.router.navigate(['/dashboard/nuevamascota']);
  }

  editarMascota(mascota: Mascota): void {
    this.router.navigate(['/dashboard/editar/nuevamascota', mascota.id]);
  }

  desactivarMascota(id: number): void {
    if (confirm('¿Está seguro de desactivar esta mascota?')) {
      this.mascotasService.desactivarMascota(id).subscribe({
        next: () => {
          if (this.clienteNumeroDocumento) {
            this.cargarMascotasPorCliente(this.clienteNumeroDocumento);
          } else {
            this.cargarMascotas();
          }
        },
        error: (error) => {
          console.error('Error al desactivar mascota:', error);
        }
      });
    }
  }

  calcularPaginacion(): void {
    this.totalPages = Math.ceil(this.mascotasFiltradas.length / this.mascotasPorPagina);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  aplicarPaginacion(): void {
    const inicio = (this.currentPage - 1) * this.mascotasPorPagina;
    const fin = inicio + this.mascotasPorPagina;
    this.mascotas = this.mascotasFiltradas.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina;
      this.aplicarPaginacion();
    }
  }

  filtrarMascotas(): void {
    if (this.searchTerm.trim() === "") {
      this.mascotasFiltradas = [...this.mascotas];
    } else {
      this.mascotasFiltradas = this.mascotas.filter(
        (mascota) =>
          mascota.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          mascota.especie.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          mascota.raza.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.currentPage = 1;
    this.calcularPaginacion();
    this.aplicarPaginacion();
  }

  cargarMascotas(): void {
    this.cargando = true;
    this.mascotasService.getMascotas().subscribe({
      next: (data) => {
        this.mascotasFiltradas = data;
        this.calcularPaginacion();
        this.aplicarPaginacion();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar mascotas:', error);
        this.cargando = false;
      }
    });
  }

  cargarMascotasPorCliente(numeroDocumento: string): void {
    this.cargando = true;
    this.mascotasService.getMascotasByCliente(numeroDocumento).subscribe({
      next: (data) => {
        this.mascotasFiltradas = data;
        if (data.length > 0) {
          this.nombreCliente = `${data[0].primerNombreDueno} ${data[0].primerApellidoDueno}`;
        }
        this.calcularPaginacion();
        this.aplicarPaginacion();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar mascotas del cliente:', error);
        this.cargando = false;
      }
    });
  }

  volverAClientes(): void {
    this.router.navigate(['/dashboard/clientes']);
  }
}
