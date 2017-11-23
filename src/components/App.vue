<template>
  <div id="app">
    <h2>Platform wait time</h2>
    <div class="period" v-for="(period, name) in periods">
      <h3>{{ name }}</h3>
      <bar-chart :chartData="period" :options="{ maintainAspectRatio: false }" class="chart" v-if="period.datasets.length"/>
      <p v-else>No data</p>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import { format } from 'date-fns'

  import BarChart from './BarChart'
  import { LINE_COLOURS } from '../constants'

  export default {
    data () {
      return {
        periods: null,
      }
    },

    components: {
      BarChart,
    },

    async created () {
      const periods = await axios('/data/platform-wait-time.json').then(res => res.data)
      this.periods = Object.keys(periods).reduce((acc, value) => {
        acc[value] = this.transformToChartData(periods[value])
        return acc
      }, {})
    },

    methods: {
      transformToChartData (data) {
        return {
          labels: data.dates.map(d => `${format(d.from, 'D/MM/YY')}-${format(d.to, 'D/MM/YY')}`),
          datasets: Object.keys(data.items)
            .map(item => {
              if (!data.items[item].length) { return null }
              return {
                label: item,
                backgroundColor: LINE_COLOURS[item] || '#777',
                data: data.items[item],
              }
            })
            .filter(x => x)
        }
      },
    }
  }
</script>

<style>
</style>
