import { generateComponentWithServerBinding } from 'paraview-lite/src/proxyHelper';

import module from './module';

/* eslint-disable prettier/prettier */
import { mapGetters, mapActions } from 'vuex';

export default generateComponentWithServerBinding(
  'Mesh',
  'Source',
  {
    //TODO: ClipType
    resolution: {
      name: 'Resolution',
      autoApply: false,
      default: 0.5,
      subProxy: 'ClipType',
    },
  },
  {
    name: 'Mesh',
    data() {
      return {
        module,
        color: 'grey darken-2',
        normalMode: 3,
      };
    },
    // computed: {
    //   resolution: {
    //     get() {
    //       // register dependency
    //       this.mtime; // eslint-disable-line
    //       return this.resolution;
    //     },
    //     set(value) {
    //       this.mtime++;
    //       this.resolution = value;
    //       // this.$forceUpdate();
    //     },
    //   },
    //   mapGetters({
    //     client: 'PVL_NETWORK_CLIENT',
    //     active: 'PVL_MODULES_ACTIVE',
    //   })
    // },
    computed: Object.assign(
      {
        file() {
          const nameMeta = this.names[this.proxies[0]];
          return nameMeta ? nameMeta.file : 'No file';
        },
        resolution: {
          get() {
            // register dependency
            this.mtime; // eslint-disable-line
            return this.resolution;
          },
          set(value) {
            this.mtime++;
            this.resolution = value;
            // this.$forceUpdate();
          },
        },
      },
      mapGetters({
        proxies: 'PVL_PROXY_SELECTED_IDS',
        names: 'PVL_PROXY_NAME_MAP',
        client: 'PVL_NETWORK_CLIENT',
      })
    ),

    methods: Object.assign({
      openFiles() {
        console.log('mesh openFiles');
        console.log('mesh file', this.file, 'type ', typeof(this.file));
        //this.client.remote.ProxyManager.open('sergi_files2/foam.foam')
        this.client.remote.ProxyManager.open(this.file)
          .then((readerProxy) => {
            let info = { id: readerProxy.id, file: this.file};
            console.log('mesh then ', info);
            // this.$store.dispatch('PVL_PROXY_NAME_FETCH', readerProxy.id);
            this.$store.dispatch('PVL_PROXY_NAME_FETCH', info);
            this.$store.dispatch('PVL_PROXY_PIPELINE_FETCH');
            this.$store.dispatch('PVL_MODULES_ACTIVE_CLEAR');
            this.$store.commit('PVL_PROXY_SELECTED_IDS_SET', [readerProxy.id]);
          })
          .catch(console.error);
      },
    }),
  }
);
