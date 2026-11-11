import Phaser from 'phaser';
import { addAnimalImage } from './animalArt';
import { animalsIn, getCounts, type AnimalKey, type WorldKey } from './animals';

// En knaps ikon: en emoji, eller en funktion der tegner ikonet omkring (0, 0) i den givne størrelse
export type ButtonIcon = string | ((scene: Phaser.Scene, size: number) => Phaser.GameObjects.GameObject);

// Stor rund knap med en emoji (eller tegning). Hele firkanten omkring er trykbar, så små fingre rammer.
export function makeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  emoji: ButtonIcon,
  color: number,
  onTap: () => void,
  radius = 80,
): Phaser.GameObjects.Container {
  const bg = scene.add.graphics();
  bg.fillStyle(0x000000, 0.25).fillCircle(4, 6, radius);
  bg.fillStyle(color).fillCircle(0, 0, radius);
  bg.lineStyle(6, 0xffffff, 0.8).strokeCircle(0, 0, radius - 3);
  const icon =
    typeof emoji === 'string'
      ? scene.add.text(0, 0, emoji, { fontSize: `${radius}px`, padding: { x: 6, y: 6 } }).setOrigin(0.5)
      : emoji(scene, radius * 1.4);

  const button = scene.add.container(x, y, [bg, icon]).setSize(radius * 2, radius * 2).setDepth(20);
  button.setInteractive({ useHandCursor: true });
  button.on('pointerdown', () => {
    scene.tweens.add({ targets: button, scale: { from: 1, to: 0.88 }, duration: 80, yoyo: true });
    onTap();
  });
  return button;
}

// Is med en jordbærkugle, lavet af de samme tegninger som i iskiosken. `size` er højden.
export function drawIceCreamIcon(scene: Phaser.Scene, size: number) {
  const width = size * 0.53; // vaflens bredde
  const scoopAbove = 0.465 * width; // så meget af kuglen stikker op over vaflen
  const total = scoopAbove + width * (210 / 160);
  const coneTop = -total / 2 + scoopAbove;
  const scoop = scene.add.image(0, coneTop, 'scoop-strawberry').setOrigin(0.5, 0.62);
  scoop.setScale((width * 0.94) / scoop.width);
  const cone = scene.add.image(0, coneTop, 'cone').setOrigin(0.5, 0);
  cone.setScale(width / cone.width);
  return scene.add.container(0, 0, [scoop, cone]);
}

// Safari-jeep set fra siden til knappen "kør videre". `size` er bredden.
export function drawJeepIcon(scene: Phaser.Scene, size: number) {
  const s = size / 110;
  const g = scene.add.graphics();
  const outline = 0x2b2118;
  const P = (points: number[][]) => points.map(([x, y]) => new Phaser.Math.Vector2(x * s, y * s));
  g.lineStyle(4 * s, outline);
  // Reservehjul bagpå
  g.fillStyle(0x333333).fillCircle(50 * s, 0, 10 * s).strokeCircle(50 * s, 0, 10 * s);
  // Førerhus og vinduer
  const cabin = P([[-30, -6], [-22, -34], [24, -34], [30, -6]]);
  g.fillStyle(0xe9c46a).fillPoints(cabin, true).strokePoints(cabin, true);
  g.fillStyle(0x8fd3f4).lineStyle(3 * s, outline);
  for (const win of [P([[-24, -10], [-18, -29], [-3, -29], [-3, -10]]), P([[3, -10], [3, -29], [19, -29], [24, -10]])]) {
    g.fillPoints(win, true).strokePoints(win, true);
  }
  // Karosseri med en stribe
  g.lineStyle(4 * s, outline).fillStyle(0xe9c46a);
  g.fillRoundedRect(-50 * s, -8 * s, 98 * s, 28 * s, 7 * s).strokeRoundedRect(-50 * s, -8 * s, 98 * s, 28 * s, 7 * s);
  g.fillStyle(0x6a994e).fillRect(-48 * s, 2 * s, 94 * s, 6 * s);
  g.fillStyle(0xfff3b0).fillCircle(-46 * s, -1 * s, 4 * s);
  // Hjul
  for (const wx of [-28, 28]) {
    g.fillStyle(0x333333).fillCircle(wx * s, 20 * s, 14 * s).strokeCircle(wx * s, 20 * s, 14 * s);
    g.fillStyle(0xbbbbbb).fillCircle(wx * s, 20 * s, 5 * s);
  }
  return g;
}

