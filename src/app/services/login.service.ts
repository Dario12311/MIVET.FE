import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/environments';

export interface LoginRequest {
  nombreUsuario: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = environment.endpoint + 'api/UsuarioControllers/login';

  constructor(private http: HttpClient) { }

  /**
   * Realiza la autenticación del usuario
   * @param nombreUsuario Nombre de usuario
   * @param password Contraseña del usuario
   * @returns Observable con la respuesta que contiene el token
   */
  login(nombreUsuario: string, password: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = {
      nombreUsuario,
      password
    };
    
    return this.http.post<LoginResponse>(this.apiUrl, loginRequest);
  }

  /**
   * Guarda el token en el almacenamiento local
   * @param token Token de autenticación
   */
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Obtiene el token del almacenamiento local
   * @returns Token de autenticación
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns true si el usuario está autenticado, false en caso contrario
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && token !== '';
  }

 
  logout(): void {
    localStorage.removeItem('token');
  }
}
