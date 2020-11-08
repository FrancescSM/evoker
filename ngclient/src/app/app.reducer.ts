/**
 * app Reducer
 */
import { Reducer, Action } from 'redux';
import { AppState } from './app.state';
import {
  PROXY_NAME_SET,
  ProxyNameSetAction,
  PROXY_PIPELINE_SET,
  PipeLineSetAction
} from './app.actions';

const initialState: AppState = {
  proxyNames:{ id: "",
    group: "",
    name: "",
    label: ""
  }
  , pipeline: []
};

// Create our reducer that will handle changes to the state
export const vtkReducer: Reducer<AppState> =
  (state: AppState = initialState, action: Action): AppState => {
    switch (action.type) {
    case PROXY_NAME_SET:
      return Object.assign({}, state, { pipeline: state.pipeline, proxyNames: (<ProxyNameSetAction>action) });
    case PROXY_PIPELINE_SET:
      return Object.assign({}, state, { pipeline: (<PipeLineSetAction>action).items, proxyNames: state.proxyNames });

    default:
      return state;
    }
  };
