<template>
  <GraphLufs
    class="graph-data"
    :instantLUFS="instantLUFS"
    :lufsData="lufsData"
    :progress="progress"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from "vue";
import GraphLufs from "./GraphLufs.vue";

const props = defineProps({
  instantLUFS: {
    type: Number,
    required: true,
  },
  progress: {
    type: Number,
    required: true,
  },
  lufsData: {
    type: Array as PropType<number[]>,
    required: false,
    default: () => [],
  },
});

const instantLUFS = ref(props.instantLUFS);

watch(
  () => props.instantLUFS,
  (newLUFS) => {
    instantLUFS.value = newLUFS;
  }
);
</script>

<style scoped>
.lufs-container {
  width: 100%;
  height: 100%;
}
</style>
