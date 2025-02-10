<script lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as THREE from "three";

export default {
  props: {
    isPlaying: Boolean,
    audioElement: {
      type: Object as () => HTMLAudioElement | null,
      required: true,
    },
  },

  setup(props) {
    const container = ref<HTMLElement | null>(null);
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let bubbles: THREE.Mesh[] = [];
    let analyser: AnalyserNode | null = null;
    let audioContext: AudioContext | null = null;
    let source: MediaElementAudioSourceNode | null = null;
    let animationFrameId: number | null = null;
    const bubbleColors = ["#ea702a", "#fab429", "#62cbb8", "#2da6be", "#006bb8", "#5356ac", "#983a98", "#c91870", "#d81838"];
    const init = () => {
      if (!container.value || !props.audioElement) return;

      
      const width = container.value.clientWidth || window.innerWidth;
      const height = container.value.clientHeight || window.innerHeight;

      
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;

      
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      container.value.appendChild(renderer.domElement);

      
      audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      
      if (source) {
        source.disconnect();
      }

      source = audioContext.createMediaElementSource(props.audioElement);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      
      const light = new THREE.PointLight(0xffffff, 1, 100);
      light.position.set(5, 5, 5);
      scene.add(light);

      // Création des bulles
      const bubbleCount = window.innerWidth < 768 ? 500 : 1080;
      const radius = 2.5;
      for (let i = 0; i < bubbleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const latitude = Math.random() * Math.PI - Math.PI / 2;
        const x = radius * Math.cos(latitude) * Math.cos(angle);
        const y = radius * Math.cos(latitude) * Math.sin(angle);
        const z = radius * Math.sin(latitude);

        const geometry = new THREE.SphereGeometry(0.05, 32, 16);
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(bubbleColors[Math.floor(Math.random() * bubbleColors.length)]),
        });
        const bubble = new THREE.Mesh(geometry, material);
        bubble.position.set(x, y, z);
        scene.add(bubble);
        bubbles.push(bubble);
      }

      
      if (props.isPlaying) {
        animate();
      }
    };

    const animate = () => {
      if (!analyser || !scene || !camera || !renderer) return;

      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencyData);

      bubbles.forEach((bubble, i) => {
        const scale = Math.max(
          frequencyData[i % frequencyData.length] / 150,
          0.1
        );
        bubble.scale.set(scale, scale, scale);
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    watch(
      () => props.isPlaying,
      (newValue) => {
        if (newValue) {
          animate();
        } else {
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
        }
      }
    );

    onMounted(() => {
      init();
      window.addEventListener("resize", onWindowResize);
    });

    onBeforeUnmount(() => {
      if (renderer) {
        renderer.dispose();
      }
      if (scene) {
        scene.clear();
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onWindowResize);
    });

    const onWindowResize = () => {
      if (!renderer || !camera || !container.value) return;
      const width = container.value.clientWidth || window.innerWidth;
      const height = container.value.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    return { container };
  },
};
</script>

<template>
  <div ref="container" class="visualizer-container globe md:mb-5"></div>
</template>

