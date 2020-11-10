/**
 * app Reducer
 */
import { Reducer, Action } from 'redux';
import { AppState } from './app.state';
import {
  PROXY_NAME_SET,
  ProxyNameSetAction,
  PROXY_PIPELINE_SET,
  PipeLineSetAction,
  VIEW_ID_SET,
  ViewIdSetAction,
  PROXY_SOURCE_TO_REP_SET,
  SourceToRepresentationMapAction,
  PROXY_DATA_MAP_SET,
  ProxyDataMapSetAction
} from './app.actions';

const initialState: AppState = {
  proxyDataMap: {}
  , proxyNames:{}
  , sourceToRepresentationMap: {} // id(string) => id(string)
  , pipeline: []
  , viewId: ""
};

// Create our reducer that will handle changes to the state
export const vtkReducer: Reducer<AppState> =
  (state: AppState = initialState, action: Action): AppState => {
    switch (action.type) {
    case PROXY_NAME_SET:
      let nameSet = state.proxyNames;
      nameSet[(<ProxyNameSetAction>action).id] = (<ProxyNameSetAction>action).info;
      console.log('nameSet', nameSet);
      return Object.assign({}, state, { pipeline: state.pipeline
        , sourceToRepresentationMap: state.sourceToRepresentationMap
        , proxyDataMap: state.proxyDataMap
        , proxyNames: nameSet
        , viewId: state.viewId });

    case PROXY_PIPELINE_SET:
      return Object.assign({}, state, { pipeline: (<PipeLineSetAction>action).items
        , sourceToRepresentationMap: state.sourceToRepresentationMap
        , proxyDataMap: state.proxyDataMap
        , proxyNames: state.proxyNames
        , viewId: state.viewId });
    case VIEW_ID_SET:
      return Object.assign({}, state, { pipeline: state.pipeline
        , sourceToRepresentationMap: state.sourceToRepresentationMap
        , proxyDataMap: state.proxyDataMap
        , proxyNames: state.proxyNames
        , viewId: (<ViewIdSetAction>action).view });
    case PROXY_SOURCE_TO_REP_SET:
      let sourceRep = state.sourceToRepresentationMap;
      sourceRep[(<SourceToRepresentationMapAction>action).id] = (<SourceToRepresentationMapAction>action).rep;
      console.log('sourceRep', sourceRep);
      return Object.assign({}, state, { pipeline: state.pipeline
        , sourceToRepresentationMap: sourceRep
        , proxyDataMap: state.proxyDataMap
        , proxyNames: state.proxyNames
        , viewId: state.viewId });
    case PROXY_DATA_MAP_SET:
      let dataMap = state.proxyDataMap;
      dataMap[(<ProxyDataMapSetAction>action).id] = (<ProxyDataMapSetAction>action).info;
      console.log('dataMap reducer', dataMap);
      return Object.assign({}, state, { pipeline: state.pipeline
        , sourceToRepresentationMap: state.sourceToRepresentationMap
        , proxyDataMap: dataMap
        , proxyNames: state.proxyNames
        , viewId: state.viewId });
    default:
      return state;
    }
  };
