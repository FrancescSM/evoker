/* eslint-disable no-unused-vars */
const DEFAULT_VALUES = {
  showInMenu(proxyData) {
    return true;
  },
  priority: 0,
  label: 'No label',
  icon: 'bubble_chart',
};

function moduleSorting(a, b) {
  return a.priority - b.priority;
}

export default {
  state: {
    modules: [],
    active: null,
    moduleMap: {},
  },
  getters: {
    PVL_MODULES_LIST(state) {
      return state.modules;
    },
    PVL_MODULES_ACTIVE(state) {
      return state.active;
    },
    PVL_MODULES_MAP(state) {
      return state.moduleMap;
    },
  },
  mutations: {
    PVL_MODULES_ADD(
      state,
      { icon, label, component, isSource, showInMenu, priority, name, directory }
    ) {
      const module = {};
      module.name = name;
      module.component = component;
      module.showInMenu = showInMenu || DEFAULT_VALUES.showInMenu;
      module.icon = icon || DEFAULT_VALUES.icon;
      module.label = label || DEFAULT_VALUES.label;
      module.priority = priority || DEFAULT_VALUES.priority;
      module.directory = directory || DEFAULT_VALUES.directory;

      state.modules.push(module);
      state.modules.sort(moduleSorting);
      state.moduleMap[name] = module;
    },
    PVL_MODULES_ACTIVE_SET(state, module) {
      console.log('PVL_MODULES_ACTIVE_SET ', module);
      state.active = module;
    },
  },
  actions: {
    PVL_MODULES_ACTIVE_CLEAR({ commit }) {
      commit('PVL_MODULES_ACTIVE_SET', null);
    },
    PVL_MODULES_ACTIVE_BY_NAME({ commit, state }, name) {
      state.moduleMap[name].directory = '.';
      commit('PVL_MODULES_ACTIVE_SET', state.moduleMap[name]);
    },
    PVL_MODULES_ACTIVE_BY_NAME_WITH_DIR({ commit, state }, value) {
      let splitted = value.split(':');
      console.log(
        'PVL_MODULES_ACTIVE_BY_NAME_WITH_DIR ',
        splitted[0],
        ' ',
        splitted[1]
      );
      state.moduleMap[splitted[0]].directory = splitted[1];
      commit('PVL_MODULES_ACTIVE_SET', state.moduleMap[splitted[0]]);
    },
  },
};
