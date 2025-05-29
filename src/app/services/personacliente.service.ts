import {  HttpClient, HttpHeaders } from "@angular/common/http"
import { Injectable } from "@angular/core"
import  { Observable } from "rxjs"
import { catchError } from "rxjs/operators"
import { throwError } from "rxjs"
import { environment } from "src/enviroments/environments"

export interface PersonaCliente {
  id?: number
  idTipoDocumento: number
  numeroDocumento: string
  primerNombre: string
  segundoNombre: string
  primerApellido: string
  segundoApellido: string
  correoElectronico: string
  telefono: string
  celular: string
  direccion: string
  ciudad: string
  departamento: string
  pais: string
  codigoPostal: string
  genero: string
  estadoCivil: string
  fechaNacimiento: string | Date
  lugarNacimiento: string
  nacionalidad: string
  fechaRegistro: string | Date
  estado: string
}

@Injectable({
  providedIn: "root",
})
export class PersonaclienteService {
  private apiUrl = environment.endpoint + "api/PersonaCliente"

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
    }
  }

  getClientes(): Observable<PersonaCliente[]> {
    return this.http.get<PersonaCliente[]>(this.apiUrl).pipe(catchError(this.handleError))
  }

  getClienteByDocumento(numeroDocumento: string): Observable<PersonaCliente> {
    return this.http.get<PersonaCliente>(`${this.apiUrl}/${numeroDocumento}`).pipe(catchError(this.handleError))
  }

  desactivateCliente(numeroDocumento: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${numeroDocumento}`).pipe(catchError(this.handleError))
  }

  crearCliente(cliente: PersonaCliente): Observable<any> {
    const clienteFormatted = this.formatClienteForApi(cliente)
    console.log("Enviando datos para crear:", clienteFormatted)

    return this.http.post(this.apiUrl, clienteFormatted, this.getHttpOptions()).pipe(catchError(this.handleError))
  }

  actualizarCliente(cliente: PersonaCliente): Observable<any> {
    const clienteFormatted = this.formatClienteForApi(cliente)
    console.log("Enviando datos para actualizar:", clienteFormatted)

    return this.http.put(this.apiUrl, clienteFormatted, this.getHttpOptions()).pipe(catchError(this.handleError))
  }

  private formatClienteForApi(cliente: PersonaCliente): any {
    // Formatear fecha de nacimiento
    let fechaNacimientoFormatted = ""
    if (cliente.fechaNacimiento) {
      try {
        if (typeof cliente.fechaNacimiento === "string") {
          // Si es string, verificar si es una fecha válida
          const fecha = new Date(cliente.fechaNacimiento)
          if (!isNaN(fecha.getTime())) {
            fechaNacimientoFormatted = fecha.toISOString().split("T")[0]
          }
        } else {
          fechaNacimientoFormatted = cliente.fechaNacimiento.toISOString().split("T")[0]
        }
      } catch (error) {
        console.error("Error al formatear fecha de nacimiento:", error)
        fechaNacimientoFormatted = ""
      }
    }

    // Formatear fecha de registro
    let fechaRegistroFormatted = ""
    if (cliente.fechaRegistro) {
      try {
        if (typeof cliente.fechaRegistro === "string") {
          fechaRegistroFormatted = cliente.fechaRegistro
        } else {
          fechaRegistroFormatted = cliente.fechaRegistro.toISOString()
        }
      } catch (error) {
        console.error("Error al formatear fecha de registro:", error)
        fechaRegistroFormatted = new Date().toISOString()
      }
    } else {
      fechaRegistroFormatted = new Date().toISOString()
    }

    return {
      idTipoDocumento: Number(cliente.idTipoDocumento) || 1,
      numeroDocumento: cliente.numeroDocumento?.trim() || "",
      primerNombre: cliente.primerNombre?.trim() || "",
      segundoNombre: cliente.segundoNombre?.trim() || "",
      primerApellido: cliente.primerApellido?.trim() || "",
      segundoApellido: cliente.segundoApellido?.trim() || "",
      correoElectronico: cliente.correoElectronico?.trim() || "",
      telefono: cliente.telefono?.trim() || "",
      celular: cliente.celular?.trim() || "",
      direccion: cliente.direccion?.trim() || "",
      ciudad: cliente.ciudad?.trim() || "",
      departamento: cliente.departamento?.trim() || "",
      pais: cliente.pais?.trim() || "",
      codigoPostal: cliente.codigoPostal?.trim() || "",
      genero: cliente.genero || "",
      estadoCivil: cliente.estadoCivil || "",
      fechaNacimiento: fechaNacimientoFormatted,
      lugarNacimiento: cliente.lugarNacimiento?.trim() || "",
      nacionalidad: cliente.nacionalidad?.trim() || "",
      fechaRegistro: fechaRegistroFormatted,
      estado: cliente.estado || "A",
    }
  }

  private handleError(error: any): Observable<never> {
    console.error("Error en el servicio:", error)

    let errorMessage = "Error desconocido"

    if (error.error) {
      if (typeof error.error === "string") {
        errorMessage = error.error
      } else if (error.error.message) {
        errorMessage = error.error.message
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    return throwError(() => ({
      ...error,
      userMessage: errorMessage,
    }))
  }
}
