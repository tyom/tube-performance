import Vue from 'vue'
import VueRouter from 'vue-router'
import VueHighcharts from 'vue-highcharts'

import App from './components/App.vue'
import Metric from './components/Metric'
import store from './store'

const router = new VueRouter({
  routes: [
    { path: '/:slug', component: Metric },
  ],
})

Vue.use(VueRouter)
Vue.use(VueHighcharts)

new Vue({
  store,
  router,
  el: '#app',
  render: h => h(App)
})
