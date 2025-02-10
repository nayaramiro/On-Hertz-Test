<script setup lang="ts">
import { defineProps } from "vue";
import GraphRms from "./GraphRms.vue";

const props = defineProps<{ rms: number; progress: number }>();
</script>

<template>
    <GraphRms class="graph-data" :rms="props.rms" :progress="props.progress" />
  
</template>
