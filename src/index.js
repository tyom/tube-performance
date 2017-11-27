import Vue from 'vue'
import VueHighcharts from 'vue-highcharts'

import App from './components/App.vue'
import store from './store'
import router from './router'

Vue.use(VueHighcharts)

new Vue({
  store,
  router,
  el: '#app',
  render: h => h(App)
})
