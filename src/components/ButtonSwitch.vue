

<script setup lang="ts">
import { useTheme } from './lit/audio-player/SwitcherTheme';
const {isDarkMode, toggleTheme} = useTheme()


</script>
<template>
  
      <button
      class="switch-theme absolute z-90 w-20 h-20 flex items-center justify-center rounded-full p-5"
      @click="toggleTheme">
        <fa :icon="isDarkMode ? 'moon' : 'sun'">Working</fa>
      </button>
    
</template>