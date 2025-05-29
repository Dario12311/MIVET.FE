import { Component } from "@angular/core"
import { FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { ActivatedRoute, Router } from "@angular/router"
import  { PersonaCliente, PersonaclienteService } from "src/app/services/personacliente.service"

@Component({
  selector: "app-updatecliente",
  templateUrl: "./updatecliente.component.html",
  styleUrls: ["./updatecliente.component.css"],
  standalone: false,
})
export class UpdateclienteComponent {
  clienteForm: FormGroup
  cargando = false
  guardando = false
  numeroDocumento = ""
  modoEdicion = false
  clienteOriginal: PersonaCliente | null = null

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private personaClienteService: PersonaclienteService,
  ) {
    this.clienteForm = this.createForm()
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.numeroDocumento = params["numeroDocumento"]
      if (this.numeroDocumento) {
        this.modoEdicion = true
        this.cargarDatosCliente()
        this.clienteForm.get("numeroDocumento")?.disable()
      } else {
        this.modoEdicion = false
        this.clienteForm.get("numeroDocumento")?.enable()
      }
    })
  }

  private createForm(): FormGroup {
    return this.fb.group({
      idTipoDocumento: [1, Validators.required],
      numeroDocumento: ["", [Validators.required, Validators.minLength(6)]],
      primerNombre: ["", [Validators.required, Validators.minLength(2)]],
      segundoNombre: [""],
      primerApellido: ["", [Validators.required, Validators.minLength(2)]],
      segundoApellido: [""],
      correoElectronico: ["", [Validators.required, Validators.email]],
      telefono: [""],
      celular: ["", [Validators.required, Validators.minLength(10)]],
      direccion: [""],
      ciudad: [""],
      departamento: [""],
      pais: ["Colombia"],
      codigoPostal: [""],
      genero: [""],
      estadoCivil: [""],
      fechaNacimiento: [""],
      lugarNacimiento: [""],
      nacionalidad: ["Colombiana"],
      estado: ["A", Validators.required],
    })
  }

  cargarDatosCliente(): void {
    this.cargando = true

    this.personaClienteService.getClienteByDocumento(this.numeroDocumento).subscribe({
      next: (cliente: PersonaCliente) => {
        this.clienteOriginal = cliente
        this.llenarFormulario(cliente)
        this.cargando = false
      },
      error: (error) => {
        console.error("Error al cargar cliente:", error)
        this.mostrarMensaje("Error al cargar los datos del cliente", "error")
        this.cargando = false
        this.volver()
      },
    })
  }

  private llenarFormulario(cliente: PersonaCliente): void {
    let fechaNacimiento = ""
    if (cliente.fechaNacimiento) {
      try {
        const fecha = new Date(cliente.fechaNacimiento)
        if (!isNaN(fecha.getTime())) {
          fechaNacimiento = fecha.toISOString().split("T")[0]
        }
      } catch (error) {
        console.error("Error al procesar la fecha de nacimiento:", error)
      }
    }

    this.clienteForm.patchValue({
      idTipoDocumento: cliente.idTipoDocumento || 1,
      numeroDocumento: cliente.numeroDocumento || "",
      primerNombre: cliente.primerNombre || "",
      segundoNombre: cliente.segundoNombre || "",
      primerApellido: cliente.primerApellido || "",
      segundoApellido: cliente.segundoApellido || "",
      correoElectronico: cliente.correoElectronico || "",
      telefono: cliente.telefono || "",
      celular: cliente.celular || "",
      direccion: cliente.direccion || "",
      ciudad: cliente.ciudad || "",
      departamento: cliente.departamento || "",
      pais: cliente.pais || "Colombia",
      codigoPostal: cliente.codigoPostal || "",
      genero: cliente.genero || "",
      estadoCivil: cliente.estadoCivil || "",
      fechaNacimiento: fechaNacimiento,
      lugarNacimiento: cliente.lugarNacimiento || "",
      nacionalidad: cliente.nacionalidad || "Colombiana",
      estado: cliente.estado || "A",
    })
  }

  guardarCambios(): void {
    if (this.clienteForm.valid) {
      this.guardando = true

      const formValues = this.clienteForm.getRawValue()

      const clienteData: PersonaCliente = {
        ...(this.clienteOriginal?.id && { id: this.clienteOriginal.id }),
        idTipoDocumento: Number(formValues.idTipoDocumento) || 1,
        numeroDocumento: this.modoEdicion ? this.numeroDocumento : formValues.numeroDocumento,
        primerNombre: formValues.primerNombre?.trim() || "",
        segundoNombre: formValues.segundoNombre?.trim() || "",
        primerApellido: formValues.primerApellido?.trim() || "",
        segundoApellido: formValues.segundoApellido?.trim() || "",
        correoElectronico: formValues.correoElectronico?.trim() || "",
        telefono: formValues.telefono?.trim() || "",
        celular: formValues.celular?.trim() || "",
        direccion: formValues.direccion?.trim() || "",
        ciudad: formValues.ciudad?.trim() || "",
        departamento: formValues.departamento?.trim() || "",
        pais: formValues.pais?.trim() || "Colombia",
        codigoPostal: formValues.codigoPostal?.trim() || "",
        genero: formValues.genero || "",
        estadoCivil: formValues.estadoCivil || "",
        fechaNacimiento: formValues.fechaNacimiento || "",
        lugarNacimiento: formValues.lugarNacimiento?.trim() || "",
        nacionalidad: formValues.nacionalidad?.trim() || "Colombiana",
        fechaRegistro: this.clienteOriginal?.fechaRegistro || new Date().toISOString(),
        estado: formValues.estado || "A",
      }

      console.log("Datos a enviar:", clienteData)

      if (this.modoEdicion) {
        this.personaClienteService.actualizarCliente(clienteData).subscribe({
          next: (response) => {
            console.log("Cliente actualizado:", response)
            this.mostrarMensaje("Cliente actualizado correctamente", "success")
            this.guardando = false
            this.volver()
          },
          error: (error) => {
            console.error("Error completo:", error)
            this.guardando = false

            // Manejo específico de errores de base de datos
            this.manejarErrorBaseDatos(error)
          },
        })
      } else {
        this.personaClienteService.crearCliente(clienteData).subscribe({
          next: (response) => {
            console.log("Cliente creado:", response)
            this.mostrarMensaje("Cliente creado correctamente", "success")
            this.guardando = false
            this.volver()
          },
          error: (error) => {
            console.error("Error al crear cliente:", error)
            this.guardando = false
            this.manejarErrorBaseDatos(error)
          },
        })
      }
    } else {
      this.marcarCamposComoTocados()
      this.mostrarMensaje("Por favor, complete todos los campos requeridos", "error")
    }
  }

  private manejarErrorBaseDatos(error: any): void {
    let mensajeError = "Error al procesar la solicitud"

    // Extraer mensaje específico del servidor
    if (error.error && typeof error.error === "string") {
      if (error.error.includes("restricciones de la base de datos")) {
        mensajeError = "Error de restricciones de base de datos. Posibles causas:\n\n"
        mensajeError += "• El correo electrónico ya está registrado\n"
        mensajeError += "• El número de celular ya está en uso\n"
        mensajeError += "• Formato de fecha inválido\n"
        mensajeError += "• Campos requeridos faltantes\n"
        mensajeError += "• Longitud de campos excedida\n\n"
        mensajeError += "Verifique los datos e intente nuevamente."
      } else {
        mensajeError = error.error
      }
    } else if (error.message) {
      mensajeError = error.message
    }

    // Mostrar sugerencias específicas basadas en los datos
    this.mostrarSugerenciasError()
    this.mostrarMensaje(mensajeError, "error")
  }

  private mostrarSugerenciasError(): void {
    const formValues = this.clienteForm.getRawValue()
    const sugerencias: string[] = []

    // Verificar correo electrónico
    if (formValues.correoElectronico && !this.esEmailValido(formValues.correoElectronico)) {
      sugerencias.push("• Verifique el formato del correo electrónico")
    }

    // Verificar longitud de campos
    if (formValues.primerNombre && formValues.primerNombre.length > 50) {
      sugerencias.push("• El primer nombre es muy largo (máximo 50 caracteres)")
    }

    if (formValues.correoElectronico && formValues.correoElectronico.length > 100) {
      sugerencias.push("• El correo electrónico es muy largo (máximo 100 caracteres)")
    }

    if (formValues.celular && formValues.celular.length > 15) {
      sugerencias.push("• El número de celular es muy largo (máximo 15 caracteres)")
    }

    // Verificar fecha de nacimiento
    if (formValues.fechaNacimiento) {
      const fecha = new Date(formValues.fechaNacimiento)
      const hoy = new Date()
      if (fecha > hoy) {
        sugerencias.push("• La fecha de nacimiento no puede ser futura")
      }
    }

    if (sugerencias.length > 0) {
      console.warn("Sugerencias para corregir errores:")
      sugerencias.forEach((sugerencia) => console.warn(sugerencia))
    }
  }

  private esEmailValido(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.clienteForm.controls).forEach((key) => {
      this.clienteForm.get(key)?.markAsTouched()
    })
  }

  volver(): void {
    this.router.navigate(["/dashboard/clientes"])
  }

  private mostrarMensaje(mensaje: string, tipo: "success" | "error"): void {
    if (tipo === "success") {
      alert(`✅ ${mensaje}`)
    } else {
      alert(`❌ ${mensaje}`)
    }
  }
}
