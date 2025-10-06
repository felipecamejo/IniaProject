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
import { ListadoPmsComponent } from './components/listado-pms/listado-pms.component';
import { GerminacionComponent } from './components/germinacion/germinacion.component';
import { TetrazolioComponent } from './components/tetrazolio/tetrazolio.component';
import { ListadoDosnComponent } from './components/listado-dosn/listado-dosn.component';
import { ListadoPurezaPNotatumComponent } from './components/listado-pureza-p-notatum/listado-pureza-p-notatum.component';
import { ListadoPurezaComponent } from './components/listado-pureza/listado-pureza.component';
import { ListadoTetrazolioComponent } from './components/listado-tetrazolio/listado-tetrazolio.component';
import { ListadoGerminacionComponent } from './components/listado-germinacion/listado-germinacion.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { ListadoSanitarioComponent } from './components/listado-sanitario/listado-sanitario.component';
import { ListadoDepositosComponent } from './components/listado-depositos/listado-depositos.component';
import { ListadoUsuariosComponent } from './components/listado-usuarios/listado-usuarios.component';
import { UsuarioComponent } from './components/usuario/usuario.component';

export const routes: Routes = [
    { path : 'home', component: HomeComponent },
    { path : 'login', component: LoginComponent },
    { path : '', redirectTo: '/login', pathMatch: 'full' },
    { path : 'listado-malezas', component: ListadoMalezasComponent },
    { path : 'lote', component: LoteComponent },
    { path : 'lote-analisis', component: LoteAnalisisComponent },
    { path : 'perfil', component: PerfilComponent },

    //listados
    { path : 'listado-depositos', component: ListadoDepositosComponent },
    { path : 'listado-usuarios', component: ListadoUsuariosComponent },
    { path : 'listado-lotes', component: ListadoLotesComponent },
    { path : 'listado-malezas', component: ListadoMalezasComponent },
    { path : 'listado-hongos', component: ListadoHongosComponent },
    { path : 'listado-cultivos', component: ListadoCultivosComponent },

    //listados asociados a un recibo
    { path : ':reciboId/listado-dosn', component: ListadoDosnComponent },
    { path : ':reciboId/listado-pms', component: ListadoPmsComponent },
    { path : ':reciboId/listado-pureza', component: ListadoPurezaComponent },
    { path : ':reciboId/listado-pureza-p-notatum', component: ListadoPurezaPNotatumComponent },
    { path : ':reciboId/listado-tetrazolio', component: ListadoTetrazolioComponent },
    { path : ':reciboId/listado-germinacion', component: ListadoGerminacionComponent },
    { path : ':reciboId/listado-sanitario', component: ListadoSanitarioComponent },

    //formularios de creación y edición
    { path : 'usuario/crear', component: UsuarioComponent },
    { path : 'usuario/editar/:id', component: UsuarioComponent },


    //formularios asociados a un lote
    { path : ':loteId/recibo/crear', component: ReciboComponent },


    //formularios asociados a un recibo
    { path : ':reciboId/pms/crear', component: PmsComponent },
    { path : ':reciboId/pms/editar/:id', component: PmsComponent },
    { path : ':reciboId/sanitario/crear', component: SanitarioComponent },
    { path : ':reciboId/sanitario/editar/:id', component: SanitarioComponent },
    { path : ':reciboId/pureza/crear', component: PurezaComponent },
    { path : ':reciboId/pureza/editar/:id', component: PurezaComponent },
    { path : ':reciboId/dosn/crear', component: DOSNComponent },
    { path : ':reciboId/dosn/editar/:id', component: DOSNComponent },
    { path : ':reciboId/pureza-p-notatum/crear', component: PurezaPNotatumComponent },
    { path : ':reciboId/pureza-p-notatum/editar/:id', component: PurezaPNotatumComponent },
    { path : ':reciboId/germinacion/crear', component: GerminacionComponent },
    { path : ':reciboId/germinacion/editar/:id', component: GerminacionComponent },
    { path : ':reciboId/tetrazolio/crear', component: TetrazolioComponent },
    { path : ':reciboId/tetrazolio/editar/:id', component: TetrazolioComponent },
];
