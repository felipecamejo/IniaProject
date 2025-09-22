import { Routes } from '@angular/router';
// import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { ReciboComponent } from './components/recibo/recibo.component';

export const routes: Routes = [

    { path : 'home', component: HomeComponent },
    { path : 'recibo', component: ReciboComponent }

];
