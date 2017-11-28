import Vue from 'vue'
import VueRouter from 'vue-router'

import Metric from './components/Metric'

Vue.use(VueRouter)

export default  new VueRouter({
  routes: [
    { name: 'metric', path: '/:slug', component: Metric },
    { path: '/', redirect: '/platform-wait-time' },
  ],
})
