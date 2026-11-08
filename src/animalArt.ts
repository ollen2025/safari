import Phaser from 'phaser';
import { ANIMALS, ANIMAL_KEYS, type AnimalKey } from './animals';

// Tegningerne ligger som SVG-filer i public/assets/animals/, så en tegning kan skiftes ud
// ved at erstatte filen. Ekstra udgaver af samme dyr hedder fx lion-2.svg (se `variants` i animals.ts).
const SVG_SCALE = 2; // SVG'erne laves i dobbelt størrelse, så de er skarpe tæt på
export const BABY_SCALE = 0.6;

export function preloadIceCreamArt(scene: Phaser.Scene) {
  scene.load.svg('cone', 'assets/icecream/cone.svg', { scale: SVG_SCALE });
  for (const flavor of ['strawberry', 'chocolate', 'vanilla', 'pistachio']) {
    scene.load.svg(`scoop-${flavor}`, `assets/icecream/scoop-${flavor}.svg`, { scale: SVG_SCALE });
  }
}

function textureKey(key: AnimalKey, variant: number) {
  return `animal-${key}-${variant}`;
}

export function preloadAnimalArt(scene: Phaser.Scene) {
  for (const key of ANIMAL_KEYS) {
    for (let variant = 1; variant <= (ANIMALS[key].variants ?? 1); variant++) {
      const file = variant === 1 ? `${key}.svg` : `${key}-${variant}.svg`;
      scene.load.svg(textureKey(key, variant), `assets/animals/${file}`, { scale: SVG_SCALE });
    }
  }
}

// Lidt forskel i størrelse, så en flok ikke ser ens ud
export function variedSize(size: number) {
  return size * Phaser.Math.FloatBetween(0.92, 1.08);
}

// Tilføjer et dyr med fødderne i (x, y). `size` er dyrets længste side i pixels.
// Uden `variant` vælges en tilfældig udgave af dyret.
export function addAnimalImage(scene: Phaser.Scene, key: AnimalKey, x: number, y: number, size: number, variant?: number) {
  const chosen = variant ?? Phaser.Math.Between(1, ANIMALS[key].variants ?? 1);
  const image = scene.add.image(x, y, textureKey(key, chosen)).setOrigin(0.5, 1);
  return image.setScale(size / Math.max(image.width, image.height));
}
