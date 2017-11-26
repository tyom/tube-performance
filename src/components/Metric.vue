<template>
  <div class="metric" v-if="metricData">
    <h1>{{ metricData.title }}</h1>
    <div class="period" v-for="(period, name) in metricData.periods" v-if="period.series.length">
      <bar-chart :title="name" :options="period"/>
    </div>
  </div>
</template>

<script>
  import BarChart from './BarChart'

  export default {
    props: ['data'],
    components: {
      BarChart,
    },
    computed: {
      metricData () {
        if (!this.$store.state.selectedMetric.periods) { return }
        return Object.assign({}, this.$store.state.selectedMetric, this.data)
      },
    },
  }
</script>

<style>
  .metric {
    padding: 20px;
  }
</style>
