import { Component, ElementRef, OnInit, ViewChild, Inject } from '@angular/core';

import { VtkService } from '../service/vtk-service.service';

import macro from 'vtk.js/Sources/macro';
import vtkInteractorObserver from 'vtk.js/Sources/Rendering/Core/InteractorObserver';
import vtkViewProxy from 'vtk.js/Sources/Proxy/Core/ViewProxy';
import vtkInteractiveOrientationWidget from 'vtk.js/Sources/Widgets/Widgets3D/InteractiveOrientationWidget';
import vtkWidgetManager from 'vtk.js/Sources/Widgets/Core/WidgetManager';
import vtkOrientationMarkerWidget from 'vtk.js/Sources/Interaction/Widgets/OrientationMarkerWidget';
import { CaptureOn } from 'vtk.js/Sources/Widgets/Core/WidgetManager/Constants';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkPolyData from 'vtk.js/Sources/Common/DataModel/PolyData';

import { Store } from 'redux';
import { AppStore } from '../app.store'
import { AppState } from '../app.state'
import * as VTKActions from '../app.actions';

// ----------------------------------------------------------------------------
// Component API
// ----------------------------------------------------------------------------

function majorAxis(vec3, idxA, idxB) {
  const axis = [0, 0, 0];
  const idx = Math.abs(vec3[idxA]) > Math.abs(vec3[idxB]) ? idxA : idxB;
  const value = vec3[idx] > 0 ? 1 : -1;
  axis[idx] = value;
  return axis;
}

// ----------------------------------------------------------------------------

function vectorToLabel(vec3) {
  if (vec3[0]) {
    return vec3[0] > 0 ? '+X' : '-X';
  }
  if (vec3[1]) {
    return vec3[1] > 0 ? '+Y' : '-Y';
  }
  if (vec3[2]) {
    return vec3[2] > 0 ? '+Z' : '-Z';
  }
  return '';
}

// ----------------------------------------------------------------------------

function toStyle({ x, y }, height) {
  return { top: `${height - y - 12}px`, left: `${x + 20}px` };
}

// ----------------------------------------------------------------------------

function computeOrientation(direction, originalViewUp) {
  let viewUp = [0, 0, 1];
  let axis = 0;
  let orientation = 1;

  if (direction[0]) {
    axis = 0;
    orientation = direction[0] > 0 ? 1 : -1;
    viewUp = majorAxis(originalViewUp, 1, 2);
  }
  if (direction[1]) {
    axis = 1;
    orientation = direction[1] > 0 ? 1 : -1;
    viewUp = majorAxis(originalViewUp, 0, 2);
  }
  if (direction[2]) {
    axis = 2;
    orientation = direction[2] > 0 ? 1 : -1;
    viewUp = majorAxis(originalViewUp, 0, 1);
  }
  return { axis, orientation, viewUp };
}

// ----------------------------------------------------------------------------

function vtkCacheMousePosition(publicAPI, model, initialValues) {
  Object.assign(model, { position: { x: 0, y: 0 } }, initialValues);
  vtkInteractorObserver.extend(publicAPI, model, initialValues);
  macro.get(publicAPI, model, ['position']);

  publicAPI.handleMouseMove = (e) => {
    model.position = e.position;
  };
}

vtkCacheMousePosition.newInstance = macro.newInstance(
  vtkCacheMousePosition,
  'vtkCacheMousePosition'
);


@Component({
  selector: 'app-renderer',
  templateUrl: './renderer.component.html',
  styleUrls: ['./renderer.component.css']
})
export class RendererComponent implements OnInit {
  private view: vtkViewProxy = null;
  private viewStream: any = null;
  private widgetManager: any = null;
  private widget: any = null;
  private viewWidget: any = null;
  private camera: any = null;
  private interactiveQuality: any = null;
  private interactiveRatio: any = null;
  private mousePositionCache: any = null;
  private connected: boolean = false;
  private actor: vtkActor = null;
  private mapper: vtkMapper = null;
  private source: vtkPolyData = null;
  private viewId: string = '';

  constructor(
    private vtkService: VtkService
    ,@Inject(AppStore) private store: Store<AppState>) {
      this.actor = vtkActor.newInstance();
      this.mapper = vtkMapper.newInstance();
      this.source = vtkPolyData.newInstance();
      this.actor.setMapper(this.mapper);
      this.mapper.setInputData(this.source);
  }

  // onResize() {
  //   if (this.view) {
  //     this.view.resize();
  //     this.view.renderLater();
  //     this.viewStream.render();
  //     this.$nextTick(this.widgetManager.enablePicking);
  //   }
  // };

  updateQuality() {
    this.viewStream.setInteractiveQuality(this.interactiveQuality);
  }

  updateRatio() {
    this.viewStream.setInteractiveRatio(this.interactiveRatio);
  }

  updateCamera({ position, focalPoint, viewUp, centerOfRotation }) {
    const camera = this.view.getCamera();
    if (position) {
      camera.setPosition(...position);
    }
    if (focalPoint) {
      camera.setFocalPoint(...focalPoint);
    }
    if (viewUp) {
      camera.setViewUp(...viewUp);
    }
    if (centerOfRotation) {
      this.view
        .getInteractorStyle3D()
        .setCenterOfRotation(centerOfRotation);
    }
  }

  ngOnInit(): void {
    // console.log('ngInit');
  }

