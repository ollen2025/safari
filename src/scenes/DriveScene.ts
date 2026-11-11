import Phaser from 'phaser';
import { Abdul } from '../abdul';
import { addAnimalImage, BABY_SCALE, variedSize } from '../animalArt';
import { ANIMALS, currentWorld, poseOf, randomAnimal, type AnimalKey, type WorldKey } from '../animals';
import { LANDSCAPES, type Landscape } from '../landscapes';
import { line, LINES } from '../lines';
import { addWeather, BRANCH, drawBeach, drawHill, drawKiosk, drawPalm } from '../scenery';
import { CollectionBar, drawIceCreamIcon, makeButton } from '../ui';

const CRUISE_SPEED = 200; // px/s for det nærmeste lag
const ACCELERATION = 120;
const BRAKING = 170;
const ANIMAL_PARALLAX = 0.8;
const HORIZON = 300;
const WINDOW = { left: 40, right: 1240, top: 80, bottom: 510 };
const HOME_DRIVE_SECONDS = 4; // så længe kører man, før iskiosken dukker op
// Under vandet: så langt stiger ubåden op til overfladen, og så højt over havbunden ligger vandkanten
const SURFACE_RISE = 400;
const SHORELINE_Y = -60;
const SURFACE_MS = 2500;
const RESTART_CONFIRM_MS = 4000; // "start forfra" kræver to tryk inden for denne tid

type DriveState = 'driving' | 'homeward' | 'stopping' | 'stopped';

// Et lag af landskabet, der kører forbi med sin egen fart (parallax)
interface ScrollLayer {
  items: Phaser.GameObjects.Graphics[];
  factor: number;
  span: number;
}

interface PassingAnimal {
  key: AnimalKey;
  sprite: Phaser.GameObjects.Image;
  tree?: Phaser.GameObjects.Graphics; // træet som dyret hænger i eller sidder i
}

// Spilleren sidder i jeepen og kigger ud ad sidevinduet
export class DriveScene extends Phaser.Scene {
  private state: DriveState = 'driving';
  private speed = 0;
  private layers: ScrollLayer[] = [];
  private animals: PassingAnimal[] = [];
  private nextSpawn = 1.5;
  private seenWhenStopped: AnimalKey[] = [];
  private homewardTime = 0;
  private arrivingHome = false;
  private kiosk?: Phaser.GameObjects.Container;
  private restartArmedUntil = 0;
  private lookedHere = false; // man har allerede været ude ved dette stop og skal køre videre først
  private rise = 0; // hvor langt ubåden er steget op mod overfladen (0 = nede ved bunden)

  private world: WorldKey = 'safari';
  private landscape!: Landscape;
  private outside!: Phaser.GameObjects.Container;
  private animalLayer!: Phaser.GameObjects.Container;
  private abdul!: Abdul;
  private stopButton!: Phaser.GameObjects.Container;
  private standButton!: Phaser.GameObjects.Container;
  private iceCreamButton!: Phaser.GameObjects.Container;
  private driveButton!: Phaser.GameObjects.Container;

  constructor() {
    super('Drive');
  }

  create() {
    // Scenen genbruges, når man kommer tilbage fra startmenuen, så alt nulstilles her
    this.state = 'driving';
    this.speed = 0;
    this.layers = [];
    this.animals = [];
    this.nextSpawn = 1.5;
    this.seenWhenStopped = [];
    this.homewardTime = 0;
    this.arrivingHome = false;
    this.kiosk = undefined;
    this.restartArmedUntil = 0;
    this.lookedHere = false;
    this.rise = 0;
    this.world = currentWorld(this);
    this.landscape = LANDSCAPES[this.world];
    this.cameras.main.fadeIn(500);

    this.outside = this.add.container(0, 0);
    this.buildLandscape();
    this.buildInterior();

    this.abdul = new Abdul(this, 150, 620, 0.75);
    new CollectionBar(this, 640, 40, this.world);

    this.stopButton = makeButton(this, 1110, 615, '✋', 0xd62828, () => this.brake()).setVisible(false);
    this.standButton = makeButton(this, 690, 615, this.landscape.vehicle.exitIcon, 0x2a9d8f, () => this.standUp()).setVisible(false);
    this.iceCreamButton = makeButton(this, 890, 615, drawIceCreamIcon, 0xf4a6c1, () => this.driveHome()).setVisible(false);
    this.driveButton = makeButton(this, 1110, 615, this.landscape.vehicle.goIcon, 0x52b788, () => this.drive()).setVisible(false);
    // Lille knap i hjørnet, så den ikke trykkes på ved et uheld
    const restartButton = makeButton(this, 1222, 40, '🔄', 0xffffff, () => this.restart(restartButton), 32);
    makeButton(this, 58, 40, '🏠', 0xffffff, () => this.goToMenu(), 32);

    // Scenens events overlever en genstart, så lytteren fjernes igen, når scenen lukkes
    this.events.once('shutdown', () => this.events.off('wake'));
    this.events.on('wake', (_sys: Phaser.Scenes.Systems, data?: { from?: string }) => {
      if (data?.from === 'icecream') {
        this.cameras.main.fadeIn(400);
        this.abdul.say(line(this.landscape.vehicle.lines.backToSafari));
        this.drive(false);
        // Ubåden dykker ned igen
        if (this.rise > 0) this.tweens.add({ targets: this, rise: 0, duration: SURFACE_MS, ease: 'Sine.easeInOut' });
      } else {
        this.showStoppedButtons(true); // skjuler "gå ud", indtil bilen har kørt videre
        this.abdul.say(line(this.landscape.vehicle.lines.wake));
      }
    });
    this.setupKeyboard();
    // Man har lige trykket på safari-kortet, så browseren må gerne tale
    this.abdul.say(line(this.landscape.intro));
    this.drive(false);
  }

