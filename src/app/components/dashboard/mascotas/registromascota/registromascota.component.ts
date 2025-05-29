import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MascotasService } from 'src/app/services/mascotas.service';

@Component({
  selector: 'app-registromascota',
  templateUrl: './registromascota.component.html',
  styleUrls: ['./registromascota.component.css'],
  standalone: false,
})
export class RegistromascotaComponent implements OnInit {
  mascotaForm: FormGroup;
  cargando = false;
  guardando = false;
  modoEdicion = false;
  mascotaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private mascotasService: MascotasService
  ) {
    this.mascotaForm = this.createForm();
  }

  ngOnInit(): void {
    // Verificar si estamos en modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.mascotaId = +params['id'];
        this.modoEdicion = true;
        this.cargarDatosMascota(this.mascotaId);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      especie: ['', Validators.required],
      raza: ['', Validators.required],
      edad: [null, [Validators.required, Validators.min(0)]],
      genero: ['', Validators.required],
      numeroDocumento: ['', [Validators.required, Validators.minLength(6)]],
      estado: ['A']
    });
  }

  cargarDatosMascota(id: number): void {
    this.cargando = true;
    this.mascotasService.getMascotaById(id).subscribe(
      (mascota: any) => {
        this.mascotaForm.patchValue(mascota);
        this.cargando = false;
      },
      (error: any) => {
        console.error('Error al cargar la mascota', error);
        this.cargando = false;
        // Mostrar mensaje de error
      }
    );
  }

  guardarCambios(): void {
    if (this.mascotaForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.mascotaForm.controls).forEach(key => {
        const control = this.mascotaForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.guardando = true;
    const mascotaData = this.mascotaForm.value;

    if (this.modoEdicion && this.mascotaId) {
      // Actualizar mascota existente
      this.mascotasService.actualizarMascota( mascotaData).subscribe(
        () => {
          this.guardando = false;
          this.router.navigate(['/dashboard/mascotas']);
        },
        (error: any) => {
          console.error('Error al actualizar la mascota', error);
          this.guardando = false;
          // Mostrar mensaje de error
        }
      );
    } else {
      // Crear nueva mascota
      this.mascotasService.crearMascota(mascotaData).subscribe(
        () => {
          this.guardando = false;
          this.router.navigate(['/dashboard/mascotas']);
        },
        (error: any) => {
          console.error('Error al registrar la mascota', error);
          this.guardando = false;
          // Mostrar mensaje de error
        }
      );
    }
  }

  volver(): void {
    this.router.navigate(['/dashboard/mascotas']);
  }
}
