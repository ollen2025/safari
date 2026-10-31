# Safari 🦁

Et simpelt safari-spil til små børn (ca. 4 år). Gameplay og glæde kommer før grafik.

## Spillet
- Spilleren sidder i en jeep og kigger ud ad vinduet, mens savannen kører forbi.
- Chaufføren hedder **Abdul**. Han snakker (browserens oplæser) og viser en taleboble.
- Ser man et dyr, trykker man på den røde ✋-knap (eller direkte på dyret), og Abdul stopper.
- Når bilen holder stille, kan man **rejse sig op** 🧍 og kigge rundt på savannen (pile eller træk med fingeren).
- Med **kikkerten** 🔭 kan man se dyr langt væk.
- Trykker man på et dyr, siger det sin **dyrelyd** og bliver **talt** (stort tal på skærmen, og Abdul siger fx "Nu har du fundet 3 zebraer!"). Samlingen øverst viser, hvor mange man har fundet af hvert dyr.
- Dyr: elefant, giraf, zebra, løve, abe, flodhest, næsehorn, bøffel, struds og hyæne. Der er også **vandhuller** med flodheste.
- Når bilen holder, kan man køre hen til **iskiosken** 🍦: Tryk kugler på isen (Abdul tæller op til 5), og spis den bagefter.

## Lyde
- Dyrelydene er CC0-optagelser fra freesound.org, se [CREDITS](public/assets/sounds/animals/CREDITS.md).
- Abduls stemme er browserens oplæser. Microsoft Edge har den bedste danske stemme ("Jeppe Natural").
- `/soundtest.html` (kun under `npm run dev`) afspiller kandidat-lydene, så man kan vælge de bedste.

## Kode-overblik
| Fil | Indhold |
|---|---|
| `src/scenes/DriveScene.ts` | Inde i jeepen: landskab der kører forbi, stop/kør |
| `src/scenes/LookoutScene.ts` | Stående: bred savanne, dyr på forskellige afstande, kikkert-zoom |
| `src/scenes/LookoutUIScene.ts` | Knapper, kikkert-ramme og tælling oven på LookoutScene |
| `src/scenes/IceCreamScene.ts` | Iskiosken: byg og spis en is |
| `src/scenes/BootScene.ts` | Indlæser lyde, før spillet starter |
| `src/abdul.ts` | Abdul: tegning, tale og taleboble |
| `src/animals.ts` | Dyrene (navne, flertal) og tælling af fundne dyr |
| `src/animalArt.ts` | Dyrenes billeder: emoji eller tegnet (struds, hyæne) |
| `src/sound.ts` | Afspilning af dyrelyde og Abduls stemme |
| `src/ui.ts` | Knapper og samlings-bjælken |
| `src/scenery.ts` | Træer, buske, bakker, vandhuller og iskiosk |

## Tech stack
- **TypeScript** som sprog
- **Phaser 3** som 2D-spilmotor (scener, touch-input, tweens, lyd)
- **Vite** som dev-server og build
- Målplatform: **browser på tablet** (touch først), evt. som PWA senere
- Grafik i starten: **emojis** som dyr (🐘🦒🦓🦁🐒🦛🦏🐃). Struds og hyæne har ingen emoji og er tegnet i kode. Skiftes til sprites senere.

## Kom i gang
Kræver Node.js (LTS).

```bash
npm install
npm run dev      # starter dev-server med live reload
npm run build    # bygger til dist/
```

## Designregler (målgruppe: 4 år)
- **Ingen tekst nødvendig.** Brug ikoner, lyd og oplæst tale.
- **Kun tryk/klik.** Intet tastatur, ingen træk-gestures med præcision.
- **Store mål:** Interaktive elementer skal være mindst ~120px.
- **Man kan ikke tabe.** Ingen timer, ingen game over, ingen straf.
- **Øjeblikkelig respons:** Hvert tryk giver lyd og/eller animation.
- **Kort og simpelt:** Én ting at gøre ad gangen. Masser af ros (🎉, konfetti, jubel).
- Ingen reklamer, køb eller links ud af spillet.

## Konventioner
- Kode og identifiers på engelsk. Kommentarer og docs må gerne være på dansk.
- Én Phaser-scene pr. fil i `src/scenes/`.
- Assets (lyd/billeder) i `public/assets/`.
