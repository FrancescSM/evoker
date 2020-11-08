import { Action, ActionCreator } from 'redux';

export interface ProxyNameSetAction extends Action {
  id: string;
  group: string;
  name: string;
  label: string;
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

export const PROXY_NAME_SET: string = 'PROXY_NAME_SET';
export const proxyNameSet: ActionCreator<ProxyNameSetAction> = (value) => ({
  type: PROXY_NAME_SET,
  id: value.id,
  group: value.group,
  name: value.name,
  label: value.label
});

export const PROXY_PIPELINE_SET: string = 'PROXY_PIPELINE_SET';
export const proxyPipeLineSet: ActionCreator<PipeLineSetAction> = (value) => ({
  type: PROXY_PIPELINE_SET,
  items: value
});
