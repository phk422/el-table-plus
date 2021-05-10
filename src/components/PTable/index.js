import PTable from './src/index.vue'

/* istanbul ignore next */
PTable.install = function(Vue) {
  Vue.component(PTable.name, PTable);
}

export default PTable