// Gul ubåd til knappen "sejl videre" (der findes ingen ubåds-emoji). `size` er bredden.
export function drawSubmarineIcon(scene: Phaser.Scene, size: number) {
  const s = size / 110;
  const g = scene.add.graphics();
  const outline = 0x2b2118;
  g.lineStyle(4 * s, outline);
  g.fillStyle(0xa87a05).fillTriangle(42 * s, 8 * s, 58 * s, -10 * s, 58 * s, 26 * s).strokeTriangle(42 * s, 8 * s, 58 * s, -10 * s, 58 * s, 26 * s);
  g.lineStyle(5 * s, 0x555555).lineBetween(6 * s, -26 * s, 6 * s, -42 * s).lineBetween(6 * s, -42 * s, 18 * s, -42 * s);
  g.lineStyle(4 * s, outline);
  g.fillStyle(0xf2b705).fillRoundedRect(-20 * s, -30 * s, 36 * s, 26 * s, 6 * s).strokeRoundedRect(-20 * s, -30 * s, 36 * s, 26 * s, 6 * s);
  g.fillEllipse(0, 8 * s, 96 * s, 44 * s).strokeEllipse(0, 8 * s, 96 * s, 44 * s);
  g.lineStyle(3 * s, outline).fillStyle(0x8fd3f4);
  for (const dx of [-26, -4, 18]) g.fillCircle(dx * s, 8 * s, 7 * s).strokeCircle(dx * s, 8 * s, 7 * s);
  return g;
}

// Stort gult tal med sort kant, til at øve tal ("3 zebraer", "3 kugler")
export function makeBigNumber(scene: Phaser.Scene, x: number, y: number, value: number, fontSize: number) {
  return scene.add
    .text(x, y, String(value), {
      fontFamily: 'sans-serif',
      fontSize: `${fontSize}px`,
      fontStyle: 'bold',
      color: '#ffd23f',
      stroke: '#000',
      strokeThickness: fontSize / 12,
    })
    .setOrigin(0.5);
}

// Lader noget poppe frem fra lille til fuld størrelse
export function popIn(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject) {
  scene.tweens.add({ targets: target, scale: { from: 0.3, to: 1 }, duration: 400, ease: 'Back.easeOut' });
}

interface Slot {
  icon: Phaser.GameObjects.Image;
  iconScale: number;
  badge: Phaser.GameObjects.Container;
  label: Phaser.GameObjects.Text;
  shown: number;
}

// Række med verdenens dyr øverst på skærmen og hvor mange man har fundet af hver.
// Ikke-fundne dyr vises som grå silhuetter.
export class CollectionBar {
  private readonly slots = new Map<AnimalKey, Slot>();

  constructor(private readonly scene: Phaser.Scene, x: number, y: number, world: WorldKey) {
    const keys = animalsIn(world);
    const spacing = 70;
    const width = keys.length * spacing + 20;
    const startX = x - ((keys.length - 1) * spacing) / 2;

    const bg = scene.add.graphics().fillStyle(0x000000, 0.35).fillRoundedRect(x - width / 2, y - 34, width, 68, 34);
    const container = scene.add.container(0, 0, [bg]).setDepth(20);
    keys.forEach((key, i) => {
      const slotX = startX + i * spacing;
      const icon = addAnimalImage(scene, key, slotX, y + 24, 50, 1);
      const label = scene.add
        .text(0, 0, '', { fontFamily: 'sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#222' })
        .setOrigin(0.5);
      const badge = scene.add.container(slotX + 22, y + 20, [scene.add.circle(0, 0, 14, 0xffd23f), label]);
      container.add([icon, badge]);
      this.slots.set(key, { icon, iconScale: icon.scale, badge, label, shown: 0 });
    });
    this.refresh(false);

    const onChange = () => this.refresh(true);
    scene.registry.events.on('changedata-counts', onChange);
    scene.events.once('shutdown', () => scene.registry.events.off('changedata-counts', onChange));
  }

  private refresh(animate: boolean) {
    const counts = getCounts(this.scene);
    for (const [key, slot] of this.slots) {
      const count = counts[key] ?? 0;
      slot.badge.setVisible(count > 0);
      slot.label.setText(String(count));
      if (count === 0) {
        slot.icon.setTintFill(0x222222).setAlpha(0.45);
      } else {
        slot.icon.clearTint().setAlpha(1);
      }

      if (animate && count !== slot.shown) {
        this.scene.tweens.add({ targets: slot.badge, scale: { from: 2, to: 1 }, duration: 500, ease: 'Back.easeOut' });
        if (slot.shown === 0) {
          this.scene.tweens.add({
            targets: slot.icon,
            scale: { from: slot.iconScale * 2, to: slot.iconScale },
            duration: 500,
            ease: 'Back.easeOut',
          });
        }
      }
      slot.shown = count;
    }
  }
}
