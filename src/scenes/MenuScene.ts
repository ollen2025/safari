import Phaser from 'phaser';
import { Abdul } from '../abdul';
import { line, LINES } from '../lines';
import { drawHill } from '../scenery';
import { WORLDS, type Rect, type WorldDef } from '../worlds';

// Kortene hænger som postkort på en snor hen over himlen
const ROPE = { y: 70, sag: 120 }; // snoren hænger ned til y + sag/2 på midten
const CARD_SPACING = 210;
const FRAME = { w: 186, h: 230 };
const PAINTING: Rect = { l: -83, t: 18, w: 166, h: 170 }; // i forhold til klemmen øverst på kortet
const HORIZON = 560;
const SILHOUETTE = 0x4a2511;

// Startmenu: solnedgang over savannen, og man vælger, hvor turen går hen
export class MenuScene extends Phaser.Scene {
  private leaving = false;
  private abdul!: Abdul;

  constructor() {
    super('Menu');
  }

  create() {
    this.leaving = false;
    this.cameras.main.fadeIn(500);
    this.drawBackground();
    this.addFireflies();
    this.drawRope();

    const firstX = 640 - ((WORLDS.length - 1) * CARD_SPACING) / 2;
    const cards = WORLDS.map((world, i) => this.addCard(world, firstX + i * CARD_SPACING, i));

    this.abdul = new Abdul(this, 150, 620, 0.75);
    // Browseren må først tale, når man har trykket på noget. Taleboblen vises altid,
    // og trykker man på Abdul, siger han det igen.
    this.abdul.say(line(LINES.menuWelcome));
    this.add
      .zone(150, 620, 200, 260)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.abdul.say(line(LINES.menuWelcome)));

