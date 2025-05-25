import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { FuncionalidadesComponent } from './components/funcionalidades/funcionalidades.component';
import { LoginComponent } from './components/login/login.component';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'Inicio', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [RoleGuard]
  },
  { 
    path: 'dashboard/admin', 
    component: DashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMINISTRADOR'] }
  },
  { 
    path: 'dashboard/veterinario', 
    component: DashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['VETERINARIO'] }
  },
  { 
    path: 'dashboard/cliente', 
    component: DashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['CLIENTE'] }
  },
  { path: 'Inicio', component: InicioComponent },
  { path: 'Funcionalidades', component: FuncionalidadesComponent },
  { path: 'Login', component: LoginComponent },
  // Ruta de fallback
  { path: '**', redirectTo: 'Inicio' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


