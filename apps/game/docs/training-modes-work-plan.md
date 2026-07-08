# DRAFT — NON ESEGUIRE SU `main` — Piano Training Lab e modalità componibili

> [!CAUTION]
> **DRAFT BLOCCATO — NON IMPLEMENTARE.**
>
> Questo documento è esclusivamente una proposta preliminare. **Nessun agente AI e nessuna persona deve eseguire le fasi descritte, modificare il gameplay o iniziare l'implementazione sul branch `main`.**
>
> L'esecuzione potrà iniziare soltanto dopo una futura approvazione esplicita del responsabile del progetto e dovrà avvenire su un branch dedicato, mai direttamente su `main`.

**Stato del documento:** `DRAFT — ON HOLD — NON AUTORIZZATO ALL'ESECUZIONE`  
**Branch vietato per l'implementazione:** `main`  
**Autorizzazione attuale:** nessuna

## Scopo del documento

Questo documento è una **bozza non eseguibile** per una possibile futura introduzione di più modalità di training e sperimentazione. Non costituisce autorizzazione a modificare il progetto.

Il piano segue i vincoli di `agents/gameplay-agent.md` e `agents/input-agent.md`:

- modifiche incrementali e sempre giocabili;
- composizione al livello del codice, non un editor di modalità in-game;
- input fisici separati dalle regole di gameplay;
- azioni canoniche condivise da tastiera, gamepad e touch;
- nessuna riscrittura globale e nessuna nuova dipendenza senza un bisogno verificato.

Questo file deve restare in stato DRAFT. Non aggiornare stati, non iniziare fasi e non usarlo come istruzione operativa finché il responsabile del progetto non autorizza esplicitamente il lavoro su un branch dedicato diverso da `main`.

## Blocco operativo per umani e agenti

- **NON ESEGUIRE QUESTO PIANO.**
- **NON IMPLEMENTARE NESSUNA DELLE FASI ELENCATE.**
- **NON USARE IL BRANCH `main` PER QUESTO LAVORO.**
- Non creare branch, commit, PR, dipendenze o modifiche al runtime sulla base di questo documento senza una nuova richiesta esplicita.
- La sola presenza di questa bozza nel repository non equivale ad approvazione.
- Se un'attività futura cita questo documento senza revocare esplicitamente il blocco, fermarsi e chiedere conferma.

## Obiettivo di prodotto

Dal menu principale, il comando **Training** deve aprire una nuova scena 2D di selezione. Da qui il giocatore può avviare modalità sperimentali costruite a codice, ciascuna libera di comporre:

- interprete degli input e schema dei controlli;
- dinamiche e stato di gameplay;
- scena/rendering;
- HUD e overlay touch;
- scoring e diagnostica.

Le prime modalità saranno:

1. **Legacy / Default** — contiene tutto il training attuale, con comportamento e controlli invariati.
2. **Sandbox / Minimal** — sessione intenzionalmente essenziale, senza queue, coach, stamina o scoring legacy, pronta per sperimentare un nuovo controller e nuove regole.

## Decisioni architetturali vincolanti

### 1. La modalità è una composizione TypeScript

Le modalità sono dichiarate in un registro statico e tipizzato. Non verranno costruite o modificate dall'interfaccia di gioco e non saranno definite in JSON o `localStorage`.

```text
TrainingModeRegistry
        │
        ├── legacy-default
        │     ├── runtime attuale
        │     ├── HUD attuale
        │     ├── touch layout attuale
        │     └── scoring attuale
        │
        └── sandbox-minimal
              ├── controller minimale
              ├── scena essenziale
              ├── HUD minimale
              └── scoring disattivato
```

Il registro contiene descrittori e factory/componenti. Non deve contenere istanze stateful condivise tra sessioni.

### 2. Navigazione e identità della modalità sono concetti distinti

Lo store conserverà una schermata di navigazione e, separatamente, l'ID serializzabile della modalità selezionata. Non si aggiungerà ogni nuova modalità alla union delle schermate.

Flusso previsto:

```text
Main menu
   └── Training
          └── trainingSelect (DOM 2D, WebGL non montato)
                 ├── legacy-default ──→ trainingSession
                 └── sandbox-minimal ─→ trainingSession
```

Azioni di navigazione previste:

- `openTrainingSelect()`;
- `startTrainingMode(modeId)`;
- `returnToTrainingSelect()`;
- `openMainMenu()`.

### 3. L'attuale training è la baseline, non materiale da riscrivere

