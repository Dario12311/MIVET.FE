import { Component, OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { ActivatedRoute, Router } from "@angular/router"
import  { Producto, ProductosService } from "src/app/services/productos.service"

@Component({
  selector: "app-registroproducto",
  templateUrl: "./registroproducto.component.html",
  styleUrls: ["./registroproducto.component.css"],
  standalone: false,
})
export class RegistroproductoComponent implements OnInit {
  productoForm: FormGroup
  modoEdicion = false
  productoId: number | null = null
  cargando = false
  imagenPreview: string | null = null
  categorias = ["Medicamentos", "Alimentos", "Accesorios", "Higiene", "Juguetes", "Cuidado Personal", "Otros"]

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.productoForm = this.fb.group({
      nombre: ["", [Validators.required, Validators.maxLength(100)]],
      descripcion: ["", [Validators.required, Validators.maxLength(500)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoria: ["", Validators.required],
      imagenUrl: [""],
      estado: ["A"], // Por defecto "A" para Activo
    })
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.modoEdicion = true
        this.productoId = +params["id"]
        this.cargarProducto(this.productoId)
      }
    })

    // Escuchar cambios en la URL de imagen
    this.productoForm.get("imagenUrl")?.valueChanges.subscribe((url: string) => {
      if (url && url.trim()) {
        this.imagenPreview = url
      }
    })
  }

  cargarProducto(id: number): void {
    this.cargando = true
    this.productosService.getProductoById(id).subscribe({
      next: (producto: Producto) => {
        this.productoForm.patchValue({
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio,
          stock: producto.stock,
          categoria: producto.categoria,
          imagenUrl: producto.imagenUrl,
          estado: producto.estado, // Mantendrá "A" o "I" según el producto
        })
        this.imagenPreview = producto.imagenUrl || null
        this.cargando = false
      },
      error: (error: any) => {
        console.error("Error al cargar el producto:", error)
        this.cargando = false
        alert("Error al cargar los datos del producto. Por favor, intenta nuevamente.")
      },
    })
  }

  guardarProducto(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched()
      return
    }

    this.cargando = true

    if (this.modoEdicion && this.productoId) {
      // Para edición, crear objeto con id
      const productoData: Producto = {
        id: this.productoId,
        nombre: this.productoForm.value.nombre,
        descripcion: this.productoForm.value.descripcion,
        precio: this.productoForm.value.precio,
        stock: this.productoForm.value.stock,
        categoria: this.productoForm.value.categoria,
        imagenUrl: this.productoForm.value.imagenUrl || "",
        estado: this.productoForm.value.estado,
      }

      this.productosService.actualizarProducto(productoData).subscribe({
        next: () => {
          this.router.navigate(["/dashboard/productos"])
        },
        error: (error: any) => {
          console.error("Error al actualizar el producto:", error)
          this.cargando = false
          alert("Error al actualizar el producto. Por favor, intenta nuevamente.")
        },
      })
    } else {
      // Para creación, crear objeto sin id (se asignará en el backend)
      const productoData: Omit<Producto, "id"> = {
        nombre: this.productoForm.value.nombre,
        descripcion: this.productoForm.value.descripcion,
        precio: this.productoForm.value.precio,
        stock: this.productoForm.value.stock,
        categoria: this.productoForm.value.categoria,
        imagenUrl: this.productoForm.value.imagenUrl || "",
        estado: this.productoForm.value.estado,
      }

      this.productosService.crearProducto(productoData as Producto).subscribe({
        next: () => {
          this.router.navigate(["/dashboard/productos"])
        },
        error: (error: any) => {
          console.error("Error al crear el producto:", error)
          this.cargando = false
          alert("Error al crear el producto. Por favor, intenta nuevamente.")
        },
      })
    }
  }

  actualizarImagenPreview(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      const file = input.files[0]

      // Validar tamaño del archivo (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es demasiado grande. El tamaño máximo es 5MB.")
        return
      }

      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecciona un archivo de imagen válido.")
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        this.imagenPreview = reader.result as string
        this.productoForm.patchValue({ imagenUrl: this.imagenPreview })
      }
      reader.readAsDataURL(file)
    }
  }

  actualizarImagenDesdeUrl(event: Event): void {
    const input = event.target as HTMLInputElement
    const url = input.value.trim()

    if (url) {
      // Validar que sea una URL válida
      try {
        new URL(url)
        this.imagenPreview = url
      } catch {
        // Si no es una URL válida, limpiar la preview
        this.imagenPreview = null
      }
    } else {
      this.imagenPreview = null
    }
  }

  volver(): void {
    if (this.productoForm.dirty) {
      if (confirm("¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.")) {
        this.router.navigate(["/dashboard/productos"])
      }
    } else {
      this.router.navigate(["/dashboard/productos"])
    }
  }

  // Getters para validación de formularios
  get nombreInvalid(): boolean {
    const control = this.productoForm.get("nombre")
    return !!(control?.invalid && control?.touched)
  }

  get descripcionInvalid(): boolean {
    const control = this.productoForm.get("descripcion")
    return !!(control?.invalid && control?.touched)
  }

  get precioInvalid(): boolean {
    const control = this.productoForm.get("precio")
    return !!(control?.invalid && control?.touched)
  }

  get stockInvalid(): boolean {
    const control = this.productoForm.get("stock")
    return !!(control?.invalid && control?.touched)
  }

  get categoriaInvalid(): boolean {
    const control = this.productoForm.get("categoria")
    return !!(control?.invalid && control?.touched)
  }
}
