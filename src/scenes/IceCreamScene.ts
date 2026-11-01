import Phaser from 'phaser';
import { Abdul } from '../abdul';
import { line, LINES } from '../lines';
import { drawKiosk } from '../scenery';
import { speak } from '../sound';
import { makeBigNumber, makeButton, popIn } from '../ui';

const FLAVORS = ['strawberry', 'chocolate', 'vanilla', 'pistachio']; // tegninger i public/assets/icecream/
const NUMBER_WORDS = ['Nul', 'En', 'To', 'Tre', 'Fire', 'Fem'];
const MAX_SCOOPS = 5;
const BITES_PER_SCOOP = 3;
const EAT_HINT_MS = 6000; // så længe venter Abdul, før han forklarer, at man kan spise isen

const CONE = { x: 760, top: 480, width: 160 };
const SCOOP_WIDTH = 150;
const SCOOP_ORIGIN_Y = 0.62; // midten af kuglens runde top i tegningen
const SCOOP_STEP = 70; // afstand mellem kuglerne i stakken
// Den første kugle sidder nede i vaflen (bag kanten); de næste ligger ovenpå og foran
const FIRST_SCOOP_DEPTH = 5;
const CONE_DEPTH = 10;

interface Scoop {
  image: Phaser.GameObjects.Image;
  baseScale: number;
  bitesLeft: number;
}

// Ved iskiosken: tryk kugler på isen (Abdul tæller), og spis den bagefter
export class IceCreamScene extends Phaser.Scene {
  private scoops: Scoop[] = [];
  private eating = false;
  private leaving = false;
  private flavorButtons: Phaser.GameObjects.Container[] = [];
  private numberText?: Phaser.GameObjects.Text;
  private hintTimer?: Phaser.Time.TimerEvent;
  private cone!: Phaser.GameObjects.Image;
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
    this.hintTimer = undefined;
    this.cameras.main.fadeIn(400);

    this.add.rectangle(640, 200, 1280, 400, 0x8fd3f4);
    this.add.circle(1050, 120, 55, 0xffd23f);
    this.add.rectangle(640, 560, 1280, 320, 0xe9c46a);
    drawKiosk(this, 270, 720).setScale(1.8);

    this.cone = this.add.image(CONE.x, CONE.top, 'cone').setOrigin(0.5, 0).setDepth(CONE_DEPTH);
    this.cone.setScale(CONE.width / this.cone.width);

    FLAVORS.forEach((flavor, i) => {
      const x = i % 2 === 0 ? 190 : 350;
      const y = i < 2 ? 470 : 620;
      const button = makeButton(this, x, y, '', 0xfff8e7, () => this.addScoop(flavor), 62);
      const icon = this.add.image(0, 6, `scoop-${flavor}`);
      button.add(icon.setScale(95 / icon.width));
      this.flavorButtons.push(button);
    });

    // Tryk på isen for at spise den
    this.add
      .zone(CONE.x, 400, 260, 640)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.bite());

    this.abdul = new Abdul(this, 1130, 610, 0.8);
    this.abdul.say(line(LINES.iceCreamStart));
  }

  private addScoop(flavor: string) {
    if (this.eating || this.scoops.length >= MAX_SCOOPS) return;

    const index = this.scoops.length;
    const image = this.add
      .image(CONE.x, -100, `scoop-${flavor}`)
      .setOrigin(0.5, SCOOP_ORIGIN_Y)
      .setDepth(index === 0 ? FIRST_SCOOP_DEPTH : CONE_DEPTH + index);
    const baseScale = SCOOP_WIDTH / image.width;
    image.setScale(baseScale).setFlipX(Math.random() < 0.5);
    this.tweens.add({ targets: image, y: CONE.top + 14 - index * SCOOP_STEP, duration: 500, ease: 'Bounce.easeOut' });
    this.scoops.push({ image, baseScale, bitesLeft: BITES_PER_SCOOP });

    const count = this.scoops.length;
    this.showNumber(count);
    if (count === MAX_SCOOPS) {
      this.flavorButtons.forEach((b) => b.setAlpha(0.4));
      this.abdul.say(line(LINES.iceCreamMax));
    } else {
      this.abdul.say(`${NUMBER_WORDS[count]}!`);
    }

    // Hvis der ikke sker mere, forklarer Abdul, at man kan spise isen
    this.hintTimer?.remove();
    this.hintTimer = this.time.delayedCall(EAT_HINT_MS, () => {
      if (!this.eating) this.abdul.say(line(LINES.eatHint));
    });
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
      this.hintTimer?.remove();
      this.flavorButtons.forEach((b) => b.setAlpha(0.4));
      this.numberText?.destroy();
    }

    const top = this.scoops[this.scoops.length - 1];
    top.bitesLeft--;
    speak('Nam!');
    if (top.bitesLeft > 0) {
      this.tweens.add({ targets: top.image, scale: (top.baseScale * top.bitesLeft) / BITES_PER_SCOOP, duration: 120 });
      return;
    }
    this.scoops.pop();
    this.tweens.add({ targets: top.image, scale: 0, duration: 150, onComplete: () => top.image.destroy() });
    if (this.scoops.length === 0) this.finish();
  }

  private finish() {
    this.tweens.add({ targets: this.cone, alpha: 0, duration: 300 });
    const face = this.add.text(CONE.x, 400, '😋', { fontSize: '160px', padding: { x: 10, y: 10 } }).setOrigin(0.5);
    popIn(this, face);
    this.time.delayedCall(600, () => this.abdul.say(line(LINES.iceCreamDone)));
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