  ngAfterContentInit(): void {
    // TODO: do we need to subscribe here?
    this.store.subscribe(() => this.readState());

  }

  readState(): void {
    const state: AppState = this.store.getState() as AppState;
    console.log('renderer readState ', state.viewId , ' ', state.connected);
    if (this.connected != state.connected){
      this.connected = state.connected;
      // console.log('renderer readState connection change');
      if (this.connected){
        // console.log('renderer readState connect!!!');
        this.createRender();
      }
    }
    if (this.viewId != state.viewId){
      console.log('renderer readState viewid change');
      this.viewId = state.viewId;
      if (this.viewStream) {
        if (this.viewStream.setViewId(this.viewId)) {
          //TODO
          //this.fetchCamera();
          const currentSize = this.view.getOpenglRenderWindow().getSize();
          this.viewStream
            .setSize(currentSize[0] + 1, currentSize[1] + 1) // Force size push
            .then(this.viewStream.render);
        }
      }
    }
  }

  createRender(): void {
    console.log('createRender');
    const container = document.getElementById('container-id');
    this.view = vtkViewProxy.newInstance();
    this.view.setContainer(container);
    this.view.resize();

    // Create and link viewStream
    console.log('component before getImageStream');
    let imageStream = this.vtkService.getImageStream();
    this.viewStream = imageStream.createViewStream('-1');
    this.view.getOpenglRenderWindow().setViewStream(this.viewStream);
    this.view.setBackground([0, 0, 0, 0]);
    this.camera = this.view.getCamera();
    this.viewStream.setCamera(this.camera);

    // Bind user input
    const interactor = this.view.getRenderWindow().getInteractor();
    interactor.onStartAnimation(this.viewStream.startInteraction);
    interactor.onEndAnimation(this.viewStream.endInteraction);
    this.mousePositionCache = vtkCacheMousePosition.newInstance();
    this.mousePositionCache.setInteractor(interactor);

    // Add orientation widget
    const orientationWidget = this.view.getReferenceByName('orientationWidget');
    this.widgetManager = vtkWidgetManager.newInstance();
    this.widgetManager.setCaptureOn(CaptureOn.MOUSE_MOVE);
    this.widgetManager.setRenderer(orientationWidget.getRenderer());
    orientationWidget.setViewportCorner(
      vtkOrientationMarkerWidget.Corners.TOP_LEFT
    );

    const bounds = [-0.51, 0.51, -0.51, 0.51, -0.51, 0.51];
    this.widget = vtkInteractiveOrientationWidget.newInstance();
    this.widget.placeWidget(bounds);
    this.widget.setBounds(bounds);
    this.widget.setPlaceFactor(1);
    this.widget.getWidgetState().onModified(() => {
      const state = this.widget.getWidgetState();
      if (!state.getActive()) {
        //this.orientationTooltip = '';
        return;
      }
      const direction = state.getDirection();
      const { axis, orientation, viewUp } = computeOrientation(
        direction,
        this.camera.getViewUp()
      );
      // this.orientationTooltip = `Reset camera ${orientation > 0 ? '+' : '-'}${
      //   'XYZ'[axis]
      // }/${vectorToLabel(viewUp)}`;
      // this.tooltipStyle = toStyle(
      //   this.mousePositionCache.getPosition(),
      //   this.view.getOpenglRenderWindow().getSize()[1]
      // );
    });

    // Manage user interaction
    this.viewWidget = this.widgetManager.addWidget(this.widget);
    this.viewWidget.onOrientationChange(({ direction }) => {
      console.log('orientation change');
      // this.updateOrientation(
      //   computeOrientation(direction, this.camera.getViewUp())
      // );
    });

    // Initial config
    this.updateQuality();
    this.updateRatio();
    //this.client.imageStream.setServerAnimationFPS(this.maxFPS);

    // Expose viewProxy to store (for camera update...)
    //this.$store.commit('PVL_VIEW_PVL_PROXY_SET', this.view);
    console.log('renderer viewproxy before addActor', this.view);
    this.view.getRenderer().addActor(this.actor);
    console.log('renderer viewproxy after addActor', this.view);
    // let cloneView = Object.assign({}, this.view);
    // let cloneView = { getCameraPosition: this.view.getCameraPosition};
    // cloneView.getCameraPosition = this.view.getCameraPosition;
    // console.log('renderer viewproxy clone', cloneView);
    // this.store.dispatch(VTKActions.viewProxySet({info: cloneView}));
    this.store.dispatch(VTKActions.viewProxySet(this.view));

    // Link server side camera to local
    let remote = this.vtkService.getRemote();
    remote.Lite.getCamera('-1').then((cameraInfo) => {
      this.updateCamera(cameraInfo);
      this.viewStream.pushCamera();
    });



  }

}

// PVL_VIEW_UPDATE_ORIENTATION(
//   { state, dispatch },
//   { axis, orientation, viewUp }
// ) {
//   if (state.viewProxy && !state.inAnimation) {
//     state.inAnimation = true;
//     state.viewProxy
//       .updateOrientation(
//         axis,
//         orientation,
//         viewUp || PVL_VIEW_UPS[axis],
//         100
//       )
//       .then(() => {
//         state.inAnimation = false;
//         dispatch('PVL_VIEW_RESET_CAMERA');
//       });
//   }
// },
