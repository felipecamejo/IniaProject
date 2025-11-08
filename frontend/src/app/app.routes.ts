import { Routes } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
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
import { ListadoMetodosComponent } from './components/listado-metodos/listado-metodos.component';
// import { ListadoLogsComponent } from './components/listado-logs/listado-logs.components';
import { CertificadoComponent } from './components/certificado/certificado.component';
import { ListadoCertificadosComponent } from './components/listado-certificados/listado-certificados.component'; 

export const routes: Routes = [
    //rutas generales
    { path : 'home', component: HomeComponent },
    { path : 'login', component: LoginComponent },
    { path : '', redirectTo: '/login', pathMatch: 'full' },
    { path : 'perfil', component: PerfilComponent },

    //listados
    { path : 'listado-depositos', component: ListadoDepositosComponent },
    { path : 'listado-metodos', component: ListadoMetodosComponent },
    { path : 'listado-usuarios', component: ListadoUsuariosComponent },
    { path : 'listado-lotes', component: ListadoLotesComponent }, // para todos los usuarios
    { path : 'listado-malezas', component: ListadoMalezasComponent },
    { path : 'listado-hongos', component: ListadoHongosComponent },
    { path : 'listado-cultivos', component: ListadoCultivosComponent },
    { path : 'listado-certificados', component: ListadoCertificadosComponent },
    // { path : 'listado-logs', component: ListadoLogsComponent }, // Componente no existe aún

    //listados asociados a un recibo
    { path : ':loteId/:reciboId/listado-dosn', component: ListadoDosnComponent },
    { path : ':loteId/:reciboId/listado-pms', component: ListadoPmsComponent },
    { path : ':loteId/:reciboId/listado-pureza', component: ListadoPurezaComponent },
    { path : ':loteId/:reciboId/listado-pureza-p-notatum', component: ListadoPurezaPNotatumComponent },
    { path : ':loteId/:reciboId/listado-tetrazolio', component: ListadoTetrazolioComponent },
    { path : ':loteId/:reciboId/listado-germinacion', component: ListadoGerminacionComponent },
    { path : ':loteId/:reciboId/listado-sanitario', component: ListadoSanitarioComponent },

    //home asociado a un lote
    { path : ':loteId/lote-analisis', component: LoteAnalisisComponent },
    { path : ':loteId/:reciboId/lote-analisis', component: LoteAnalisisComponent },

    //formularios de creación y edición
    { path : 'usuario/crear', component: UsuarioComponent },
    { path : 'usuario/editar/:id', component: UsuarioComponent },
    { path : 'lote/crear', component: LoteComponent },

    //formularios asociados a un lote
    { path : ':loteId/recibo/crear', component: ReciboComponent },
    { path : ':loteId/:reciboId/recibo/editar', component: ReciboComponent },

    //formularios asociados a un recibo
    { path : ':loteId/:reciboId/pms/crear', component: PmsComponent },
    { path : ':loteId/:reciboId/pms/editar/:id', component: PmsComponent },
    { path : ':loteId/:reciboId/pms/:id', component: PmsComponent }, // Para visualización con query param view=true
    { path : ':loteId/:reciboId/sanitario/crear', component: SanitarioComponent },
    { path : ':loteId/:reciboId/sanitario/editar/:id', component: SanitarioComponent },
    { path : ':loteId/:reciboId/sanitario/:id', component: SanitarioComponent }, // Para visualización con query param view=true
    { path : ':loteId/:reciboId/pureza/crear', component: PurezaComponent },
    { path : ':loteId/:reciboId/pureza/editar/:id', component: PurezaComponent },
    { path : ':loteId/:reciboId/pureza/:id', component: PurezaComponent }, // Para visualización con query param view=true
    { path : ':loteId/:reciboId/dosn/crear', component: DOSNComponent },
    { path : ':loteId/:reciboId/dosn/editar/:id', component: DOSNComponent },
    { path : ':loteId/:reciboId/dosn/:id', component: DOSNComponent }, // Para visualización con query param view=true
    { path : ':loteId/:reciboId/pureza-p-notatum/crear', component: PurezaPNotatumComponent },
    { path : ':loteId/:reciboId/pureza-p-notatum/editar/:id', component: PurezaPNotatumComponent },
    { path : ':loteId/:reciboId/pureza-p-notatum/:id', component: PurezaPNotatumComponent }, // Para visualización con query param view=true
    { path : ':loteId/:reciboId/germinacion/crear', component: GerminacionComponent },
    { path : ':loteId/:reciboId/germinacion/editar/:id', component: GerminacionComponent },
    { path : ':loteId/:reciboId/germinacion/:id', component: GerminacionComponent }, // Para visualización con query param view=true
    { path : ':loteId/:reciboId/tetrazolio/crear', component: TetrazolioComponent },
    { path : ':loteId/:reciboId/tetrazolio/editar/:id', component: TetrazolioComponent },
    
    //formularios de certificados
    { path : 'certificado/crear', component: CertificadoComponent },
    { path : 'certificado/editar/:id', component: CertificadoComponent },
    { path : 'certificado/:id', component: CertificadoComponent }, // Para visualización con query param view=true
    
    //formularios de certificados asociados a un recibo
    { path : ':loteId/:reciboId/certificado/crear', component: CertificadoComponent },
    { path : ':loteId/:reciboId/certificado/editar/:id', component: CertificadoComponent },
    { path : ':loteId/:reciboId/certificado/:id', component: CertificadoComponent }, // Para visualización con query param view=true
];