La prima versione di `legacy-default` deve montare l'attuale `GamePlayScene` tramite un wrapper sottile. L'estrazione del monolite attuale avverrà soltanto dopo aver ottenuto la parità funzionale nel nuovo flusso.

Il fallback per un ID mancante o non valido sarà sempre `legacy-default`, così un errore di selezione non produce una schermata vuota.

### 4. Una sola frontiera canonica per gli input

Ogni modalità deve rispettare questa catena:

```text
Device API
→ Input adapter
→ GameInputSnapshot / azioni canoniche
→ interprete specifico della modalità
→ stato/controller di gameplay
→ PlayerMotionState o stato equivalente
→ renderer
```

Il gameplay non può leggere `KeyboardEvent`, Pointer Events, Gamepad API, key code o indici di pulsanti. Una modalità può scegliere quali sorgenti, layout e curve usare, ma gli adapter continuano a produrre lo stesso contratto canonico.

### 5. Input UI, HUD e scoring sono porte distinte

L'attuale `TouchControlsOverlay` è montato da `GamePlayHUD`; questa dipendenza dovrà essere sciolta dopo la parità Legacy. L'overlay input appartiene al bundle input della modalità, non al suo HUD informativo.

Allo stesso modo, scoring e HUD non dovranno essere imposti a ogni modalità. La modalità minimale userà uno scorer nullo o nessuno scorer e un proprio snapshot di presentazione essenziale.

### 6. Isolamento della sessione

Il cambio modalità deve smontare e ricreare provider, controller, actor e stato volatile. La sessione sarà keyed con il `modeId`; nessun pulsante premuto, stick, queue, timer o punteggio temporaneo deve passare da una modalità all'altra.

Le preferenze realmente globali, come lingua e impostazioni del dispositivo, restano nello store condiviso.

## Stato attuale rilevato

- `GameApp.tsx` monta direttamente `GamePlayScene` per `career` e `training`.
- Il bottone Training in `GameHUD.tsx` avvia subito `startMode('training')`.
- `GamePlayScene.tsx` compone lifecycle, adapter, motion machine, animazione, move queue, stamina, scoring, diagnostica, canvas e HUD.
- `GameInputProvider` e `GameInputController` forniscono già un valido snapshot canonico condiviso.
- Tastiera, gamepad e touch rispettano già il principio adapter → azioni canoniche.
- Dead zone e curve analogiche sono ancora hardcoded in alcuni adapter.
- `TouchControlsOverlay` incorpora layout e controlli ed è montato direttamente dal gameplay HUD.
- `InputManager.ts`, `useInputManager.ts` e `useInputStore.ts` costituiscono un percorso legacy apparentemente non usato dal runtime attivo; non verranno rimossi durante questa migrazione.
- Non è presente un test runner dedicato nel repository. L'aggiunta di una dipendenza di test richiederà una decisione esplicita separata.

## Struttura sorgente prevista

I nomi finali possono essere raffinati durante l'implementazione, ma le responsabilità devono restare separate.

```text
apps/game/src/game/
├── training/
│   ├── TrainingModeSelectScene.tsx
│   ├── TrainingSessionScene.tsx
│   ├── trainingModeTypes.ts
│   ├── trainingModeRegistry.ts
│   └── modes/
│       ├── legacy/
│       │   └── LegacyTrainingModeScene.tsx
│       └── minimal/
│           ├── MinimalTrainingModeScene.tsx
│           ├── MinimalTrainingController.ts
│           └── MinimalTrainingHUD.tsx
└── input/
    ├── profiles/
    │   ├── inputProfileTypes.ts
    │   ├── legacyInputProfile.ts
    │   └── minimalInputProfile.ts
    └── overlays/
        ├── LegacyTouchLayout.tsx
        └── MinimalTouchLayout.tsx
```

Il profilo input e gli overlay separati si introducono solo quando le due modalità forniscono requisiti concreti. Non devono bloccare il primo incremento del selector e del wrapper Legacy.

## Contratti iniziali proposti

Il contratto va mantenuto piccolo. Le capacità più profonde saranno aggiunte soltanto quando servono realmente.

```ts
export type TrainingModeId = 'legacy-default' | 'sandbox-minimal';

export interface TrainingModeDefinition {
  id: TrainingModeId;
  titleKey: TrainingCopyKey;
  descriptionKey: TrainingCopyKey;
  status: 'stable' | 'experimental';
  Scene: React.ComponentType<TrainingModeSceneProps>;
}

export interface TrainingModeSceneProps {
  copy: GameCopy;
  onExit: () => void;
}
```

