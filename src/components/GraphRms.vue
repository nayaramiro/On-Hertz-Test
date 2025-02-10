<template>
  <div class="container w-full h-full">
    <div class="left-div">
      <div class="graph-vertical relative">
        <div class="value-labels">
          <span v-for="n in valueLabels" :key="n" class="value-label">{{
            n
          }}</span>
        </div>
        <div class="inner-container">
          <div class="inner-div" :style="{ height: rmsHeight + 'px' }"></div>
        </div>
      </div>
      <div class="buttons w-full">
        <div class="container">
          <fa class="reset" icon="fa-arrow-rotate-left" @click="resetZoom" />
          <div class="box">
            <fa icon="magnifying-glass-plus" @click="zoomIn" />
            <fa icon="magnifying-glass-minus" @click="zoomOut" />
          </div>
        </div>
      </div>
    </div>
    <div class="chart-container">
      <v-chart ref="chartRef" class="chart" :option="chartOptions" autoresize />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { use } from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";

use([
  LineChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

const chartRef = ref(null);
const props = defineProps({
  rms: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
});

const valueLabels = [0, 5, 10, 15, 20, 25, 30];
const categories = ref<string[]>([]);
const rmsValues = ref<number[]>([]);
const zoomStart = ref(0);
const zoomEnd = ref(100);

const chartOptions = ref({
  title: {
    text: "Évolution du RMS dans le temps",
    left: "center",
    top: "10px",
    textStyle: { color: "#585b7d", fontSize: 18, fontWeight: "bold" },
  },
  tooltip: {
    trigger: "axis",
    formatter: (params: any) => {
      const dataPoint = params[0];
      return `<strong>Temps: ${dataPoint.name}s</strong><br />RMS: ${dataPoint.value}`;
    },
  },
  xAxis: {
  type: "category",
  data: [] as string[],
  axisLabel: {
    interval: function (index) {
      const totalPoints = chartOptions.value.xAxis.data.length;
      return index % Math.ceil(totalPoints / 5) === 0 ? true : false;
    },
    rotate: 45,
  },
  name: "Secondes",
  nameLocation: "middle",
  nameTextStyle: {
    fontSize: 14,
    color: "#585b7d",
  },
},

  yAxis: {
    type: "value",
    min: 0,
    max: 30,
    interval: 5,
    splitLine: { show: false },
  },
  series: [
    {
      name: "RMS instantanés",
      type: "line",
      smooth: true,
      showSymbol: false,
      data: rmsValues.value,
      itemStyle: { color: "#1ABC9C" },
      areaStyle: { color: "rgba(26, 188, 156, 0.3)" },
      animationDuration: 2000,
      animationEasing: "cubicOut",
    },
  ],
  grid: {
    left: "3%",
    right: "4%",
    bottom: "10%",
    containLabel: true,
    show: false,
  },
  dataZoom: [{ type: "inside", start: zoomStart.value, end: zoomEnd.value }],
});

watch([() => props.rms, () => props.progress], () => {
  rmsValues.value.push(props.rms);
  categories.value.push(Math.round(props.progress).toString());
  chartOptions.value.xAxis.data = [...categories.value];
  chartOptions.value.series[0].data = [...rmsValues.value];
});

const leftDivHeight = ref(0);
onMounted(() => {
  leftDivHeight.value =
    document.querySelector(".left-div")?.clientHeight || 300;
});

const rmsHeight = ref(0);
watch(
  () => props.rms,
  (newRms) => {
    const usableHeight = leftDivHeight.value - 13;
    rmsHeight.value = (newRms / 30) * usableHeight;
  }
);

const zoomIn = () => {
  zoomStart.value = Math.min(zoomStart.value + 10, 90);
  zoomEnd.value = Math.max(zoomEnd.value - 10, 20);
  chartOptions.value.dataZoom[0].start = zoomStart.value;
  chartOptions.value.dataZoom[0].end = zoomEnd.value;
};

const zoomOut = () => {
  zoomStart.value = Math.max(zoomStart.value - 10, 0);
  zoomEnd.value = Math.min(zoomEnd.value + 10, 100);
  chartOptions.value.dataZoom[0].start = zoomStart.value;
  chartOptions.value.dataZoom[0].end = zoomEnd.value;
};

const resetZoom = () => {
  zoomStart.value = 0;
  zoomEnd.value = 100;
  chartOptions.value.dataZoom[0].start = zoomStart.value;
  chartOptions.value.dataZoom[0].end = zoomEnd.value;
};
</script>

<style scoped>
.chart-container {
  flex-grow: 1;
  height: 300px;
}

.inner-div {
  background-color: #1abc9c;
}

@media (max-width: 600px) {
  .container {
    flex-direction: column;
  }
  .chart-container {
    height: 200px;
  }
  .left-div {
    width: 100%;
    height: 100%;
  }
}
</style>
