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

const routes: Routes = [
  { path: '', redirectTo: 'Inicio', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [RoleGuard],
    children: [
      { path: '', component: InicioDashboardComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'editar/:numeroDocumento', component: UpdateclienteComponent },
      { path: 'nuevocliente', component: UpdateclienteComponent },
      { path: 'mascotas', component: MascotasComponent },
      { path: 'mascotas/cliente/:numeroDocumento', component: MascotasComponent },
      { path: 'nuevamascota', component: RegistromascotaComponent },
      { path: 'editar/nuevamascota/:id', component: RegistromascotaComponent },
      {path: 'productos', component: ProductosComponent},
      {path: 'nuevoproducto', component: RegistroproductoComponent},
      {path: 'editar/producto/:id', component: RegistroproductoComponent},
      { path: 'medicoveterinario', component: MedicoveterinarioComponent },
      { path: 'nuevomedico', component: RegistromedicoComponent },
      { path: 'editar/medico/:id', component: RegistromedicoComponent },
      
    ]
  },
  // Añadir al array de rutas en app-routing.module.ts
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
    // Añadir más rutas específicas para recepcionista
  ]
},
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
    // Añadir más rutas específicas para recepcionista
  ]
},

  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMINISTRADOR'] }
  },
 
  { path: 'Inicio', component: InicioComponent },
  { path: 'Funcionalidades', component: FuncionalidadesComponent },
  { path: 'Login', component: LoginComponent },
  { path: 'role-selector', component: RoleSelectorComponent },
  // Elimina esta ruta duplicada o actualízala si es necesaria
  // {path: 'clientes', component: ClientesComponent},
  // Ruta de fallback
  { path: '**', redirectTo: 'Inicio' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


