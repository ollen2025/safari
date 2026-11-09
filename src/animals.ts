import Phaser from 'phaser';

// Verdener med dyr, man kan køre rundt i. Startmenuens kort står i worlds.ts.
export type WorldKey = 'safari' | 'jungle' | 'ice';

export type AnimalKey =
  // Savannen
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
  // Junglen
  | 'tiger'
  | 'leopard'
  | 'puma'
  | 'snake'
  | 'okapi'
  | 'gorilla'
  | 'chimp'
  | 'parrot'
  | 'toucan'
  | 'sloth'
  // Isen
  | 'polarbear'
  | 'penguin'
  | 'seal'
  | 'sealion'
  | 'puffin'
  | 'walrus'
  | 'arcticfox'
  | 'reindeer'
  | 'orca'
  | 'owl';

// Hvor dyret er: på jorden (standard), hængende under en gren, siddende oven på en gren (eller klippe),
// eller svømmende (kun i vandet, fx spækhuggeren)
export type Pose = 'ground' | 'hang' | 'perch' | 'swim';

export interface AnimalDef {
  world: WorldKey;
  name: string; // "en elefant", siges af Abdul
  plural: string; // "elefanter", til "Nu har du fundet 3 elefanter"
  variants?: number; // antal tegninger, fx lion.svg og lion-2.svg (standard 1)
  pose?: Pose;
  // Hvor i tegningen (0 = top, 1 = bund) grenen er, for dyr i træer. For dyr på jorden er det fødderne (1).
  anchorY?: number;
  scale?: number; // størrelse i forhold til de andre dyr (standard 1)
}

export const ANIMALS: Record<AnimalKey, AnimalDef> = {
  elephant: { world: 'safari', name: 'en elefant', plural: 'elefanter' },
  giraffe: { world: 'safari', name: 'en giraf', plural: 'giraffer' },
  zebra: { world: 'safari', name: 'en zebra', plural: 'zebraer' },
  lion: { world: 'safari', name: 'en løve', plural: 'løver', variants: 2 },
  baboon: { world: 'safari', name: 'en bavian', plural: 'bavianer' },
  hippo: { world: 'safari', name: 'en flodhest', plural: 'flodheste' },
  rhino: { world: 'safari', name: 'et næsehorn', plural: 'næsehorn' },
  buffalo: { world: 'safari', name: 'en bøffel', plural: 'bøfler' },
  ostrich: { world: 'safari', name: 'en struds', plural: 'strudse' },
  hyena: { world: 'safari', name: 'en hyæne', plural: 'hyæner' },
  gazelle: { world: 'safari', name: 'en gazelle', plural: 'gazeller' },
  gnu: { world: 'safari', name: 'en gnu', plural: 'gnuer' },
  crocodile: { world: 'safari', name: 'en krokodille', plural: 'krokodiller' },

  tiger: { world: 'jungle', name: 'en tiger', plural: 'tigre' },
  leopard: { world: 'jungle', name: 'en træleopard', plural: 'træleoparder', pose: 'perch', anchorY: 0.55, scale: 1.2 },
  puma: { world: 'jungle', name: 'en puma', plural: 'pumaer' },
  snake: { world: 'jungle', name: 'en slange', plural: 'slanger', pose: 'hang', anchorY: 0.06 },
  okapi: { world: 'jungle', name: 'en okapi', plural: 'okapier' },
  gorilla: { world: 'jungle', name: 'en gorilla', plural: 'gorillaer' },
  chimp: { world: 'jungle', name: 'en chimpanse', plural: 'chimpanser' },
  parrot: { world: 'jungle', name: 'en papegøje', plural: 'papegøjer', pose: 'perch', anchorY: 0.65, scale: 0.9 },
  toucan: { world: 'jungle', name: 'en tukan', plural: 'tukaner', pose: 'perch', anchorY: 0.83, scale: 0.8 },
  sloth: { world: 'jungle', name: 'et dovendyr', plural: 'dovendyr', pose: 'hang', anchorY: 0.09 },

  polarbear: { world: 'ice', name: 'en isbjørn', plural: 'isbjørne' },
  penguin: { world: 'ice', name: 'en pingvin', plural: 'pingviner', scale: 0.75 },
  seal: { world: 'ice', name: 'en sæl', plural: 'sæler', scale: 0.85 },
  sealion: { world: 'ice', name: 'en søløve', plural: 'søløver', scale: 0.9 },
  puffin: { world: 'ice', name: 'en søpapegøje', plural: 'søpapegøjer', pose: 'perch', scale: 0.6 },
  walrus: { world: 'ice', name: 'en hvalros', plural: 'hvalrosser' },
  arcticfox: { world: 'ice', name: 'en polarræv', plural: 'polarræve', scale: 0.7 },
  reindeer: { world: 'ice', name: 'et rensdyr', plural: 'rensdyr' },
  orca: { world: 'ice', name: 'en spækhugger', plural: 'spækhuggere', pose: 'swim' },
  owl: { world: 'ice', name: 'en sneugle', plural: 'sneugler', pose: 'perch', scale: 0.65 },
};

export const ANIMAL_KEYS = Object.keys(ANIMALS) as AnimalKey[];

export function animalsIn(world: WorldKey): AnimalKey[] {
  return ANIMAL_KEYS.filter((key) => ANIMALS[key].world === world);
}

// Et tilfældigt dyr på land eller i træerne. Dyr der kun svømmer, er med i landskabets vand.
export function randomAnimal(world: WorldKey): AnimalKey {
  return Phaser.Utils.Array.GetRandom(animalsIn(world).filter((key) => ANIMALS[key].pose !== 'swim'));
}

export function poseOf(key: AnimalKey): Pose {
  return ANIMALS[key].pose ?? 'ground';
}

// Den verden, man valgte i startmenuen. Ligger i registry ligesom tællingen.
export function currentWorld(scene: Phaser.Scene): WorldKey {
  return scene.registry.get('world') ?? 'safari';
}

// Hvor mange af hvert dyr spilleren har fundet. Ligger i Phasers registry, som deles af alle scener.
export type Counts = Partial<Record<AnimalKey, number>>;

export function getCounts(scene: Phaser.Scene): Counts {
  return scene.registry.get('counts') ?? {};
}

// Sendes på game.events for hvert fundet dyr. Forælder-timeren lytter, så "start forfra" ikke påvirker den.
export const ANIMAL_COUNTED = 'animal-counted';

// Tæller et fundet dyr og returnerer det nye antal
export function countAnimal(scene: Phaser.Scene, key: AnimalKey): number {
  const counts = { ...getCounts(scene) };
  const count = (counts[key] ?? 0) + 1;
  counts[key] = count;
  scene.registry.set('counts', counts);
  scene.game.events.emit(ANIMAL_COUNTED, key);
  return count;
}
