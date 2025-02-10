<script setup lang="ts">
import { defineProps, ref } from "vue";

const props = defineProps<{ startAudioContext: () => void }>();

const heights = ref<number[]>([2, 4, 10, 5, 3]);
const colors = ref<string[]>([
  "#ea702a",
  "#fab429",
  "#62cbb8",
  "#2da6be",
  "#006bb8",
  "#5356ac",
  "#983a98",
  "#c91870",
  "#d81838",
]);
const barColors = ref<string[]>(Array(5).fill("#3498db")); 

let intervalId: number | null = null; 
const startRandomEffects = () => {
  if (!intervalId) {
    
    intervalId = setInterval(() => {
      heights.value = heights.value.map(() => Math.floor(Math.random() * 16)); 
      barColors.value = barColors.value.map(
        () => colors.value[Math.floor(Math.random() * colors.value.length)]
      ); 
    }, 200); 
  }
};

const stopRandomEffects = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};
</script>

<template>
  <button
    @mouseover="startRandomEffects"
    @mouseleave="stopRandomEffects"
    @click="startAudioContext"
    class="start-button flex items-end"
  >
    Onward to discovery!
    <div
      v-for="(height, index) in heights"
      :key="index"
      :style="{ height: height + 'px', backgroundColor: barColors[index] }"
      class="bar w-2"
    ></div>
  </button>
</template>
