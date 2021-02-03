import { generateComponentWithServerBinding } from 'paraview-lite/src/proxyHelper';

import { mapGetters } from 'vuex';
import module from './module';

/* eslint-disable prettier/prettier */

export default generateComponentWithServerBinding(
  'Mesh',
  'Source',
  {
    //TODO: ClipType
    resolution: {
      name: 'Resolution',
      autoApply: false,
      default: 500,
      subProxy: 'ClipType',
    },
    xTopology: {
      name: 'xTopology',
      autoApply: false,
      default: 1,
      subProxy: 'ClipType',
    },
    yTopology: {
      name: 'yTopology',
      autoApply: false,
      default: 1,
      subProxy: 'ClipType',
    },
    zTopology: {
      name: 'zTopology',
      autoApply: false,
      default: 1,
      subProxy: 'ClipType',
    }
  },
  {
    name: 'Mesh',
    data() {
      return {
        module,
        color: 'grey darken-2',
        normalMode: 3,
        refinements: []
      };
    },

    mounted: function () {
      this.client.remote.Lite.meshGetRefinementSurfaces(this.path).then(function (value) {
        value.forEach(element => this.refinements.push({label:element,min:0,max:0}));
        console.log('mounted meshGetRefinementSurfaces then items', this.refinements);
        // this.refinements.forEach(element => console.log(typeof(element.min),element.min,typeof(element.max),element.max));
        this.client.remote.Lite.meshGetPersistence(this.path,this.refinements).then(function (persistence) {
          if (persistence != null){
            console.log('persistence:', persistence);
            if (persistence.hasOwnProperty('resolution')){
              this.resolution = persistence['resolution']
              // console.log('persistence resolution ', this.resolution);
            }
            if (persistence.hasOwnProperty('xTopology')){
              this.xTopology = persistence['xTopology']
              // console.log('persistence xTopology ', this.xTopology);
            }
            if (persistence.hasOwnProperty('yTopology')){
              this.yTopology = persistence['yTopology']
              // console.log('persistence yTopology ', this.xTopology);
            }
            if (persistence.hasOwnProperty('zTopology')){
              this.zTopology = persistence['zTopology']
              // console.log('persistence zTopology ', this.xTopology);
            }
            if (persistence.hasOwnProperty('refinements')){
              this.refinements = persistence['refinements']
              // console.log('persistence refinements ', this.refinements);
            }
          }
          else
            console.log('persistence data not found using defaults');
        }.bind(this));
      }.bind(this));
    },

    computed: Object.assign(
      {
        file() {
          const nameMeta = this.names[this.proxies[0]];
          return nameMeta ? nameMeta.file : 'No file';
        },
        path() {
          const nameMeta = this.names[this.proxies[0]];
          return nameMeta ? nameMeta.file[0].split('/')[0] : 'No path';
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
        xTopology: {
          get() {
            // register dependency
            this.mtime; // eslint-disable-line
            return this.xTopology;
          },
          set(value) {
            this.mtime++;
            this.xTopology = value;
            // this.$forceUpdate();
          },
        },
        yTopology: {
          get() {
            // register dependency
            this.mtime; // eslint-disable-line
            return this.yTopology;
          },
          set(value) {
            this.mtime++;
            this.yTopology = value;
            // this.$forceUpdate();
          },
        },
        zTopology: {
          get() {
            // register dependency
            this.mtime; // eslint-disable-line
            return this.zTopology;
          },
          set(value) {
            this.mtime++;
            this.zTopology = value;
            // this.$forceUpdate();
          },
        }
      },
      mapGetters({
        proxies: 'PVL_PROXY_SELECTED_IDS',
        names: 'PVL_PROXY_NAME_MAP',
        client: 'PVL_NETWORK_CLIENT',
      })
    ),

    methods: Object.assign({
      openFiles() {

        this.refinements.forEach(element => console.log(parseInt(element.min),parseInt(element.max)));
        console.log('resolution ', this.resolution);
        console.log('refinements ', this.refinements);
        let that = this;
        this.client.remote.Lite.meshRun(this.path, this.resolution, this.refinements, this.xTopology, this.yTopology, this.zTopology).then(function (value) {
          console.log('meshRun', value);
          // this.refinements.forEach(element => console.log(typeof(element.min),element.min,typeof(element.max),element.max));

          //TODO: call openFoam mesh commands and then open
          console.log('mesh file', that.file, 'type ', typeof (that.file));

          //that.client.remote.ProxyManager.open('sergi_files2/foam.foam')
          that.client.remote.ProxyManager.open(that.file)
            .then((readerProxy) => {
              let info = { id: readerProxy.id, file: that.file };
              console.log('mesh then ', info);
              // that.$store.dispatch('PVL_PROXY_NAME_FETCH', readerProxy.id);
              that.$store.dispatch('PVL_PROXY_NAME_FETCH', info);
              that.$store.dispatch('PVL_PROXY_PIPELINE_FETCH');
              that.$store.dispatch('PVL_MODULES_ACTIVE_CLEAR');
              that.$store.commit('PVL_PROXY_SELECTED_IDS_SET', [readerProxy.id]);
            })
            .catch(console.error);
        });



      },
    }),
  }
);
