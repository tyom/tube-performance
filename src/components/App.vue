<!--suppress CheckEmptyScriptTag -->
<template>
  <div id="app">
    <h1>Platform wait time</h1>
    <div class="period" v-for="(period, name) in periods">
      <bar-chart :title="name" :options="period" v-if="period.series.length"/>
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
          xAxis: {
            categories: data.dates.map((d, i) => `fwap ${i + 1}`),
            crosshair: true,
          },
          yAxis: {
            min: 0,
            title: {
              text: null
            }
          },
          series: Object.keys(data.items)
            .map(item => {
              if (!data.items[item].length) { return null }
              return {
                name: item,
                data: data.items[item],
                color: LINE_COLOURS[item] || '#777',
              }
            })
            .filter(x => x)
        }
      },
    }
  }
</script>

<style>
  body {
    font: 16px/1.4 'Helvetica Neue', Arial, sans-serif;
  }
</style>
