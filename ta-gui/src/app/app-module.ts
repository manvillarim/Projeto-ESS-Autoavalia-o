import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { AlunosComponent } from './alunos.component';
import { MetasComponent } from './metas.component';
import { AlunoService } from './aluno.service';

@NgModule({
  declarations: [
    App,
    AlunosComponent,
    MetasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', redirectTo: '/alunos', pathMatch: 'full' },
      { path: 'metas', component: MetasComponent },
      { path: 'alunos', component: AlunosComponent }
    ])
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    AlunoService,
    // provideClientHydration(),
  ],
  bootstrap: [App]
})
export class AppModule { }
