import { mapGetters, mapActions } from 'vuex';

import module from './module';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export default {
  name: 'Mesh',
  data() {
    return {
      label: 'Home',
      directories: [],
      groups: [],
      files: [],
      path: [],
      module,
      color: 'grey darken-2',
    };
  },
  computed: mapGetters({
    client: 'PVL_NETWORK_CLIENT',
  }),
  methods: Object.assign(
    {
      listServerDirectory(pathToList) {
        console.log('listServerDirectory ', pathToList);
        this.client.remote.FileListing.listServerDirectory(pathToList)
          .then((listing) => {
            const { dirs, files, groups, path } = listing;
            this.files = files;
            this.groups = groups;
            this.directories = dirs;
            this.path = path;
            this.label = this.path.slice(-1)[0];
          })
          .catch(console.error);
      },
      // openFiles(files) {
      //   const pathPrefix = this.path.slice(1).join('/');
      //   const relativePathFiles =
      //   this.path.length > 1 ? files.map((f) => `${pathPrefix}/${f}`) : files;
      //   console.log('openfiles ', files, 'relative ', relativePathFiles);
      //   //TODO: check if file is for meshing
      //   this.client.remote.ProxyManager.open(relativePathFiles)
      //   .then((readerProxy) => {
      //     this.$store.dispatch('PVL_PROXY_NAME_FETCH', readerProxy.id);
      //     this.$store.dispatch('PVL_PROXY_PIPELINE_FETCH');
      //     this.$store.dispatch('PVL_MODULES_ACTIVE_CLEAR');
      //     this.$store.commit('PVL_PROXY_SELECTED_IDS_SET', [readerProxy.id]);
      //   })
      //   .catch(console.error);
      // },
      openDirectory(directoryName) {
        console.log('openDirectory ', directoryName);
        this.client.remote.Lite.mesh(directoryName);
        let value = 'Files:' + directoryName;
        this.activate_with_dir(value);
      },
      listParentDirectory(index) {
        console.log('listParentDirectory ', index);
        if (index) {
          this.listServerDirectory(this.path.slice(0, index + 1).join('/'));
        } else {
          this.listServerDirectory('.');
        }
      },
    },
    mapActions({
      removeActiveModule: 'PVL_MODULES_ACTIVE_CLEAR',
      activate_with_dir: 'PVL_MODULES_ACTIVE_BY_NAME_WITH_DIR',
    })
  ),
  mounted() {
    this.listServerDirectory('.');
  },
};
