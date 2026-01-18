import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'movies', loadComponent: () => import('./vod-list/vod-list.component').then(m => m.VodListComponent) },
    { path: 'series', loadComponent: () => import('./series-list/series-list.component').then(m => m.SeriesListComponent) },
    { path: 'series/:id', loadComponent: () => import('./series-details/series-details.component').then(m => m.SeriesDetailsComponent) },
    { path: 'play/:streamId/:streamType', loadComponent: () => import('./player/player.component').then(m => m.PlayerComponent) },
    { path: 'play/:streamId/:streamType/:containerExtension', loadComponent: () => import('./player/player.component').then(m => m.PlayerComponent) },
    { path: 'movie/:id', loadComponent: () => import('./vod-details/vod-details.component').then(m => m.VodDetailsComponent) },
    { path: '**', redirectTo: 'login' }
];
