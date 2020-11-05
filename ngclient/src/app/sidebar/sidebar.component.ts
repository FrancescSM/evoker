import { Component, OnInit } from '@angular/core';
import SmartConnect from 'wslink/src/SmartConnect';
import vtkImageStream from 'vtk.js/Sources/IO/Core/ImageStream';
import FileListing from '../protocols/FileListing';
import { Observable } from 'rxjs'
import { FileElement } from '../file-explorer/model/file-element'
import { FileService } from '../service/file-service.service';

const REMOTE_API = {
  // ColorManager,
  FileListing,
  // KeyValuePairStore,
  // MouseHandler,
  // ProgressUpdate,
  // ProxyManager,
  // SaveData,
  // TimeHandler,
  // ViewPort,
  // ViewPortGeometryDelivery,
  // ViewPortImageDelivery,
  // VtkGeometryDelivery,
  // VtkImageDelivery,
  // // custom
  // Lite,
};

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  // id?: string
  // isFolder: boolean
  // name: string
  // parent: string
  // {id:"id1",isFolder: false,name:"name1",parent:"parent1"}
  fileElements: Observable<FileElement[]>;
  currentRoot: FileElement;
  currentPath: string;
  canNavigateUp = false;

  //private config: any = null;
  private connection: any = null;
  private smartConnect: SmartConnect;
  private imageStream: vtkImageStream;
  private ws: any = null;
  private subscription: boolean = false;
  private session: any = null;
  private remote: any = null;
  private updateBusy: any;
  private busyCount: number = 0;

  constructor(private fileService: FileService) {

    this.updateBusy = (delta = 0) => {
      this.busyCount += delta;
      //   if (this.busyCallback) {
      //     if (this.timeoutId) {
      //       clearTimeout(this.timeoutId);
      //       this.timeoutId = 0;
      //     }
      //     if (!this.busyCount) {
      //       // Try to delay the notification of idle
      //       this.timeoutId = setTimeout(() => {
      //         this.notifyBusy();
      //       }, 50);
      //     } else {
      //       this.notifyBusy();
      //     }
      //   }
    };
  }

  ngOnInit(): void {
    this.connect();
  }

  connect() {
    this.doConnect()
      .then((validClient) => {
        console.log('connected');
        // commit('PVL_NETWORK_CLIENT_SET', validClient);
        // dispatch('PVL_TIME_FETCH_ACTIVE_INDEX');
        // dispatch('PVL_PROXY_PIPELINE_FETCH');
        // dispatch('PVL_APP_ROUTE_RUN');
        // dispatch('PVL_COLOR_FETCH_PRESET_NAMES', 500);
        // clientToConnect.updateBusy(-1);
        // this.fileService.add({ isFolder: true, name: 'folder1', parent: this.currentRoot ? this.currentRoot.id : 'root' });
        // this.fileService.add({ isFolder: true, name: 'folder2', parent: this.currentRoot ? this.currentRoot.id : 'root' });
        // this.fileService.add({ isFolder: false, name: 'file1', parent: this.currentRoot ? this.currentRoot.id : 'root' });
        // this.fileService.add({ isFolder: false, name: 'file2', parent: this.currentRoot ? this.currentRoot.id : 'root' });


        this.remote.FileListing.listServerDirectory('.')
          .then((listing) => {
            const { dirs, files, groups, path } = listing;
            // console.log('dirs ', dirs, 'files ', files);
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

  // ----------------------------------------------------------------------------
  // Busy feedback handling
  // ----------------------------------------------------------------------------

  busy(fn, update) {
    return (...args) =>
      new Promise((resolve, reject) => {
        update(1);
        fn(...args).then(
          (response) => {
            update(-1);
            resolve(response);
          },
          (error) => {
            update(-1);
            reject(error);
          }
        );
      });
  }

  busyWrap(methodMap, update) {
    const busyContainer = {};
    Object.keys(methodMap).forEach((methodName) => {
      busyContainer[methodName] = this.busy(methodMap[methodName], update);
    });
    return busyContainer;
  }

  doConnect() {
    let config = {
      application: 'evoker',
      sessionURL: 'ws://localhost:8082/ws'
    }
    console.log('Evoker', JSON.stringify({ config }), '\n');
    if (this.connection) {
      return Promise.reject(new Error('Need to disconnect before'));
    }
    return new Promise((resolve, reject) => {
      this.smartConnect = SmartConnect.newInstance({ config });
      this.smartConnect.onConnectionReady((connection) => {
        console.log('onConnectionReady');
        this.connection = connection;
        this.imageStream = vtkImageStream.newInstance();
        this.remote = {};
        const session = connection.getSession();

        // Link remote API
        Object.keys(REMOTE_API).forEach((name) => {
          this.remote[name] = this.busyWrap(
            REMOTE_API[name](session),
            this.updateBusy
          );
        });

        // Link imageStream
        this.imageStream.connect(session);

        resolve(this);
      });
      this.smartConnect.onConnectionError((error) => {
        console.log('connection error');
        // if (this.connectionCallback) {
        //   this.connectionCallback('errored', error);
        // }
        reject(error);
      });
      this.smartConnect.onConnectionClose((close) => {
        console.log('connection close');
        // if (this.connectionCallback) {
        //   this.connectionCallback('closed', close);
        // }
        reject(close);
      });
      this.smartConnect.connect();
    });
  }

  disconnect(timeout = 60) {
    if (this.connection) {
      this.connection.destroy(timeout);
      this.connection = null;
    }
  }

  openFile() {
    console.log('openFile');

    this.remote.FileListing.listServerDirectory('.')
      .then((listing) => {
        const { dirs, files, groups, path } = listing;
        console.log('dirs ', dirs, 'files ', files);
        // this.files = files;
        // this.groups = groups;
        // this.directories = dirs;
        // this.path = path;
        // this.label = this.path.slice(-1)[0];
      })
      .catch(console.error);
    return true;
  }

  updateFileElementQuery() {
    this.fileElements = this.fileService.queryInFolder(this.currentRoot ? this.currentRoot.id : 'root');
  }

  addFolder(folder: { name: string }) {
    this.fileService.add({ isFolder: true, name: folder.name, parent: this.currentRoot ? this.currentRoot.id : 'root' });
    this.updateFileElementQuery();
  }

  removeElement(element: FileElement) {
    this.fileService.delete(element.id);
    this.updateFileElementQuery();
  }

  moveElement(event: { element: FileElement; moveTo: FileElement }) {
    this.fileService.update(event.element.id, { parent: event.moveTo.id });
    this.updateFileElementQuery();
  }

  renameElement(element: FileElement) {
    this.fileService.update(element.id, { name: element.name });
    this.updateFileElementQuery();
  }

  navigateUp() {
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
