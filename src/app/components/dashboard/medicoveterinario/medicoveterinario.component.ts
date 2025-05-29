import { Component,  OnInit } from "@angular/core"
import  { Router } from "@angular/router"
import  { MedicoveterinarioService, MedicoVeterinario } from "src/app/services/medicoveterinario.service"

@Component({
  selector: "app-medicoveterinario",
  templateUrl: "./medicoveterinario.component.html",
  styleUrls: ["./medicoveterinario.component.css"],
})
export class MedicoveterinarioComponent implements OnInit {
  medicos: MedicoVeterinario[] = []
  medicosFiltrados: MedicoVeterinario[] = []
  medicosPorPagina = 5
  searchTerm = ""
  currentPage = 1
  totalPages = 1
  pages: number[] = []
  cargando = false

  constructor(
    private router: Router,
    private medicoService: MedicoveterinarioService,
  ) {}

  ngOnInit(): void {
    this.cargarMedicos()
  }

  cargarMedicos(): void {
    this.cargando = true
    this.medicoService.getMedicos().subscribe({
      next: (respuesta: MedicoVeterinario[]) => {
        this.medicos = respuesta
        this.medicosFiltrados = [...this.medicos]
        this.calcularPaginacion()
        this.aplicarPaginacion()
        this.cargando = false
      },
      error: (error) => {
        console.error("Error al cargar médicos:", error)
        this.mostrarMensaje("Error al cargar los médicos veterinarios", "error")
        this.cargando = false
      },
    })
  }

  filtrarMedicos(): void {
    if (this.searchTerm.trim() === "") {
      this.medicosFiltrados = [...this.medicos]
    } else {
      const termino = this.searchTerm.toLowerCase().trim()
      this.medicosFiltrados = this.medicos.filter(
        (medico) =>
          medico.nombre.toLowerCase().includes(termino) ||
          medico.numeroDocumento.toLowerCase().includes(termino) ||
          medico.especialidad.toLowerCase().includes(termino) ||
          medico.correoElectronico.toLowerCase().includes(termino),
      )
    }
    this.currentPage = 1
    this.calcularPaginacion()
    this.aplicarPaginacion()
  }

  calcularPaginacion(): void {
    this.totalPages = Math.ceil(this.medicosFiltrados.length / this.medicosPorPagina)
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1)
  }

  aplicarPaginacion(): void {
    const inicio = (this.currentPage - 1) * this.medicosPorPagina
    const fin = inicio + this.medicosPorPagina
    this.medicos = this.medicosFiltrados.slice(inicio, fin)
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina
      this.aplicarPaginacion()
    }
  }

  agregarMedico(): void {
    // Navegar al componente de registro sin parámetros (modo creación)
    this.router.navigate(["/dashboard/nuevomedico"])
  }

  editarMedico(numeroDocumento: string): void {
    // Navegar al mismo componente de registro pero con el número de documento (modo edición)
    this.router.navigate(["/dashboard/editar/medico", numeroDocumento])
  }

  desactivarMedico(numeroDocumento: string): void {
    if (confirm("¿Está seguro de desactivar este médico veterinario?")) {
      this.medicoService.desactivarMedico(numeroDocumento).subscribe({
        next: () => {
          this.mostrarMensaje("Médico desactivado correctamente", "success")
          this.cargarMedicos()
        },
        error: (error) => {
          console.error("Error al desactivar médico:", error)
          this.mostrarMensaje("Error al desactivar el médico", "error")
        },
      })
    }
  }

  estaActivo(estado: string): boolean {
    return estado === "A"
  }

  mostrarMensaje(mensaje: string, tipo: "success" | "error"): void {
    // Aquí puedes implementar la lógica para mostrar mensajes
    console.log(`${tipo.toUpperCase()}: ${mensaje}`)
    // Si tienes un servicio de notificaciones, úsalo aquí
  }
}
