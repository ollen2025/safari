import Phaser from 'phaser';
import { drawIceCreamIcon } from './ui';

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
  const sign = drawIceCreamIcon(scene, 100).setPosition(0, -250);
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

export type Weather = 'snow' | 'bubbles';

// Sne der falder stille ned, eller bobler der stiger op, inden for et område.
// Hver flage/boble starter forfra i den anden ende, når den når frem.
export function addWeather(
  scene: Phaser.Scene,
  weather: Weather,
  area: { x: number; y: number; width: number; height: number },
  count = 60,
) {
  const bubbles = weather === 'bubbles';
  const top = area.y;
  const bottom = area.y + area.height;
  const [startEdge, endEdge] = bubbles ? [bottom, top] : [top, bottom];
  const particles: Phaser.GameObjects.Arc[] = [];
  for (let i = 0; i < count; i++) {
    const p = bubbles
      ? scene.add.circle(0, 0, Phaser.Math.FloatBetween(3, 8)).setStrokeStyle(2, 0xffffff, 0.8).setFillStyle(0xffffff, 0.15)
      : scene.add.circle(0, 0, Phaser.Math.FloatBetween(2, 4.5), 0xffffff, 0.9);
    const speed = Phaser.Math.FloatBetween(0.06, 0.12); // px pr. millisekund
    // Første gang starter den et tilfældigt sted på vejen, så de ikke alle starter i kanten
    const move = (startY: number) => {
      const x = area.x + Phaser.Math.Between(0, area.width);
      p.setPosition(x, startY);
      scene.tweens.add({
        targets: p,
        y: endEdge,
        x: x + Phaser.Math.Between(-50, 50),
        duration: Math.abs(endEdge - startY) / speed,
        onComplete: () => move(startEdge),
      });
    };
    move(top + Phaser.Math.Between(0, area.height));
    particles.push(p);
  }
  return particles;
}

// Eukalyptustræ med lys, plettet stamme og en vandret gren (ved BRANCH) til koalaer og fugle
export function drawEucalyptus(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0xe8e2d6).fillRect(-10, -210, 20, 210);
  g.fillStyle(0xe8e2d6).fillTriangle(-22, 0, 22, 0, 0, -30);
  g.fillStyle(0xc9bfae).fillEllipse(-3, -60, 8, 18).fillEllipse(4, -150, 7, 16).fillEllipse(-4, -185, 6, 12);
  g.lineStyle(11, 0xe8e2d6).lineBetween(0, -108, 88, -128).lineBetween(0, -170, -60, -205);
  g.fillStyle(0x7d9a6e).fillEllipse(94, -136, 46, 22);
  g.fillStyle(0x6b8a5e).fillEllipse(-60, -220, 110, 56).fillEllipse(30, -235, 130, 64);
  g.fillStyle(0x8aa37b).fillEllipse(-10, -255, 140, 60).fillEllipse(60, -220, 80, 40);
  g.fillStyle(0xa3b98f).fillEllipse(-30, -265, 70, 26).fillEllipse(30, -250, 60, 24);
  return g.setScale(scale);
}

// Runde tuer af spinifex-græs med spidse strå
export function drawSpinifex(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x9c8f3a).fillEllipse(-40, 0, 100, 50).fillEllipse(40, -4, 110, 60);
  g.fillStyle(0xc2b45a).fillEllipse(-44, -8, 76, 30).fillEllipse(36, -14, 84, 36);
  g.lineStyle(3, 0xd9cb72);
  for (let i = 0; i < 9; i++) {
    const bx = -80 + i * 20;
    g.lineBetween(bx, -10, bx + (i % 2 ? 10 : -10), -46 - (i % 3) * 6);
  }
  return g.setScale(scale);
}

// Billabong: vandhul med rød, støvet bred og siv
export function drawBillabong(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0xb5651d).fillEllipse(0, 0, width + 30, height + 16);
  g.fillStyle(0x4f9fc0).fillEllipse(0, 0, width, height);
  g.fillStyle(0x8fcbe0).fillEllipse(-width * 0.15, -height * 0.15, width * 0.45, height * 0.3);
  g.lineStyle(3, 0x6a7f3a);
  for (const dx of [0.42, 0.46, 0.5]) g.lineBetween(width * dx, height * 0.1, width * dx + 4, -height * 0.4);
  return g;
}

// Koraltræ med runde spidser og en vandret gren (ved BRANCH), hvor søheste kan holde fast
export function drawCoralTree(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const g = scene.add.graphics({ x, y });
  const coral = 0xe76f51;
  g.fillStyle(coral).fillTriangle(-26, 0, 26, 0, 0, -40);
  g.lineStyle(18, coral).lineBetween(0, 0, 0, -200);
  g.lineStyle(11, coral).lineBetween(0, -108, 88, -128).lineBetween(0, -150, -60, -200).lineBetween(0, -170, 50, -230);
  g.lineStyle(8, coral).lineBetween(-30, -175, -70, -160).lineBetween(-60, -200, -50, -240).lineBetween(25, -200, 70, -200);
  g.fillStyle(0xf4a261);
  for (const [tx, ty] of [[88, -128], [0, -205], [-60, -205], [50, -235], [-70, -160], [-50, -244], [70, -200]]) g.fillCircle(tx, ty, 10);
  return g.setScale(scale);
}