Evoluzione ammessa dopo la seconda modalità giocabile:

```ts
export interface InputProfile {
  enabledSources: readonly ActiveInputSource[];
  analog: {
    move: AnalogChannelProfile;
    look?: AnalogChannelProfile;
  };
  touchLayout: 'legacy-dual-stick' | 'minimal';
}
```

Il registro non deve diventare un contenitore universale di flag. Se due modalità hanno runtime sostanzialmente differenti, devono avere componenti/controller differenti che condividono soltanto le interfacce utili.

## Piano di implementazione

> [!WARNING]
> **PIANO DRAFT, SOSPESO E NON AUTORIZZATO. Le fasi seguenti sono materiale di valutazione futura: non devono essere avviate, soprattutto non sul branch `main`.**

### Fase 0 — Baseline e checklist di parità

**Stato:** DRAFT BLOCCATO — NON ESEGUIRE.

- [ ] Salvare una checklist manuale del comportamento attuale in Training.
- [ ] Verificare build standalone prima delle modifiche.
- [ ] Registrare mapping input, auto-start, pause/resume, exit, queue, cue, scoring, stamina, animazione e debug HUD.
- [ ] Verificare il comportamento desktop e touch con viewport almeno desktop e mobile landscape.
- [ ] Annotare eventuali difetti già esistenti per non attribuirli alla migrazione.

**Gate:** baseline riproducibile e `npm run game:build` completato.

### Fase 1 — Contratti e registro senza cambio runtime

**Stato:** DRAFT BLOCCATO — NON ESEGUIRE.

- [ ] Aggiungere `TrainingModeId` e `TrainingModeDefinition`.
- [ ] Creare il registro TypeScript con ID univoci.
- [ ] Implementare `resolveTrainingMode(id)` con fallback `legacy-default`.
- [ ] Registrare un wrapper Legacy che monta l'attuale scena Training.
- [ ] Non cambiare ancora il percorso del menu principale.

**Gate:** il gioco continua ad avviare il training attuale; il registro non crea singleton stateful; build superata.

### Fase 2 — Scena 2D di selezione e navigazione

**Stato:** DRAFT BLOCCATO — NON ESEGUIRE.

- [ ] Separare nello store `screen` e `selectedTrainingModeId`.
- [ ] Aggiungere le azioni di navigazione dedicate.
- [ ] Cambiare il bottone Training affinché apra `trainingSelect`.
- [ ] Costruire `TrainingModeSelectScene` come DOM 2D senza canvas.
- [ ] Mostrare card Legacy e Sandbox con stato, descrizione e call to action.
- [ ] Aggiungere Back al menu principale, navigazione da tastiera e focus visibile.
- [ ] Aggiungere copy alle cinque locale; mantenere il fallback inglese sicuro.
- [ ] Aggiungere CSS responsive isolato per il selector.

**Gate:** Main menu → Training apre il selector senza montare WebGL; Back torna al menu; ogni card seleziona l'ID corretto.

### Fase 3 — Routing di sessione e parità Legacy

**Stato:** DRAFT BLOCCATO — NON ESEGUIRE.

- [ ] Creare `TrainingSessionScene` che risolve la definition selezionata.
- [ ] Montare la scena con `key={modeId}` per isolamento completo.
- [ ] Fare in modo che l'uscita da Legacy torni al selector.
- [ ] Aggiungere a `GamePlayScene` un callback `onExit` con default compatibile, evitando una riscrittura.
- [ ] Mantenere invariati provider input, adapter, motion/animation machine, queue, scoring, stamina, coach, canvas, touch overlay e debug HUD.
- [ ] Verificare fallback Legacy per ID assente/non valido.

**Gate:** tutti i punti della checklist Fase 0 coincidono; cambiano solo navigazione e destinazione del Back.

### Fase 4 — Modalità Sandbox / Minimal giocabile

**Stato:** DRAFT BLOCCATO — NON ESEGUIRE.

- [ ] Creare un runtime separato che non importi queue, coach, scoring o stamina Legacy.
- [ ] Montare un proprio `GameInputProvider` per sessione.
- [ ] Usare gli adapter canonici necessari senza leggere device API dal controller.
- [ ] Implementare un controller minimale puro: snapshot canonico → intent/stato minimale.
- [ ] Mostrare una scena essenziale con player/placeholder controllabile e stato chiaramente osservabile.
- [ ] Fornire HUD minimo con nome modalità, input corrente, reset/pause se utili e Back.
- [ ] Garantire una strategia no-op per lo scoring o la completa assenza del sottosistema.
- [ ] Definire esplicitamente il comportamento del rhythm clock nella nuova sessione.

