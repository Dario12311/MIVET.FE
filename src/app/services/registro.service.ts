import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, catchError, tap, map } from 'rxjs/operators';
import { environment } from 'src/enviroments/environments';

export interface RegistroUsuarioRequest {
  identificacion: string;
  nombreUsuario: string;
  password: string;
  estado: string;
  rolId: number;
}

export interface RegistroClienteRequest {
  idTipoDocumento: number;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  correoElectronico: string;
  telefono: string;
  celular: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  pais: string;
  codigoPostal: string;
  genero: string;
  estadoCivil: string;
  fechaNacimiento: string;
  lugarNacimiento: string;
  nacionalidad: string;
  fechaRegistro: string;
  estado: string;
}

export interface RegistroResponse {
  mensaje: string;
  exito: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  private apiUrlUsuario = environment.endpoint + 'api/UsuarioControllers';
  private apiUrlCliente = environment.endpoint + 'api/PersonaCliente';

  constructor(private http: HttpClient) { 
    console.log('URLs de API:');
    console.log('Usuario:', this.apiUrlUsuario);
    console.log('Cliente:', this.apiUrlCliente);
  }

  /**
   * Registra un nuevo usuario en el sistema
   * @param formData Datos del formulario de registro
   * @returns Observable con la respuesta del servidor
   */
  registrarUsuario(formData: any): Observable<RegistroResponse> {

    const usuarioRequest: RegistroUsuarioRequest = {
      identificacion: formData.numeroDocumento,
      nombreUsuario: formData.nombreUsuario,
      password: formData.password,
      estado: 'A', 
      rolId: 5 
    };
    
    const clienteRequest: RegistroClienteRequest = {
      idTipoDocumento: parseInt(formData.tipoDocumento),
      numeroDocumento: formData.numeroDocumento,
      primerNombre: formData.primerNombre,
      segundoNombre: formData.segundoNombre || '',
      primerApellido: formData.primerApellido,
      segundoApellido: formData.segundoApellido || '',
      correoElectronico: formData.correoElectronico,
      telefono: formData.telefono || '',
      celular: formData.celular,
      direccion: formData.direccion,
      ciudad: formData.ciudad,
      departamento: formData.departamento || '',
      pais: formData.pais || 'Colombia',
      codigoPostal: formData.codigoPostal || '00000',
      genero: formData.genero || 'M',
      estadoCivil: formData.estadoCivil || 'S',
      fechaNacimiento: formData.fechaNacimiento ? formData.fechaNacimiento.substring(0, 10) : new Date().toISOString().substring(0, 10),
      lugarNacimiento: formData.lugarNacimiento || '',
      nacionalidad: formData.nacionalidad || 'Colombiana',
      fechaRegistro: new Date().toISOString().substring(0, 10),
      estado: 'A' 
    };
    
    console.log('Enviando datos de usuario:', usuarioRequest);
    console.log('Enviando datos de cliente:', clienteRequest);
    
    return this.http.post<any>(this.apiUrlUsuario, usuarioRequest).pipe(
      tap(respuesta => {
        console.log('Respuesta completa del registro de usuario:', JSON.stringify(respuesta));
        if (typeof respuesta === 'object') {
          console.log('Propiedades de la respuesta:');
          Object.keys(respuesta).forEach(key => {
            console.log(`- ${key}: ${JSON.stringify(respuesta[key])}`);
          });
        }
      }),
      switchMap(respuestaUsuario => {

        console.log('Intentando registrar cliente en:', this.apiUrlCliente);
        return this.http.post<any>(this.apiUrlCliente, clienteRequest).pipe(
          tap(respuestaCliente => console.log('Respuesta del registro de cliente:', respuestaCliente)),
          map(respuestaCliente => {

            const respuestaCombinada: RegistroResponse = {
              mensaje: 'Registro completado con éxito',
              exito: true
            };
            return respuestaCombinada;
          }),
          catchError(errorCliente => {
            console.error('Error al registrar cliente:', errorCliente);

            const errorResponseCliente: RegistroResponse = {
              mensaje: `Error al registrar datos del cliente: ${errorCliente.message || errorCliente.statusText || 'Error desconocido'}`,
              exito: false
            };
            return of(errorResponseCliente);
          })
        );
      }),
      catchError(error => {
        console.error('Error en el registro de usuario:', error);

        const errorResponse: RegistroResponse = {
          mensaje: `Error al registrar usuario: ${error.message || error.statusText || 'Error desconocido'}`,
          exito: false
        };
        return of(errorResponse);
      })
    );
  }
}