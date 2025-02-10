<script lang="ts">
import { ref } from "vue";

export default {
  props: {
    progress: Number,
    duration: Number,
  },
  setup(props, { emit }) {
    const isPlaying = ref(true);

    const togglePlayPause = () => {
      isPlaying.value = !isPlaying.value;
      emit("toggle-music", isPlaying.value);
    };

    const rewind = () => {
      emit("rewind-music");
    };

    const forward = () => {
      emit("forward-music");
    };

    const seek = (event: Event) => {
      const newTime = parseFloat((event.target as HTMLInputElement).value);
      emit("seek-music", newTime);
    };

    return { isPlaying, togglePlayPause, rewind, forward, seek };
  },
};
</script>

<template>
  <div class="music-controls w-full flex items-center p-5 flex-col">
    <img src="../img/monkey.jpg" class="h-30 w-auto rounded-xl" alt="monkey" />
    <p class="title w-80 text-start">Monkeys</p>
    <input
      type="range"
      :min="0"
      :max="duration || 1"
      :value="progress"
      @input="seek($event)"
      class="w-80"
    />
    <div class="buttons w-80 flex justify-between py-2 items-center">
      <button @click="rewind">
        <fa icon="backward" />
      </button>

      <button @click="togglePlayPause">
        <fa :icon="isPlaying ? 'play' : 'pause'" />
      </button>

      <button @click="forward">
        <fa icon="forward" />
      </button>
    </div>
  </div>
</template>
