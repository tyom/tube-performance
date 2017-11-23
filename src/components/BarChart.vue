<script>
  import axios from 'axios'
  import { format } from 'date-fns'
  import { Bar, mixins } from 'vue-chartjs'
  const { reactiveProp } = mixins

  export default {
    extends: Bar,
    mixins: [reactiveProp],
    props: ['chartData', 'options'],
    mounted () {
      this.renderChart(this.chartData, this.options)
    },
  }
</script>