  update(time: number, delta: number) {
    const dt = delta / 1000;

    if (this.state === 'driving' || this.state === 'homeward') {
      this.speed = Math.min(CRUISE_SPEED, this.speed + ACCELERATION * dt);
    } else if (this.state === 'stopping') {
      this.speed = Math.max(0, this.speed - BRAKING * dt);
      if (this.speed === 0) this.onStopped();
    }

    for (const layer of this.layers) {
      for (const item of layer.items) {
        item.x -= this.speed * layer.factor * dt;
        if (item.x < -400) item.x += layer.span;
      }
    }

    for (const animal of this.animals) {
      animal.sprite.x -= this.speed * ANIMAL_PARALLAX * dt;
      if (animal.tree) animal.tree.x -= this.speed * ANIMAL_PARALLAX * dt;
    }
    this.animals = this.animals.filter((animal) => {
      if (animal.sprite.x > -200) return true;
      animal.sprite.destroy();
      animal.tree?.destroy();
      return false;
    });

    if (this.kiosk) {
      this.kiosk.x -= this.speed * ANIMAL_PARALLAX * dt;
      if (this.kiosk.x < -300) {
        this.kiosk.destroy();
        this.kiosk = undefined;
      }
    }

    if (this.state === 'driving') {
      this.nextSpawn -= dt;
      if (this.nextSpawn <= 0) {
        this.spawnAnimal();
        this.nextSpawn = Phaser.Math.FloatBetween(3, 6);
      }
    }

    if (this.state === 'homeward') {
      this.homewardTime += dt;
      if (!this.kiosk && this.homewardTime > HOME_DRIVE_SECONDS) {
        this.kiosk = this.landscape.beach ? this.beachKiosk() : drawKiosk(this, 1500, 490);
        this.animalLayer.add(this.kiosk);
      }
      // Bremser i tide til at holde lige ud for kiosken
      if (this.kiosk && this.kiosk.x < 760) {
        this.state = 'stopping';
        this.arrivingHome = true;
      }
    }

    // Bilen gynger lidt på den hullede vej. Når ubåden stiger op, glider landskabet ned.
    this.outside.y = this.rise + Math.sin(time / 80) * 3 * (this.speed / CRUISE_SPEED);
  }

  // Iskiosken på stranden, med palmer. Ubåden begynder at stige op til overfladen, så man kan se den.
  private beachKiosk() {
    const kiosk = drawKiosk(this, 1500, SHORELINE_Y - 20).setScale(0.8);
    kiosk.addAt([drawPalm(this, -260, 30, 0.9), drawPalm(this, 300, 20, 1.05)], 0);
    this.tweens.add({ targets: this, rise: SURFACE_RISE, duration: SURFACE_MS, ease: 'Sine.easeInOut' });
    return kiosk;
  }

  private goToMenu() {
    if (this.cameras.main.fadeEffect.isRunning) return; // dobbelttryk eller allerede på vej til is
    this.cameras.main.fadeOut(400);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Menu'));
  }

