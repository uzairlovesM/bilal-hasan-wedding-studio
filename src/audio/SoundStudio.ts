import { Howl } from 'howler';
import * as Tone from 'tone';

export type SoundCue = 'impact' | 'seal' | 'paper' | 'chime';

class SoundStudio {
  private cues = new Map<SoundCue, Howl>();
  private music: Howl | null = null;
  private toneSynth: Tone.Synth | null = null;
  private metal: Tone.MetalSynth | null = null;
  private context: AudioContext | null = null;
  private ready = false;
  private active = false;
  private musicWanted = false;

  constructor() {
    this.cues.set('impact', new Howl({ src: ['/assets/landing-impact.wav'], volume: .48, preload: true }));
    this.cues.set('paper', new Howl({ src: ['/assets/paper-rustle.wav'], volume: .36, preload: true }));
    this.cues.set('seal', new Howl({ src: ['/assets/seal-crack.wav'], volume: .5, preload: true }));
    this.music = new Howl({ src: ['/assets/bg-music.mp3'], volume: .32, loop: true, preload: true, html5: true });
  }

  async enable() {
    this.active = true;
    const Context = window.AudioContext || (window as any).webkitAudioContext;
    if (!this.context && Context) this.context = new Context();
    if (this.context?.state === 'suspended') await this.context.resume();
    if (!this.ready) {
      await Tone.start();
      this.toneSynth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: .015, decay: .65, sustain: .04, release: 1.2 } }).toDestination();
      this.metal = new Tone.MetalSynth({ envelope: { attack: .001, decay: .45, release: .2 }, harmonicity: 6.1, modulationIndex: 18, resonance: 2600, octaves: 1.2 }).toDestination();
      this.metal.volume.value = -18;
      this.ready = true;
    }
    if (this.musicWanted) this.playMusic();
  }

  disable() {
    this.active = false;
    this.music?.pause();
  }

  async toggle() {
    if (this.active) this.disable();
    else await this.enable();
    return this.active;
  }

  playMusic() {
    this.musicWanted = true;
    if (!this.active || !this.music) return;
    if (!this.music.playing()) this.music.play();
  }

  pauseMusic() {
    this.musicWanted = false;
    this.music?.pause();
  }

  isMusicPlaying() {
    return !!this.music?.playing();
  }

  private fallbackChime() {
    if (!this.context) return;
    const now = this.context.currentTime;
    [659.25, 830.61, 987.77].forEach((frequency, index) => {
      const oscillator = this.context!.createOscillator();
      const gain = this.context!.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, now + index * .11);
      gain.gain.exponentialRampToValueAtTime(.12, now + index * .11 + .025);
      gain.gain.exponentialRampToValueAtTime(.0001, now + index * .11 + .92);
      oscillator.connect(gain).connect(this.context!.destination);
      oscillator.start(now + index * .11); oscillator.stop(now + index * .11 + 1);
    });
  }

  play(cue: SoundCue) {
    if (!this.active) return;
    if (cue === 'chime') {
      if (this.ready) {
        this.toneSynth?.triggerAttackRelease('E6', '8n', undefined, .3);
        this.toneSynth?.triggerAttackRelease('A6', '4n', '+0.13', .22);
      } else this.fallbackChime();
      this.metal?.triggerAttackRelease('C3', '16n');
      return;
    }
    this.cues.get(cue)?.play();
    if (cue === 'seal' && this.ready) this.metal?.triggerAttackRelease('C3', '16n');
  }

  dispose() {
    this.cues.forEach(cue => cue.unload());
    this.music?.unload(); this.music = null;
    this.toneSynth?.dispose(); this.metal?.dispose();
    this.context?.close(); this.context = null;
    this.active = false; this.ready = false; this.musicWanted = false;
  }
}

export const soundStudio = new SoundStudio();
