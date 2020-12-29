import { generateComponentWithServerBinding } from 'paraview-lite/src/proxyHelper';

import module from './module';

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
    computed: {
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
  }
);