  // Mellemrum stopper bilen, og 1, 2, 3 vælger knapperne fra venstre: gå ud, is, kør videre.
  // Tasterne trykker bare på knapperne, så de kun virker, når knappen er synlig.
  private setupKeyboard() {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;
    keyboard.addCapture('SPACE');
    const keys: Record<string, Phaser.GameObjects.Container> = {
      ' ': this.stopButton,
      '1': this.standButton,
      '2': this.iceCreamButton,
      '3': this.driveButton,
    };
    keyboard.on('keydown', (event: KeyboardEvent) => {
      const button = keys[event.key];
      if (!event.repeat && button?.visible) button.emit('pointerdown');
    });

    // Små skilte på knapperne med tasten. Vises kun, hvor der er et tastatur.
    if (!this.sys.game.device.os.desktop) return;
    const badges: [Phaser.GameObjects.Container, string][] = [
      [this.stopButton, 'mellemrum'],
      [this.standButton, '1'],
      [this.iceCreamButton, '2'],
      [this.driveButton, '3'],
    ];
    for (const [button, text] of badges) {
      button.add(
        this.add
          .text(-58, -58, text, {
            fontFamily: 'sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#222',
            backgroundColor: '#fff',
            padding: { x: 8, y: 2 },
          })
          .setOrigin(0.5),
      );
    }
  }

  private showStoppedButtons(visible: boolean) {
    this.standButton.setVisible(visible && !this.lookedHere);
    this.iceCreamButton.setVisible(visible);
    this.driveButton.setVisible(visible);
  }

  private drive(announce = true) {
    this.state = 'driving';
    this.lookedHere = false;
    this.showStoppedButtons(false);
    this.stopButton.setVisible(true);
    if (announce) this.abdul.say(line(this.landscape.vehicle.lines.drive));
  }

  // Nulstiller alle fundne dyr. Første tryk spørger, andet tryk (inden for et par sekunder) starter forfra.
  private restart(button: Phaser.GameObjects.Container) {
    if (this.time.now > this.restartArmedUntil) {
      this.restartArmedUntil = this.time.now + RESTART_CONFIRM_MS;
      this.abdul.say(line(LINES.restartConfirm));
      this.tweens.add({ targets: button, angle: 360, duration: 600 });
      return;
    }
    this.restartArmedUntil = 0;
    this.registry.set('counts', {});
    this.abdul.say(line(LINES.restarted));
  }

  private driveHome() {
    this.state = 'homeward';
    this.homewardTime = 0;
    // En kiosk fra sidste tur kan stadig være på vej ud af billedet. Ellers ville vi stoppe ved den.
    this.kiosk?.destroy();
    this.kiosk = undefined;
    this.showStoppedButtons(false);
    this.abdul.say(line(this.landscape.vehicle.lines.homeward));
  }

  private brake() {
    if (this.state !== 'driving') return;
    this.state = 'stopping';
    this.stopButton.setVisible(false);
    this.abdul.say(line(this.landscape.vehicle.lines.brake));
  }

