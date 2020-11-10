import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs'
import { FileElement } from '../file-explorer/model/file-element'
import { FileService } from '../service/file-service.service';
import { VtkService } from '../service/vtk-service.service';

import { Store } from 'redux';
import { AppStore } from '../app.store'
import { AppState } from '../app.state'
import * as VTKActions from '../app.actions';


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
  mapPathDiscovered: { [key: string]: boolean } = {};

  constructor(private fileService: FileService,
    private vtkService: VtkService
    ,@Inject(AppStore) private store: Store<AppState>
    ) {
    // TODO: do we need to subscribe here?
    store.subscribe(() => this.readState());
    this.readState();
  }

  readState() {
    const state: AppState = this.store.getState() as AppState;
    console.log('readState ', state);
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

  getProxyName(id: string){
    let remote = this.vtkService.getRemote();
    remote.Lite.getProxyName(id)
    .then((info) => {
      // console.log('proxyName ready ', info);
      this.store.dispatch(VTKActions.proxyNameSet({ id: info.id, info: info }));
    })
    .catch(console.error);
  }

  getProxyDataMap(id: string){
    const needUI : boolean = true;
    let proxyManager = this.vtkService.getProxyManager();
    proxyManager.get(id, needUI)
    .then((proxy) => {
      // console.log('datamap ', proxy);
      this.store.dispatch(VTKActions.proxyDataMapSet({ id: proxy.id, info: proxy }));
    })
    .catch(console.error);
  }

  selectElement(element: FileElement) {
    console.log('selectElement ', element);
    // this.updateFileElementQuery();
    let proxyManager = this.vtkService.getProxyManager();
    proxyManager.open(element.name)
      .then((readerProxy) => {
        console.log('proxyManager ready ', readerProxy ) ;
        this.getProxyName(readerProxy.id);
        proxyManager.list()
          .then(({ sources, view }) => {
            console.log('proxyManager list sources ', sources);
            console.log('proxyManager list view ', view);
            this.store.dispatch(VTKActions.proxyPipeLineSet(sources));
            this.store.dispatch(VTKActions.viewIdSet(view));
            const state: AppState = this.store.getState() as AppState;
            // Fetch view data if first time
            if (!state.proxyDataMap[view]) {
              this.getProxyDataMap(view);
            }

            sources.forEach((proxy) => {
              console.log('PVL_PROXY_SOURCE_TO_REPRESENTATION_SET', proxy);
              this.store.dispatch(VTKActions.proxySourceToRepSet({ id: proxy.id, rep: proxy.rep }));

              //Fetch proxy data if not available
              if (!state.proxyDataMap[proxy.id]) {
                this.getProxyDataMap(proxy.id);
              }

              // Fetch proxy name if not available
              if (!state.proxyNames[proxy.id]) {
                this.getProxyName(proxy.id);
                // this.store.dispatch(VTKActions.proxyNameSet({ id: proxy.id, info: proxy }));
              }

              // Fetch representation data if not available
              if (!state.proxyDataMap[proxy.rep]) {
                this.getProxyDataMap(proxy.rep);
              }

              // Fetch representation name if not available
              if (!state.proxyNames[proxy.rep]) {
                this.getProxyName(proxy.rep);
                // this.store.dispatch(VTKActions.proxyNameSet({ id: proxy.rep, info: proxy }));
              }
            });

            // If only one source trigger a reset camera
            // if (sources.length === 1) {
            //   dispatch('PVL_VIEW_RESET_CAMERA');
            // }

            // Fetch new time values
            // dispatch('PVL_TIME_FETCH_VALUES');


          })
          .catch(console.error);
      })
      .catch(console.error);

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
    if (this.mapPathDiscovered[this.currentPath] === undefined) {
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
