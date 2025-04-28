import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { FuncionalidadesComponent } from './components/funcionalidades/funcionalidades.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  { path: '', redirectTo: 'Inicio', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent  },
  {path: 'Inicio', component: InicioComponent},
  {path: 'Funcionalidades', component: FuncionalidadesComponent},
  {path: 'Login', component: LoginComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


