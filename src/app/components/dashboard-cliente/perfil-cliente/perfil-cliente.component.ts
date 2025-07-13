import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/services/token.service';
import { ClienteService, ActualizarPerfilDto } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-perfil-cliente',
  templateUrl: './perfil-cliente.component.html',
  styleUrls: ['./perfil-cliente.component.css'],
  standalone: false,
})
export class PerfilClienteComponent implements OnInit {
  
  perfilForm: FormGroup;
  cargando = false;
  guardando = false;
  numeroDocumento = '';
  datosOriginales: any = {};
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tokenService: TokenService,
    private clienteService: ClienteService
  ) {
    this.perfilForm = this.createForm();
  }

  ngOnInit(): void {
    this.obtenerNumeroDocumento();
    this.cargarDatosPerfil();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      numeroDocumento: [{value: '', disabled: true}],
      tipoDocumento: [{value: '', disabled: true}],
      primerNombre: ['', [Validators.required, Validators.minLength(2)]],
      segundoNombre: [''],
      primerApellido: ['', [Validators.required, Validators.minLength(2)]],
      segundoApellido: [''],
      correoElectronico: ['', [Validators.required, Validators.email]],
      telefono: [''],
      celular: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      direccion: ['', Validators.required],
      ciudad: ['', Validators.required],
      departamento: [''],
      pais: [''],
      codigoPostal: [''],
      fechaNacimiento: [''],
      genero: [''],
      estadoCivil: [''],
      nacionalidad: ['']
    });
  }

  private obtenerNumeroDocumento(): void {
    const userData = this.tokenService.getUserData();
    if (userData) {
      this.numeroDocumento = userData.numeroDocumento || userData.identificacion;
    }
  }

  private cargarDatosPerfil(): void {
    this.cargando = true;
    
    this.clienteService.getPerfil(this.numeroDocumento).subscribe({
      next: (perfil) => {
        this.datosOriginales = { ...perfil };
        this.perfilForm.patchValue(perfil);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar perfil:', error);
        this.cargando = false;
        this.mostrarError('Error al cargar los datos del perfil');
      }
    });
  }

  guardarCambios(): void {
    if (this.perfilForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    this.guardando = true;
    
    // Preparar datos para enviar (solo campos modificables)
    const datosActualizados: ActualizarPerfilDto = {
      numeroDocumento: this.numeroDocumento,
      primerNombre: this.perfilForm.get('primerNombre')?.value,
      segundoNombre: this.perfilForm.get('segundoNombre')?.value || '',
      primerApellido: this.perfilForm.get('primerApellido')?.value,
      segundoApellido: this.perfilForm.get('segundoApellido')?.value || '',
      correoElectronico: this.perfilForm.get('correoElectronico')?.value,
      telefono: this.perfilForm.get('telefono')?.value || '',
      celular: this.perfilForm.get('celular')?.value,
      direccion: this.perfilForm.get('direccion')?.value,
      ciudad: this.perfilForm.get('ciudad')?.value,
      departamento: this.perfilForm.get('departamento')?.value || '',
      pais: this.perfilForm.get('pais')?.value || ''
    };

    this.clienteService.actualizarPerfil(datosActualizados).subscribe({
      next: (respuesta) => {
        this.guardando = false;
        this.mostrarExito('Perfil actualizado correctamente');
        this.datosOriginales = { ...respuesta };
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        this.guardando = false;
        this.mostrarError('Error al actualizar el perfil');
      }
    });
  }

  cancelarCambios(): void {
    this.perfilForm.patchValue(this.datosOriginales);
    this.perfilForm.markAsUntouched();
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.perfilForm.controls).forEach(key => {
      const control = this.perfilForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para validación
  get primerNombre() { return this.perfilForm.get('primerNombre'); }
  get primerApellido() { return this.perfilForm.get('primerApellido'); }
  get correoElectronico() { return this.perfilForm.get('correoElectronico'); }
  get celular() { return this.perfilForm.get('celular'); }
  get direccion() { return this.perfilForm.get('direccion'); }
  get ciudad() { return this.perfilForm.get('ciudad'); }

  // Validaciones personalizadas
  validarEmail(): boolean {
    const email = this.correoElectronico?.value;
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validarCelular(): boolean {
    const celular = this.celular?.value;
    if (!celular) return false;
    return /^[0-9]{10}$/.test(celular);
  }

  // Métodos para mostrar mensajes
  private mostrarExito(mensaje: string): void {
    // Implementar notificación de éxito
    alert(mensaje); // Temporal, usar toast o similar
  }

  private mostrarError(mensaje: string): void {
    // Implementar notificación de error
    alert(mensaje); // Temporal, usar toast o similar
  }

  // Verificar si hay cambios pendientes
  hayCambiosPendientes(): boolean {
    const valoresActuales = this.perfilForm.getRawValue();
    return JSON.stringify(valoresActuales) !== JSON.stringify(this.datosOriginales);
  }

  volver(): void {
    if (this.hayCambiosPendientes()) {
      if (confirm('¿Deseas salir sin guardar los cambios?')) {
        this.router.navigate(['/dashboard-cliente']);
      }
    } else {
      this.router.navigate(['/dashboard-cliente']);
    }
  }

  // Listas para campos selectores
  getDepartamentos(): string[] {
    return [
      'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
      'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
      'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
      'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío',
      'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre',
      'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'
    ];
  }

  getGeneros(): { valor: string; texto: string }[] {
    return [
      { valor: 'M', texto: 'Masculino' },
      { valor: 'F', texto: 'Femenino' },
      { valor: 'O', texto: 'Otro' },
      { valor: 'N', texto: 'Prefiero no decir' }
    ];
  }

  getEstadosCiviles(): string[] {
    return ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión libre'];
  }

  getPaises(): string[] {
    return [
      'Colombia', 'Argentina', 'Brasil', 'Chile', 'Ecuador', 'Perú',
      'Venezuela', 'México', 'Estados Unidos', 'España', 'Otro'
    ];
  }
}