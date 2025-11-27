import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';
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
import { ListadoAutocompletadosComponent } from './components/listado-autocompletados/listado-autocompletados.component';
// import { ListadoLogsComponent } from './components/listado-logs/listado-logs.components';
import { CertificadoComponent } from './components/certificado/certificado.component';
import { ListadoCertificadosComponent } from './components/listado-certificados/listado-certificados.component'; 
import { ListadoLogsComponent } from './components/listado-logs/listado-logs.components';
import { ExcelMiddlewareComponent } from './components/excel-middleware/excel-middleware.component';

export const routes: Routes = [
    // Ruta pública (sin autenticación)
    { path : 'login', component: LoginComponent },
    { path : '', redirectTo: '/login', pathMatch: 'full' },
    
    // Rutas protegidas (requieren autenticación)
    { path : 'home', component: HomeComponent, canActivate: [authGuard] },
    { path : 'perfil', component: PerfilComponent, canActivate: [authGuard] },
    { path : 'excel-middleware', component: ExcelMiddlewareComponent, canActivate: [authGuard] },

    //listados (protegidos)
    { path : 'listado-depositos', component: ListadoDepositosComponent, canActivate: [authGuard] },
    { path : 'listado-metodos', component: ListadoMetodosComponent, canActivate: [authGuard] },
    { path : 'listado-autocompletados', component: ListadoAutocompletadosComponent, canActivate: [authGuard] },
    { path : 'listado-usuarios', component: ListadoUsuariosComponent, canActivate: [authGuard] },
    { path : 'listado-lotes', component: ListadoLotesComponent, canActivate: [authGuard] }, // para todos los usuarios
    { path : 'listado-malezas', component: ListadoMalezasComponent, canActivate: [authGuard] },
    { path : 'listado-hongos', component: ListadoHongosComponent, canActivate: [authGuard] },
    { path : 'listado-cultivos', component: ListadoCultivosComponent, canActivate: [authGuard] },
    { path : 'listado-certificados', component: ListadoCertificadosComponent, canActivate: [authGuard] },
    
    { path : ':loteId/:reciboId/listado-logs', component: ListadoLogsComponent, canActivate: [authGuard] },

    //listados asociados a un recibo (protegidos)
    { path : ':loteId/:reciboId/listado-dosn', component: ListadoDosnComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/listado-pms', component: ListadoPmsComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/listado-pureza', component: ListadoPurezaComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/listado-pureza-p-notatum', component: ListadoPurezaPNotatumComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/listado-tetrazolio', component: ListadoTetrazolioComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/listado-germinacion', component: ListadoGerminacionComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/listado-sanitario', component: ListadoSanitarioComponent, canActivate: [authGuard] },

    //home asociado a un lote (protegido)
    { path : ':loteId/lote-analisis', component: LoteAnalisisComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/lote-analisis', component: LoteAnalisisComponent, canActivate: [authGuard] },

    //formularios de creación y edición (protegidos)
    { path : 'usuario/crear', component: UsuarioComponent, canActivate: [authGuard] },
    { path : 'usuario/editar/:id', component: UsuarioComponent, canActivate: [authGuard] },
    { path : 'lote/crear', component: LoteComponent, canActivate: [authGuard] },

    //formularios asociados a un lote (protegidos)
    { path : ':loteId/recibo/crear', component: ReciboComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/recibo/editar', component: ReciboComponent, canActivate: [authGuard] },

    //formularios asociados a un recibo (protegidos)
    { path : ':loteId/:reciboId/pms/crear', component: PmsComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/pms/editar/:id', component: PmsComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/pms/:id', component: PmsComponent, canActivate: [authGuard] }, // Para visualización con query param view=true
    { path : ':loteId/:reciboId/sanitario/crear', component: SanitarioComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/sanitario/editar/:id', component: SanitarioComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/sanitario/:id', component: SanitarioComponent, canActivate: [authGuard] }, // Para visualización con query param view=true
    { path : ':loteId/:reciboId/pureza/crear', component: PurezaComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/pureza/editar/:id', component: PurezaComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/pureza/:id', component: PurezaComponent, canActivate: [authGuard] }, // Para visualización con query param view=true
    { path : ':loteId/:reciboId/dosn/crear', component: DOSNComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/dosn/editar/:id', component: DOSNComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/dosn/:id', component: DOSNComponent, canActivate: [authGuard] }, // Para visualización con query param view=true
    { path : ':loteId/:reciboId/pureza-p-notatum/crear', component: PurezaPNotatumComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/pureza-p-notatum/editar/:id', component: PurezaPNotatumComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/pureza-p-notatum/:id', component: PurezaPNotatumComponent, canActivate: [authGuard] }, // Para visualización con query param view=true
    { path : ':loteId/:reciboId/germinacion/crear', component: GerminacionComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/germinacion/editar/:id', component: GerminacionComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/germinacion/:id', component: GerminacionComponent, canActivate: [authGuard] }, // Para visualización con query param view=true
    { path : ':loteId/:reciboId/tetrazolio/crear', component: TetrazolioComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/tetrazolio/editar/:id', component: TetrazolioComponent, canActivate: [authGuard] },
    
    //formularios de certificados (protegidos)
    { path : 'certificado/crear', component: CertificadoComponent, canActivate: [authGuard] },
    { path : 'certificado/editar/:id', component: CertificadoComponent, canActivate: [authGuard] },
    { path : 'certificado/:id', component: CertificadoComponent, canActivate: [authGuard] }, // Para visualización con query param view=true
    
    //formularios de certificados asociados a un recibo (protegidos)
    { path : ':loteId/:reciboId/certificado/crear', component: CertificadoComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/certificado/editar/:id', component: CertificadoComponent, canActivate: [authGuard] },
    { path : ':loteId/:reciboId/certificado/:id', component: CertificadoComponent, canActivate: [authGuard] }, // Para visualización con query param view=true
];
