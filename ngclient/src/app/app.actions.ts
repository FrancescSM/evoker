import { Action, ActionCreator } from 'redux';

export interface ProxyNameSetAction extends Action {
  [id: string]: string;
  };

export interface PipeLineSetAction extends Action {
  items: {
    name: string;
    id: string;
    rep: string;
    visible: boolean;
    parent: string;
  }[];
};

export interface ViewIdSetAction extends Action {
  view: string;
  };

export interface SourceToRepresentationMapAction extends Action {
  [id: string]: string;
};

export interface ProxyDataMapSetAction extends Action {
  [id: string]: string;
};


export const PROXY_NAME_SET: string = 'PROXY_NAME_SET';
export const proxyNameSet: ActionCreator<ProxyNameSetAction> = (value) => ({
  type: PROXY_NAME_SET,
  id: value.id,
  info: value.info
});

export const PROXY_PIPELINE_SET: string = 'PROXY_PIPELINE_SET';
export const proxyPipeLineSet: ActionCreator<PipeLineSetAction> = (value) => ({
  type: PROXY_PIPELINE_SET,
  items: value
});

export const VIEW_ID_SET: string = 'VIEW_ID_SET';
export const viewIdSet: ActionCreator<ViewIdSetAction> = (value) => ({
  type: VIEW_ID_SET,
  view: value
});

export const PROXY_SOURCE_TO_REP_SET: string = 'PROXY_SOURCE_TO_REP_SET';
export const proxySourceToRepSet: ActionCreator<SourceToRepresentationMapAction> = (value) => ({
  type: PROXY_SOURCE_TO_REP_SET,
  id: value.id,
  rep: value.rep
});

export const PROXY_DATA_MAP_SET: string = 'PROXY_DATA_MAP_SET';
export const proxyDataMapSet: ActionCreator<ProxyDataMapSetAction> = (value) => ({
  type: PROXY_DATA_MAP_SET,
  id: value.id,
  info: value.info
});
