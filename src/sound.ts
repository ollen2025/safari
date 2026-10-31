import Phaser from 'phaser';
import { ANIMAL_KEYS, type AnimalKey } from './animals';

const MAX_SOUND_SECONDS = 4;
const FADE_MS = 500;
const FADE_STEPS = 10;

// Rigtige optagelser fra freesound.org (CC0), se public/assets/sounds/animals/CREDITS.md
export function preloadAnimalSounds(scene: Phaser.Scene) {
  for (const key of ANIMAL_KEYS) scene.load.audio(`sound-${key}`, `assets/sounds/animals/${key}.mp3`);
}

// Kun én dyrelyd ad gangen, så mange hurtige tryk ikke stabler lyde oven på hinanden.
// Timerne er browserens egne og ikke scenens, så de virker, selv om spilleren skifter scene.
type GameSound = Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound;

interface PlayingSound {
  sound: GameSound;
  timeout?: number;
  interval?: number;
}
let playing: PlayingSound | undefined;

function stopAnimalSound() {
  if (!playing) return;
  window.clearTimeout(playing.timeout);
  window.clearInterval(playing.interval);
  playing.sound.destroy();
  playing = undefined;
}

export function playAnimalSound(scene: Phaser.Scene, key: AnimalKey) {
  const soundKey = `sound-${key}`;
  if (!scene.cache.audio.exists(soundKey)) return;

  stopAnimalSound();
  const entry: PlayingSound = { sound: scene.sound.add(soundKey) as GameSound };
  playing = entry;
  entry.sound.once('complete', () => {
    if (playing === entry) stopAnimalSound();
  });
  entry.sound.play();

  // Nogle optagelser er lange, så vi fader ud efter et par sekunder
  entry.timeout = window.setTimeout(() => {
    let step = 0;
    entry.interval = window.setInterval(() => {
      step++;
      if (step < FADE_STEPS) {
        entry.sound.setVolume(1 - step / FADE_STEPS);
      } else if (playing === entry) {
        stopAnimalSound();
      }
    }, FADE_MS / FADE_STEPS);
  }, MAX_SOUND_SECONDS * 1000);
}

// Abduls stemme er browserens indbyggede oplæser.
// Vi foretrækker en naturlig (neural) dansk mandestemme, fx "Microsoft Jeppe Online (Natural)" i Edge.
const NATURAL_VOICE = /natural|online|neural/i;
let abdulVoice: SpeechSynthesisVoice | undefined;

function pickVoice() {
  const danish = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('da'));
  abdulVoice =
    danish.find((v) => /jeppe/i.test(v.name)) ?? danish.find((v) => NATURAL_VOICE.test(v.name)) ?? danish[0];
}

if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
}

export function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'da-DK';
  if (abdulVoice) utterance.voice = abdulVoice;
  utterance.rate = 0.9;
  // De gamle robotstemmer lyder mere som en mand med lavere tone; de naturlige skal ikke ændres
  utterance.pitch = abdulVoice && NATURAL_VOICE.test(abdulVoice.name) ? 1 : 0.8;
  speechSynthesis.speak(utterance);
}
