import Phaser from 'phaser';
import { Abdul } from '../abdul';
import { drawKiosk } from '../scenery';
import { speak } from '../sound';
import { makeBigNumber, makeButton, popIn } from '../ui';

const FLAVORS = [0xf4a6c1, 0x7b4a2d, 0xfff1b5, 0xa8d672]; // jordbær, chokolade, vanilje, pistacie
const NUMBER_WORDS = ['Nul', 'En', 'To', 'Tre', 'Fire', 'Fem'];
const MAX_SCOOPS = 5;
const SCOOP_RADIUS = 62;
const BITES_PER_SCOOP = 3;
const CONE = { x: 760, top: 500, bottom: 690, halfWidth: 72 };

interface Scoop {
  container: Phaser.GameObjects.Container;
  bitesLeft: number;
}

// Ved iskiosken: tryk kugler på isen (Abdul tæller), og spis den bagefter
export class IceCreamScene extends Phaser.Scene {
  private scoops: Scoop[] = [];
  private eating = false;
  private leaving = false;
  private flavorButtons: Phaser.GameObjects.Container[] = [];
  private numberText?: Phaser.GameObjects.Text;
  private cone!: Phaser.GameObjects.Graphics;
  private abdul!: Abdul;

  constructor() {
    super('IceCream');
  }

  create() {
    this.scoops = [];
    this.eating = false;
    this.leaving = false;
    this.flavorButtons = [];
    this.numberText = undefined;
    this.cameras.main.fadeIn(400);

    this.add.rectangle(640, 200, 1280, 400, 0x8fd3f4);
    this.add.circle(1050, 120, 55, 0xffd23f);
    this.add.rectangle(640, 560, 1280, 320, 0xe9c46a);
    drawKiosk(this, 270, 720).setScale(1.8);

    this.cone = this.drawCone();
    FLAVORS.forEach((color, i) => {
      const x = i % 2 === 0 ? 190 : 350;
      const y = i < 2 ? 470 : 620;
      this.flavorButtons.push(makeButton(this, x, y, '', color, () => this.addScoop(color), 62));
    });

    // Tryk på isen for at spise den
    this.add
      .zone(CONE.x, 400, 260, 640)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.bite());

    this.abdul = new Abdul(this, 1130, 610, 0.8);
    this.abdul.say('Hvilken is vil du have? Tryk på farverne!');
  }

  private drawCone() {
    const { x, top, bottom, halfWidth } = CONE;
    const g = this.add.graphics();
    g.fillStyle(0xd9a066).fillTriangle(x - halfWidth, top, x + halfWidth, top, x, bottom);
    g.fillStyle(0xc68b4e).fillRect(x - halfWidth - 6, top - 6, (halfWidth + 6) * 2, 16);
    return g;
  }

  private addScoop(color: number) {
    if (this.eating || this.scoops.length >= MAX_SCOOPS) return;

    const y = CONE.top - 8 - this.scoops.length * SCOOP_RADIUS * 1.1;
    const g = this.add.graphics();
    g.fillStyle(color).fillCircle(0, 0, SCOOP_RADIUS);
    g.fillEllipse(-25, SCOOP_RADIUS * 0.7, 30, 26).fillEllipse(20, SCOOP_RADIUS * 0.75, 26, 22);
    g.fillStyle(0xffffff, 0.5).fillCircle(-20, -22, 14);
    const container = this.add.container(CONE.x, -100, [g]);
    this.tweens.add({ targets: container, y, duration: 500, ease: 'Bounce.easeOut' });
    this.scoops.push({ container, bitesLeft: BITES_PER_SCOOP });

    const count = this.scoops.length;
    this.showNumber(count);
    if (count === MAX_SCOOPS) {
      this.flavorButtons.forEach((b) => b.setAlpha(0.4));
      this.abdul.say('Fem kugler! Tryk på isen for at spise den!');
    } else {
      this.abdul.say(`${NUMBER_WORDS[count]}!`);
    }
  }

  private showNumber(n: number) {
    this.numberText?.destroy();
    this.numberText = makeBigNumber(this, 980, 300, n, 160);
    popIn(this, this.numberText);
  }

  private bite() {
    if (this.scoops.length === 0) return;
    if (!this.eating) {
      this.eating = true;
      this.flavorButtons.forEach((b) => b.setAlpha(0.4));
      this.numberText?.destroy();
    }

    const top = this.scoops[this.scoops.length - 1];
    top.bitesLeft--;
    speak('Nam!');
    if (top.bitesLeft > 0) {
      this.tweens.add({ targets: top.container, scale: top.bitesLeft / BITES_PER_SCOOP, duration: 120 });
      return;
    }
    this.scoops.pop();
    this.tweens.add({ targets: top.container, scale: 0, duration: 150, onComplete: () => top.container.destroy() });
    if (this.scoops.length === 0) this.finish();
  }

  private finish() {
    this.tweens.add({ targets: this.cone, alpha: 0, duration: 300 });
    const face = this.add.text(CONE.x, 400, '😋', { fontSize: '160px', padding: { x: 10, y: 10 } }).setOrigin(0.5);
    popIn(this, face);
    this.time.delayedCall(600, () => this.abdul.say('Mmm, den var god! Skal vi tage på safari igen?'));
    makeButton(this, CONE.x, 620, '🚙', 0x52b788, () => this.backToSafari()).setDepth(30);
  }

  private backToSafari() {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(400);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.stop();
      this.scene.wake('Drive', { from: 'icecream' });
    });
  }
}
