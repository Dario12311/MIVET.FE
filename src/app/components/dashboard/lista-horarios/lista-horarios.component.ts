import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HorarioVeterinarioService, HorarioVeterinarioDto } from 'src/app/services/horario-veterinario.service';

@Component({
  selector: 'app-lista-horarios',
  templateUrl: './lista-horarios.component.html',
  styleUrls: ['./lista-horarios.component.css'],
  standalone: false,
})
export class ListaHorariosComponent implements OnInit {
  horarios: HorarioVeterinarioDto[] = [];
  cargando = false;
  filtroVeterinario = '';
  filtroDia: number | null = null;
  mostrarSoloActivos = true;

  diasSemana = [
    { valor: 0, nombre: 'Domingo' },
    { valor: 1, nombre: 'Lunes' },
    { valor: 2, nombre: 'Martes' },
    { valor: 3, nombre: 'Miércoles' },
    { valor: 4, nombre: 'Jueves' },
    { valor: 5, nombre: 'Viernes' },
    { valor: 6, nombre: 'Sábado' }
  ];

  constructor(
    private horarioService: HorarioVeterinarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarHorarios();
  }

  cargarHorarios(): void {
    this.cargando = true;
    this.horarioService.getTodosHorarios().subscribe(
      (horarios: HorarioVeterinarioDto[]) => {
        this.horarios = horarios;
        this.cargando = false;
      },
      (error: any) => {
        console.error('Error al cargar horarios', error);
        this.cargando = false;
      }
    );
  }

  get horariosFiltrados(): HorarioVeterinarioDto[] {
    return this.horarios.filter(horario => {
      const cumpleFiltroVeterinario = !this.filtroVeterinario || 
        horario.nombreVeterinario?.toLowerCase().includes(this.filtroVeterinario.toLowerCase()) ||
        horario.medicoVeterinarioNumeroDocumento.includes(this.filtroVeterinario);
      
      const cumpleFiltroDia = this.filtroDia === null || horario.diaSemana === this.filtroDia;
      
      const cumpleFiltroActivo = !this.mostrarSoloActivos || horario.esActivo;
      
      return cumpleFiltroVeterinario && cumpleFiltroDia && cumpleFiltroActivo;
    });
  }

  getNombreDia(diaSemana: number): string {
    return this.horarioService.getNombreDiaSemana(diaSemana);
  }

  formatearHora(hora: string): string {
    return this.horarioService.formatearHora(hora);
  }

  nuevoHorario(): void {
    this.router.navigate(['/dashboard/horarios/nuevo']);
  }

  editarHorario(horario: HorarioVeterinarioDto): void {
    this.router.navigate(['/dashboard/horarios/editar', horario.id]);
  }

  verHorarios(numeroDocumento: string): void {
    this.router.navigate(['/dashboard/horarios/veterinario', numeroDocumento]);
  }

  toggleEstadoHorario(horario: HorarioVeterinarioDto): void {
    if (horario.esActivo) {
      this.desactivarHorario(horario);
    } else {
      this.activarHorario(horario);
    }
  }

  private desactivarHorario(horario: HorarioVeterinarioDto): void {
    if (confirm(`¿Está seguro de desactivar el horario de ${horario.nombreVeterinario}?`)) {
      this.horarioService.desactivarHorario(horario.id).subscribe(
        () => {
          horario.esActivo = false;
          // Mostrar mensaje de éxito
        },
        (error: any) => {
          console.error('Error al desactivar horario', error);
          // Mostrar mensaje de error
        }
      );
    }
  }

  private activarHorario(horario: HorarioVeterinarioDto): void {
    this.horarioService.activarHorario(horario.id).subscribe(
      () => {
        horario.esActivo = true;
        // Mostrar mensaje de éxito
      },
      (error: any) => {
        console.error('Error al activar horario', error);
        // Mostrar mensaje de error
      }
    );
  }

  eliminarHorario(horario: HorarioVeterinarioDto): void {
    if (confirm(`¿Está seguro de eliminar el horario de ${horario.nombreVeterinario}?\n\nEsta acción no se puede deshacer.`)) {
      this.horarioService.eliminarHorario(horario.id).subscribe(
        () => {
          this.horarios = this.horarios.filter(h => h.id !== horario.id);
          // Mostrar mensaje de éxito
        },
        (error: any) => {
          console.error('Error al eliminar horario', error);
          // Mostrar mensaje de error
        }
      );
    }
  }

  limpiarFiltros(): void {
    this.filtroVeterinario = '';
    this.filtroDia = null;
    this.mostrarSoloActivos = true;
  }
}