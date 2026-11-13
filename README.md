# Safari 🦁

Et simpelt safari-spil til små børn (ca. 4 år). Gameplay og glæde kommer før grafik.

## Spillet
- Spillet starter i en **startmenu**: postkort, der hænger på en snor i solnedgangen. Man vælger, hvor turen går hen. **Safari**, **jungle**, **isen**, **Australien**, **under vandet** og **dinosaurer** er klar. På tastatur vælges kortene med **1** til **6**. 🏠 i safarien fører tilbage til menuen.
- Spilleren sidder i en jeep og kigger ud ad vinduet, mens savannen kører forbi.
- Chaufføren hedder **Abdul**. Han snakker (browserens oplæser) og viser en taleboble.
- Ser man et dyr, trykker man på den røde ✋-knap (eller direkte på dyret), og Abdul stopper.
- Når bilen holder stille, kan man **rejse sig op** 🧍 og kigge rundt på savannen (pile eller træk med fingeren). Har man været ude, skal bilen køre videre, før man kan gå ud igen.
- På tastatur: **mellemrum** stopper bilen, og **1**, **2**, **3** vælger gå ud, is og kør videre.
- Med **kikkerten** 🔭 kan man se dyr langt væk. På tastatur styres udsigten og kikkerten med piletasterne.
- På tastatur har hvert dyr et lille skilt med et tal eller bogstav. Tryk på tasten for at markere dyret, når det er i billedet.
- Trykker man på et dyr, siger det sin **dyrelyd** og bliver **talt** (stort tal på skærmen, og Abdul siger fx "Nu har du fundet 3 zebraer!"). Samlingen øverst viser, hvor mange man har fundet af hvert dyr.
- Dyr på savannen: elefant, giraf, zebra, løve (han og hun), bavian, flodhest, næsehorn, bøffel, struds, hyæne, gazelle, gnu og krokodille. Nogle gange er der en unge med. Der er også **vandhuller** med flodheste og krokodiller.
- Dyr i junglen: tiger, træleopard, puma, slange, okapi, gorilla, chimpanse, papegøje, tukan og dovendyr. Nogle af dem hænger i eller sidder på grenene i træerne, og der er skovsøer.
- Dyr på isen: isbjørn, pingvin, sæl, søløve, søpapegøje, hvalros, polarræv, rensdyr, spækhugger, sneugle, ulv og mammut. Det sner, fuglene sidder på klipper, og i hullerne i isen svømmer sæler og spækhuggere.
- Dyr i Australien: kænguru, koala, wombat, næbdyr, emu, latterfugl, tasmansk djævel, dingo, kakadue og myrepindsvin. Jorden er rødt sand, koalaer og fugle sidder i eukalyptustræerne, og næbdyret svømmer i vandhullerne (billabongs).
- Under vandet sidder man i en **gul ubåd**: kaskelot, delfin, haj, klovnefisk, søko, blæksprutte, havskildpadde, søhest, krabbe, vandmand og muræne. Fiskene svømmer over bunden, der stiger bobler op, søhesten holder fast i koraltræerne, og murænen kigger op af en hule i klippen.
- Dinosaurer: gigantosaurus, T-rex, spinosaurus, triceratops, stegosaurus, brachiosaurus, ankylosaurus, parasaurolophus, pachycephalosaurus og troodon, plus flyveøglerne pteranodon og quetzalcoatlus, der flyver på himlen. Der er vulkaner i baggrunden, cykas-træer, og spinosaurus vader i sumpen.
- Når bilen holder, kan man køre hen til **iskiosken** 🍦: Tryk kugler på isen (Abdul tæller op til 5), og spis den bagefter. Kiosken står i verdenens eget landskab. Under vandet stiger ubåden op til overfladen, og kiosken ligger på en strand med palmer.
- Knapperne til jeep, ubåd og is er tegnet (`drawJeepIcon`, `drawSubmarineIcon`, `drawIceCreamIcon` i `src/ui.ts`), resten er emojis.
- Abdul har flere sætninger til hver situation (`src/lines.ts`), så han ikke siger det samme hele tiden.
- 🔄 i øverste hjørne starter forfra (nulstiller fundne dyr). Den skal trykkes to gange, så den ikke rammes ved et uheld.
- ⏱️ øverst til højre er **forælder-timeren** og kan åbnes midt i en tur. Spillet kan stoppe om et antal minutter eller efter et antal fundne dyr. Derefter er det låst, også efter genindlæsning, indtil en voksen løser et regnestykke. Der skal også regnes for at ændre en aftale, der allerede kører.

