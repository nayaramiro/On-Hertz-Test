<template>
  <main>
    <template v-if="audioContext">
      <div class="container relative w-screen h-screen">
        <ButtonSwitch />

        <!-- Mobile -->
        <div class="content content-mobile p-5 relative" v-if="width < 860">
          <div class="menu">
            <a href="https://www.on-hertz.com/">
              <img src="./img/LogoLight.png" alt="" class="night" />
              <img src="./img/Logo.png" alt="" class="light" />
            </a>
          </div>

          <div class="graph">
            <div class="graph-toggle">
              <button @click="setGraphActive('Globe')" :class="{ active: activeGraph === 'Globe' }">GLOBE</button>
              <button @click="setGraphActive('RMS')" :class="{ active: activeGraph === 'RMS' }">RMS</button>
              <button @click="setGraphActive('LUFS')" :class="{ active: activeGraph === 'LUFS' }">LUFS</button>
            </div>

            <div v-if="activeGraph === 'Globe'" class="Globe container">
              <Globe :isPlaying="isPlaying" :bubbleColor="bubbleColor" :rms="instantRMS" :audioElement="audioRef" />
            </div>
            <div v-if="activeGraph === 'RMS'" class="RMS container">
              <RMS :rms="instantRMS" :progress="progress" @update:rms="updateRMS" />
            </div>
            <div v-if="activeGraph === 'LUFS'" class="LUFS container">
              <Lufs :instantLUFS="instantLUFS" :lufsData="lufsData" :progress="progress" />
            </div>
          </div>

          <div class="bottom rounded-xl">
            <AudioButtons
              :audioElement="audioRef"
              @toggle-music="toggleMusic"
              @rewind-music="rewindMusic"
              @forward-music="forwardMusic"
              :progress="progress"
              :duration="duration"
              @seek-music="seekMusic"
            />
          </div>
        </div>

        <!-- Desktop -->
        <div v-if="width >= 860" class="content content-desktop grid grid-cols-2">
          <div class="left grid grid-rows-2 p-5">
            <Globe :isPlaying="isPlaying" class="row-span-4" :bubbleColor="bubbleColor" :rms="instantRMS" :audioElement="audioRef" />
            <section id="music-section" class="h-full w-full rounded-xl grid-cols-2 gap-4">
              <AudioButtons
                :audioElement="audioRef"
                @toggle-music="toggleMusic"
                @rewind-music="rewindMusic"
                @forward-music="forwardMusic"
                :progress="progress"
                :duration="duration"
                @seek-music="seekMusic"
              />
            </section>
          </div>

          <div class="right h-full grid grid-rows-2 p-5">
            <section id="volume-section" class="volume-section p-5 mb-5 flex flex-col justify-between rounded-xl relative">
              <div class="container flex flex-col items-center justify-center">
                <RMS :rms="instantRMS" :progress="progress" @update:rms="updateRMS" />
              </div>
            </section>

            <div id="lufs-section" class="lufs-section p-5 rounded-xl flex items-center justify-center">
              <Lufs :instantLUFS="instantLUFS" :lufsData="lufsData" :progress="progress" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <ButtonStart :startAudioContext="startAudioContext" />
    </template>

    <audio ref="audioRef" :src="audioSrc" @timeupdate="updateProgress" @loadedmetadata="setDuration" />
    <oh-audio-player ref="audioPlayer" class="hidden" :src="audioSrc" :audioContext="audioContext" />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useWindowSize } from "@vueuse/core";
import ButtonStart from "./components/ButtonStart.vue";
import ButtonSwitch from "./components/ButtonSwitch.vue";
import Globe from "./components/Globe.vue";
import RMS from "./components/RMS.vue";
import Lufs from "./components/Lufs.vue";
import AudioButtons from "./components/AudioButtons.vue";
import "@/components/lit/audio-player/AudioPlayer";

const instantLUFS = ref(0);
const lufsData = ref<number[]>([]);
const audioContext = ref<AudioContext | null>(null);
const isPlaying = ref(true);
const bubbleColor = ref("#ff0000");
const audioRef = ref<HTMLAudioElement | null>(null);
const progress = ref(0);
const duration = ref(0);
const instantRMS = ref(0);
const audioPlayer = ref<HTMLElement | null>(null);
const audioSrc = ref("/audio/monkeys.mp3");

const { width } = useWindowSize();
const activeGraph = ref<"Globe" | "RMS" | "LUFS">("Globe");

const setGraphActive = (graph: "Globe" | "RMS" | "LUFS") => {
  activeGraph.value = graph;
};

const updateProgress = () => {
  if (audioRef.value && audioRef.value.duration) {
    progress.value = (audioRef.value.currentTime / audioRef.value.duration) * 100;
  }
};

const setDuration = () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration;
  }
};

const startAudioContext = () => {
  audioContext.value = new AudioContext();
};

const toggleMusic = () => {
  if (!audioRef.value || !audioPlayer.value) return;
  if (audioRef.value.paused) {
    audioRef.value.play();
    (audioPlayer.value as any).playAudio();
  } else {
    audioRef.value.pause();
    (audioPlayer.value as any).pauseAudio();
  }
};

const rewindMusic = () => {
  if (audioRef.value) {
    audioRef.value.currentTime = Math.max(0, audioRef.value.currentTime - 10);
  }
};

const forwardMusic = () => {
  if (audioRef.value) {
    audioRef.value.currentTime = Math.min(audioRef.value.duration, audioRef.value.currentTime + 10);
  }
};

const seekMusic = (newTime: number) => {
  if (audioRef.value) {
    audioRef.value.currentTime = newTime;
  }
};

const updateRMS = (newRMS: number) => {
  instantRMS.value = newRMS;
};

watch(instantRMS, (newVolume) => {
  if (audioRef.value) {
    audioRef.value.volume = newVolume / 100;
  }
});

onMounted(() => {
  if (!audioPlayer.value) return;
  audioPlayer.value.addEventListener("volume-change", (e: CustomEvent) => {
    if (!e.detail) return;
    const { lufs, rms } = e.detail;
    updateRMS(rms);
    instantLUFS.value = Math.round(lufs);
  });
});
</script>
