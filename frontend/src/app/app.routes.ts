import { Routes } from '@angular/router';
// import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { ReciboComponent } from './components/recibo/recibo.component';
import { LoginComponent } from './components/login/login.component';
import { PmsComponent } from './components/pms/pms.component';
import { SanitarioComponent } from './components/sanitario/sanitario.component';
import { PurezaComponent } from './components/pureza/pureza.component';
import { LoteComponent } from './components/lote/lote.component';
import { LoteAnalisisComponent } from './components/lote-analisis/lote-analisis.component';
import { ListadoLotesComponent } from './components/listado-lotes/listado-lotes.component';
import { DOSNComponent } from './components/dosn/dosn.component';
import { ListadoMalezasComponent } from './components/listado-malezas/listado-malezas.component';
import { ListadoHongosComponent } from './components/listado-hongos/listado-hongos.component';
import { ListadoCultivosComponent } from './components/listado-cultivos/listado-cultivos.component';
import { PurezaPNotatumComponent } from './components/pureza-p-notatum/pureza-p-notatum.component';
import { GerminacionComponent } from './components/germinacion/germinacion.component';

export const routes: Routes = [
    { path : 'home', component: HomeComponent },
    { path : 'recibo', component: ReciboComponent },
    { path : 'login', component: LoginComponent },
    { path : '', redirectTo: '/login', pathMatch: 'full' },
    { path : 'pms', component: PmsComponent },
    { path : 'sanitario', component: SanitarioComponent },
    { path : 'pureza', component: PurezaComponent },
    { path : 'listado-malezas', component: ListadoMalezasComponent },
    { path : 'dosn', component: DOSNComponent },
    { path : 'lote', component: LoteComponent },
    { path : 'lote-analisis', component: LoteAnalisisComponent },
    { path : 'pureza-p-notatum', component: PurezaPNotatumComponent },
    { path : 'germinacion', component: GerminacionComponent },
    
    //listados
    { path : 'listado-lotes', component: ListadoLotesComponent },
    { path : 'listado-malezas', component: ListadoMalezasComponent },
    { path : 'listado-hongos', component: ListadoHongosComponent },
    { path : 'listado-cultivos', component: ListadoCultivosComponent },
];
