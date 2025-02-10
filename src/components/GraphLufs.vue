<template>
  <div class="container">
    <div class="left-div flex flex-col" ref="leftDiv">
      <div class="graph-vertical relative">
        <div class="value-labels">
          <span v-for="n in valueLabels" :key="n" class="value-label">{{ n }}</span>
        </div>
        <div class="inner-container">
          <div class="inner-div" :style="{ height: lufsHeight + 'px' }"></div>
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
      <v-chart ref="chartRef" class="lufs-graphic" :option="chartOptions" autoresize />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, onMounted, nextTick } from "vue";
import { use } from "echarts/core";
import { LineChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
} from "echarts/components";
import VChart from "vue-echarts";

use([
  LineChart,
  CanvasRenderer,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
]);

const props = defineProps({
  instantLUFS: { type: Number, required: true },
  progress: { type: Number, required: true },
  lufsData: {
    type: Array as () => number[],
    required: false,
    default: () => [],
  },
});

const categories = ref<string[]>([]);
const lufsValues = ref<number[]>([]);
const zoomStart = ref(0);
const zoomEnd = ref(100);
const chartRef = ref(null);

const chartOptions = ref({
  title: {
    text: "LUFS en fonction du temps",
    left: "center",
    textStyle: { color: "#585b7d", fontSize: 18 },
  },
  tooltip: { trigger: "axis" },
  xAxis: {
    type: "category",
    name: "Temps (s)",
    data: categories.value,
    boundaryGap: false,
    nameTextStyle: { color: "#585b7d", fontSize: 14 },
    axisLabel: {
      color: "#cf4fcf",
      fontSize: 14,
      fontWeight: "bold",
    },
  },
  yAxis: {
    type: "value",
    min: 0,
    max: 30,
    name: "LUFS",
    nameTextStyle: { color: "#585b7d", fontSize: 14 },
    axisLabel: { formatter: (value: number) => Math.round(value).toString() },
    splitLine: { show: false },
  },
  series: [
    {
      name: "LUFS instantanés",
      type: "line",
      smooth: true,
      showSymbol: false,
      data: lufsValues.value,
      lineStyle: { width: 3, color: "#cf4fcf" },
      animationDuration: 4000,
      animationEasing: "easeOutCubic",
    },
  ],
  grid: {
    left: "5%",
    right: "5%",
    bottom: "10%",
    top: "15%",
    containLabel: true,
  },
  legend: { show: false },
  dataZoom: [{ type: "inside", start: zoomStart.value, end: zoomEnd.value }],
});

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

const leftDiv = ref<HTMLElement | null>(null);
const leftDivHeight = ref(300);
const lufsHeight = ref(0);

onMounted(() => {
  nextTick(() => {
    if (leftDiv.value) {
      leftDivHeight.value = leftDiv.value.clientHeight;
    }
  });
});

watch(
  () => props.instantLUFS,
  (newInstantLUFS) => {
    const positiveLUFS = Math.max(0, Math.min(30, newInstantLUFS));

    lufsValues.value.push(positiveLUFS);
    categories.value.push(`${props.progress.toFixed(2)}s`);

    chartOptions.value.xAxis.data = [...categories.value];
    chartOptions.value.series[0].data = [...lufsValues.value];

    const usableHeight = leftDivHeight.value - 40;
    lufsHeight.value = (positiveLUFS / 30) * usableHeight;
  }
);

const valueLabels = [0, 5, 10, 15, 20, 25, 30];
</script>

<style scoped>
.inner-div {
  background-color: #cf4fcf;
}

.chart-container {
  flex-grow: 1;
  height: 100%;
}

.lufs-graphic {
  width: 100%;
  height: 100%;
}

@media (max-width: 600px) {
  .container {
    flex-direction: column;
  }

  .chart-container {
    height: 300px;
  }

  .left-div {
    width: 100%;
    height: 100%;
  }
}
</style>