import { Component, OnInit } from '@angular/core';
import { PersonaclienteService } from 'src/app/services/personacliente.service';
import { MascotasService } from 'src/app/services/mascotas.service';

@Component({
  selector: 'app-inicio-dashboard',
  templateUrl: './inicio-dashboard.component.html',
  styleUrls: ['./inicio-dashboard.component.css'],
  standalone: false,
})
export class InicioDashboardComponent implements OnInit {
  selectedItem: string = ''; 
  es = { 
    firstDayOfWeek: 1, 
    dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"], 
    dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"], 
    dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"], 
    monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"], 
    monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"] 
  };

  // Contadores para el dashboard
  cantidadClientes: number = 0;
  cantidadMascotas: number = 0;

  // Propiedades para las citas próximas
  proximasCitas = [
    {
      hora: '10:30',
      dia: 'Hoy',
      mascota: 'Luna',
      tipo: 'Gato',
      motivo: 'Control de rutina',
      dueno: 'Carlos Pérez'
    },
    {
      hora: '11:45',
      dia: 'Hoy',
      mascota: 'Rocky',
      tipo: 'Perro',
      motivo: 'Vacunación',
      dueno: 'María López'
    },
    {
      hora: '14:15',
      dia: 'Hoy',
      mascota: 'Pelusa',
      tipo: 'Conejo',
      motivo: 'Revisión dental',
      dueno: 'Ana Gómez'
    }
  ];

  // Para el calendario
  fechaActual: Date = new Date();
  eventos: any[] = [];

  constructor(
    private personaClienteService: PersonaclienteService,
    private mascotasService: MascotasService
  ) { }

  ngOnInit(): void {
    // Cargar contadores
    this.cargarContadores();
    
    // Inicializar eventos o cargar datos desde un servicio
    this.cargarEventos();
  }

  cargarContadores(): void {
    // Obtener cantidad de clientes
    this.personaClienteService.getClientes().subscribe({
      next: (clientes) => {
        this.cantidadClientes = clientes.length;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.cantidadClientes = 0;
      }
    });

    // Obtener cantidad de mascotas
    this.mascotasService.getMascotas().subscribe({
      next: (mascotas) => {
        this.cantidadMascotas = mascotas.length;
      },
      error: (error) => {
        console.error('Error al cargar mascotas:', error);
        this.cantidadMascotas = 0;
      }
    });
  }

  cargarEventos(): void {
    // Aquí podrías cargar eventos desde un servicio
    // Por ahora usamos datos de ejemplo
    this.eventos = [
      {
        title: 'Vacunación masiva',
        start: new Date(2023, 4, 10), // Mayo 10
        end: new Date(2023, 4, 10)
      },
      {
        title: 'Revisión general',
        start: new Date(2023, 4, 15), // Mayo 15
        end: new Date(2023, 4, 15)
      },
      {
        title: 'Campaña de adopción',
        start: new Date(2023, 4, 22), // Mayo 22
        end: new Date(2023, 4, 22)
      }
    ];
  }

  mesAnterior(): void {
    // Lógica para ir al mes anterior
    console.log('Mes anterior');
  }

  mesSiguiente(): void {
    // Lógica para ir al mes siguiente
    console.log('Mes siguiente');
  }
}
