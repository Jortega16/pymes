import { Routes } from '@angular/router';
import { BackofficeComponent } from './backoffice.component';
import { BusinessDetailComponent } from './business-detail.component';
import { DirectoryComponent } from './directory.component';
import { HomeComponent } from './home.component';
import { InfoPageComponent } from './info-page.component';
import { RegisterWizardComponent } from './register-wizard.component';
import { ClientPortalComponent } from './client-portal.component';
import { LoginSelectComponent } from './login-select.component';

export const routes: Routes = [
  { path: 'login', component: LoginSelectComponent },
  { path: 'acceso', redirectTo: 'login' },
  { path: '', component: HomeComponent },
  { path: 'directorio', component: DirectoryComponent },
  { path: 'negocio/:slug', component: BusinessDetailComponent },
  {
    path: 'categorias',
    component: InfoPageComponent,
    data: {
      title: 'Categorías verificadas',
      description: 'Explore rubros de pymes con información revisada, referencias y señales de confianza.',
      cards: ['Alimentación, tecnología, turismo, servicios y bienestar.', 'Cada categoría puede crecer con filtros por provincia y plan.', 'Los negocios destacados pasan por revisión adicional.'],
    },
  },
  {
    path: 'como-funciona',
    component: InfoPageComponent,
    data: {
      title: 'Cómo funciona la verificación',
      description: 'Recibimos la solicitud, revisamos evidencia, validamos referencias y publicamos únicamente información aprobada.',
      cards: ['Formulario guiado con 9 secciones.', 'Revisión de operación, servicio y confianza.', 'Declaraciones obligatorias antes del envío.'],
    },
  },
  {
    path: 'sobre-nosotros',
    component: InfoPageComponent,
    data: {
      title: 'Sobre nosotros',
      description: 'Creamos una capa de confianza para que las personas encuentren pymes serias y las pymes puedan competir mejor.',
      cards: ['Enfoque local para Costa Rica.', 'Marketplace orientado a confianza, no solo visibilidad.', 'Backoffice para mantener datos actualizados.'],
    },
  },
  {
    path: 'blog',
    component: InfoPageComponent,
    data: {
      title: 'Blog',
      description: 'Guías para comprar mejor, vender con más confianza y preparar una pyme para verificación.',
      cards: ['Cómo evaluar referencias de un proveedor.', 'Qué evidencia preparar antes de registrarse.', 'Buenas prácticas de atención al cliente.'],
    },
  },
  {
    path: 'contacto',
    component: InfoPageComponent,
    data: {
      title: 'Contacto',
      description: 'Conversemos sobre alianzas, soporte para pymes, verificación o espacios comerciales dentro del marketplace.',
      cards: ['Correo: contacto@pymesverificadas.cr', 'WhatsApp: +506 8888-0000', 'Atención de lunes a viernes.'],
    },
  },
  {
    path: 'favoritos',
    component: InfoPageComponent,
    data: {
      title: 'Favoritos',
      description: 'Aquí se podrá guardar una lista personal de negocios para comparar y contactar más tarde.',
      cards: ['Funcionalidad preparada como página independiente.', 'Lista local o con usuario al activar autenticación.', 'Ideal para procesos de compra recurrentes.'],
    },
  },
  { path: 'registrar', component: RegisterWizardComponent },
  { path: 'cliente', component: ClientPortalComponent },
  { path: 'backoffice', component: BackofficeComponent },
  { path: '**', redirectTo: '' },
];