    this.setupKeyboard(cards);
  }

  private drawBackground() {
    const g = this.add.graphics();
    // Solnedgangshimmel: gradient fra varm terrakotta øverst til lys fersken ved horisonten
    g.fillGradientStyle(0xe76f51, 0xe76f51, 0xf4a261, 0xf4a261).fillRect(0, 0, 1280, 380);
    g.fillGradientStyle(0xf4a261, 0xf4a261, 0xffdca8, 0xffdca8).fillRect(0, 380, 1280, HORIZON - 380);

    // Stor lav sol med glød
    const sun = this.add.graphics();
    sun.fillStyle(0xfff1c1, 0.18).fillCircle(880, HORIZON, 230);
    sun.fillStyle(0xfff1c1, 0.3).fillCircle(880, HORIZON, 170);
    sun.fillStyle(0xffd166).fillCircle(880, HORIZON, 115);
    this.tweens.add({ targets: sun, alpha: { from: 1, to: 0.85 }, duration: 2500, yoyo: true, repeat: -1 });

    // Bakker og træer som mørke silhuetter mod solen
    drawHill(this, 300, HORIZON + 20, 900, 150, 0xc9774a);
    drawHill(this, 1100, HORIZON + 30, 800, 120, 0xb5653d);
    this.add.rectangle(640, (HORIZON + 720) / 2 + 10, 1280, 720 - HORIZON, 0x7f4f24);
    this.drawSilhouetteTree(560, HORIZON + 30, 1);
    this.drawSilhouetteTree(1150, HORIZON + 40, 0.75);
    this.drawSilhouetteTree(1010, HORIZON + 45, 0.5);
    this.add.graphics().fillStyle(0x5e3a1a).fillRect(0, 670, 1280, 50);
  }

  private drawSilhouetteTree(x: number, y: number, scale: number) {
    const g = this.add.graphics({ x, y }).setScale(scale);
    g.fillStyle(SILHOUETTE).fillRect(-7, -110, 14, 110);
    g.lineStyle(9, SILHOUETTE).lineBetween(0, -80, -45, -125).lineBetween(0, -90, 40, -125);
    g.fillEllipse(0, -135, 230, 42).fillEllipse(-45, -125, 120, 32).fillEllipse(50, -128, 130, 32);
  }

  // Små lysprikker, der svæver langsomt op, så menuen føles levende og hyggelig
  private addFireflies() {
    for (let i = 0; i < 14; i++) {
      const dot = this.add.circle(Phaser.Math.Between(20, 1260), Phaser.Math.Between(420, 700), Phaser.Math.Between(2, 4), 0xfff3c4);
      dot.setAlpha(0);
      this.tweens.add({
        targets: dot,
        y: dot.y - Phaser.Math.Between(80, 160),
        x: dot.x + Phaser.Math.Between(-30, 30),
        alpha: { from: 0, to: 0.8 },
        duration: Phaser.Math.Between(3000, 5000),
        delay: Phaser.Math.Between(0, 4000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private ropeY(x: number) {
    const t = x / 1280;
    return ROPE.y + ROPE.sag * 2 * t * (1 - t);
  }

  private drawRope() {
    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(-20, this.ropeY(-20)),
      new Phaser.Math.Vector2(640, ROPE.y + ROPE.sag),
      new Phaser.Math.Vector2(1300, this.ropeY(1300)),
    );
    const g = this.add.graphics();
    g.lineStyle(4, 0x6b4423);
    curve.draw(g, 64);
  }

  private addCard(world: WorldDef, x: number, index: number): Phaser.GameObjects.Container {
    const ready = world.play !== undefined;
    const g = this.add.graphics();
    // Skygge og lys papirkant (som et polaroid-foto)
    g.fillStyle(0x000000, 0.2).fillRoundedRect(-FRAME.w / 2 + 6, 14, FRAME.w, FRAME.h, 14);
    g.fillStyle(0xfff4e0).fillRoundedRect(-FRAME.w / 2, 8, FRAME.w, FRAME.h, 14);
    world.paint(g, PAINTING);
    // Træklemme
    g.fillStyle(0xc68b59).fillRoundedRect(-9, -10, 18, 30, 4);
    g.fillStyle(0x8c5a3c).fillRect(-9, 4, 18, 3);

    const centerY = PAINTING.t + PAINTING.h / 2;
    const emoji = this.add
      .text(0, centerY + 20, world.emoji, { fontSize: '72px', padding: { x: 8, y: 8 } })
      .setOrigin(0.5);
    const title = this.add
      .text(0, PAINTING.t + PAINTING.h + 25, world.title, {
        fontFamily: 'Georgia, serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: ready ? '#7a3e21' : '#a58a74',
      })
      .setOrigin(0.5);
    const parts: Phaser.GameObjects.GameObject[] = [g, emoji, title];

    if (!ready) {
      // Ikke klar endnu: lidt dæmpet med en hængelås
      const veil = this.add.graphics().fillStyle(0x5a3e2b, 0.35);
      veil.fillRoundedRect(PAINTING.l, PAINTING.t, PAINTING.w, PAINTING.h, 8);
      const lock = this.add.text(PAINTING.l + PAINTING.w - 22, PAINTING.t + 22, '🔒', { fontSize: '30px', padding: { x: 4, y: 4 } }).setOrigin(0.5);
      parts.push(veil, lock);
    }

    // Usynlig trykflade over hele kortet. Som barn af containeren svajer og skalerer den med.
    const hit = this.add.zone(0, FRAME.h / 2, FRAME.w, FRAME.h + 20).setInteractive({ useHandCursor: true });
    parts.push(hit);
    const card = this.add.container(x, this.ropeY(x), parts).setData('baseX', x);
    hit.on('pointerdown', () => this.choose(world, card));

    // Kortene svajer lidt på snoren, hver i sin egen takt
    const sway = Phaser.Math.FloatBetween(1.5, 3);
    card.setAngle(index % 2 === 0 ? -sway : sway);
    this.tweens.add({
      targets: card,
      angle: index % 2 === 0 ? sway : -sway,
      duration: Phaser.Math.Between(1800, 2600),
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
    if (ready) {
      this.tweens.add({ targets: card, scale: 1.06, duration: 900, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
    }

    this.addKeyBadge(card, String(index + 1));
    return card;
  }

  // Tasten der vælger kortet, vist i et lille skilt. Kun hvor der er et tastatur.
  private addKeyBadge(card: Phaser.GameObjects.Container, key: string) {
    if (!this.sys.game.device.os.desktop) return;
    card.add(
      this.add
        .text(-FRAME.w / 2 + 6, 20, key, {
          fontFamily: 'sans-serif',
          fontSize: '22px',
          fontStyle: 'bold',
          color: '#222',
          backgroundColor: '#fff',
          padding: { x: 8, y: 2 },
        })
        .setOrigin(0.5),
    );
  }

  private setupKeyboard(cards: Phaser.GameObjects.Container[]) {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.repeat) return;
      const index = event.key === ' ' || event.key === 'Enter' ? 0 : Number(event.key) - 1;
      // Number('x') giver NaN, og WORLDS[NaN] er undefined, så andre taster gør ingenting
      const world = WORLDS[index];
      if (world) this.choose(world, cards[index]);
    });
  }

  private choose(world: WorldDef, card: Phaser.GameObjects.Container) {
    if (this.leaving) return;
    if (!world.play) {
      // Ryst kortet og lad Abdul forklare, at den verden kommer senere
      const baseX: number = card.getData('baseX');
      this.tweens.add({ targets: card, x: { from: baseX, to: baseX + 8 }, duration: 60, yoyo: true, repeat: 3 });
      this.abdul.say(line(LINES.worldLocked, { name: world.spokenName }));
      return;
    }
    this.registry.set('world', world.play);
    this.leaving = true;
    this.tweens.add({ targets: card, scale: 1.25, duration: 300, ease: 'Back.easeOut' });
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Drive'));
  }
}
