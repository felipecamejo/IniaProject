import { Routes } from '@angular/router';
// import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { ReciboComponent } from './components/recibo/recibo.component';
import { LoginComponent } from './components/login/login.component';
import { PmsComponent } from './components/pms/pms.component';
//import { SanitarioComponent } from './components/sanitario/sanitario.component';
import { PurezaComponent } from './components/pureza/pureza.component';
import { LoteComponent } from './components/lote/lote.component';
import { LoteAnalisisComponent } from './components/lote-analisis/lote-analisis.component';
import { ListadoLotesComponent } from './components/listado-lotes/listado-lotes.component';
import { DOSNComponent } from './components/dosn/dosn.component';
import { ListadoMalezasComponent } from './components/listado-malezas/listado-malezas.component';
import { ListadoHongosComponent } from './components/listado-hongos/listado-hongos.component';
import { ListadoCultivosComponent } from './components/listado-cultivos/listado-cultivos.component';
import { PurezaPNotatumComponent } from './components/pureza-p-notatum/pureza-p-notatum.component';
import { ListadoPmsComponent } from './components/listado-pms/listado-pms.component';
import { GerminacionComponent } from './components/germinacion/germinacion.component';
import { TetrazolioComponent } from './components/tetrazolio/tetrazolio.component';
import { ListadoDosnComponent } from './components/listado-dosn/listado-dosn.component';
import { ListadoPurezaPNotatumComponent } from './components/listado-pureza-p-notatum/listado-pureza-p-notatum.component';
import { ListadoPurezaComponent } from './components/listado-pureza/listado-pureza.component';
import { ListadoTetrazolioComponent } from './components/listado-tetrazolio/listado-tetrazolio.component';
import { ListadoGerminacionComponent } from './components/listado-germinacion/listado-germinacion.component';
//import { PerfilComponent } from './components/perfil/perfil.component';
import { ListadoSanitarioComponent } from './components/listado-sanitario/listado-sanitario.component';
import { ListadoDepositosComponent } from './components/listado-depositos/listado-depositos.component';

export const routes: Routes = [
    { path : 'home', component: HomeComponent },
    { path : 'recibo', component: ReciboComponent },
    { path : 'login', component: LoginComponent },
    { path : '', redirectTo: '/login', pathMatch: 'full' },
  //  { path : 'sanitario', component: SanitarioComponent },
    { path : 'pureza', component: PurezaComponent },
    { path : 'listado-malezas', component: ListadoMalezasComponent },
    { path : 'dosn', component: DOSNComponent },
    { path : 'lote', component: LoteComponent },
    { path : 'lote-analisis', component: LoteAnalisisComponent },
    { path : 'pureza-p-notatum', component: PurezaPNotatumComponent },
    { path : 'germinacion', component: GerminacionComponent },
    { path : 'tetrazolio', component: TetrazolioComponent },
   // { path : 'perfil', component: PerfilComponent },

    //listados
    { path : 'listado-lotes', component: ListadoLotesComponent },
    { path : 'listado-malezas', component: ListadoMalezasComponent },
    { path : 'listado-hongos', component: ListadoHongosComponent },
    { path : 'listado-cultivos', component: ListadoCultivosComponent },
    { path : 'listado-dosn', component: ListadoDosnComponent },
    { path : 'listado-pms', component: ListadoPmsComponent },
    { path : 'listado-pureza', component: ListadoPurezaComponent },
    { path : 'listado-pureza-p-notatum', component: ListadoPurezaPNotatumComponent },
    { path : 'listado-tetrazolio', component: ListadoTetrazolioComponent },
    { path : 'listado-germinacion', component: ListadoGerminacionComponent },
    { path : 'listado-sanitario', component: ListadoSanitarioComponent },
    { path : 'listado-depositos', component: ListadoDepositosComponent },

    //Formularios de creación y edición
    { path : 'pms/crear', component: PmsComponent },
    { path : 'pms/editar/:id', component: PmsComponent },
    //{ path : 'sanitario/crear', component: SanitarioComponent },
    //{ path : 'sanitario/editar/:id', component: SanitarioComponent },
    { path : 'pureza/crear', component: PurezaComponent },
    { path : 'pureza/editar/:id', component: PurezaComponent },
    { path : 'dosn/crear', component: DOSNComponent },
    { path : 'dosn/editar/:id', component: DOSNComponent },
    { path : 'pureza-p-notatum/crear', component: PurezaPNotatumComponent },
    { path : 'pureza-p-notatum/editar/:id', component: PurezaPNotatumComponent },
    { path : 'germinacion/crear', component: GerminacionComponent },
    { path : 'germinacion/editar/:id', component: GerminacionComponent },
    { path : 'tetrazolio/crear', component: TetrazolioComponent },
    { path : 'tetrazolio/editar/:id', component: TetrazolioComponent },
];

