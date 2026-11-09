import Phaser from 'phaser';
import { preloadAnimalArt, preloadIceCreamArt } from '../animalArt';
import { preloadAnimalSounds } from '../sound';

// Indlæser tegninger og lyde og nulstiller spillets fælles data, før startmenuen vises
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    preloadAnimalArt(this);
    preloadIceCreamArt(this);
    preloadAnimalSounds(this);
  }

  create() {
    this.registry.set('counts', {});
    this.scene.launch('Parent');
    this.scene.start('Menu');
  }
}
