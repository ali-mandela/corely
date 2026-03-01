import { Routes } from '@angular/router';
import { DlsComponent } from './features/dls/dls';

export const routes: Routes = [
  { path: 'dls', component: DlsComponent },
  { path: '', redirectTo: 'dls', pathMatch: 'full' }, 
];
