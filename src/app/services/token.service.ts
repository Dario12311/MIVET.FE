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
  nombreUsuario: string;
  identificacion: string;
  
  // Información personal del usuario
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  
  // Información de contacto
  correoElectronico?: string;
  telefono?: string;
  celular?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  
  // Roles
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

  /**
   * Obtiene el nombre de usuario desde el token
   * @returns Nombre de usuario o null si no hay token
   */
  getUserName(): string | null {
    const decoded = this.getDecodedToken();
    return decoded ? decoded.nombreUsuario : null;
  }

  /**
   * Obtiene los datos del usuario desde el token
   * @returns Datos del usuario o null si no hay token
   */
  getUserData(): any | null {
    const decoded = this.getDecodedToken();
    if (!decoded) {
      return null;
    }

    // Retorna un objeto con los datos del usuario disponibles en el token
    return {
      idUsuario: decoded.idUsuario,
      nombreUsuario: decoded.nombreUsuario,
      numeroDocumento: decoded.identificacion || decoded.sub || decoded.idUsuario,
      identificacion: decoded.identificacion || decoded.sub || decoded.idUsuario,
      
      // Información personal
      primerNombre: decoded.primerNombre || '',
      segundoNombre: decoded.segundoNombre || '',
      primerApellido: decoded.primerApellido || '',
      segundoApellido: decoded.segundoApellido || '',
      nombre: this.construirNombreCompleto(decoded),
      
      // Información de contacto
      correoElectronico: decoded.correoElectronico || '',
      email: decoded.correoElectronico || '',
      telefono: decoded.telefono || '',
      celular: decoded.celular || '',
      direccion: decoded.direccion || '',
      ciudad: decoded.ciudad || '',
      departamento: decoded.departamento || '',
      pais: decoded.pais || '',
      
      // Roles
      roles: this.getUserRole(),
    };
  }

  /**
   * Construye el nombre completo del usuario
   * @param decoded Token decodificado
   * @returns Nombre completo
   */
  private construirNombreCompleto(decoded: DecodedToken): string {
    const nombres = [
      decoded.primerNombre,
      decoded.segundoNombre,
      decoded.primerApellido,
      decoded.segundoApellido
    ].filter(nombre => nombre && nombre.trim() !== '');
    
    return nombres.length > 0 ? nombres.join(' ') : decoded.nombreUsuario || 'Usuario';
  }

  /**
   * Obtiene la identificación/documento del usuario
   * @returns Número de documento o null si no hay token
   */
  getUserDocument(): string | null {
    const decoded = this.getDecodedToken();
    return decoded ? (decoded.identificacion || decoded.sub || decoded.idUsuario) : null;
  }

  /**
   * Obtiene el email del usuario
   * @returns Email del usuario o null si no hay token
   */
  getUserEmail(): string | null {
    const decoded = this.getDecodedToken();
    return decoded ? (decoded.correoElectronico || '') : null;
  }

  /**
   * Obtiene el teléfono del usuario
   * @returns Teléfono del usuario o null si no hay token
   */
  getUserPhone(): string | null {
    const decoded = this.getDecodedToken();
    return decoded ? (decoded.telefono || '') : null;
  }

  /**
   * Obtiene el celular del usuario
   * @returns Celular del usuario o null si no hay token
   */
  getUserCellPhone(): string | null {
    const decoded = this.getDecodedToken();
    return decoded ? (decoded.celular || '') : null;
  }

  /**
   * Obtiene la dirección del usuario
   * @returns Dirección del usuario o null si no hay token
   */
  getUserAddress(): string | null {
    const decoded = this.getDecodedToken();
    return decoded ? (decoded.direccion || '') : null;
  }

  /**
   * Obtiene la ciudad del usuario
   * @returns Ciudad del usuario o null si no hay token
   */
  getUserCity(): string | null {
    const decoded = this.getDecodedToken();
    return decoded ? (decoded.ciudad || '') : null;
  }
}