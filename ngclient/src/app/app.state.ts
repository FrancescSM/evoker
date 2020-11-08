
export interface AppState {
  pipeline: [], // pipeline list
  proxyNames: {
    id: string,
    group: string,
    name: string,
    label: string
    }
};

// state: {
//   selectedSources: [], // list of ids of the selected sources
//   pipeline: [], // pipeline list
//   proxyToModuleMap: {}, // xmlName(string) => moduleName(string)
//   sourceToRepresentationMap: {}, // id(string) => id(string)
//   proxyDataMap: {}, // id(string) => { data, properties, ui, id }
//   proxyNames: {}, // id(string) => { group(str), name(str), label(str) }
// },

