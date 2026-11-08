import Phaser from 'phaser';
import { Abdul } from '../abdul';
import { addAnimalImage } from '../animalArt';
import { ANIMALS, animalsIn, countAnimal, currentWorld, getCounts, type AnimalKey } from '../animals';
import { line, LINES } from '../lines';
import { CollectionBar, makeBigNumber, makeButton, popIn } from '../ui';
import type { LookoutScene } from './LookoutScene';

// Knapper og kikkert-ramme oven på LookoutScene. Kører som sin egen scene,
// så den ikke bliver zoomet, når kikkerten bruges.
export class LookoutUIScene extends Phaser.Scene {
  private spyglassOn = false;

  constructor() {
    super('LookoutUI');
  }

  create() {
    const world = this.scene.get('Lookout') as LookoutScene;
    this.spyglassOn = false;

    // Jeepens forkant, som spilleren står i
    this.add.graphics().fillStyle(0x2f3720).fillRect(0, 652, 1280, 10).fillStyle(0x4a5530).fillRect(0, 660, 1280, 60);

    const abdul = new Abdul(this, 300, 640, 0.55);
    const overlay = this.add.image(640, 360, this.spyglassTexture()).setDepth(15).setVisible(false);
    new CollectionBar(this, 640, 45, currentWorld(this));

    makeButton(this, 110, 620, '🚙', 0x52b788, () => this.sitDown(), 75);
    makeButton(this, 1170, 620, '🔭', 0xe76f51, () => {
      this.spyglassOn = !this.spyglassOn;
      overlay.setVisible(this.spyglassOn);
      world.setSpyglass(this.spyglassOn);
    }, 75);
    this.addPanButton(70, 330, '◀️', -1, world);
    this.addPanButton(1210, 330, '▶️', 1, world);
    this.input.on('pointerup', () => (world.panDirection = 0));

    const onFound = (key: AnimalKey) => {
      const count = countAnimal(this, key);
      const counts = getCounts(this);
      const foundAll = animalsIn(currentWorld(this)).every((k) => (counts[k] ?? 0) > 0);
      this.showCount(key, count);

      let text = line(LINES.foundMore, { n: count, plural: ANIMALS[key].plural });
      if (count === 1) text = foundAll ? line(LINES.foundAll) : line(LINES.foundFirst, { name: ANIMALS[key].name });
      this.time.delayedCall(900, () => abdul.say(text));
    };
    world.events.on('animal-found', onFound);
    this.events.once('shutdown', () => world.events.off('animal-found', onFound));

    abdul.say(line(LINES.lookoutStart));
  }

  private sitDown() {
    this.scene.stop('Lookout');
    this.scene.wake('Drive');
    this.scene.stop();
  }

  // Stort tal med dyret, så man kan øve tal: "3 zebraer"
  private showCount(key: AnimalKey, count: number) {
    const icon = addAnimalImage(this, key, -60, 60, 110, 1);
    const number = makeBigNumber(this, 60, 0, count, 110);
    const toast = this.add.container(640, 190, [icon, number]).setDepth(40);
    popIn(this, toast);
    this.tweens.add({ targets: toast, alpha: 0, delay: 1800, duration: 400, onComplete: () => toast.destroy() });
  }

  // Hold knappen nede for at dreje hovedet
  private addPanButton(x: number, y: number, emoji: string, direction: number, world: LookoutScene) {
    const button = makeButton(this, x, y, emoji, 0xffffff, () => (world.panDirection = direction), 55).setAlpha(0.8);
    button.on('pointerout', () => (world.panDirection = 0));
  }

  // Sort skærm med et rundt hul, tegnet én gang på et canvas
  private spyglassTexture(): string {
    const key = 'spyglass';
    if (!this.textures.exists(key)) {
      const texture = this.textures.createCanvas(key, 1280, 720)!;
      const ctx = texture.context;
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, 1280, 720);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(640, 360, 290, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 20;
      ctx.strokeStyle = '#5c4033';
      ctx.beginPath();
      ctx.arc(640, 360, 295, 0, Math.PI * 2);
      ctx.stroke();
      texture.refresh();
    }
    return key;
  }
}
