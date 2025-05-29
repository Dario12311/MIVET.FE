import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/enviroments/environments';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  estado: string;
  imagenUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private apiUrl = environment.endpoint + 'api/ProductosControllers';

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
    };
  }

  getProductos(): Observable<any>  {
    return this.http.get(this.apiUrl);
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  crearProducto(producto: Producto): Observable<any> {
    console.log("Enviando datos para crear:", producto)

    return this.http.post(this.apiUrl, producto, this.getHttpOptions()).pipe(catchError(this.handleError));
  }

  actualizarProducto(producto: Producto): Observable<any> {
    return this.http.put(this.apiUrl, producto, this.getHttpOptions()).pipe(catchError(this.handleError));
  }

  desactivarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/disable/${id}`).pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Error en la operación:', error);
    return throwError(() => error);
  }
}
