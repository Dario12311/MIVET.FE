import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule } from 'primeng/calendar';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { NavbarInicioComponent } from './navbar/navbar-inicio/navbar-inicio.component';
import { FuncionalidadesComponent } from './components/funcionalidades/funcionalidades.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarAdministradorComponent } from './components/navbar/navbar-administrador/navbar-administrador.component';
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
import { DashboardClienteComponent } from './components/dashboard-cliente/dashboard-cliente.component';
import { RegistroHorarioComponent } from './components/dashboard/registro-horario/registro-horario.component';
import { ListaHorariosComponent } from './components/dashboard/lista-horarios/lista-horarios.component';
import { AgendarCitaComponent } from './components/dashboard/agendar-cita/agendar-cita.component';
import { ListaCitasComponent } from './components/dashboard/lista-citas/lista-citas.component';
import { DetalleCitaComponent } from './components/dashboard/detalle-cita/detalle-cita.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    InicioComponent,
    NavbarInicioComponent,
    FuncionalidadesComponent,
    LoginComponent,
    NavbarAdministradorComponent,
    ClientesComponent,
    InicioDashboardComponent,
    UpdateclienteComponent,
    MascotasComponent,
    RegistromascotaComponent,
    DashboardrecepcionistaComponent,
    RoleSelectorComponent,
    ProductosComponent,
    RegistroproductoComponent,
    DashboardveterinarioComponent,
    MedicoveterinarioComponent,
    RegistromedicoComponent,
    DashboardClienteComponent,
    RegistroHorarioComponent,
    ListaHorariosComponent,
    AgendarCitaComponent,
    ListaCitasComponent,
    DetalleCitaComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CalendarModule,
    ReactiveFormsModule,
    HttpClientModule,
],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
