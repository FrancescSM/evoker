export default {
  name: 'Mesh',
  icon: 'mdi-view-dashboard',
  label: 'Mesh',
  showInMenu(selectedSourceIds) {
    return selectedSourceIds.length === 1;
  },
};
