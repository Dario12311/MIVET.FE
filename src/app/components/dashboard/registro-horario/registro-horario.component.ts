import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HorarioVeterinarioService, CrearHorarioVeterinarioDto, ActualizarHorarioVeterinarioDto } from 'src/app/services/horario-veterinario.service';
import { MedicoveterinarioService, MedicoVeterinario } from 'src/app/services/medicoveterinario.service';

@Component({
  selector: 'app-registro-horario',
  templateUrl: './registro-horario.component.html',
  styleUrls: ['./registro-horario.component.css'],
  standalone: false,
})
export class RegistroHorarioComponent implements OnInit {
  horarioForm: FormGroup;
  cargando = false;
  guardando = false;
  modoEdicion = false;
  horarioId: number | null = null;
  
  // Modal de médicos
  mostrarModalMedicos = false;
  cargandoMedicos = false;
  medicos: MedicoVeterinario[] = [];
  medicoSeleccionado: MedicoVeterinario | null = null;
  
  // Días de la semana
  diasSemana = [
    { valor: 1, nombre: 'Lunes' },
    { valor: 2, nombre: 'Martes' },
    { valor: 3, nombre: 'Miércoles' },
    { valor: 4, nombre: 'Jueves' },
    { valor: 5, nombre: 'Viernes' },
    { valor: 6, nombre: 'Sábado' },
    { valor: 0, nombre: 'Domingo' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private horarioService: HorarioVeterinarioService,
    private medicoService: MedicoveterinarioService
  ) {
    this.horarioForm = this.createForm();
  }

  ngOnInit(): void {
    // Verificar si estamos en modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.horarioId = +params['id'];
        this.modoEdicion = true;
        this.cargarDatosHorario(this.horarioId);
      }
    });
    
    // Cargar médicos al inicializar
    this.cargarMedicos();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      medicoVeterinarioNumeroDocumento: ['', Validators.required],
      diaSemana: [1, Validators.required],
      horaInicio: ['', [Validators.required, this.validarHora]],
      horaFin: ['', [Validators.required, this.validarHora]],
      observaciones: [''],
      fechaInicio: [''],
      fechaFin: [''],
      esActivo: [true]
    }, { validators: this.validarRangoHoras });
  }

  // Validador personalizado para formato de hora
  validarHora(control: any) {
    if (!control.value) return null;
    const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return horaRegex.test(control.value) ? null : { formatoHoraInvalido: true };
  }

  // Validador para verificar que hora fin sea mayor que hora inicio
  validarRangoHoras(formGroup: FormGroup) {
    const horaInicio = formGroup.get('horaInicio')?.value;
    const horaFin = formGroup.get('horaFin')?.value;
    
    if (horaInicio && horaFin) {
      const [horasInicio, minutosInicio] = horaInicio.split(':').map(Number);
      const [horasFin, minutosFin] = horaFin.split(':').map(Number);
      
      const minutosInicioTotal = horasInicio * 60 + minutosInicio;
      const minutosFinTotal = horasFin * 60 + minutosFin;
      
      if (minutosFinTotal <= minutosInicioTotal) {
        return { rangoHorasInvalido: true };
      }
    }
    
    return null;
  }

  cargarMedicos(): void {
    this.cargandoMedicos = true;
    this.medicoService.getMedicos().subscribe(
      (medicos: MedicoVeterinario[]) => {
        this.medicos = medicos.filter(m => m.estado === 'A'); // Solo médicos activos
        this.cargandoMedicos = false;
      },
      (error: any) => {
        console.error('Error al cargar médicos', error);
        this.cargandoMedicos = false;
      }
    );
  }

  cargarDatosHorario(id: number): void {
    this.cargando = true;
    this.horarioService.getHorarioById(id).subscribe(
      (horario: any) => {
        // Formatear las horas para el input
        const horarioFormateado = {
          ...horario,
          horaInicio: this.formatearHoraParaInput(horario.horaInicio),
          horaFin: this.formatearHoraParaInput(horario.horaFin),
          fechaInicio: horario.fechaInicio ? horario.fechaInicio.split('T')[0] : '',
          fechaFin: horario.fechaFin ? horario.fechaFin.split('T')[0] : ''
        };
        
        this.horarioForm.patchValue(horarioFormateado);
        
        // Buscar y establecer el médico seleccionado
        this.medicoSeleccionado = this.medicos.find(m => 
          m.numeroDocumento === horario.medicoVeterinarioNumeroDocumento
        ) || null;
        
        this.cargando = false;
      },
      (error: any) => {
        console.error('Error al cargar el horario', error);
        this.cargando = false;
      }
    );
  }

  formatearHoraParaInput(hora: string): string {
    if (!hora) return '';
    // Convertir "08:00:00" a "08:00"
    return hora.substring(0, 5);
  }

  formatearHoraParaEnvio(hora: string): string {
    if (!hora) return '';
    // Convertir "08:00" a "08:00:00"
    return hora + ':00';
  }

  abrirModalMedicos(): void {
    this.mostrarModalMedicos = true;
  }

  cerrarModalMedicos(): void {
    this.mostrarModalMedicos = false;
  }

  seleccionarMedico(medico: MedicoVeterinario): void {
    this.medicoSeleccionado = medico;
    this.horarioForm.patchValue({
      medicoVeterinarioNumeroDocumento: medico.numeroDocumento
    });
    this.cerrarModalMedicos();
  }

  quitarMedicoSeleccionado(): void {
    this.medicoSeleccionado = null;
    this.horarioForm.patchValue({
      medicoVeterinarioNumeroDocumento: ''
    });
  }

  guardarCambios(): void {
    if (this.horarioForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.horarioForm.controls).forEach(key => {
        const control = this.horarioForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.guardando = true;
    const formData = this.horarioForm.value;
    
    // Preparar datos para envío
    const horarioData = {
      ...formData,
      horaInicio: this.formatearHoraParaEnvio(formData.horaInicio),
      horaFin: this.formatearHoraParaEnvio(formData.horaFin),
      fechaInicio: formData.fechaInicio ? `${formData.fechaInicio}T00:00:00.000Z` : null,
      fechaFin: formData.fechaFin ? `${formData.fechaFin}T23:59:59.999Z` : null
    };

    if (this.modoEdicion && this.horarioId) {
      // Actualizar horario existente
      const datosActualizacion: ActualizarHorarioVeterinarioDto = {
        diaSemana: parseInt(horarioData.diaSemana),
        horaInicio: horarioData.horaInicio,
        horaFin: horarioData.horaFin,
        observaciones: horarioData.observaciones,
        fechaInicio: horarioData.fechaInicio,
        fechaFin: horarioData.fechaFin,
        esActivo: horarioData.esActivo
      };
      
      this.horarioService.actualizarHorario(this.horarioId, datosActualizacion).subscribe(
        () => {
          this.guardando = false;
          this.router.navigate(['/dashboard/horarios']);
        },
        (error: any) => {
          console.error('Error al actualizar el horario', error);
          this.guardando = false;
          // Aquí podrías mostrar un mensaje de error al usuario
        }
      );
    } else {
      // Crear nuevo horario
      const nuevoHorario: CrearHorarioVeterinarioDto = {
        medicoVeterinarioNumeroDocumento: horarioData.medicoVeterinarioNumeroDocumento,
        diaSemana: parseInt(horarioData.diaSemana),
        horaInicio: horarioData.horaInicio,
        horaFin: horarioData.horaFin,
        observaciones: horarioData.observaciones,
        fechaInicio: horarioData.fechaInicio,
        fechaFin: horarioData.fechaFin
      };
      
      this.horarioService.crearHorario(nuevoHorario).subscribe(
        () => {
          this.guardando = false;
          this.router.navigate(['/dashboard/horarios']);
        },
        (error: any) => {
          console.error('Error al registrar el horario', error);
          this.guardando = false;
          // Aquí podrías mostrar un mensaje de error al usuario
        }
      );
    }
  }

  volver(): void {
    this.router.navigate(['/dashboard/horarios']);
  }
}