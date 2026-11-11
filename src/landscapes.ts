import Phaser from 'phaser';
import type { AnimalKey, WorldKey } from './animals';
import { LINES } from './lines';
import { drawJeepIcon, drawSubmarineIcon, type ButtonIcon } from './ui';
import {
  drawAcacia,
  drawBillabong,
  drawBush,
  drawCoralTree,
  drawEucalyptus,
  drawFern,
  drawIceHole,
  drawIceRock,
  drawJungleTree,
  drawPond,
  drawSeaCave,
  drawSeaweed,
  drawSnowDrift,
  drawSpinifex,
  drawWaterhole,
  type Weather,
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

// Abduls replikker, der handler om køretøjet ("Rejs dig op!" eller "Svøm ud og se!")
type VehicleLines = Record<
  'brake' | 'stoppedSeen' | 'stoppedNothing' | 'drive' | 'wake' | 'homeward' | 'backToSafari' | 'iceCreamDone',
  string[]
>;

// Det køretøj, man sidder i (jeep eller ubåd): farver, knapper og det Abdul siger
export interface Vehicle {
  body: number;
  trim: number; // vinduesramme og kant
  rivets: boolean; // nitter rundt om vinduet, som på en ubåd
  goIcon: ButtonIcon; // knappen "kør/sejl videre"
  exitIcon: ButtonIcon; // knappen "rejs dig op/svøm ud"
  lines: VehicleLines;
}

const JEEP: Vehicle = {
  body: 0x4a5530,
  trim: 0x2f3720,
  rivets: false,
  goIcon: drawJeepIcon,
  exitIcon: '🧍',
  lines: {
    brake: LINES.brake,
    stoppedSeen: LINES.stoppedSeen,
    stoppedNothing: LINES.stoppedNothing,
    drive: LINES.drive,
    wake: LINES.wake,
    homeward: LINES.homeward,
    backToSafari: LINES.backToSafari,
    iceCreamDone: LINES.iceCreamDone,
  },
};

const SUBMARINE: Vehicle = {
  body: 0xf2b705,
  trim: 0xa87a05,
  rivets: true,
  goIcon: drawSubmarineIcon,
  exitIcon: '🤿',
  lines: {
    brake: LINES.brakeSea,
    stoppedSeen: LINES.stoppedSeenSea,
    stoppedNothing: LINES.stoppedNothingSea,
    drive: LINES.driveSea,
    wake: LINES.wakeSea,
    homeward: LINES.homewardSea,
    backToSafari: LINES.backToSafariSea,
    iceCreamDone: LINES.iceCreamDoneSea,
  },
};

// Alt det, der gør en verden forskellig fra de andre: farver, træer, vand og Abduls velkomst
export interface Landscape {
  sky: number;
  sun: boolean;
  weather?: Weather; // sne eller bobler, der bevæger sig hen over billedet
  vehicle: Vehicle;
  beach?: boolean; // iskiosken ligger oppe på en strand, og ubåden skal op til overfladen
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
    vehicle: JEEP,
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
    vehicle: JEEP,
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
    weather: 'snow',
    vehicle: JEEP,
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
  australia: {
    sky: 0x7cc6ee,
    sun: true,
    vehicle: JEEP,
    hill: 0xb5532c, // røde klipper langt væk
    lookoutHill: 0xc8693f,
    ground: 0xd9824a, // rødt sand
    haze: 0xe8a66c,
    tree: drawEucalyptus,
    bush: drawSpinifex,
    water: drawBillabong,
    driveTrees: 4,
    lookoutTrees: 12,
    swimmers: [{ key: 'platypus', dx: -40, dy: 14, size: 120, waterline: 0.58, chance: 1 }],
    drinkers: ['kangaroo', 'emu', 'dingo', 'wombat'],
    intro: LINES.introAustralia,
  },
  // Under vandet: "himlen" er havet, jorden er sandbunden, og man sidder i en gul ubåd
  sea: {
    sky: 0x1f7fbf,
    sun: false,
    weather: 'bubbles',
    vehicle: SUBMARINE,
    beach: true,
    hill: 0x2a6f97, // rev langt væk
    lookoutHill: 0x3d85b0,
    ground: 0xe6d3a3,
    haze: 0xa9c9c4,
    tree: drawCoralTree,
    bush: drawSeaweed,
    water: drawSeaCave,
    driveTrees: 4,
    lookoutTrees: 12,
    swimmers: [{ key: 'eel', dx: 0, dy: 10, size: 120, waterline: 0.55, chance: 1 }],
    drinkers: ['crab', 'octopus', 'seaturtle'],
    intro: LINES.introSea,
  },
};