## Lyde
- Dyrelydene er CC0-optagelser fra freesound.org, se [CREDITS](public/assets/sounds/animals/CREDITS.md).
- Abduls stemme er browserens oplæser. Microsoft Edge har den bedste danske stemme ("Jeppe Natural").
- `/soundtest.html` (kun under `npm run dev`) afspiller kandidat-lydene, så man kan vælge de bedste.

## Kode-overblik
| Fil | Indhold |
|---|---|
| `src/scenes/MenuScene.ts` | Startmenuen, hvor man vælger verden |
| `src/worlds.ts` | Verdenerne i menuen og tegningerne på deres kort |
| `src/scenes/DriveScene.ts` | Inde i jeepen: landskab der kører forbi, stop/kør |
| `src/scenes/LookoutScene.ts` | Stående: bred savanne, dyr på forskellige afstande, kikkert-zoom |
| `src/scenes/LookoutUIScene.ts` | Knapper, kikkert-ramme og tælling oven på LookoutScene |
| `src/scenes/IceCreamScene.ts` | Iskiosken: byg og spis en is |
| `src/scenes/ParentScene.ts` | Forælder-timer og lås, et lag oven på alle andre scener |
| `src/parentLimit.ts` | Forældrenes grænse, gemt i browseren |
| `src/scenes/BootScene.ts` | Indlæser lyde, før spillet starter |
| `src/abdul.ts` | Abdul: tegning, tale og taleboble |
| `src/animals.ts` | Dyrene (verden, navne, flertal, om de er i træer) og tælling af fundne dyr |
| `src/landscapes.ts` | Hver verdens landskab: farver, køretøj (jeep/ubåd), træer, vand og hvilke dyr der drikker/svømmer |
| `src/lines.ts` | Abduls replikker |
| `src/animalArt.ts` | Indlæsning af dyretegningerne, unger og størrelsesvariation |
| `src/sound.ts` | Afspilning af dyrelyde og Abduls stemme |
| `src/ui.ts` | Knapper og samlings-bjælken |
| `src/scenery.ts` | Træer, klipper, buske, bakker, vand, sne/bobler og iskiosk for hver verden |

## Tech stack
- **TypeScript** som sprog
- **Phaser 3** som 2D-spilmotor (scener, touch-input, tweens, lyd)
- **Vite** som dev-server og build
- Målplatform: **browser på tablet** (touch først), evt. som PWA senere
- Grafik: håndtegnede **SVG-tegninger** af dyrene i `public/assets/animals/` og af isen i `public/assets/icecream/`. En tegning skiftes ud ved at erstatte filen; ekstra udgaver hedder fx `lion-2.svg` (sæt `variants` i `src/animals.ts`).

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
- **Man kan ikke tabe.** Ingen timer, ingen game over, ingen straf. (Forælder-timeren er forældrenes aftale med barnet, ikke en del af spillet.)
- **Øjeblikkelig respons:** Hvert tryk giver lyd og/eller animation.
- **Kort og simpelt:** Én ting at gøre ad gangen. Masser af ros (🎉, konfetti, jubel).
- Ingen reklamer, køb eller links ud af spillet.

## Konventioner
- Kode og identifiers på engelsk. Kommentarer og docs må gerne være på dansk.
- Én Phaser-scene pr. fil i `src/scenes/`.
- Assets (lyd/billeder) i `public/assets/`.
