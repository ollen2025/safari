import Phaser from 'phaser';
import { addAnimalImage, BABY_SCALE, HANG_ORIGIN_Y, variedSize } from '../animalArt';
import { ANIMALS, randomAnimal, type AnimalKey } from '../animals';
import { drawAcacia, drawBush, drawHill, drawWaterhole } from '../scenery';
import { playAnimalSound } from '../sound';

const WORLD_WIDTH = 3840;
const HORIZON = 340;
const SPYGLASS_ZOOM = 3;
const PAN_SPEED = 700;
const WATERHOLE_Y = 545;

// Hvor langt væk et dyr står. Dyr langt væk er så små, at man skal bruge kikkerten.
// hitSize er det mindste trykbare område i verdens-pixels, så små fingre kan ramme:
// 120 px for dyr, man ser uden kikkert, og 50 px for dyr langt væk (= 150 px på skærmen med kikkerten).
const DISTANCES = {
  near: { y: 650, size: 150, hitSize: 120 },
  mid: { y: 480, size: 70, hitSize: 120 },
  far: { y: 385, size: 24, hitSize: 50 },
};
const HERD_SPACING = 55; // større end hitSize for "far", så trykområderne i en flok ikke overlapper
const TAP_TOLERANCE = 30; // så meget må fingeren flytte sig, før det tæller som et træk
type Distance = keyof typeof DISTANCES;

const DRINKERS: AnimalKey[] = ['elephant', 'zebra', 'buffalo', 'giraffe', 'gnu', 'gazelle'];

// Spilleren står op i jeepen og kigger ud over savannen.
// Knapperne ligger i LookoutUIScene, så de ikke zoomer med, når kikkerten bruges.
export class LookoutScene extends Phaser.Scene {
  panDirection = 0;
  private seen: AnimalKey[] = [];

  constructor() {
    super('Lookout');
  }

  // Phaser genbruger scene-objektet, så tilstand skal nulstilles her og ikke i felterne
  init(data: { seen?: AnimalKey[] }) {
    this.seen = data.seen ?? [];
    this.panDirection = 0;
  }

  create() {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_WIDTH, 720);
    cam.setZoom(1);
    cam.centerOn(WORLD_WIDTH / 2, 360);

    this.buildLandscape();
    this.placeAnimals();

