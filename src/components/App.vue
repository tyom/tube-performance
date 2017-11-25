<!--suppress CheckEmptyScriptTag -->
<template>
  <div id="app">
    <navigation :items="getNavItems({ selected: selectedMetric })"/>
    <div class="metric">
      <h1>{{ selectedMetric.title }}</h1>
      <div class="period" v-for="(period, name) in selectedMetric.periods">
        <bar-chart :title="name" :options="period" v-if="period.series.length"/>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import format from 'date-fns/format'
  import map from 'lodash/map'

  import Navigation from './Navigation'
  import BarChart from './BarChart'
  import { LINE_COLOURS } from '../constants'

  export default {
    data () {
      return {
        metrics: null,
        selectedMetric: {},
      }
    },

    components: {
      BarChart,
      Navigation,
    },

    async created () {
      const metrics = await axios('/data/metrics.json').then(res => res.data)

      this.metrics = map(metrics, metric => {
        const periods = Object.keys(metric.periods).reduce((acc, value) => {
          acc[value] = this.transformToChartData(metric.periods[value])
          return acc
        }, {})

        return Object.assign({}, metric, {
          periods
        })
      })

      this.selectedMetric = this.metrics[0]
    },

    methods: {
      getNavItems ({ selected }) {
        return map(this.metrics, metric => ({
          slug: metric.slug,
          label: metric.title,
          isSelected: metric.slug === selected.slug,
        }))
      },

      transformToChartData (data) {
        return {
          xAxis: {
            categories: data.dates.map((d, i) => ({
              label: `fwap ${i + 1}`,
              range: data.dates[i],
            })),
            labels: {
              format: '{value.label}',
            },
            crosshair: true,
          },
          yAxis: {
            title: {
              text: null
            }
          },
          series: Object.keys(data.items)
            .map((item, i) => {
              if (!data.items[item].length) { return }
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
    padding: 0;
    margin: 0;
  }

  .metric {
    padding: 20px;
  }
</style>
