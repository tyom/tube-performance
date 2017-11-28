<template>
  <div id="app">
    <navigation class="navigation" :items="navItems" :selected="$store.state.selectedMetric"/>
    <router-view/>
  </div>
</template>

<script>
  import axios from 'axios'
  import format from 'date-fns/format'
  import map from 'lodash/map'
  import get from 'lodash/get'

  import Navigation from './Navigation'
  import { LINE_COLOURS } from '../constants'

  export default {
    components: {
      Navigation,
    },

    computed: {
      navItems () {
        return map(this.$store.state.metrics, metric => ({
          slug: metric.slug,
          label: metric.title,
          isSelected: metric.slug === get(this.$store, 'state.selectedMetric')
        }))
      }
    },

    async created () {
      await this.$store.dispatch('getData', this.transformMetric)

      this.$store.commit('selectMetric', this.$route.params.slug)
    },

    watch: {
      '$route': {
        handler (route) {
          this.$store.commit('selectMetric', route.params.slug)
        },
      }
    },

    methods: {
      transformMetric (metric) {
        const periods = Object.keys(metric.periods).reduce((acc, value) => {
          acc[value] = this.transformPeriodToChartData(metric.periods[value])
          return acc
        }, {})

        return Object.assign({}, metric, {
          periods
        })
      },

      transformPeriodToChartData (period) {
        return {
          credits: {
            enabled: false,
          },
          xAxis: {
            categories: period.dates.map((d, i) => ({
              label: `fwap ${i + 1}`,
              range: period.dates[i],
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
          series: Object.keys(period.items)
            .map((item) => {
              if (!period.items[item].length) { return }
              return {
                name: item,
                data: period.items[item],
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

  #app {
    display: flex;
    min-height: 100vh;
  }

  .navigation {
    width: 20%;
    min-width: 200px;
    flex-direction: column;
    flex-shrink: 0;
  }

  .metric {
    width: 80%;
  }
</style>
