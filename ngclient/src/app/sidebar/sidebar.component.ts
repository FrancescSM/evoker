import { Component, OnInit } from '@angular/core';
import SmartConnect from 'wslink/src/SmartConnect';
import vtkImageStream from 'vtk.js/Sources/IO/Core/ImageStream';
import FileListing from '../protocols/FileListing';

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

  constructor() {
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
}