  private onStopped() {
    this.state = 'stopped';

    if (this.arrivingHome) {
      this.arrivingHome = false;
      this.abdul.say(line(LINES.arriveKiosk));
      this.time.delayedCall(1800, () => {
        this.cameras.main.fadeOut(500);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.launch('IceCream');
          this.scene.sleep();
        });
      });
      return;
    }

    this.seenWhenStopped = [
      ...new Set(
        this.animals
          .filter((a) => a.sprite.x > WINDOW.left + 30 && a.sprite.x < WINDOW.right - 30)
          .map((a) => a.key),
      ),
    ];
    this.showStoppedButtons(true);
    this.abdul.say(line(this.seenWhenStopped.length > 0 ? this.landscape.vehicle.lines.stoppedSeen : this.landscape.vehicle.lines.stoppedNothing));
  }

  private standUp() {
    this.lookedHere = true;
    this.scene.launch('Lookout', { seen: this.seenWhenStopped });
    this.scene.sleep();
  }

  private spawnAnimal() {
    const key = randomAnimal(this.world);
    if (poseOf(key) === 'hang' || poseOf(key) === 'perch') {
      this.spawnTreeAnimal(key);
      return;
    }
    const count = Math.random() < 0.3 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      // Den anden i et par er nogle gange en unge
      const baby = i > 0 && Math.random() < 0.5;
      const size = variedSize(110) * (baby ? BABY_SCALE : 1) * (ANIMALS[key].scale ?? 1);
      // Fisk og andre havdyr svømmer et stykke over bunden
      const y = Phaser.Math.Between(440, 480) - (ANIMALS[key].float ?? 0) * 110;
      const sprite = addAnimalImage(this, key, 1400 + i * 130, y, size);
      // Små børn trykker på dyret i stedet for stopknappen, så det stopper også bilen
      sprite.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.brake());
      this.animalLayer.add(sprite);
      this.animals.push({ key, sprite });
    }
  }

  // Dyr i træer (dovendyr, slanger, fugle ...) kører forbi sammen med deres træ
  private spawnTreeAnimal(key: AnimalKey) {
    const groundY = Phaser.Math.Between(450, 480);
    const tree = this.landscape.tree(this, 1400, groundY, 1);
    const { anchorY = 1, scale = 1 } = ANIMALS[key];
    const sprite = addAnimalImage(this, key, 1400 + BRANCH.x, groundY + BRANCH.y, variedSize(80) * scale);
    sprite.setOrigin(0.5, anchorY);
    sprite.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.brake());
    this.animalLayer.add([tree, sprite]);
    this.animals.push({ key, sprite, tree });
  }

  private buildLandscape() {
    const land = this.landscape;
    const sky = this.add.rectangle(640, (HORIZON - 20) / 2, 1280, HORIZON + 20, land.sky);
    const sun = this.add.circle(1050, 150, 55, 0xffd23f).setVisible(land.sun);
    const hills = this.add.container(0, 0);
    const ground = this.add.rectangle(640, (HORIZON + 740) / 2, 1280, 740 - HORIZON, land.ground);
    const trees = this.add.container(0, 0);
    const water = this.add.container(0, 0);
    this.animalLayer = this.add.container(0, 0);
    const bushes = this.add.container(0, 0);
    this.outside.add([sky, sun, hills, ground, trees, water, this.animalLayer, bushes]);
    if (land.beach) {
      // Over havet (uden for billedet, indtil ubåden stiger op): strand, sol og vandoverfladen
      const beach = drawBeach(this, 640, SHORELINE_Y, 1400, 900);
      const beachSun = this.add.circle(1050, SHORELINE_Y - 280, 55, 0xffd23f);
      const surfaceWater = this.add.rectangle(640, SHORELINE_Y + 30, 1280, 60, land.sky);
      const waves = this.add.rectangle(640, SHORELINE_Y + 3, 1280, 8, 0xbfe6f5);
      this.outside.addAt([beach, beachSun, surfaceWater, waves], 0);
    }
    if (land.weather) {
      const { left, right, top, bottom } = WINDOW;
      this.outside.add(addWeather(this, land.weather, { x: left, y: top - 20, width: right - left, height: bottom - top + 20 }));
    }

    const { Between, FloatBetween } = Phaser.Math;
    this.addLayer(hills, 5, 2100, 0.15, (x) =>
      drawHill(this, x, HORIZON + 10, Between(500, 800), Between(120, 200), land.hill),
    );
    this.addLayer(trees, land.driveTrees, 2400, 0.4, (x) => land.tree(this, x, HORIZON + 40, FloatBetween(0.8, 1.1)));
    this.addLayer(water, 1, 2600, 0.6, (x) => land.water(this, x + 1000, 440, 360, 60));
    this.addLayer(bushes, 6, 1900, 1.3, (x) => land.bush(this, x, 510, FloatBetween(1, 1.3)));
  }

  private addLayer(
    container: Phaser.GameObjects.Container,
    count: number,
    span: number,
    factor: number,
    make: (x: number) => Phaser.GameObjects.Graphics,
  ) {
    const items: Phaser.GameObjects.Graphics[] = [];
    for (let i = 0; i < count; i++) items.push(make((i * span) / count + Phaser.Math.Between(-60, 60)));
    container.add(items);
    this.layers.push({ items, factor, span });
  }

  // Jeepens (eller ubådens) indre: tag, dør og vinduesramme, tegnet oven på landskabet
  private buildInterior() {
    const { left, right, top, bottom } = WINDOW;
    const { body, trim, rivets } = this.landscape.vehicle;
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(body);
    g.fillRect(0, 0, 1280, top);
    g.fillRect(0, 0, left, 720);
    g.fillRect(right, 0, 1280 - right, 720);
    g.fillRect(0, bottom, 1280, 720 - bottom);
    g.lineStyle(14, trim).strokeRoundedRect(left, top, right - left, bottom - top, 12);
    if (rivets) {
      g.fillStyle(trim);
      for (let x = left + 20; x < right; x += 60) g.fillCircle(x, top - 22, 6).fillCircle(x, bottom + 22, 6);
      for (let y = top + 20; y < bottom; y += 60) g.fillCircle(left - 20, y, 5).fillCircle(right + 20, y, 5);
    }
  }
}
