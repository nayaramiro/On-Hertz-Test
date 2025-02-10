<template>
  <div class="container w-full h-full">
    
    <div class="left-div">
      
      <div class="value-labels">
        <span v-for="n in valueLabels" :key="n" class="value-label">{{
          n
        }}</span>
      </div>

      
      <div class="inner-container">
        <div class="inner-div" :style="{ height: rmsHeight + 'px' }"></div>
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
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";

use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

const chartOptions = ref({
  title: {
    text: "Évolution du RMS dans le temps",
    left: "center",
    top: "10px",
    textStyle: {
      color: "#585b7d",
      fontSize: 18,
      fontWeight: "bold",
    },
  },
  xAxis: {
    type: "category",
    data: [] as string[],
    axisLabel: {
      interval: 0,
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
    name: "",
    axisLabel: {
      show: true,
      formatter: "{value}",
    },
    min: 0, 
    max: 30, 
    interval: 5, 
    splitLine: { show: false },
    data: [0, 5, 10, 15, 20, 25, 30], 
  },
  series: [
    {
      data: [] as number[],
      type: "line",
      smooth: true,
      itemStyle: {
        color: "#1ABC9C",
      },
      areaStyle: {
        color: "rgba(26, 188, 156, 0.3)",
      },
      animationDuration: 2000,
      animationEasing: "cubicOut" as "AnimationEasing",
    },
  ],
  tooltip: {
    trigger: "axis",
  },
  animationDurationUpdate: 10000,
  animationEasingUpdate: "cubicOut" as "AnimationEasing",
  grid: {
    left: "3%",
    right: "4%",
    bottom: "10%",
    containLabel: true,
    show: false,
  },
});

const chartRef = ref(null);

const props = defineProps({
  rms: {
    type: Number,
    default: 0,
  },
  progress: {
    type: Number,
    default: 0,
  },
});

const valueLabels = [0, 5, 10, 15, 20, 25, 30];


const maxDataLength = 10;

watch([() => props.rms, () => props.progress], () => {
  chartOptions.value.series[0].data.push(props.rms);
  chartOptions.value.xAxis.data.push(Math.round(props.progress).toString());

  if (chartOptions.value.xAxis.data.length > maxDataLength) {
    chartOptions.value.xAxis.data.shift();
    chartOptions.value.series[0].data.shift();
  }

  const step = Math.ceil(chartOptions.value.xAxis.data.length / 4);
  chartOptions.value.xAxis.axisLabel.interval = step;
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

onMounted(async () => {
  await nextTick(() => {
    const chartInstance = chartRef.value?.echarts;
    chartInstance?.resize();
  });
});
</script>

<style scoped>
.chart-container {
  flex-grow: 1;
  height: 300px;
}

/* Barre dynamique */
.inner-div {
  background-color: #1abc9c;
}

/* Responsive */
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