// Tang der vajer, og en lyserød søanemone
export function drawSeaweed(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const g = scene.add.graphics({ x, y });
  for (const [dx, h, col] of [[-60, 110, 0x2d6a4f], [-30, 150, 0x40916c], [10, 120, 0x2d6a4f], [100, 90, 0x40916c]]) {
    g.fillStyle(col);
    for (let i = 0; i < 5; i++) g.fillEllipse(dx + (i % 2 ? 8 : -8), -i * (h / 5) - 12, 22, h / 4);
  }
  g.fillStyle(0xf4a6c1).fillEllipse(55, -10, 70, 30);
  g.lineStyle(7, 0xf4a6c1);
  for (let i = 0; i < 7; i++) g.lineBetween(30 + i * 8, -18, 26 + i * 9, -50 - (i % 2) * 10);
  return g.setScale(scale);
}

// Klippe på bunden med en mørk hule, hvor murænen bor. (x, y) er midten af hulen.
export function drawSeaCave(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x6c7a89).fillEllipse(0, -height * 0.15, width * 0.85, height * 1.7);
  g.fillStyle(0x8d99ae).fillEllipse(-width * 0.15, -height * 0.6, width * 0.4, height * 0.45);
  g.fillStyle(0x1b263b).fillEllipse(0, 0, width * 0.55, height * 0.9);
  return g;
}

// Vulkan langt væk med glødende lava og røg. Tegnes som en bakke: (x, y) er midten af foden.
export function drawVolcano(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
  const g = scene.add.graphics({ x, y });
  const top = -height * 0.9;
  const rim = width * 0.08;
  g.fillStyle(0x6d4c41).fillPoints(
    [
      { x: -width * 0.4, y: 0 },
      { x: -rim, y: top },
      { x: rim, y: top },
      { x: width * 0.4, y: 0 },
    ],
    true,
  );
  g.fillStyle(0xe63946).fillTriangle(-rim, top, rim, top, rim * 0.2, top + height * 0.3);
  g.fillStyle(0xf4a261).fillTriangle(-rim * 0.5, top, rim * 0.5, top, -rim * 0.4, top + height * 0.45);
  g.fillStyle(0x9e9e9e, 0.8).fillCircle(0, top - 14, 14).fillCircle(16, top - 36, 18).fillCircle(2, top - 62, 22);
  return g;
}

// Cykas med tyk, skællet stamme og store fjerblade, der hænger ud til siderne
export function drawCycad(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x7a5c3a).fillRect(-14, -180, 28, 180).fillTriangle(-28, 0, 28, 0, 0, -34);
  g.lineStyle(3, 0x5c4429);
  for (let sy = -170; sy < -20; sy += 22) g.lineBetween(-14, sy, 0, sy + 10).lineBetween(0, sy + 10, 14, sy);
  // Vinkel 0 er mod højre, -π/2 er lige op, og positive vinkler hælder nedad
  const fronds: [number, number][] = [
    [0.45, 0x386641],
    [2.7, 0x386641],
    [-0.25, 0x4f772d],
    [-2.9, 0x4f772d],
    [-0.9, 0x6a994e],
    [-2.25, 0x6a994e],
    [-1.57, 0x6a994e],
  ];
  g.save();
  g.translateCanvas(0, -180);
  for (const [angle, color] of fronds) {
    g.rotateCanvas(angle);
    g.fillStyle(color).fillEllipse(64, 0, 135, 26);
    g.rotateCanvas(-angle);
  }
  g.restore();
  return g.setScale(scale);
}

// Sump med mudret bred, grumset vand og siv
export function drawSwamp(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x6b5a3a).fillEllipse(0, 0, width + 30, height + 16);
  g.fillStyle(0x5b7f4a).fillEllipse(0, 0, width, height);
  g.fillStyle(0x86a86a).fillEllipse(-width * 0.15, -height * 0.15, width * 0.45, height * 0.3);
  g.lineStyle(2, 0xc6d49a, 0.8).strokeCircle(width * 0.25, height * 0.05, 5).strokeCircle(width * 0.3, -height * 0.12, 3);
  g.lineStyle(3, 0x4f6b2a);
  for (const dx of [-0.48, -0.44, 0.44, 0.48]) g.lineBetween(width * dx, height * 0.1, width * dx + 4, -height * 0.5);
  return g;
}

// Palme på stranden
export function drawPalm(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const g = scene.add.graphics({ x, y });
  g.lineStyle(16, 0x8d6e4a);
  const trunk = new Phaser.Curves.QuadraticBezier(
    new Phaser.Math.Vector2(0, 0),
    new Phaser.Math.Vector2(30, -110),
    new Phaser.Math.Vector2(-10, -220),
  );
  trunk.draw(g, 24);
  // Bladene sidder rundt om toppen. Vinkel 0 er mod højre, -π/2 er lige op.
  g.fillStyle(0x52734d);
  for (const angle of [0.35, -0.5, -1.45, -2.4, 2.8]) {
    g.save();
    g.translateCanvas(-10, -220);
    g.rotateCanvas(angle);
    g.fillEllipse(55, 0, 115, 26);
    g.restore();
  }
  g.fillStyle(0x6b4423).fillCircle(-16, -212, 8).fillCircle(-2, -210, 8);
  return g.setScale(scale);
}

// Strand set fra vandkanten: himmel, sol, sand og havet forrest. y er vandkanten.
export function drawBeach(scene: Phaser.Scene, x: number, y: number, width: number, skyHeight: number) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x8fd3f4).fillRect(-width / 2, -skyHeight, width, skyHeight);
  g.fillStyle(0xf4e1a6).fillRect(-width / 2, -100, width, 100);
  g.fillStyle(0xe9cf8f).fillEllipse(-width * 0.2, -40, 300, 30).fillEllipse(width * 0.25, -60, 260, 24);
  return g;
}
