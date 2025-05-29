import { Component,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { ActivatedRoute, Router } from "@angular/router"
import  { MedicoveterinarioService, MedicoVeterinario } from "src/app/services/medicoveterinario.service"

@Component({
  selector: "app-registromedico",
  templateUrl: "./registromedico.component.html",
  styleUrls: ["./registromedico.component.css"],
})
export class RegistromedicoComponent implements OnInit {
  medicoForm: FormGroup
  modoEdicion = false
  numeroDocumento = ""
  cargando = false
  enviando = false
  tiposDocumento = [
    { id: 1, nombre: "Cédula de Ciudadanía" },
    { id: 2, nombre: "Tarjeta de Identidad" },
    { id: 3, nombre: "Cédula de Extranjería" },
    { id: 4, nombre: "Pasaporte" },
  ]
  estadosCiviles = [
    { id: 1, nombre: "Soltero/a" },
    { id: 2, nombre: "Casado/a" },
    { id: 3, nombre: "Divorciado/a" },
    { id: 4, nombre: "Viudo/a" },
    { id: 5, nombre: "Unión Libre" },
  ]

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private medicoService: MedicoveterinarioService,
  ) {
    this.medicoForm = this.fb.group({
      id: [0],
      nombre: ["", [Validators.required, Validators.maxLength(100)]],
      numeroDocumento: ["", [Validators.required, Validators.maxLength(20)]],
      estadoCivil: [null, Validators.required],
      tipoDocumentoId: [null, Validators.required],
      especialidad: ["", [Validators.required, Validators.maxLength(50)]], // Cambiado a 50
      telefono: ["", [Validators.required, Validators.maxLength(15)]],
      correoElectronico: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
      direccion: ["", [Validators.required, Validators.maxLength(200)]],
      fechaRegistro: [new Date().toISOString()],
      universidadGraduacion: ["", [Validators.required, Validators.maxLength(100)]],
      fechaNacimiento: ["", Validators.required],
      añoGraduacion: ["", Validators.required],
      genero: ["", Validators.required], // Cambiado a minúscula
      nacionalidad: ["", [Validators.required, Validators.maxLength(50)]], // Cambiado a minúscula
      ciudad: ["", [Validators.required, Validators.maxLength(50)]], // Cambiado a minúscula
      estado: ["A", Validators.required],
    })
  }

  ngOnInit(): void {
    // Detectar si es modo edición basado en el parámetro de la ruta
    this.route.paramMap.subscribe((params) => {
      // El parámetro puede ser 'id' o el primer parámetro sin nombre
      const numeroDocumento = params.get("id") || params.keys[0] ? params.get(params.keys[0]) : null

      console.log("Parámetros de ruta:", params)
      console.log("Número de documento recibido:", numeroDocumento)

      if (numeroDocumento) {
        this.numeroDocumento = numeroDocumento
        this.modoEdicion = true
        this.cargarDatosMedico(this.numeroDocumento)
      } else {
        // Modo creación - resetear formulario
        this.modoEdicion = false
        this.numeroDocumento = ""
        this.resetearFormulario()
      }
    })
  }

  resetearFormulario(): void {
    this.medicoForm.reset({
      id: 0,
      estado: "A",
      fechaRegistro: new Date().toISOString(),
    })
    console.log("Formulario reseteado para modo creación")
  }

  cargarDatosMedico(numeroDocumento: string): void {
    console.log("Cargando datos del médico con documento:", numeroDocumento)
    this.cargando = true

    this.medicoService.getMedicoById(numeroDocumento).subscribe({
      next: (medico: MedicoVeterinario) => {
        console.log("Datos del médico cargados:", medico)
        this.medicoForm.patchValue({
          ...medico,
          fechaNacimiento: this.formatearFechaParaInput(medico.fechaNacimiento),
          añoGraduacion: this.formatearFechaParaInput(medico.añoGraduacion),
        })
        this.cargando = false
      },
      error: (error) => {
        console.error("Error al cargar datos del médico:", error)
        this.mostrarMensaje("Error al cargar los datos del médico", "error")
        this.cargando = false
        this.router.navigate(["/dashboard/medicoveterinario"])
      },
    })
  }

  formatearFechaParaInput(fecha: string): string {
    if (!fecha) return ""
    // Convertir la fecha al formato YYYY-MM-DD para el input type=date
    const date = new Date(fecha)
    return date.toISOString().split("T")[0]
  }

  guardarMedico(): void {
    if (this.medicoForm.invalid) {
      this.medicoForm.markAllAsTouched()
      this.mostrarMensaje("Por favor, complete todos los campos requeridos correctamente", "error")
      return
    }

    this.enviando = true
    const medicoData = this.medicoForm.value

    if (this.modoEdicion) {
      this.medicoService.actualizarMedico(medicoData).subscribe({
        next: () => {
          this.mostrarMensaje("Médico actualizado correctamente", "success")
          this.enviando = false
          this.router.navigate(["/dashboard/medicoveterinario"])
        },
        error: (error) => {
          console.error("Error al actualizar médico:", error)
          this.mostrarMensaje("Error al actualizar el médico", "error")
          this.enviando = false
        },
      })
    } else {
      this.medicoService.crearMedico(medicoData).subscribe({
        next: () => {
          this.mostrarMensaje("Médico registrado correctamente", "success")
          this.enviando = false
          this.router.navigate(["/dashboard/medicoveterinario"])
        },
        error: (error) => {
          console.error("Error al registrar médico:", error)
          this.mostrarMensaje("Error al registrar el médico", "error")
          this.enviando = false
        },
      })
    }
  }

  cancelar(): void {
    this.router.navigate(["/dashboard/medicoveterinario"])
  }

  mostrarMensaje(mensaje: string, tipo: "success" | "error"): void {
    // Aquí puedes implementar la lógica para mostrar mensajes
    console.log(`${tipo.toUpperCase()}: ${mensaje}`)
    // Si tienes un servicio de notificaciones, úsalo aquí
  }

  // Getters para validación de formularios
  get nombreInvalido(): boolean {
    return (this.medicoForm.get("nombre")?.invalid && this.medicoForm.get("nombre")?.touched) || false
  }

  get documentoInvalido(): boolean {
    return (this.medicoForm.get("numeroDocumento")?.invalid && this.medicoForm.get("numeroDocumento")?.touched) || false
  }

  get especialidadInvalida(): boolean {
    return (this.medicoForm.get("especialidad")?.invalid && this.medicoForm.get("especialidad")?.touched) || false
  }

  get correoInvalido(): boolean {
    return (
      (this.medicoForm.get("correoElectronico")?.invalid && this.medicoForm.get("correoElectronico")?.touched) || false
    )
  }

  get estadoInvalido(): boolean {
    return (this.medicoForm.get("estado")?.invalid && this.medicoForm.get("estado")?.touched) || false
  }
}
