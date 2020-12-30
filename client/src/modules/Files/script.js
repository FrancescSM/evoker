/* eslint-disable prettier/prettier */
import { mapGetters, mapActions } from 'vuex';

import module from './module';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export default {
  name: 'Files',
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
    active: 'PVL_MODULES_ACTIVE',
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
      openFiles(files) {
        const pathPrefix = this.path.slice(1).join('/');
        console.log('openfiles path ', this.path);
        console.log('openfiles pathPrefix ', pathPrefix);
        console.log('openfiles type files ', typeof(files));
        console.log('openfiles files ', files);
        for (const file in files)
          console.log(file);
        console.log('openfiles len ', this.path.length, ' files ', files, ' prefix ', pathPrefix);
        const relativePathFiles =
          this.path.length > 1 ? files.map((f) => `${pathPrefix}/${f}`) : files;
        console.log('openfiles ', files, 'relative ', relativePathFiles);
        //TODO: check if file is for meshing
        this.client.remote.ProxyManager.open(relativePathFiles)
          .then((readerProxy) => {
            let info = { id: readerProxy.id, file: relativePathFiles};
            console.log('then ', info);
            // this.$store.dispatch('PVL_PROXY_NAME_FETCH', readerProxy.id);
            this.$store.dispatch('PVL_PROXY_NAME_FETCH', info);
            this.$store.dispatch('PVL_PROXY_PIPELINE_FETCH');
            this.$store.dispatch('PVL_MODULES_ACTIVE_CLEAR');
            this.$store.commit('PVL_PROXY_SELECTED_IDS_SET', [readerProxy.id]);
          })
          .catch(console.error);
      },
      openDirectory(directoryName) {
        console.log('openDirectory ', directoryName);
        this.listServerDirectory(this.path.concat(directoryName).join('/'));
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
    mapActions({ removeActiveModule: 'PVL_MODULES_ACTIVE_CLEAR' })
  ),
  mounted() {
    console.log('mounted files path', this.path);
    console.log('mounted files ', this.active.directory);
    this.listServerDirectory(this.active.directory);
    if (this.active.directory != '.'){
      console.log('opening directory');
      this.openDirectory(this.active.directory);
    }
    else
      console.log('not opening directory');
  },
};
