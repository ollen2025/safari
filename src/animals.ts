import Phaser from 'phaser';

export type AnimalKey =
  | 'elephant'
  | 'giraffe'
  | 'zebra'
  | 'lion'
  | 'monkey'
  | 'hippo'
  | 'rhino'
  | 'buffalo'
  | 'ostrich'
  | 'hyena';

export interface AnimalDef {
  name: string; // "en elefant", siges af Abdul
  plural: string; // "elefanter", til "Nu har du fundet 3 elefanter"
  emoji?: string; // dyr uden emoji bliver tegnet i animalArt.ts
}

export const ANIMALS: Record<AnimalKey, AnimalDef> = {
  elephant: { name: 'en elefant', plural: 'elefanter', emoji: '🐘' },
  giraffe: { name: 'en giraf', plural: 'giraffer', emoji: '🦒' },
  zebra: { name: 'en zebra', plural: 'zebraer', emoji: '🦓' },
  lion: { name: 'en løve', plural: 'løver', emoji: '🦁' },
  monkey: { name: 'en abe', plural: 'aber', emoji: '🐒' },
  hippo: { name: 'en flodhest', plural: 'flodheste', emoji: '🦛' },
  rhino: { name: 'et næsehorn', plural: 'næsehorn', emoji: '🦏' },
  buffalo: { name: 'en bøffel', plural: 'bøfler', emoji: '🐃' },
  ostrich: { name: 'en struds', plural: 'strudse' },
  hyena: { name: 'en hyæne', plural: 'hyæner' },
};

export const ANIMAL_KEYS = Object.keys(ANIMALS) as AnimalKey[];

export function randomAnimal(): AnimalKey {
  return Phaser.Utils.Array.GetRandom(ANIMAL_KEYS);
}

// Hvor mange af hvert dyr spilleren har fundet. Ligger i Phasers registry, som deles af alle scener.
export type Counts = Partial<Record<AnimalKey, number>>;

export function getCounts(scene: Phaser.Scene): Counts {
  return scene.registry.get('counts') ?? {};
}

// Tæller et fundet dyr og returnerer det nye antal
export function countAnimal(scene: Phaser.Scene, key: AnimalKey): number {
  const counts = { ...getCounts(scene) };
  const count = (counts[key] ?? 0) + 1;
  counts[key] = count;
  scene.registry.set('counts', counts);
  return count;
}
