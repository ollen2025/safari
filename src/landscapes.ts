import Phaser from 'phaser';
import type { AnimalKey, WorldKey } from './animals';
import { LINES } from './lines';
import {
  drawAcacia,
  drawBush,
  drawFern,
  drawIceHole,
  drawIceRock,
  drawJungleTree,
  drawPond,
  drawSnowDrift,
  drawWaterhole,
} from './scenery';

type Draw = (scene: Phaser.Scene, x: number, y: number, scale?: number) => Phaser.GameObjects.Graphics;
type DrawWater = (scene: Phaser.Scene, x: number, y: number, width: number, height: number) => Phaser.GameObjects.Graphics;

// Dyr der ligger i vandet, så kun den øverste del (waterline) stikker op
export interface Swimmer {
  key: AnimalKey;
  dx: number; // i forhold til vandets midte
  dy: number;
  size: number;
  waterline: number;
  chance: number; // sandsynlighed for at den er der
}

// Alt det, der gør en verden forskellig fra de andre: farver, træer, vand og Abduls velkomst
export interface Landscape {
  sky: number;
  sun: boolean;
  snow: boolean;
  hill: number; // bakker langt væk, set fra bilen
  lookoutHill: number; // bakker set stående
  ground: number;
  haze: number; // lyst bånd ved horisonten
  tree: Draw;
  bush: Draw;
  water: DrawWater;
  driveTrees: number; // træer i baggrunden, når man kører
  lookoutTrees: number;
  swimmers: Swimmer[];
  drinkers: AnimalKey[]; // dyr der drikker ved vandet
  intro: string[];
}

export const LANDSCAPES: Record<WorldKey, Landscape> = {
  safari: {
    sky: 0x8fd3f4,
    sun: true,
    snow: false,
    hill: 0xa3b18a,
    lookoutHill: 0xb5c99a,
    ground: 0xe9c46a,
    haze: 0xf0d58c,
    tree: drawAcacia,
    bush: drawBush,
    water: drawWaterhole,
    driveTrees: 4,
    lookoutTrees: 14,
    swimmers: [
      { key: 'hippo', dx: -60, dy: 10, size: 110, waterline: 0.55, chance: 1 },
      { key: 'crocodile', dx: 110, dy: 16, size: 160, waterline: 0.45, chance: 0.6 },
    ],
    drinkers: ['elephant', 'zebra', 'buffalo', 'giraffe', 'gnu', 'gazelle'],
    intro: LINES.intro,
  },
  jungle: {
    sky: 0xb7e4c7,
    sun: false,
    snow: false,
    hill: 0x2d6a4f,
    lookoutHill: 0x40916c,
    ground: 0x7c9a54,
    haze: 0x95b98a,
    tree: drawJungleTree,
    bush: drawFern,
    water: drawPond,
    driveTrees: 7,
    lookoutTrees: 22,
    swimmers: [],
    drinkers: ['tiger', 'okapi', 'gorilla', 'puma'],
    intro: LINES.introJungle,
  },
  ice: {
    sky: 0xcaf0f8,
    sun: true,
    snow: true,
    hill: 0xe3f2fa,
    lookoutHill: 0xeef7fb,
    ground: 0xf5fbfd,
    haze: 0xe0f1f8,
    tree: drawIceRock,
    bush: drawSnowDrift,
    water: drawIceHole,
    driveTrees: 3,
    lookoutTrees: 10,
    swimmers: [
      { key: 'seal', dx: -70, dy: 12, size: 110, waterline: 0.6, chance: 1 },
      { key: 'orca', dx: 100, dy: 18, size: 170, waterline: 0.5, chance: 0.7 },
    ],
    drinkers: ['polarbear', 'penguin', 'walrus', 'sealion'],
    intro: LINES.introIce,
  },
};
