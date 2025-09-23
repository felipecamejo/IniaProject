import { Routes } from '@angular/router';
// import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { ReciboComponent } from './components/recibo/recibo.component';
import { LoginComponent } from './components/login/login.component';
import { PmsComponent } from './components/pms/pms.component';
import { SanitarioComponent } from './components/sanitario/sanitario.component';
import { ListadoLotesComponent } from './components/listado-lotes/listado-lotes.component';

export const routes: Routes = [
    { path : 'home', component: HomeComponent },
    { path : 'recibo', component: ReciboComponent },
    { path : 'login', component: LoginComponent },
    { path : '', redirectTo: '/login', pathMatch: 'full' },
    { path : 'pms', component: PmsComponent },
    { path : 'sanitario', component: SanitarioComponent },
    { path : 'listado-lotes', component: ListadoLotesComponent }
];
