import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs'
import { FileElement } from '../file-explorer/model/file-element'
import { FileService } from '../service/file-service.service';
import { VtkService } from '../service/vtk-service.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  fileElements: Observable<FileElement[]>;
  currentRoot: FileElement;
  currentPath: string;
  canNavigateUp: boolean = false;
  mapPathDiscovered : { [key: string]: boolean} = {};

  constructor(private fileService: FileService,
    private vtkService: VtkService) {
  }

  ngOnInit(): void {
    this.connect();
  }

  connect() {
    this.vtkService.connect()
      .then((validClient) => {
        console.log('connected');
        let fileListing = this.vtkService.getFileListing();
        // console.log('connect1 currentRoot ', this.currentRoot);
        // console.log('connect2 currentPath ', this.currentPath);

        fileListing.listServerDirectory('.')
          .then((listing) => {
            const { dirs, files, groups, path } = listing;
            // console.log('dirs ', dirs);
            // console.log('files ', files);
            dirs.forEach(element => {
              console.log(element);
              this.fileService.add({ isFolder: true, name: element, parent: this.currentRoot ? this.currentRoot.id : 'root' });
            });
            files.forEach(element => {
              console.log(element);
              this.fileService.add({ isFolder: false, name: element.label, parent: this.currentRoot ? this.currentRoot.id : 'root' });
            });
            this.updateFileElementQuery();
            // this.files = files;
            // this.groups = groups;
            // this.directories = dirs;
            // this.path = path;
            // this.label = this.path.slice(-1)[0];
          })
          .catch(console.error);
      })
      .catch((error) => {
        console.log('error');
        console.error(error);
      });
  }

  // openFile() {
  //   console.log('openFile');
  //   let fileListing = this.vtkService.getFileListing();
  //   fileListing.listServerDirectory('.')
  //     .then((listing) => {
  //       const { dirs, files, groups, path } = listing;
  //       console.log('dirs ', dirs, 'files ', files);
  //       // this.files = files;
  //       // this.groups = groups;
  //       // this.directories = dirs;
  //       // this.path = path;
  //       // this.label = this.path.slice(-1)[0];
  //     })
  //     .catch(console.error);
  //   return true;
  // }

  updateFileElementQuery() {
    console.log('updateFileElementQuery');
    this.fileElements = this.fileService.queryInFolder(this.currentRoot ? this.currentRoot.id : 'root');
  }

  addFolder(folder: { name: string }) {
    console.log('addFolder');
    this.fileService.add({ isFolder: true, name: folder.name, parent: this.currentRoot ? this.currentRoot.id : 'root' });
    this.updateFileElementQuery();
  }

  removeElement(element: FileElement) {
    console.log('removeElement');
    this.fileService.delete(element.id);
    this.updateFileElementQuery();
  }

  selectElement(element: FileElement) {
    console.log('selectElement ', element);
    // this.updateFileElementQuery();
  }

  moveElement(event: { element: FileElement; moveTo: FileElement }) {
    console.log('moveElement');
    this.fileService.update(event.element.id, { parent: event.moveTo.id });
    this.updateFileElementQuery();
  }

  renameElement(element: FileElement) {
    console.log('renameElement');
    this.fileService.update(element.id, { name: element.name });
    this.updateFileElementQuery();
  }

  navigateUp() {
    console.log('navigateUp');
    if (this.currentRoot && this.currentRoot.parent === 'root') {
      this.currentRoot = null;
      this.canNavigateUp = false;
      this.updateFileElementQuery();
    } else {
      this.currentRoot = this.fileService.get(this.currentRoot.parent);
      this.updateFileElementQuery();
    }
    this.currentPath = this.popFromPath(this.currentPath);
  }

  navigateToFolder(element: FileElement) {
    this.currentRoot = element;
    this.updateFileElementQuery();
    this.currentPath = this.pushToPath(this.currentPath, element.name);
    this.canNavigateUp = true;
    // console.log('navigateToFolder2 currentRoot ', this.currentRoot);
    console.log('navigateToFolder currentPath ', this.currentPath);
    let fileListing = this.vtkService.getFileListing();
    if (this.mapPathDiscovered[this.currentPath] === undefined){
      this.mapPathDiscovered[this.currentPath] = true;
      fileListing.listServerDirectory('HOME/' + this.currentPath)
        .then((listing) => {
          const { dirs, files, groups, path } = listing;
          // console.log('dirs ', dirs);
          // console.log('files ', files);
          dirs.forEach(element => {
            // console.log(element);
            this.fileService.add({ isFolder: true, name: element, parent: this.currentRoot ? this.currentRoot.id : 'root' });
          });
          files.forEach(element => {
            // console.log(element);
            this.fileService.add({ isFolder: false, name: element.label, parent: this.currentRoot ? this.currentRoot.id : 'root' });
          });
          this.updateFileElementQuery();
          // this.files = files;
          // this.groups = groups;
          // this.directories = dirs;
          // this.path = path;
          // this.label = this.path.slice(-1)[0];
        })
        .catch(console.error);
    }
  }

  pushToPath(path: string, folderName: string) {
    let p = path ? path : '';
    p += `${folderName}/`;
    return p;
  }

  popFromPath(path: string) {
    let p = path ? path : '';
    let split = p.split('/');
    split.splice(split.length - 2, 1);
    p = split.join('/');
    return p;
  }
}
