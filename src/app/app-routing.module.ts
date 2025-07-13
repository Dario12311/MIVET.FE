import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { FuncionalidadesComponent } from './components/funcionalidades/funcionalidades.component';
import { LoginComponent } from './components/login/login.component';
import { RoleGuard } from './guards/role.guard';
import { ClientesComponent } from './components/dashboard/clientes/clientes.component';
import { InicioDashboardComponent } from './components/dashboard/inicio-dashboard/inicio-dashboard.component';
import { UpdateclienteComponent } from './components/dashboard/clientes/updatecliente/updatecliente.component';
import { MascotasComponent } from './components/dashboard/mascotas/mascotas.component';
import { RegistromascotaComponent } from './components/dashboard/mascotas/registromascota/registromascota.component';
import { DashboardrecepcionistaComponent } from './components/dashboardrecepcionista/dashboardrecepcionista.component';
import { RoleSelectorComponent } from './components/login/role-selector/role-selector.component';
import { ProductosComponent } from './components/dashboard/productos/productos.component';
import { RegistroproductoComponent } from './components/dashboard/productos/registroproducto/registroproducto.component';
import { DashboardveterinarioComponent } from './components/dashboardveterinario/dashboardveterinario.component';
import { MedicoveterinarioComponent } from './components/dashboard/medicoveterinario/medicoveterinario.component';
import { RegistromedicoComponent } from './components/dashboard/medicoveterinario/registromedico/registromedico.component';
import { ListaHorariosComponent } from './components/dashboard/lista-horarios/lista-horarios.component';
import { RegistroHorarioComponent } from './components/dashboard/registro-horario/registro-horario.component';
import { AgendarCitaComponent } from './components/dashboard/agendar-cita/agendar-cita.component';
import { ListaCitasComponent } from './components/dashboard/lista-citas/lista-citas.component';
import { DetalleCitaComponent } from './components/dashboard/detalle-cita/detalle-cita.component';
import { DashboardClienteComponent } from './components/dashboard-cliente/dashboard-cliente.component';
import { HistorialClinicoClienteComponent } from './components/dashboard-cliente/historial-clinico-cliente/historial-clinico-cliente.component';
import { InicioDashboardClienteComponent } from './components/dashboard-cliente/inicio-dashboard-cliente/inicio-dashboard-cliente.component';
import { PerfilClienteComponent } from './components/dashboard-cliente/perfil-cliente/perfil-cliente.component';
import { MascotasClienteComponent } from './components/dashboard-cliente/mascotas-cliente/mascotas-cliente.component';

// === IMPORTAR LOS NUEVOS COMPONENTES ESPECÍFICOS DEL CLIENTE ===
import { AgendarCitaClienteComponent } from './components/dashboard-cliente/agendar-cita-cliente/agendar-cita-cliente.component';
import { ListaCitasClienteComponent } from './components/dashboard-cliente/lista-citas-cliente/lista-citas-cliente.component';
import { DetalleCitaClienteComponent } from './components/dashboard-cliente/detalle-cita-cliente/detalle-cita-cliente.component';

