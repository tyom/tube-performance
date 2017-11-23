<template>
  <highcharts :options="chartData"/>
</template>

<script>
  import merge from 'lodash/merge'

  export default {
    data () {
      return {
        defaults: {
          chart: {
            type: 'column',
          },
          plotOptions: {
            column: {
              stacking: 'percent',
              dataLabels: {
                enabled: false,
                formatter () {
                  return `${Math.round(this.percentage)}`
                },
              }
            }
          },
        }
      }
    },
    props: ['title', 'subtitle', 'options'],
    created () {
      this.chartData = merge({}, this.defaults, this.options, {
        title: {
          text: this.title,
        },
        subtitle: {
          text: this.subtitle,
        }
      })
    }
  }
</script>
