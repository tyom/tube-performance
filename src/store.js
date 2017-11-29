import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import map from 'lodash/map'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    metrics: {},
    selectedMetric: {},
  },
  mutations: {
    getData: (state, payload) => {
      state.metrics = payload
    },
    selectMetric: (state, payload) => {
      state.selectedMetric = state.metrics.find(metric => metric.slug === payload)
    }
  },
  actions: {
    async getData ({ commit }, metricTransformer) {
      const responseData = await axios('metrics.json').then(res => res.data)
      const metrics = map(responseData, metricTransformer)

      commit('getData', metrics)
    },
  }
})

export default store
