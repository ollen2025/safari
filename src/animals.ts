import Phaser from 'phaser';

export type AnimalKey =
  | 'elephant'
  | 'giraffe'
  | 'zebra'
  | 'lion'
  | 'baboon'
  | 'hippo'
  | 'rhino'
  | 'buffalo'
  | 'ostrich'
  | 'hyena'
  | 'gazelle'
  | 'gnu'
  | 'crocodile'
  | 'sloth';

export interface AnimalDef {
  name: string; // "en elefant", siges af Abdul
  plural: string; // "elefanter", til "Nu har du fundet 3 elefanter"
  variants?: number; // antal tegninger, fx lion.svg og lion-2.svg (standard 1)
  hangs?: boolean; // hænger i et træ i stedet for at stå på jorden
}

export const ANIMALS: Record<AnimalKey, AnimalDef> = {
  elephant: { name: 'en elefant', plural: 'elefanter' },
  giraffe: { name: 'en giraf', plural: 'giraffer' },
  zebra: { name: 'en zebra', plural: 'zebraer' },
  lion: { name: 'en løve', plural: 'løver', variants: 2 },
  baboon: { name: 'en bavian', plural: 'bavianer' },
  hippo: { name: 'en flodhest', plural: 'flodheste' },
  rhino: { name: 'et næsehorn', plural: 'næsehorn' },
  buffalo: { name: 'en bøffel', plural: 'bøfler' },
  ostrich: { name: 'en struds', plural: 'strudse' },
  hyena: { name: 'en hyæne', plural: 'hyæner' },
  gazelle: { name: 'en gazelle', plural: 'gazeller' },
  gnu: { name: 'en gnu', plural: 'gnuer' },
  crocodile: { name: 'en krokodille', plural: 'krokodiller' },
  sloth: { name: 'et dovendyr', plural: 'dovendyr', hangs: true },
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
