<template>
  <div class="metric" v-if="metricData">
    <h1>{{ metricData.title }}</h1>
    <nav>
      <router-link
        :to="{ name: 'metric', query: {period: buildPeriodQueryValue(period.label)} }"
        :key="period.label"
        :class="{ selected: isSelectedPeriod(period.label) }"
        v-for="period in availablePeriods"
      >
        <span>{{ period.label }}</span>
      </router-link>
    </nav>
    <div class="period" v-for="period in selectedPeriods">
      <bar-chart :title="period.label" :options="period"/>
    </div>
  </div>
</template>

<script>
  import map from 'lodash/map'
  import flatten from 'lodash/flatten'
  import uniq from 'lodash/uniq'
  import BarChart from './BarChart'

  export default {
    props: ['data'],
    components: {
      BarChart,
    },
    methods: {
      buildPeriodQueryValue (periodLabel) {
        const selectedPeriodLabels = this.selectedPeriods.map(p => p.label)

        if (selectedPeriodLabels.includes(periodLabel)) {
          return selectedPeriodLabels.filter(label => label !== periodLabel)
        }

        return [periodLabel].concat(selectedPeriodLabels)
      },

      isSelectedPeriod (periodLabel) {
        return this.selectedPeriods
          .map(p => p.label)
          .includes(periodLabel)
      }
    },
    computed: {
      metricData () {
        const metric = this.$store.state.selectedMetric
        if (!metric.periods) { return }
        return Object.assign({}, metric, this.data)
      },

      availablePeriods () {
        return map(
          this.metricData.periods,
          (period, name) => Object.assign({}, period, {
            label: name,
          })
        )
          .filter(period => period.series.length)
          .reverse()
      },

      selectedPeriods () {
        const periodQuery = this.$route.query.period

        if (!periodQuery) {
          return [this.availablePeriods[0]]
        }

        const getPeriodByLabel = label => this.availablePeriods.find(period => period.label === label)

        return flatten([this.$route.query.period])
          .map(getPeriodByLabel)
      },
    }
  }
</script>

<style scoped>
  .metric {
    padding: 40px 30px;
  }

  h1 {
    margin: 0 0 40px;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    margin: 40px 0;
    line-height: 1;
    font-weight: bold;
    font-size: .9em;
    overflow: auto;
    width: 100%;
  }

  nav a {
    padding: 10px;
    margin-top: 2px;
    margin-right: 2px;
    text-decoration: none;
    color: #2b68c0;
  }

  nav a span {
    padding: 5px;
    margin: -5px;
    overflow: hidden;
    display: block;
  }

  nav a:hover {
    background-color: #eee;
    color: #000;
  }

  nav a:hover span {
    width: auto;
  }

  nav .selected {
    background-color: #222;
    color: #fff;
  }

  nav .selected:hover {
    background-color: #777;
    color: #fff;
  }
</style>
