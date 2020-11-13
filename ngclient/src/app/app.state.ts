
export interface AppState {
  connected: boolean
  , selectedSources: string[]
  , pipeline: {
    name: string;
    id: string;
    rep: string;
    visible: boolean;
    parent: string;
  }[] // pipeline list
  , sourceToRepresentationMap: {
    [id:string] : string
  } // id(string) => id(string)
  , proxyDataMap: {} // id(string) => { data, properties, ui, id }
  , proxyNames: {} // id(string) => { group(str), name(str), label(str) }
  , viewId: string
  , viewProxy: null
};

// state: {
//   selectedSources: [], // list of ids of the selected sources
//   pipeline: [], // pipeline list
//   proxyToModuleMap: {}, // xmlName(string) => moduleName(string)
//   sourceToRepresentationMap: {}, // id(string) => id(string)
//   proxyDataMap: {}, // id(string) => { data, properties, ui, id }
//   proxyNames: {}, // id(string) => { group(str), name(str), label(str) }
// },

// state: {
//   view: '-1',
//   stats: false,
//   stillQuality: 100,
//   interactiveQuality: 80,
//   stillRatio: 1,
//   interactiveRatio: 1,
//   maxFPS: 30,
//   mouseThrottle: 16.6,
//   camera: null,
//   viewProxy: null,
//   inAnimation: false,
// },
