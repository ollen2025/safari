import Phaser from 'phaser';

// Simple tegninger af landskabet. Hver funktion tegner omkring (0, 0), hvor y er bunden.

export function drawHill(scene: Phaser.Scene, x: number, y: number, width: number, height: number, color = 0xa3b18a) {
  return scene.add.graphics({ x, y }).fillStyle(color).fillEllipse(0, 0, width, height);
}

export function drawAcacia(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x6b4423).fillRect(-8, -110, 16, 110);
  g.lineStyle(10, 0x6b4423).lineBetween(0, -80, -45, -125).lineBetween(0, -90, 40, -125);
  g.fillStyle(0x52734d).fillEllipse(0, -135, 230, 45).fillEllipse(-45, -125, 120, 35).fillEllipse(50, -128, 130, 35);
  return g.setScale(scale);
}

export function drawBush(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x6a994e).fillEllipse(-40, 0, 110, 70).fillEllipse(30, -10, 120, 85).fillEllipse(80, 5, 90, 60);
  return g.setScale(scale);
}

// Vandhul med mudret bred. (x, y) er midten af vandet.
export function drawWaterhole(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0xc9a96e).fillEllipse(0, 0, width + 30, height + 16);
  g.fillStyle(0x5fa8d3).fillEllipse(0, 0, width, height);
  g.fillStyle(0x9ccfe8).fillEllipse(-width * 0.15, -height * 0.15, width * 0.5, height * 0.35);
  return g;
}

// Iskiosk med stribet markise
export function drawKiosk(scene: Phaser.Scene, x: number, y: number) {
  const g = scene.add.graphics();
  g.fillStyle(0xffffff).fillRect(-110, -160, 220, 160);
  g.fillStyle(0xf4a6c1).fillRect(-110, -60, 220, 60);
  const stripes = 6;
  const stripeWidth = 260 / stripes;
  for (let i = 0; i < stripes; i++) {
    g.fillStyle(i % 2 === 0 ? 0xe63946 : 0xffffff).fillRect(-130 + i * stripeWidth, -200, stripeWidth, 45);
  }
  const sign = scene.add.text(0, -240, '🍦', { fontSize: '70px', padding: { x: 6, y: 6 } }).setOrigin(0.5);
  return scene.add.container(x, y, [g, sign]);
}

// Punktet på grenen (i forhold til træets fod ved scale 1), hvor dyr hænger eller sidder.
// Både akacietræet og junglens træ har en gren her.
export const BRANCH = { x: 45, y: -118 };

// Højt jungletræ med en vandret gren til dovendyr, slanger og fugle, og lianer der hænger ned
export function drawJungleTree(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x5c3d2e).fillRect(-11, -230, 22, 230);
  g.fillStyle(0x5c3d2e).fillTriangle(-24, 0, 24, 0, 0, -40);
  g.lineStyle(12, 0x5c3d2e).lineBetween(0, -108, 88, -128);
  g.fillStyle(0x2d6a4f).fillEllipse(92, -134, 50, 26);
  g.fillStyle(0x1b4332).fillEllipse(-50, -230, 130, 80).fillEllipse(50, -238, 140, 86);
  g.fillStyle(0x2d6a4f).fillEllipse(0, -265, 170, 90).fillEllipse(-70, -250, 90, 60).fillEllipse(75, -255, 100, 60);
  g.fillStyle(0x40916c).fillEllipse(-20, -280, 90, 44).fillEllipse(40, -268, 70, 36);
  g.lineStyle(3, 0x52b788).lineBetween(-60, -205, -66, -150).lineBetween(-30, -200, -28, -170).lineBetween(70, -210, 74, -160);
  return g.setScale(scale);
}

// Store bregner og blade i junglen
export function drawFern(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x1b4332).fillEllipse(-40, -10, 120, 80).fillEllipse(40, -14, 130, 90);
  g.fillStyle(0x2d6a4f).fillEllipse(-70, -30, 90, 36).fillEllipse(70, -36, 100, 36).fillEllipse(0, -50, 80, 60);
  g.fillStyle(0x52b788).fillEllipse(-20, -40, 60, 22).fillEllipse(36, -54, 56, 20);
  return g.setScale(scale);
}

// Skovsø i junglen med åkander
export function drawPond(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x5c4a2e).fillEllipse(0, 0, width + 30, height + 16);
  g.fillStyle(0x3a7d6b).fillEllipse(0, 0, width, height);
  g.fillStyle(0x6fb3a0).fillEllipse(-width * 0.15, -height * 0.15, width * 0.45, height * 0.3);
  g.fillStyle(0x52b788).fillEllipse(width * 0.2, height * 0.1, 40, 14).fillEllipse(width * 0.3, -height * 0.15, 30, 10);
  g.fillStyle(0xf4a6c1).fillCircle(width * 0.2, height * 0.08, 5);
  return g;
}

// Klippe med sne på toppen og en hylde (ved BRANCH), hvor fugle kan sidde
export function drawIceRock(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x6c7a89).fillTriangle(-70, 0, -30, -190, 20, 0).fillTriangle(-10, 0, 20, -150, 60, 0);
  g.fillStyle(0x8d99ae).fillTriangle(-50, 0, -30, -190, -5, 0);
  g.fillStyle(0x6c7a89).fillRect(0, -118, 80, 26);
  g.fillStyle(0xffffff).fillRect(-4, -124, 86, 8).fillEllipse(78, -120, 14, 12);
  g.fillStyle(0xffffff).fillTriangle(-42, -150, -30, -190, -18, -150);
  return g.setScale(scale);
}

// Snedrive og isklumper
export function drawSnowDrift(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0xdbeef7).fillEllipse(-30, 0, 130, 60).fillEllipse(40, -6, 120, 70);
  g.fillStyle(0xffffff).fillEllipse(-36, -8, 100, 40).fillEllipse(36, -16, 90, 44);
  g.fillStyle(0xa9d6e5).fillTriangle(70, 0, 90, -40, 110, 0);
  return g.setScale(scale);
}

// Hul i isen med mørkt, koldt vand
export function drawIceHole(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0xffffff).fillEllipse(0, 0, width + 40, height + 24);
  g.fillStyle(0xa9d6e5).fillEllipse(0, 2, width + 10, height + 6);
  g.fillStyle(0x1d6fa3).fillEllipse(0, 0, width, height);
  g.fillStyle(0x4ea8de).fillEllipse(-width * 0.15, -height * 0.15, width * 0.45, height * 0.3);
  return g;
}

// Sne der falder stille ned inden for et område. Flagerne starter forfra i toppen, når de når bunden.
export function addSnowfall(scene: Phaser.Scene, area: { x: number; y: number; width: number; height: number }, count = 60) {
  const flakes: Phaser.GameObjects.Arc[] = [];
  for (let i = 0; i < count; i++) {
    const flake = scene.add.circle(0, 0, Phaser.Math.FloatBetween(2, 4.5), 0xffffff, 0.9);
    const speed = Phaser.Math.FloatBetween(0.06, 0.12); // px pr. millisekund
    // Første gang starter flagen et tilfældigt sted på vejen ned, så de ikke alle starter i toppen
    const fall = (startY: number) => {
      const x = area.x + Phaser.Math.Between(0, area.width);
      flake.setPosition(x, startY);
      scene.tweens.add({
        targets: flake,
        y: area.y + area.height,
        x: x + Phaser.Math.Between(-50, 50),
        duration: (area.y + area.height - startY) / speed,
        onComplete: () => fall(area.y),
      });
    };
    fall(area.y + Phaser.Math.Between(0, area.height));
    flakes.push(flake);
  }
  return flakes;
}
