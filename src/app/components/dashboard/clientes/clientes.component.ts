
import { Component, OnInit } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { PersonaclienteService, PersonaCliente } from "src/app/services/personacliente.service"
import { MascotasService } from "src/app/services/mascotas.service"
import { forkJoin, of } from "rxjs"
import { catchError, finalize } from "rxjs/operators"

interface Cliente {
  id: number
  numeroDocumento: string
  primerNombre: string
  segundoNombre: string
  primerApellido: string
  segundoApellido: string
  correo: string
  telefono: string
  estado: string
  cantidadMascotas: number
}

@Component({
  selector: "app-clientes",
  templateUrl: "./clientes.component.html",
  styleUrls: ["./clientes.component.css"],
  standalone: false,
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = []
  clientesFiltrados: Cliente[] = []
  clientesPorPagina = 3
  searchTerm = ""
  currentPage = 1
  totalPages = 1
  pages: number[] = []
  todosLosClientes: Cliente[] = []
  cargando = false

  // En el constructor
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private personaClienteService: PersonaclienteService,
    private mascotasService: MascotasService
  ) {}

  ngOnInit(): void {
    this.cargarClientes()
  }

  cargarClientes(): void {
    this.cargando = true
    this.personaClienteService.getClientes().subscribe({
      next: (respuesta: PersonaCliente[]) => {
        // Mapear de PersonaCliente a Cliente
        this.todosLosClientes = respuesta.map((pc, index) => ({
          id: index + 1,
          numeroDocumento: pc.numeroDocumento,
          primerNombre: pc.primerNombre,
          segundoNombre: pc.segundoNombre,
          primerApellido: pc.primerApellido,
          segundoApellido: pc.segundoApellido,
          correo: pc.correoElectronico,
          telefono: pc.celular || pc.telefono,
          estado: pc.estado,
          cantidadMascotas: 0,
        }))

        // Obtener la cantidad de mascotas para cada cliente
        this.obtenerCantidadMascotas()
      },
      error: (error) => {
        console.error("Error al cargar clientes:", error)
        this.mostrarMensaje("Error al cargar los clientes", "error")
        this.cargando = false
      },
    })
  }

  obtenerCantidadMascotas(): void {
    // Crear un array de observables para obtener las mascotas de cada cliente
    const observables = this.todosLosClientes.map(cliente => {
      return this.mascotasService.getMascotasByCliente(cliente.numeroDocumento).pipe(
        catchError(error => {
          console.error(`Error al obtener mascotas para cliente ${cliente.numeroDocumento}:`, error);
          return of([]);
        })
      );
    });

    // Ejecutar todas las peticiones en paralelo
    forkJoin(observables).pipe(
      finalize(() => {
        this.calcularPaginacion();
        this.aplicarPaginacion();
        this.cargando = false;
      })
    ).subscribe(resultados => {
      // Actualizar la cantidad de mascotas para cada cliente
      resultados.forEach((mascotas, index) => {
        if (index < this.todosLosClientes.length) {
          this.todosLosClientes[index].cantidadMascotas = mascotas.length;
        }
      });
    });
  }

  calcularPaginacion(): void {
    this.totalPages = Math.ceil(this.todosLosClientes.length / this.clientesPorPagina)
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1)
  }

  aplicarPaginacion(): void {
    const inicio = (this.currentPage - 1) * this.clientesPorPagina
    const fin = inicio + this.clientesPorPagina
    this.clientes = this.todosLosClientes.slice(inicio, fin)
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina
      this.aplicarPaginacion()
    }
  }

  verMascotas(clienteId: number): void {
    const cliente = this.todosLosClientes.find(c => c.id === clienteId);
    if (cliente) {
      this.router.navigate(["/dashboard/mascotas/cliente", cliente.numeroDocumento]);
    }
  }

  agregarCliente(): void {
    this.router.navigate(["/dashboard/nuevocliente"])
  }

  editarCliente(numeroDocumento: string): void {
    this.router.navigate(["/dashboard/editar", numeroDocumento], { relativeTo: this.route })
  }

  desactivateClient(numeroDocumento: string): void {
    const cliente = this.todosLosClientes.find((c) => c.numeroDocumento === numeroDocumento)
    const nombreCompleto = cliente ? `${cliente.primerNombre} ${cliente.primerApellido}` : "este cliente"

    if (confirm(`¿Está seguro que desea desactivar a ${nombreCompleto}?`)) {
      this.cargando = true

      // Usar solo DELETE que es el método que funciona
      this.personaClienteService.desactivateCliente(numeroDocumento).subscribe({
        next: (response) => {
          console.log("Cliente desactivado exitosamente:", response)
          this.mostrarMensaje("Cliente desactivado correctamente", "success")
          this.cargarClientes() // Recarga la lista actualizada
        },
        error: (error) => {
          console.error("Error al desactivar cliente:", error)
          this.manejarError(error)
        },
      })
    }
  }

  private manejarError(error: any): void {
    this.cargando = false

    let mensajeError = "No se pudo desactivar el cliente. "

    switch (error.status) {
      case 404:
        mensajeError += "Cliente no encontrado."
        break
      case 400:
        mensajeError += "Datos inválidos."
        break
      case 500:
        mensajeError += "Error interno del servidor."
        break
      default:
        mensajeError += `Error: ${error.status} - ${error.message}`
    }

    this.mostrarMensaje(mensajeError, "error")

    // Log detallado para debugging
    console.log("Detalles del error:", {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      error: error.error,
    })
  }

  filtrarClientes(): void {
    if (this.searchTerm.trim() === "") {
      this.todosLosClientes = [...this.clientes]
    } else {
      this.todosLosClientes = this.todosLosClientes.filter(
        (cliente) =>
          cliente.primerNombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          cliente.primerApellido.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          cliente.numeroDocumento.includes(this.searchTerm) ||
          cliente.correo.toLowerCase().includes(this.searchTerm.toLowerCase()),
      )
    }

    this.currentPage = 1
    this.calcularPaginacion()
    this.aplicarPaginacion()
  }

  private mostrarMensaje(mensaje: string, tipo: "success" | "error"): void {
    if (tipo === "success") {
      alert(`✅ ${mensaje}`)
    } else {
      alert(`❌ ${mensaje}`)
    }
  }

  // Método para verificar si un cliente está activo
  estaActivo(estado: string): boolean {
    return estado === "A" || estado === "Activo"
  }
}