**Gate:** Sandbox si avvia e risponde agli input, ma non monta né importa le feature Legacy escluse; uscita e cambio modalità azzerano lo stato.

### Fase 5 — Profili input e layout touch componibili

**Stato:** DRAFT BLOCCATO — NON ESEGUIRE; dipenderebbe da due modalità funzionanti.

- [ ] Estrarre un `InputProfile` dai requisiti reali di Legacy e Minimal.
- [ ] Conservare nel profilo Legacy mapping, dead zone e curve correnti senza variazioni.
- [ ] Rendere configurabili per profilo canali analogici, dead zone, curva e sorgenti abilitate.
- [ ] Separare l'overlay touch dal gameplay HUD e montarlo in uno slot input della sessione.
- [ ] Riutilizzare l'attuale overlay come `LegacyTouchLayout` senza restyling involontario.
- [ ] Costruire un `MinimalTouchLayout` solo in base al nuovo esperimento di controllo.
- [ ] Mantenere la regola “last meaningful source”: il polling neutro non ruba la sorgente attiva.
- [ ] Reset completo su unmount, blur, page hide, cambio visibilità e perdita pointer capture.

**Gate:** tastiera, gamepad e touch producono azioni canoniche equivalenti; ogni modalità sceglie il proprio layout senza conoscere l'hardware nel gameplay.

### Fase 6 — Separazione controllata di controller, HUD e scoring Legacy

**Stato:** DRAFT BLOCCATO — NON ESEGUIRE; sarebbe valutabile solo dopo parità e Sandbox validata.

- [ ] Estrarre meccanicamente il controller Legacy dal monolite.
- [ ] Incapsulare lo scoring corrente dietro una piccola porta/factory stateful per sessione.
- [ ] Definire uno snapshot di presentazione per evitare che un HUD dipenda da tutti gli actor interni.
- [ ] Evitare modifiche contemporanee alle regole di gameplay durante l'estrazione.
- [ ] Conservare export/wrapper compatibili finché Career usa ancora il percorso attuale.
- [ ] Documentare come aggiungere una terza modalità.

**Gate:** Legacy conserva la parità; Minimal resta indipendente; una terza modalità richiede registro + propri componenti, non nuovi `if (mode === ...)` nel monolite.

### Fase 7 — Pulizia e documentazione finale

**Stato:** DRAFT BLOCCATO — NON ESEGUIRE.

- [ ] Aggiornare `docs/input-manager.md` e `apps/game/docs/threejs-scene-architecture.md`.
- [ ] Marcare come deprecato il percorso input legacy non usato, dopo verifica tramite ricerca e build.
- [ ] Non eliminare `InputManager`, `useInputManager`, `useInputStore` o `nipplejs` senza task e approvazione separati.
- [ ] Aggiornare questo documento con scostamenti motivati e risultati dei gate.
- [ ] Eseguire build standalone, build sito se il boundary è stato toccato e `git diff --check`.

**Gate:** documentazione coerente col runtime, nessun import website ↔ game e nessuna regressione nota non registrata.

## Matrice di accettazione finale

| Area | Legacy / Default | Sandbox / Minimal |
| --- | --- | --- |
| Entrata | Dal selector Training | Dal selector Training |
| Uscita | Torna al selector | Torna al selector |
| Input | Identico all'attuale | Profilo essenziale indipendente |
| Gameplay | Queue e motion attuali | Controller minimale nuovo |
| HUD | HUD, coach e debug attuali | HUD minimo dedicato |
| Scoring | Attuale, inclusi stamina/reward | Assente/no-op |
| Touch | Layout attuale invariato | Layout minimale o esplicitamente disabilitato |
| Stato sessione | Isolato e resettato | Isolato e resettato |
| ID invalido | Fallback Legacy | Non produce schermata vuota |

## Strategia di test

### Test automatici senza nuova infrastruttura

- funzioni pure: risoluzione/fallback del registro e unicità ID;
- reducer/controller minimale;
- normalizzazione, dead zone e curve quando diventano configurabili;
- factory di sessione che restituiscono stato indipendente.

Se il repository non consente di eseguire questi test senza introdurre un runner, documentare i casi come test di contratto/manuali. Non aggiungere Vitest, RTL o Playwright silenziosamente.

