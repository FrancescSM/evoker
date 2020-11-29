import { Injectable } from '@angular/core';
import SmartConnect from 'wslink/src/SmartConnect';
import vtkImageStream from 'vtk.js/Sources/IO/Core/ImageStream';

import ColorManager from '../protocols/ColorManager';
import FileListing from '../protocols/FileListing';
import KeyValuePairStore from '../protocols/KeyValuePairStore';
import MouseHandler from '../protocols/MouseHandler';
import ProgressUpdate from '../protocols/ProgressUpdate';
import ProxyManager from '../protocols/ProxyManager';
import SaveData from '../protocols/SaveData';
import TimeHandler from '../protocols/TimeHandler';
import ViewPort from '../protocols/ViewPort';
import ViewPortGeometryDelivery from '../protocols/ViewPortGeometryDelivery';
import ViewPortImageDelivery from '../protocols/ViewPortImageDelivery';
import VtkGeometryDelivery from '../protocols/VtkGeometryDelivery';
import VtkImageDelivery from '../protocols/VtkImageDelivery';

import Lite from '../protocols/Lite';


const REMOTE_API = {
  ColorManager,
  FileListing,
  KeyValuePairStore,
  MouseHandler,
  ProgressUpdate,
  ProxyManager,
  SaveData,
  TimeHandler,
  ViewPort,
  ViewPortGeometryDelivery,
  ViewPortImageDelivery,
  VtkGeometryDelivery,
  VtkImageDelivery,
  // custom
  Lite,
};

@Injectable({
  providedIn: 'root'
})
export class VtkService {

  private connection: any = null;
  private smartConnect: SmartConnect;
  private imageStream: vtkImageStream;
  private ws: any = null;
  private subscription: boolean = false;
  private session: any = null;
  private remote: any = null;
  private updateBusy: any;
  private busyCount: number = 0;
  private timeoutId: any = 0;
  private busyCallback: any = null;
  private notifyBusy: any = null;

  constructor() {
    this.updateBusy = (delta = 0) => {
      this.busyCount += delta;
        if (this.busyCallback) {
          if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = 0;
          }
          if (!this.busyCount) {
            // Try to delay the notification of idle
            this.timeoutId = setTimeout(() => {
              this.notifyBusy();
            }, 50);
          } else {
            this.notifyBusy();
          }
        }
    };
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

  connect() {
    let config = {
      application: 'evoker',
      sessionURL: 'ws://localhost:8083/ws'
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
        console.log('service create ImageStream');
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

  getFileListing() {
    return this.remote.FileListing;
  }

  getProxyManager() {
    return this.remote.ProxyManager;
  }

  // TODO: consider removing getProxyManager and getFileListing
  getRemote() {
    return this.remote;
  }

  getImageStream() {
    return this.imageStream;
  }

}
