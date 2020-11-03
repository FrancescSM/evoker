import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RendererComponent } from './renderer/renderer.component';
import { VisElementComponent } from './vis-element/vis-element.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    RendererComponent,
    VisElementComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
