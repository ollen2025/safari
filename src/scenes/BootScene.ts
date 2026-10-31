import Phaser from 'phaser';
import { preloadAnimalSounds } from '../sound';

// Indlæser lyde og nulstiller spillets fælles data, før safarien starter
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    preloadAnimalSounds(this);
  }

  create() {
    this.registry.set('counts', {});
    this.scene.start('Drive');
  }
}
