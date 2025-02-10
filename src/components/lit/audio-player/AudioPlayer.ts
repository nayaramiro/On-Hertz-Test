import { getInstantVolume, getSimpleInstantLUFS } from "@/utils/helpers";
import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

@customElement("oh-audio-player")
export class AudioPlayer extends LitElement {
  @property()
  src!: string;

  @property({ type: Object })
  audioContext!: AudioContext;

  @query("#audio-file") audio!: HTMLAudioElement;

  private analyser!: AnalyserNode;
  private dataArray!: Uint8Array;
  private bufferLength!: number;
  private gainNode!: GainNode;
  private audioSource!: MediaElementAudioSourceNode | null;

  private getValues() {
    if (!this.audio || this.audio.paused || this.audio.readyState < 2) {
      return; // Ne fait rien si l'audio est en pause ou pas prêt
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    const rms = getInstantVolume(
      this.bufferLength,
      this.dataArray,
      this.analyser
    );
    const lufs = getSimpleInstantLUFS(rms);

    ;

    if (rms !== null && lufs !== null) {
      ;
      this.dispatchEvent(
        new CustomEvent("volume-change", {
          detail: { rms, lufs },
          bubbles: true,
          composed: true,
        })
      );


    }

    requestAnimationFrame(() => this.getValues()); // Continue la mise à jour
  }

  playAudio() {
    if (this.audio) {
      this.audio.play();
      ;
      requestAnimationFrame(() => this.getValues()); // Lance l'analyse au démarrage
    }
  }

  pauseAudio() {
    if (this.audio) {
      this.audio.pause();
      ;
    }
  }

  rewindAudio() {
    if (this.audio) {
      this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
      ;
    }
  }

  forwardAudio() {
    if (this.audio) {
      this.audio.currentTime = Math.min(
        this.audio.duration,
        this.audio.currentTime + 10
      );
      ;
    }
  }

  setVolume(value: number) {
    if (this.audio) {
      this.audio.volume = value / 100;
      ;
    }
  }

  protected async firstUpdated() {
    ;

    if (!this.audioContext) {
      console.log(
        "❌ AudioContext non défini, création d'un nouvel AudioContext..."
      );
      this.audioContext = new AudioContext();
    }

    // Vérifie si l’audio source est déjà créé
    if (!this.audioSource) {
      this.audioSource = this.audioContext.createMediaElementSource(this.audio);
    }

    // Création de l'AnalyserNode
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;

    // Ajout d'un GainNode pour éviter un signal trop faible
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 2; // Augmente le volume d'analyse

    // Connexions
    this.audioSource.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    console.log(
      "✅ AnalyserNode initialisé avec fftSize:",
      this.analyser.fftSize
    );
  }

  render() {
    return html` <audio id="audio-file" controls src="${this.src}"></audio> `;
  }
}
