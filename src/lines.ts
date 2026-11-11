import Phaser from 'phaser';

// Abduls replikker. Hver situation har flere sætninger, så han ikke siger det samme hele tiden.
// {name}, {n} og {plural} bliver udskiftet: "Nu har du fundet {n} {plural}!" → "Nu har du fundet 3 zebraer!"
export const LINES = {
  menuWelcome: [
    'Hej! Jeg hedder Abdul. Hvor skal vi hen i dag?',
    'Hej med dig! Hvor skal vi køre hen?',
  ],
  worldLocked: [
    'Vi skal snart til {name}! Men den tur er ikke klar endnu.',
    'Turen til {name} er ikke klar endnu. Vælg en anden tur!',
    'Uh, {name}! Det bliver spændende. Men ikke i dag!',
  ],
  introAustralia: [
    'Velkommen til Australien! Tryk på den røde knap, når du ser et dyr!',
    'Her er varmt og rødt! Kig efter dyr på jorden og oppe i træerne!',
  ],
  introSea: [
    'Velkommen ombord på ubåden! Tryk på den røde knap, når du ser et dyr!',
    'Blub blub! Nu dykker vi ned i havet. Kig efter fisk og hvaler!',
  ],
  introIce: [
    'Brr, hvor er her koldt! Tryk på den røde knap, når du ser et dyr!',
    'Velkommen til isen! Kig efter dyr i sneen og i vandet!',
  ],
  introJungle: [
    'Velkommen til junglen! Tryk på den røde knap, når du ser et dyr!',
    'Så kører vi ind i junglen! Kig godt efter, nogle dyr er oppe i træerne!',
  ],
  intro: [
    'Så kører vi på safari! Tryk på den røde knap, når du ser et dyr!',
    'Velkommen på safari! Tryk på den røde knap, når du ser et dyr!',
  ],
  brake: ['Okay!', 'Jeg stopper!', 'Hov, så du noget?', 'Stop bilen!'],
  stoppedSeen: [
    'Godt set! Rejs dig op og kig!',
    'Ja, der var et dyr! Rejs dig op!',
    'Flot! Lad os kigge nærmere!',
    'Du har gode øjne! Rejs dig op og se!',
  ],
  stoppedNothing: [
    'Rejs dig op og kig efter dyr!',
    'Mon der er dyr her? Lad os kigge!',
    'Måske gemmer der sig et dyr. Rejs dig op!',
  ],
  drive: ['Så kører vi!', 'Hold fast!', 'Videre på eventyr!', 'Brum brum!'],
  wake: ['Skal vi køre videre?', 'Godt kigget! Skal vi køre?', 'Sæt dig godt til rette!'],
  homeward: ['Så kører vi hen og får is!', 'Is! Hold fast, så kører vi!', 'Jeg glæder mig også til is!'],
  arriveKiosk: ['Der er iskiosken!', 'Vi er fremme! Nu er det is-tid!'],
  // Under vandet sejler man i ubåd og svømmer ud for at kigge
  brakeSea: ['Okay!', 'Jeg stopper!', 'Hov, så du noget?', 'Stop ubåden!'],
  stoppedSeenSea: [
    'Godt set! Svøm ud og kig!',
    'Ja, der var et dyr! Tag dykkermasken på!',
    'Flot! Lad os svømme ud og se!',
    'Du har gode øjne! Svøm ud og se!',
  ],
  stoppedNothingSea: [
    'Svøm ud og kig efter dyr!',
    'Mon der er dyr her? Lad os svømme ud!',
    'Måske gemmer der sig et dyr. Svøm ud og se!',
  ],
  driveSea: ['Så sejler vi!', 'Hold fast!', 'Videre på eventyr!', 'Blub blub!'],
  wakeSea: ['Skal vi sejle videre?', 'Godt svømmet! Skal vi sejle?', 'Velkommen tilbage i ubåden!'],
  homewardSea: ['Så sejler vi hen og får is!', 'Is! Hold fast, så sejler vi!', 'Jeg glæder mig også til is!'],
  backToSafariSea: ['Så sejler vi igen!', 'Afsted! Nu skal vi finde flere havdyr!'],
  iceCreamDoneSea: ['Mmm, den var god! Skal vi sejle videre?', 'Nam nam! Skal vi finde flere havdyr?'],
  lookoutStart: [
    'Kig rundt! Brug kikkerten til dyr langt væk.',
    'Hvad kan du se? Prøv kikkerten!',
    'Kig godt efter! Nogle dyr er langt væk.',
  ],
  foundFirst: ['Godt set! Det er {name}!', 'Wow, {name}!', 'Se! Det er {name}!', 'Flot! Du fandt {name}!'],
  foundMore: [
    'Godt set! Nu har du fundet {n} {plural}!',
    'Endnu en! {n} {plural}!',
    'Sejt! Det er {n} {plural}!',
  ],
  foundAll: ['Wow! Du har fundet alle dyrene!'],
  iceCreamStart: ['Hvilken is vil du have? Tryk på farverne!', 'Vælg nogle kugler! Tryk på farverne!'],
  iceCreamMax: ['Kan du virkelig spise så stor en is?'],
  eatHint: ['Tryk på isen for at spise den!', 'Nam! Tryk på isen for at tage en bid!'],
  iceCreamDone: ['Mmm, den var god! Skal vi køre videre?', 'Nam nam! Skal vi finde flere dyr?'],
  backToSafari: ['Så kører vi igen!', 'Afsted! Nu skal vi finde flere dyr!'],
  restartConfirm: ['Skal vi starte forfra? Tryk igen!'],
  restarted: ['Så starter vi forfra! Kan du finde alle dyrene igen?'],
  parentStop: [
    'Nu er turen slut for i dag. Tak fordi du kørte med mig!',
    'Så er vi hjemme! Tak for turen. Vi ses næste gang!',
  ],
} satisfies Record<string, string[]>;

const lastPicked = new Map<string[], string>();

// Vælger en tilfældig sætning, men aldrig den samme som sidst i samme situation
export function line(options: string[], values: Record<string, string | number> = {}): string {
  const fresh = options.length > 1 ? options.filter((o) => o !== lastPicked.get(options)) : options;
  const chosen: string = Phaser.Utils.Array.GetRandom(fresh);
  lastPicked.set(options, chosen);
  return chosen.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}