const routes: Routes = [
  { path: '', redirectTo: 'Inicio', pathMatch: 'full' },
  
  // === DASHBOARD ADMINISTRADOR ===
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMINISTRADOR', 'RECEPCIONISTA'] },
    children: [
      { path: '', component: InicioDashboardComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'editar/:numeroDocumento', component: UpdateclienteComponent },
      { path: 'nuevocliente', component: UpdateclienteComponent },
      { path: 'mascotas', component: MascotasComponent },
      { path: 'mascotas/cliente/:numeroDocumento', component: MascotasComponent },
      { path: 'nuevamascota', component: RegistromascotaComponent },
      { path: 'editar/nuevamascota/:id', component: RegistromascotaComponent },
      { path: 'productos', component: ProductosComponent },
      { path: 'nuevoproducto', component: RegistroproductoComponent },
      { path: 'editar/producto/:id', component: RegistroproductoComponent },
      { path: 'medicoveterinario', component: MedicoveterinarioComponent },
      { path: 'nuevomedico', component: RegistromedicoComponent },
      { path: 'editar/medico/:id', component: RegistromedicoComponent },
      {
        path: 'horarios',
        component: ListaHorariosComponent
      },
      {
        path: 'horarios/nuevo',
        component: RegistroHorarioComponent
      },
      {
        path: 'horarios/editar/:id',
        component: RegistroHorarioComponent
      },
      {
        path: 'horarios/veterinario/:numeroDocumento',
        component: ListaHorariosComponent
      },
      // === RUTAS DE CITAS PARA ADMINISTRADOR ===
      {
        path: 'citas',
        component: ListaCitasComponent
      },
      {
        path: 'citas/nueva',
        component: AgendarCitaComponent
      },
      {
        path: 'citas/editar/:id',
        component: AgendarCitaComponent
      },
      {
        path: 'citas/detalle/:id',
        component: DetalleCitaComponent
      },
      {
        path: 'citas/cliente/:numeroDocumento',
        component: ListaCitasComponent
      },
      {
        path: 'citas/veterinario/:numeroDocumento',
        component: ListaCitasComponent
      },
      {
        path: 'citas/mascota/:mascotaId',
        component: ListaCitasComponent
      }
    ]
  },

  // === DASHBOARD RECEPCIONISTA ===
  { 
    path: 'dashboard-recepcionista', 
    component: DashboardrecepcionistaComponent,
    canActivate: [RoleGuard],
    data: { roles: ['RECEPCIONISTA'] },
    children: [
      { path: '', component: InicioDashboardComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'mascotas', component: MascotasComponent },
      { path: 'mascotas/cliente/:numeroDocumento', component: MascotasComponent },
      // === RUTAS DE CITAS PARA RECEPCIONISTA ===
      {
        path: 'citas',
        component: ListaCitasComponent
      },
      {
        path: 'citas/nueva',
        component: AgendarCitaComponent
      },
      {
        path: 'citas/editar/:id',
        component: AgendarCitaComponent
      }
    ]
  },

  // === DASHBOARD VETERINARIO ===
  { 
    path: 'dashboard-veterinario', 
    component: DashboardveterinarioComponent,
    canActivate: [RoleGuard],
    data: { roles: ['VETERINARIO'] },
    children: [
      { path: '', component: InicioDashboardComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'mascotas', component: MascotasComponent },
      { path: 'mascotas/cliente/:numeroDocumento', component: MascotasComponent },
      // === RUTAS DE CITAS PARA VETERINARIO ===
      {
        path: 'citas',
        component: ListaCitasComponent
      },
      {
        path: 'citas/mis-citas',
        component: ListaCitasComponent
      }
    ]
  },

  // === DASHBOARD CLIENTE (USANDO COMPONENTES ESPECÍFICOS) ===
  { 
    path: 'dashboard-cliente', 
    component: DashboardClienteComponent,
    canActivate: [RoleGuard],
    data: { roles: ['CLIENTE'] },
    children: [
      { path: '', component: InicioDashboardClienteComponent },
      
      // === GESTIÓN DE PERFIL ===
      { path: 'perfil', component: PerfilClienteComponent },
      
      // === GESTIÓN DE MASCOTAS ===
      { path: 'mascotas/cliente/:numeroDocumento', component: MascotasClienteComponent },
      { path: 'nuevamascota', component: RegistromascotaComponent },
      { path: 'mascotas/editar/:id', component: RegistromascotaComponent },
      
      // === GESTIÓN DE CITAS (COMPONENTES ESPECÍFICOS DEL CLIENTE) ===
      {
        path: 'citas',
        component: ListaCitasClienteComponent // ⭐ Componente específico del cliente
      },
      {
        path: 'citas/nueva',
        component: AgendarCitaClienteComponent // ⭐ Componente específico del cliente
      },
      {
        path: 'citas/editar/:id',
        component: AgendarCitaClienteComponent // ⭐ Componente específico del cliente
      },
      {
        path: 'citas/detalle/:id',
        component: DetalleCitaClienteComponent // ⭐ Componente específico del cliente
      },
      {
        path: 'citas/mascota/:mascotaId',
        component: ListaCitasClienteComponent // ⭐ Componente específico del cliente
      },
      {
        path: 'citas/mis-citas',
        component: ListaCitasClienteComponent // ⭐ Componente específico del cliente
      },
      {
        path: 'citas/proximas',
        component: ListaCitasClienteComponent // ⭐ Solo citas próximas del cliente
      },
      
      // === HISTORIA CLÍNICA ===
      {
        path: 'historial',
        component: HistorialClinicoClienteComponent
      },
      {
        path: 'historial/mascota/:mascotaId',
        component: HistorialClinicoClienteComponent
      }
    ]
  },

  // === RUTAS PRINCIPALES ===
  { path: 'Inicio', component: InicioComponent },
  { path: 'Funcionalidades', component: FuncionalidadesComponent },
  { path: 'Login', component: LoginComponent },
  { path: 'role-selector', component: RoleSelectorComponent },
  
  // === RUTA DE FALLBACK ===
  { path: '**', redirectTo: 'Inicio' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }