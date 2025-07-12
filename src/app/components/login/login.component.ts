import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { RegistroService, RegistroResponse } from '../../services/registro.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false,
})

export class LoginComponent {
  isSignUpMode = false;
  nombreUsuario: string = '';
  password: string = '';
  mensajeError: string = '';
  cargando: boolean = false;
  
  registroForm: FormGroup = this.fb.group({

    nombreUsuario: ['', [Validators.required, Validators.minLength(4)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmarPassword: ['', Validators.required],
    
    tipoDocumento: ['', Validators.required],
    numeroDocumento: ['', Validators.required],
    primerNombre: ['', Validators.required],
    segundoNombre: [''],
    primerApellido: ['', Validators.required],
    segundoApellido: [''],
    
    correoElectronico: ['', [Validators.required, Validators.email]],
    telefono: [''],
    celular: ['', Validators.required],
    direccion: ['', Validators.required],
    ciudad: ['', Validators.required]
  }, {
    validators: this.passwordMatchValidator
  });
  seccionActual: number = 1;
  totalSecciones: number = 4;

  constructor(
    private loginService: LoginService,
    private tokenService: TokenService,
    private registroService: RegistroService, 
    private router: Router,
    private fb: FormBuilder
  ) {
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.registroForm = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', Validators.required],
      
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      primerNombre: ['', Validators.required],
      segundoNombre: [''],
      primerApellido: ['', Validators.required],
      segundoApellido: [''],
      
      correoElectronico: ['', [Validators.required, Validators.email]],
      telefono: [''],
      celular: ['', Validators.required],
      direccion: ['', Validators.required],
      ciudad: ['', Validators.required],
      
      departamento: ['', Validators.required],
      pais: ['', Validators.required],
      codigoPostal: [''],
      genero: [''],
      estadoCivil: [''],
      fechaNacimiento: [''],
      lugarNacimiento: [''],
      nacionalidad: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmarPassword = formGroup.get('confirmarPassword')?.value;
    
    if (password === confirmarPassword) {
      return null;
    } else {
      return { passwordMismatch: true };
    }
  }

  toggleMode() {
    this.isSignUpMode = !this.isSignUpMode;

    this.nombreUsuario = '';
    this.password = '';
    this.mensajeError = '';
    
    if (this.isSignUpMode) {
      this.seccionActual = 1;
      this.inicializarFormulario();
    }
  }

  siguienteSeccion() {

    if (this.validarSeccionActual()) {
      if (this.seccionActual < this.totalSecciones) {
        this.seccionActual++;
      }
    }
  }

  seccionAnterior() {
    if (this.seccionActual > 1) {
      this.seccionActual--;
    }
  }

  validarSeccionActual(): boolean {
    let esValido = true;
    
    switch (this.seccionActual) {
      case 1:

      if (
          this.registroForm.get('nombreUsuario')?.invalid ||
          this.registroForm.get('password')?.invalid ||
          this.registroForm.get('confirmarPassword')?.invalid ||
          this.registroForm.get('password')?.value !== this.registroForm.get('confirmarPassword')?.value
        ) {
          this.mensajeError = 'Por favor, complete todos los campos correctamente. Las contraseñas deben coincidir.';
          esValido = false;
        } else {
          this.mensajeError = '';
        }
        break;
      
      case 2:

      if (
          this.registroForm.get('tipoDocumento')?.invalid ||
          this.registroForm.get('numeroDocumento')?.invalid ||
          this.registroForm.get('primerNombre')?.invalid ||
          this.registroForm.get('primerApellido')?.invalid
        ) {
          this.mensajeError = 'Por favor, complete todos los campos obligatorios.';
          esValido = false;
        } else {
          this.mensajeError = '';
        }
        break;
      
      case 3:

      if (
          this.registroForm.get('correoElectronico')?.invalid ||
          this.registroForm.get('celular')?.invalid ||
          this.registroForm.get('direccion')?.invalid ||
          this.registroForm.get('ciudad')?.invalid
        ) {
          this.mensajeError = 'Por favor, complete todos los campos obligatorios.';
          esValido = false;
        } else {
          this.mensajeError = '';
        }
        break;
      
      case 4:

      this.mensajeError = '';
        break;
    }
    
    return esValido;
  }

  login() {

    if (!this.nombreUsuario || !this.password) {
      this.mensajeError = 'Por favor, ingresa nombre de usuario y contraseña';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    this.loginService.login(this.nombreUsuario, this.password).subscribe({
      next: (respuesta) => {

        this.loginService.saveToken(respuesta.token);
        
        this.redirectBasedOnRole();
        
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        
        if (error.status === 401) {
          this.mensajeError = 'Credenciales incorrectas. Por favor, verifica tu nombre de usuario y contraseña.';
        } else if (error.error && error.error.message) {
          this.mensajeError = error.error.message;
        } else {
          this.mensajeError = 'Error al iniciar sesión. Por favor, intenta nuevamente más tarde.';
        }
        
        console.error('Error de inicio de sesión:', error);
      }
    });
  }

  registrar() {
    if (!this.registroForm.valid) {
      this.mensajeError = 'Por favor, complete todos los campos obligatorios correctamente.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
  
    this.registroService.registrarUsuario(this.registroForm.value).subscribe({
      next: (respuesta: RegistroResponse) => {
        this.cargando = false;
        this.isSignUpMode = false;
        
        alert('Registro exitoso. Por favor, inicia sesión con tus credenciales.');
        
        this.inicializarFormulario();
      },
      error: (error: any) => {
        this.cargando = false;
        
        console.error('Error de registro:', error);
        
        if (error.status === 404) {
          this.mensajeError = 'No se pudo conectar con el servidor. Verifique la URL de la API.';
        } else if (error.error && error.error.message) {
          this.mensajeError = error.error.message;
        } else if (error.status === 500 && error.error) {
          this.mensajeError = `Error en el servidor: ${error.error}`;
        } else {
          this.mensajeError = 'Error al registrarse. Por favor, intenta nuevamente más tarde.';
        }
      }
    });
  }


  private redirectBasedOnRole(): void {
    const roles = this.tokenService.getUserRole();
    console.log('Roles del usuario:', roles);
    
    if (!roles || roles.length === 0) {
      this.router.navigate(['/Inicio']);
      return;
    }
    
    // Si el usuario tiene más de un rol, mostrar la pantalla de selección
    if (roles.length > 1) {
      this.router.navigate(['/role-selector']);
      return;
    }
    
    // Si solo tiene un rol, redirigir directamente
    if (roles.includes('ADMINISTRADOR')) {
      localStorage.setItem('selectedRole', 'ADMINISTRADOR');
      this.router.navigate(['/dashboard']);
    } else if (roles.includes('RECEPCIONISTA')) {
      localStorage.setItem('selectedRole', 'RECEPCIONISTA');
      this.router.navigate(['/dashboard-recepcionista']);
    } else if (roles.includes('VETERINARIO')) {
      localStorage.setItem('selectedRole', 'VETERINARIO');
      this.router.navigate(['/dashboard-veterinario']);
    } else if (roles.includes('CLIENTE')) {
      localStorage.setItem('selectedRole', 'CLIENTE');
      this.router.navigate(['/dashboard-cliente']);
    } else {
      this.router.navigate(['/Inicio']);
    }
  }
}
