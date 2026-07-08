# Bring Your Music — tap-tempo implementation

**Stato:** implementato  
**Ambito:** `apps/game`, modalità Training

## Decisione finale

“Bring Your Music” non cattura, registra o analizza l'audio del dispositivo. L'utente riproduce la propria musica con YouTube, Spotify o qualsiasi altra applicazione e definisce il tempo della sessione tramite un controllo touch nell'HUD.

Questa decisione sostituisce integralmente il precedente esperimento basato su `getDisplayMedia()` e rilevamento automatico:

- nessun permesso di cattura;
- nessun `MediaStream` o `AudioContext` dedicato all'ascolto esterno;
- nessun analizzatore BPM, timer o aggiornamento React derivato dall'audio;
- comportamento identico su mobile, tablet e desktop;
- nessun costo aggiuntivo nel rendering Three.js.

## Flusso

```text
Options → Audio → Bring Your Music
                  │
                  ▼
             Training session
                  │
                  ▼
          R1 Tap BPM control (touch)
                  │
                  ▼
         useGameStore.setBpm()
                  │
                  ▼
            RhythmClockProvider
```

La sessione parte a 100 BPM. Il primo tap apre una finestra di misura di 3 secondi; il secondo tap, eseguito sul battito consecutivo della musica esterna, calcola il BPM dall'intervallo trascorso e chiude la finestra. Intervalli inferiori a un battito a 180 BPM vengono rifiutati come doppi click accidentali: il secondo tocco diventa il nuovo primo tap e R1 resta in attesa. Se il secondo tap non arriva in tempo, la misura viene annullata e la sessione torna al fallback di 100 BPM. Il risultato viene normalizzato nel range 60–180 BPM e diventa l'unica autorità temporale della sessione.

## Modalità audio Training

- `Game music` — traccia interna.
- `Bring Your Music` — musica esterna non catturata e Tap BPM assegnato al dorsale touch R1; l'indicatore 4/4 resta solo visivo.
- `Manual BPM` — slider e metronomo sintetizzato, in attesa della futura traccia basic di assolo batteria.

## Verifica

- il pulsante deve essere utilizzabile con touch, mouse e tastiera;
- il primo tap prepara una nuova misura e il secondo produce un BPM;
- tap regolari devono stabilizzarsi sul valore atteso;
- una pausa di oltre 2,5 secondi deve azzerare la sequenza;
- HUD 4/4, debug BPM, cue, animazioni e gameplay devono leggere lo stesso `RhythmClock`;
- `npm run game:build` e `git diff --check` devono passare.