    // Træk med fingeren for at kigge rundt. Vi husker selv sidste position, fordi Phasers
    // prevPosition kan stamme fra en tidligere berøring på touch. Første bevægelse efter et
    // nyt tryk (ny downTime) sætter kun startpunktet, også hvis trykket begyndte på en knap i UI-scenen.
    const last = { x: 0, y: 0 };
    let dragDownTime = -1;
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!p.isDown) return;
      if (p.downTime !== dragDownTime) {
        dragDownTime = p.downTime;
        last.x = p.x;
        last.y = p.y;
        return;
      }
      cam.scrollX -= (p.x - last.x) / cam.zoom;
      cam.scrollY -= (p.y - last.y) / cam.zoom;
      last.x = p.x;
      last.y = p.y;
    });

    this.scene.launch('LookoutUI');
  }

  update(_time: number, delta: number) {
    // Stop drejningen, hvis ingen finger er nede, fx hvis systemet afbrød berøringen
    if (!this.input.manager.pointers.some((p) => p.isDown)) this.panDirection = 0;
    if (this.panDirection === 0) return;
    const cam = this.cameras.main;
    cam.scrollX += (this.panDirection * PAN_SPEED * (delta / 1000)) / cam.zoom;
  }

  setSpyglass(on: boolean) {
    const cam = this.cameras.main;
    cam.zoomTo(on ? SPYGLASS_ZOOM : 1, 400, 'Sine.easeInOut');
    if (on) cam.pan(cam.midPoint.x, HORIZON + 30, 400, 'Sine.easeInOut');
  }

  private buildLandscape() {
    const { Between, FloatBetween } = Phaser.Math;

    this.add.rectangle(WORLD_WIDTH / 2, HORIZON / 2, WORLD_WIDTH, HORIZON, 0x8fd3f4).setDepth(-10);
    this.add.circle(WORLD_WIDTH / 2 + 450, 130, 55, 0xffd23f).setDepth(-10);
    for (let x = 0; x < WORLD_WIDTH + 400; x += Between(350, 550)) {
      drawHill(this, x, HORIZON + 10, Between(500, 800), Between(100, 180), 0xb5c99a).setDepth(-9);
    }
    this.add.rectangle(WORLD_WIDTH / 2, (HORIZON + 720) / 2, WORLD_WIDTH, 720 - HORIZON, 0xe9c46a).setDepth(-8);
    // Lysere, diset bånd langt væk
    this.add.rectangle(WORLD_WIDTH / 2, HORIZON + 30, WORLD_WIDTH, 60, 0xf0d58c).setDepth(-7);

    // Alt i landskabet får depth = y, så det der står tættest på tegnes forrest
    for (let i = 0; i < 14; i++) {
      const far = Math.random() < 0.5;
      const y = far ? HORIZON + 45 : Between(450, 520);
      drawAcacia(this, Between(0, WORLD_WIDTH), y, far ? 0.25 : FloatBetween(0.5, 0.7)).setDepth(y);
    }
    for (let x = 100; x < WORLD_WIDTH; x += Between(400, 700)) {
      drawBush(this, x, 700, FloatBetween(1, 1.4)).setDepth(700);
    }
  }

  private placeAnimals() {
    const center = WORLD_WIDTH / 2;
    const { Between } = Phaser.Math;

    // De dyr, der var i vinduet da bilen stoppede, står tæt på
    this.seen.forEach((key, i) => {
      const x = center + (i - (this.seen.length - 1) / 2) * 380;
      this.addAnimal(key, x, i === 0 ? 'near' : 'mid');
    });
    // Der skal altid være noget at se, når man rejser sig
    if (this.seen.length === 0) this.addAnimal(randomAnimal(), center + Between(-300, 300), 'mid');

    // Vandhullet ligger lidt ude til siden, så man skal kigge rundt for at finde det
    const waterholeX = center + (Math.random() < 0.5 ? -1 : 1) * 700;
    this.placeWaterhole(waterholeX);

    // Flere dyr rundt omkring, de fleste langt væk
    const slots = Phaser.Utils.Array.Shuffle(
      Array.from({ length: 12 }, (_, i) => 200 + i * 300).filter(
        (x) => Math.abs(x - center) > 600 && Math.abs(x - waterholeX) > 400,
      ),
    );
    const extras: Distance[] = ['mid', 'far', 'far', 'far'];
    extras.forEach((distance, i) => {
      const key = randomAnimal();
      const herd = distance === 'far' && !ANIMALS[key].hangs ? Between(1, 3) : 1;
      const x = slots[i] + Between(-40, 40);
      for (let j = 0; j < herd; j++) this.addAnimal(key, x + j * HERD_SPACING, distance, j > 0 && Math.random() < 0.4);
    });
  }

  private placeWaterhole(x: number) {
    drawWaterhole(this, x, WATERHOLE_Y, 520, 90).setDepth(WATERHOLE_Y - 10);
    this.addAnimalAt('hippo', x - 60 + Phaser.Math.Between(-40, 40), WATERHOLE_Y + 10, 110, 120, 0.55);
    // Nogle gange lurer der en krokodille, hvor kun øjne og ryg stikker op
    if (Math.random() < 0.6) this.addAnimalAt('crocodile', x + 110, WATERHOLE_Y + 16, 160, 120, 0.45);
    // Et dyr drikker ved den anden bred
    this.addAnimalAt(Phaser.Utils.Array.GetRandom(DRINKERS), x + 170, WATERHOLE_Y - 40, 90, 120);
  }

  private addAnimal(key: AnimalKey, x: number, distance: Distance, baby = false) {
    const { y, size, hitSize } = DISTANCES[distance];
    this.addAnimalAt(key, x, y, variedSize(size) * (baby ? BABY_SCALE : 1), hitSize);
  }

  // (x, y) er hvor dyret står. `waterline` er hvor stor en del af dyret der stikker op af vandet.
  private addAnimalAt(key: AnimalKey, x: number, y: number, size: number, hitSize: number, waterline?: number) {
    const hangs = ANIMALS[key].hangs ?? false;
    const sprite = addAnimalImage(this, key, x, y, size).setDepth(y).setFlipX(Math.random() < 0.5);

    // Trykområdet er mindst hitSize stort og centreret på dyret. Det angives i billedets egne
    // (uskalerede) koordinater, derfor divideres med skalaen.
    const hitWidth = Math.max(sprite.width, hitSize / sprite.scaleX);
    const hitHeight = Math.max(sprite.height, hitSize / sprite.scaleY);
    sprite.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(
        (sprite.width - hitWidth) / 2,
        (sprite.height - hitHeight) / 2,
        hitWidth,
        hitHeight,
      ),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    let baseY = y;
    if (waterline !== undefined) {
      // Kun den øverste del stikker op af vandet
      sprite.setCrop(0, 0, sprite.width, sprite.height * waterline);
      baseY = y + sprite.height * (1 - waterline) * sprite.scaleY;
      sprite.setY(baseY);
    }
    if (hangs) {
      // Hænger i et akacietræ, der står hvor dyret ellers ville stå
      const treeScale = size / 80;
      drawAcacia(this, x - 45 * treeScale, y, treeScale).setDepth(y - 1);
      baseY = y - 118 * treeScale;
      sprite.setOrigin(0.5, HANG_ORIGIN_Y).setY(baseY);
    }

    this.tweens.add({
      targets: sprite,
      scaleY: sprite.scaleY * 1.06,
      duration: Phaser.Math.Between(800, 1200),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    let found = false;
    sprite.on('pointerup', (p: Phaser.Input.Pointer) => {
      // Det var et træk for at kigge rundt, ikke et tryk på dyret
      if (Phaser.Math.Distance.Between(p.downX, p.downY, p.upX, p.upY) > TAP_TOLERANCE) return;

      playAnimalSound(this, key);
      // Dyr hopper op; dovendyr gynger lidt ned i grenen
      this.tweens.add({
        targets: sprite,
        y: { from: baseY, to: baseY + (hangs ? size * 0.15 : -size * 0.4) },
        duration: 180,
        yoyo: true,
        ease: 'Quad.easeOut',
      });

      if (found) return;
      found = true;
      this.add
        .text(x, hangs ? baseY + size * 1.15 : y - size * 1.2, '⭐', { fontSize: `${Math.max(14, size * 0.4)}px` })
        .setOrigin(0.5)
        .setDepth(y);
      this.events.emit('animal-found', key);
    });
  }
}
