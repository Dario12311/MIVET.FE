import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"
import  { ProductosService, Producto } from "src/app/services/productos.service"

@Component({
  selector: "app-productos",
  templateUrl: "./productos.component.html",
  styleUrls: ["./productos.component.css"],
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = []
  productosFiltrados: Producto[] = []
  productosPorPagina = 6 // Cambiado a 6 para mejor visualización en grid
  searchTerm = ""
  currentPage = 1
  totalPages = 1
  pages: number[] = []
  cargando = false

  // Agregamos Math para usar en el template
  Math = Math

  constructor(
    private router: Router,
    private productosService: ProductosService,
  ) {}

  ngOnInit(): void {
    this.cargarProductos()
  }

  cargarProductos(): void {
    this.cargando = true
    this.productosService.getProductos().subscribe({
      next: (productos: Producto[]) => {
        this.productosFiltrados = productos
        this.calcularPaginacion()
        this.aplicarPaginacion()
        this.cargando = false
      },
      error: (error: any) => {
        console.error("Error al cargar productos:", error)
        this.cargando = false
      },
    })
  }

  agregarProducto(): void {
    this.router.navigate(["/dashboard/nuevoproducto"])
  }

  editarProducto(id: number): void {
    this.router.navigate(["/dashboard/editar/producto", id])
  }

  desactivarProducto(id: number): void {
    if (confirm("¿Está seguro de desactivar este producto?")) {
      this.productosService.desactivarProducto(id).subscribe({
        next: () => {
          this.cargarProductos()
        },
        error: (error: any) => {
          console.error("Error al desactivar producto:", error)
        },
      })
    }
  }

  calcularPaginacion(): void {
    this.totalPages = Math.ceil(this.productosFiltrados.length / this.productosPorPagina)
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1)
  }

  aplicarPaginacion(): void {
    const inicio = (this.currentPage - 1) * this.productosPorPagina
    const fin = inicio + this.productosPorPagina
    this.productos = this.productosFiltrados.slice(inicio, fin)
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina
      this.aplicarPaginacion()
    }
  }

  filtrarProductos(): void {
    if (this.searchTerm.trim() === "") {
      this.cargarProductos() // Recargar todos los productos
    } else {
      const termino = this.searchTerm.toLowerCase().trim()
      // Filtrar desde todos los productos, no solo los filtrados
      this.productosService.getProductos().subscribe({
        next: (todosLosProductos: Producto[]) => {
          this.productosFiltrados = todosLosProductos.filter(
            (producto: Producto) =>
              producto.nombre.toLowerCase().includes(termino) ||
              producto.descripcion.toLowerCase().includes(termino) ||
              producto.categoria.toLowerCase().includes(termino),
          )
          this.calcularPaginacion()
          this.currentPage = 1
          this.aplicarPaginacion()
        },
        error: (error: any) => {
          console.error("Error al filtrar productos:", error)
        },
      })
    }
  }

  estaActivo(estado: string): boolean {
    return estado === "Activo" || estado === "A"
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString("es-CO", { style: "currency", currency: "COP" })
  }
}
