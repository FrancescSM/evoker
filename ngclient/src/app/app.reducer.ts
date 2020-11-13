/**
 * app Reducer
 */
import { Reducer, Action } from 'redux';
import { AppState } from './app.state';


import * as VTKActions from './app.actions';

const initialState: AppState = {
  connected: false
  , selectedSources: []
  , proxyDataMap: {}
  , proxyNames:{}
  , sourceToRepresentationMap: {} // id(string) => id(string)
  , pipeline: []
  , viewId: ""
  , viewProxy: null
};

// Create our reducer that will handle changes to the state
export const vtkReducer: Reducer<AppState> =
  (state: AppState = initialState, action: Action): AppState => {
    let newState = state;
    switch (action.type) {

    case VTKActions.PROXY_NAME_SET:
      let nameSet = state.proxyNames;
      nameSet[(<VTKActions.ProxyNameSetAction>action).id] = (<VTKActions.ProxyNameSetAction>action).info;
      newState.proxyNames = nameSet;
      return Object.assign({}, state, newState);

    case VTKActions.PROXY_PIPELINE_SET:
      newState.pipeline = (<VTKActions.PipeLineSetAction>action).items;
      return Object.assign({}, state, newState);


    case VTKActions.VIEW_ID_SET:
      newState.viewId = (<VTKActions.ViewIdSetAction>action).view;
      return Object.assign({}, state, newState);

    case VTKActions.PROXY_SOURCE_TO_REP_SET:
      let sourceRep = state.sourceToRepresentationMap;
      sourceRep[(<VTKActions.SourceToRepresentationMapAction>action).id] = (<VTKActions.SourceToRepresentationMapAction>action).rep;
      console.log('sourceRep', sourceRep);
      newState.sourceToRepresentationMap = sourceRep;
      return Object.assign({}, state, newState);

    case VTKActions.PROXY_DATA_MAP_SET:
      let dataMap = state.proxyDataMap;
      dataMap[(<VTKActions.ProxyDataMapSetAction>action).id] = (<VTKActions.ProxyDataMapSetAction>action).info;
      newState.proxyDataMap = dataMap;
      // console.log('dataMap reducer', dataMap);
      return Object.assign({}, state, newState);

    case VTKActions.CONNECTION_SET:{
      console.log('reducer connection old ', state);
      newState.connected = (<VTKActions.ConnectionSetAction>action).connected;
      console.log('reducer connection new ', newState);
      return Object.assign({}, state, newState);
    }

    case VTKActions.VIEW_PROXY_SET:{
      // console.log('reducer VIEW_PROXY_SET ', (<VTKActions.ViewProxySetAction>action).viewProxy);
      // nota podria ser q aquests callback es guardin be però no es vegin be a les chrome debugging tools de redux
      console.log('reducer view_proxy old ', newState);
      newState.viewProxy = (<VTKActions.ViewProxySetAction>action).viewProxy;
      console.log('reducer view_proxy new ', newState);
      return Object.assign({}, state, newState);
    }

    case VTKActions.PROXY_SELECTED_IDS_SET:{
      newState.selectedSources = (<VTKActions.ProxySelectedIdsSetAction>action).selectedSources.slice();
      return Object.assign({}, state, newState);
    }

      default:
      return state;
    }
  };