### Test d'integrazione UI

- Training apre selector, non il canvas;
- le due card montano la scena corretta;
- Back segue `session → selector → main menu`;
- il remount con ID diverso produce input neutro;
- focus, etichette accessibili e uso completo da tastiera;
- fallback sicuro per ID non valido.

### Regressione Legacy

- auto-start del Training;
- movimento e quattro famiglie di mosse;
- queue, cue track e animazioni;
- scoring adaptive/assisted/expert, stamina e reward;
- pause/resume/reset/exit;
- debug HUD in sviluppo;
- tastiera, gamepad, hotplug/remap e touch multitouch;
- blur, background/foreground, cancel e lost pointer capture.

### Test responsive e rendering

- desktop e mobile landscape;
- device touch, device ibrido e override `?touchControls=1`;
- rotazione viewport;
- perdita/assenza WebGL confinata alle sessioni che usano il canvas;
- selector 2D utilizzabile anche senza WebGL.

### Comandi di verifica

```bash
npm run game:build
npm run build
git diff --check
```

`npm run build` è richiesto solo quando le modifiche possono aver toccato il boundary o l'integrazione col sito; resta comunque consigliato al gate finale.

## Rischi e mitigazioni

| Rischio | Mitigazione |
| --- | --- |
| Esplosione di flag in `GamePlayScene` | Runtime/factory separati per modalità; niente mega-config. |
| Regressione del training attuale | Wrapper Legacy prima di qualunque estrazione e checklist di parità. |
| Stato o input bloccato tra modalità | Provider/actor keyed per sessione e reset su unmount/eventi browser. |
| Overlay touch accoppiato all'HUD | Spostamento in uno slot input dopo la parità, non durante il primo routing. |
| Divergenza tra device | Un solo contratto canonico e test di equivalenza keyboard/gamepad/touch. |
| Registry con stato condiviso | Solo descriptor e factory; niente controller/scorer singleton. |
| Store sovraccarico | Conservare solo navigazione, preferenze globali e `selectedTrainingModeId`. |
| CSS Legacy danneggiato | Classi Legacy invariate inizialmente; nuove UI namespaced per modalità. |
| Rhythm clock ereditato involontariamente | Ownership e reset definiti esplicitamente per ogni sessione. |
| Rimozione prematura del vecchio input | Deprecazione e task separato, nessuna cancellazione in questa migrazione. |
| Astrazione prematura | Input profile e scoring port introdotti dopo due casi giocabili reali. |

## Regole per le future modalità

Una nuova modalità è accettabile quando:

1. possiede un ID stabile e un descrittore nel registro;
2. crea nuovo stato per ogni sessione;
3. consuma input canonico o introduce nuove azioni semantiche nel contratto condiviso;
4. non legge direttamente API hardware;
5. dichiara esplicitamente controller, HUD, scoring e touch layout usati o assenti;
6. non modifica il comportamento Legacy per poter funzionare;
7. documenta obiettivo dell'esperimento e criteri con cui valutarlo;
8. supera build e test manuali proporzionati al rischio.

## Definition of Done complessiva

- [ ] Dal menu principale Training apre una scena 2D di selezione.
- [ ] Legacy / Default preserva tutto il gameplay esistente.
- [ ] Sandbox / Minimal fornisce una base pulita e giocabile per nuovi controlli.
- [ ] Input, gameplay, HUD e scoring sono componibili a codice per modalità.
- [ ] Il gameplay resta indipendente dal dispositivo fisico.
- [ ] Il cambio modalità non conserva stato volatile.
- [ ] Il fallback Legacy impedisce sessioni invalide.
- [ ] Il gioco standalone resta buildabile e indipendente dal sito.
- [ ] Documentazione e checklist riflettono l'implementazione effettiva.

## Nessun prossimo passo autorizzato

**Non è autorizzata nemmeno la Fase 0. Non procedere con analisi operative, baseline, implementazione o modifiche al gameplay.**

Per riattivare questa proposta serviranno tutte le condizioni seguenti:

1. approvazione esplicita del responsabile del progetto;
2. revoca esplicita dello stato `DRAFT BLOCCATO`;
3. creazione o indicazione esplicita di un branch dedicato diverso da `main`;
4. nuova conferma dell'ambito e delle fasi da eseguire.

In assenza anche di una sola condizione, qualsiasi lettore umano o agente deve considerare il piano **NON ESEGUIBILE**.
