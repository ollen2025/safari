import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { DriveScene } from './scenes/DriveScene';
import { IceCreamScene } from './scenes/IceCreamScene';
import { LookoutScene } from './scenes/LookoutScene';
import { LookoutUIScene } from './scenes/LookoutUIScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#87ceeb',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // Kun den første scene starter automatisk. Rækkefølgen bestemmer også, hvilken scene der tegnes øverst.
  scene: [BootScene, DriveScene, LookoutScene, LookoutUIScene, IceCreamScene],
});
