<template>
  <highcharts :options="chartData"/>
</template>

<script>
  import merge from 'lodash/merge'
  import format from 'date-fns/format'

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
              },
            },
          },
          tooltip: {
            shared: true,
            useHTML: true,
            backgroundColor: 'rgba(255,255,255,.95)',
            borderColor: '#777',
            formatter () {
              const formatter = dateString => format(dateString, 'D MMM \'YY')
              const { from, to } = this.x.range
              const heading = `${formatter(from)} - ${formatter(to)}`

              const rows = this.points
                .map(point => `
                  <tr>
                    <th class="series-legend"><i class="legend-icon" style="background-color: ${point.color}"></i></th>
                    <th class="series-name">${point.series.name}</th>
                    <td class="series-value">${Math.round(point.percentage)}%</td>
                  </tr>
                `)
                .join('')

              return `
                <b class="tooltip-heading">${heading}</b>
                <table>
                  ${rows}
                </table>
              `
            },
          },
        },
      }
    },
    props: ['title', 'subtitle', 'options'],
    created () {
      this.chartData = merge({}, this.defaults, this.options, {
        title: {
          text: this.title,
          align: 'left',
        },
        subtitle: {
          text: this.subtitle,
        },
      })
    },
  }
</script>

<style>
  .series-legend {
    width: 1%;
    padding-right: 5px;
  }

  .legend-icon {
    display: inline-block;
    width: 10px;
    height: 10px;
  }

  .tooltip-heading {
    font-size: 1.2em;
    display: block;
    padding: 0 0 5px;
    margin-bottom: 5px;
    border-bottom: 1px solid #aaa;
  }
</style>
