import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  // Claims estándar de JWT
  sub: string;
  exp: number;
  iss?: string;
  aud?: string;
  
  // Claims personalizados según tu backend
  idUsuario: string;
  roles?: string | string[];
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  /**
   * Decodifica el token JWT
   * @returns Token decodificado o null si no hay token o es inválido
   */
  getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

  /**
   * Obtiene el token del almacenamiento local
   * @returns Token de autenticación
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Guarda el token en el almacenamiento local
   * @param token Token de autenticación
   */
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Elimina el token del almacenamiento local
   */
  removeToken(): void {
    localStorage.removeItem('token');
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns true si el usuario está autenticado, false en caso contrario
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Verificar si el token ha expirado
    const decoded = this.getDecodedToken();
    if (!decoded) {
      return false;
    }

    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  }

  /**
   * Obtiene el rol del usuario desde el token
   * @returns Rol del usuario o null si no hay token
   */
  getUserRole(): string[] | null {
    const decoded = this.getDecodedToken();
    if (!decoded) {
      return null;
    }
    
    // Verificar si roles existe y convertirlo a array
    if (decoded.roles) {
      // Si roles es un string, convertirlo a array
      if (typeof decoded.roles === 'string') {
        return [decoded.roles];
      }
      // Si ya es un array, devolverlo directamente
      return decoded.roles;
    }
    
    return null;
  }
  
  /**
   * Verifica si el usuario tiene un rol específico
   * @param role Rol a verificar
   * @returns true si el usuario tiene el rol, false en caso contrario
   */
  hasRole(role: string): boolean {
    const roles = this.getUserRole();
    if (!roles) {
      return false;
    }
    
    return roles.includes(role);
  }
  
  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * @param allowedRoles Roles permitidos
   * @returns true si el usuario tiene alguno de los roles, false en caso contrario
   */
  hasAnyRole(allowedRoles: string[]): boolean {
    const roles = this.getUserRole();
    if (!roles) {
      return false;
    }
    
    return roles.some(role => allowedRoles.includes(role));
  }
  
  /**
   * Obtiene el ID del usuario desde el token
   * @returns ID del usuario o null si no hay token
   */
  getUserId(): string | null {
    const decoded = this.getDecodedToken();
    return decoded ? decoded.idUsuario : null;
  }
}