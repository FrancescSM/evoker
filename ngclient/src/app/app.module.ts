import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RendererComponent } from './renderer/renderer.component';
import { VisElementComponent } from './vis-element/vis-element.component';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';

import { CommonModule } from '@angular/common'
import { MatToolbarModule } from '@angular/material/toolbar'
import { FlexLayoutModule } from '@angular/flex-layout'
import { MatIconModule } from '@angular/material/icon'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatMenuModule } from '@angular/material/menu'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatDialogModule } from '@angular/material/dialog'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { FormsModule } from '@angular/forms';
import { NewFolderDialogComponent } from './file-explorer/modals/new-folder-dialog/new-folder-dialog.component';
import { RenameDialogComponent } from './file-explorer/modals/rename-dialog/rename-dialog.component';
import { MatCardModule } from '@angular/material/card';

import { appStoreProviders } from './app.store'

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    RendererComponent,
    VisElementComponent,
    FileExplorerComponent,
    NewFolderDialogComponent,
    RenameDialogComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    MatToolbarModule,
    FlexLayoutModule,
    MatIconModule,
    MatGridListModule,
    MatMenuModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatCardModule
  ],
  providers: [appStoreProviders],
  bootstrap: [AppComponent]
})
export class AppModule { }



