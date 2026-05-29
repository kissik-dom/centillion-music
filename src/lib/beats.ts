export interface BeatPreset {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  key: string;
  mood: string;
  description: string;
  pattern: {
    kick: number[];
    snare: number[];
    hihat: number[];
    clap: number[];
  };
  // 16-step sequencer, 1 = hit, 0 = rest
}

export const BEAT_PRESETS: BeatPreset[] = [
  {
    id: "trap-bounce",
    name: "Trap Bounce",
    genre: "Hip-Hop",
    bpm: 140,
    key: "Cm",
    mood: "Hard",
    description: "Heavy 808s with rolling hi-hats",
    pattern: {
      kick:  [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
      clap:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    },
  },
  {
    id: "boom-bap",
    name: "Boom Bap Classic",
    genre: "Hip-Hop",
    bpm: 90,
    key: "Dm",
    mood: "Chill",
    description: "Old school boom bap groove",
    pattern: {
      kick:  [1,0,0,0, 0,0,0,0, 1,0,1,0, 0,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  {
    id: "rnb-slow",
    name: "Velvet Nights",
    genre: "R&B",
    bpm: 75,
    key: "Eb",
    mood: "Sensual",
    description: "Smooth R&B with soft percussion",
    pattern: {
      kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
      hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      clap:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    },
  },
  {
    id: "afrobeats",
    name: "Lagos Groove",
    genre: "Afrobeats",
    bpm: 108,
    key: "Gm",
    mood: "Energetic",
    description: "West African rhythms with modern bounce",
    pattern: {
      kick:  [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,1,0,1, 1,0,1,1, 0,1,1,0, 1,1,0,1],
      clap:  [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0],
    },
  },
  {
    id: "pop-radio",
    name: "Radio Ready",
    genre: "Pop",
    bpm: 120,
    key: "C",
    mood: "Upbeat",
    description: "Clean pop production with driving beat",
    pattern: {
      kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      clap:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    },
  },
  {
    id: "lo-fi-chill",
    name: "Late Night Study",
    genre: "Lo-Fi",
    bpm: 82,
    key: "Am",
    mood: "Relaxed",
    description: "Dusty lo-fi with vinyl crackle vibes",
    pattern: {
      kick:  [1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,0,1,1, 0,0,1,0, 1,0,1,1, 0,0,1,0],
      clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  {
    id: "edm-drop",
    name: "Festival Drop",
    genre: "Electronic",
    bpm: 128,
    key: "Fm",
    mood: "Hype",
    description: "Four-on-the-floor festival energy",
    pattern: {
      kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      hihat: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
      clap:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    },
  },
  {
    id: "soul-groove",
    name: "Golden Soul",
    genre: "Soul",
    bpm: 95,
    key: "Bb",
    mood: "Warm",
    description: "Classic soul groove with warm tones",
    pattern: {
      kick:  [1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
      snare: [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,0],
      hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  {
    id: "drill-uk",
    name: "London Drill",
    genre: "Drill",
    bpm: 142,
    key: "Db",
    mood: "Dark",
    description: "UK drill slide with bouncing 808",
    pattern: {
      kick:  [0,0,0,1, 0,0,0,0, 0,1,0,0, 0,0,1,0],
      snare: [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
      hihat: [1,1,0,1, 1,0,1,1, 0,1,1,0, 1,0,1,1],
      clap:  [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
    },
  },
  {
    id: "reggaeton",
    name: "Dembow Flow",
    genre: "Reggaeton",
    bpm: 96,
    key: "Em",
    mood: "Fiery",
    description: "Classic dembow rhythm with Latin heat",
    pattern: {
      kick:  [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      clap:  [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0],
    },
  },
  {
    id: "jazz-swing",
    name: "Midnight Jazz",
    genre: "Jazz",
    bpm: 115,
    key: "Db",
    mood: "Sophisticated",
    description: "Swing rhythm with brush cymbals",
    pattern: {
      kick:  [1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
      snare: [0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
      hihat: [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,1],
      clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  {
    id: "gospel-praise",
    name: "Sunday Morning",
    genre: "Gospel",
    bpm: 105,
    key: "Ab",
    mood: "Uplifting",
    description: "Uplifting gospel rhythm with praise energy",
    pattern: {
      kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,1,1,0, 1,1,1,0, 1,1,1,0, 1,1,1,0],
      clap:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    },
  },
];

// ---- Web Audio Beat Engine ----

let audioCtx: AudioContext | null = null;
let currentInterval: ReturnType<typeof setInterval> | null = null;
let currentStep = 0;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playKick(ctx: AudioContext, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.35);
  gain.gain.setValueAtTime(0.8, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
  osc.connect(gain).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.35);
}

function playSnare(ctx: AudioContext, time: number) {
  // Noise burst
  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.4, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

  // Tone body
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(200, time);
  oscGain.gain.setValueAtTime(0.3, time);
  oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

  noise.connect(noiseGain).connect(ctx.destination);
  osc.connect(oscGain).connect(ctx.destination);
  noise.start(time);
  noise.stop(time + 0.12);
  osc.start(time);
  osc.stop(time + 0.08);
}

function playHiHat(ctx: AudioContext, time: number) {
  const bufferSize = ctx.sampleRate * 0.04;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Bandpass filter for metallic sound
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(8000, time);
  filter.Q.setValueAtTime(2, time);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);

  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start(time);
  noise.stop(time + 0.04);
}

function playClap(ctx: AudioContext, time: number) {
  // Multiple short noise bursts
  for (let i = 0; i < 3; i++) {
    const offset = i * 0.01;
    const bufferSize = ctx.sampleRate * 0.03;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let j = 0; j < bufferSize; j++) {
      data[j] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2000, time + offset);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, time + offset);
    gain.gain.exponentialRampToValueAtTime(0.01, time + offset + 0.08);

    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(time + offset);
    noise.stop(time + offset + 0.08);
  }
}

export function playBeat(preset: BeatPreset, onStep?: (step: number) => void): () => void {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") ctx.resume();

  stopBeat();

  const stepDuration = (60 / preset.bpm / 4); // 16th notes
  currentStep = 0;

  const playStep = () => {
    const time = ctx.currentTime + 0.05; // small lookahead
    const step = currentStep % 16;

    if (preset.pattern.kick[step]) playKick(ctx, time);
    if (preset.pattern.snare[step]) playSnare(ctx, time);
    if (preset.pattern.hihat[step]) playHiHat(ctx, time);
    if (preset.pattern.clap[step]) playClap(ctx, time);

    onStep?.(step);
    currentStep++;
  };

  playStep(); // Play first step immediately
  currentInterval = setInterval(playStep, stepDuration * 1000);

  return stopBeat;
}

export function stopBeat() {
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }
  currentStep = 0;
}

export function isPlaying(): boolean {
  return currentInterval !== null;
}

export const GENRES = [
  "Hip-Hop", "R&B", "Pop", "Electronic", "Lo-Fi", "Jazz",
  "Afrobeats", "Soul", "Drill", "Reggaeton", "Gospel", "Rock",
  "Country", "Latin", "Dancehall", "Punk",
];

export const MOODS = [
  "Hype", "Chill", "Dark", "Romantic", "Energetic", "Melancholy",
  "Empowering", "Nostalgic", "Aggressive", "Dreamy", "Uplifting", "Raw",
];
