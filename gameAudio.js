/**
 * Sistema Audio per Ruota della Fortuna - Versione "Orchestra & Jingle"
 * Player multitraccia che carica composizioni JSON e riproduce jingle per gli eventi.
 */
class GameAudio {
    constructor() {
        // --- Contesto Audio e Volumi ---
        this.audioCtx = null;
        this.masterVolume = 0.5;
        this.effectsVolume = 0.7;
        this.musicVolume = 0.1;
        this.audioEnabled = true;
        this.initAudioContext();

        // --- Stato del Player Musicale ---
        this.songData = null;
        this.backgroundMusicPlaying = false;
        this.startTime = 0;
        this.nextNoteTime = 0.0;
        this.schedulerTimer = null;
        this.lookahead = 25.0; // ms
        this.scheduleAheadTime = 0.1; // sec
        
        // Tabella di conversione da nota a frequenza (Hz)
        this.noteFrequencies = {
            'C0': 16.35, 'C#0': 17.32, 'D0': 18.35, 'D#0': 19.45, 'E0': 20.60, 'F0': 21.83, 'F#0': 23.12, 'G0': 24.50, 'G#0': 25.96, 'A0': 27.50, 'A#0': 29.14, 'B0': 30.87,
            'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'E1': 41.20, 'F1': 43.65, 'F#1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
            'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
            'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.26, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
            'C6': 1046.50
        };
    }

    initAudioContext() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Audio non disponibile:', error);
            this.audioEnabled = false;
        }
    }

    getEffectiveVolume(type = 'effect') {
        if (!this.audioEnabled) return 0;
        const baseVolume = type === 'music' ? this.musicVolume : this.effectsVolume;
        return this.masterVolume * baseVolume;
    }
    
    async loadSong(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.songData = await response.json();
            console.log('Canzone caricata:', this.songData.title);
        } catch (error) {
            console.error('Impossibile caricare la canzone:', error);
            this.songData = null;
        }
    }

    // --- NUOVA SEZIONE JINGLE ---

    /**
     * Funzione interna per riprodurre sequenze di note (jingle).
     * @param {Array} jingleData - Array di oggetti nota {pitch, duration, delay, waveform, vol}.
     */
    _playJingle(jingleData) {
        const baseVolume = this.getEffectiveVolume('effect');
        if (baseVolume === 0) return;

        jingleData.forEach(noteData => {
            setTimeout(() => {
                if (!this.audioEnabled) return;
                try {
                    const osc = this.audioCtx.createOscillator();
                    const gainNode = this.audioCtx.createGain();
                    osc.connect(gainNode);
                    gainNode.connect(this.audioCtx.destination);

                    osc.type = noteData.waveform || 'square';
                    const freq = this.noteFrequencies[noteData.pitch];
                    if (!freq) return;
                    osc.frequency.value = freq;
                    
                    const now = this.audioCtx.currentTime;
                    const peakVolume = baseVolume * (noteData.vol || 0.4);
                    gainNode.gain.setValueAtTime(0, now);
                    gainNode.gain.linearRampToValueAtTime(peakVolume, now + 0.01); // Attack rapidissimo
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + noteData.duration);

                    osc.start(now);
                    osc.stop(now + noteData.duration);
                } catch(e) { console.error("Errore nel riprodurre il jingle:", e); }
            }, noteData.delay);
        });
    }

    playSuccess() {
        const jingle = [
            { pitch: 'G4', duration: 0.15, delay: 0, vol: 0.5 },
            { pitch: 'C5', duration: 0.3, delay: 150, vol: 0.6 },
            { pitch: 'E5', duration: 0.3, delay: 150, vol: 0.5 } // Armonia
        ];
        this._playJingle(jingle);
    }

    playError() {
        const jingle = [
            { pitch: 'G#3', duration: 0.2, delay: 0, waveform: 'sawtooth', vol: 0.5 },
            { pitch: 'G3', duration: 0.4, delay: 150, waveform: 'sawtooth', vol: 0.5 }
        ];
        this._playJingle(jingle);
    }
    
    playJolly() {
        const jingle = [
            { pitch: 'C4', duration: 0.1, delay: 0, vol: 0.5 },
            { pitch: 'E4', duration: 0.1, delay: 100, vol: 0.5 },
            { pitch: 'G4', duration: 0.1, delay: 200, vol: 0.5 },
            { pitch: 'C5', duration: 0.1, delay: 300, vol: 0.5 },
            { pitch: 'E5', duration: 0.4, delay: 400, vol: 0.6 }
        ];
        this._playJingle(jingle);
    }

    playBankrupt() {
        const jingle = [
            { pitch: 'C5', duration: 0.1, delay: 0, waveform: 'sawtooth', vol: 0.6 },
            { pitch: 'B4', duration: 0.1, delay: 100, waveform: 'sawtooth', vol: 0.55 },
            { pitch: 'A#4', duration: 0.1, delay: 200, waveform: 'sawtooth', vol: 0.5 },
            { pitch: 'A4', duration: 0.1, delay: 300, waveform: 'sawtooth', vol: 0.45 },
            { pitch: 'G#4', duration: 0.1, delay: 400, waveform: 'sawtooth', vol: 0.4 },
            { pitch: 'G4', duration: 0.1, delay: 500, waveform: 'sawtooth', vol: 0.35 },
            { pitch: 'F#4', duration: 0.1, delay: 600, waveform: 'sawtooth', vol: 0.3 },
            { pitch: 'F4', duration: 0.8, delay: 700, waveform: 'sawtooth', vol: 0.5 }
        ];
        this._playJingle(jingle);
    }
    
    playPassTurn() {
        const jingle = [
            { pitch: 'A4', duration: 0.15, delay: 0, waveform: 'triangle', vol: 0.4 },
            { pitch: 'F4', duration: 0.2, delay: 150, waveform: 'triangle', vol: 0.3 }
        ];
        this._playJingle(jingle);
    }

    playWin() {
        const jingle = [
            // Accordo iniziale
            { pitch: 'C4', duration: 0.8, delay: 0, waveform: 'sawtooth', vol: 0.3 },
            { pitch: 'G4', duration: 0.8, delay: 0, waveform: 'sawtooth', vol: 0.4 },
            { pitch: 'C5', duration: 0.8, delay: 0, waveform: 'sawtooth', vol: 0.5 },
            // Fanfara
            { pitch: 'G5', duration: 0.3, delay: 100, vol: 0.6 },
            { pitch: 'G5', duration: 0.3, delay: 300, vol: 0.6 },
            { pitch: 'G5', duration: 0.3, delay: 500, vol: 0.6 },
            { pitch: 'C6', duration: 1.0, delay: 700, vol: 0.7 }
        ];
        this._playJingle(jingle);
    }

    // --- EFFETTI NON-JINGLE (Immutati) ---

    playWheelClick() {
        const volume = this.getEffectiveVolume();
        if (volume === 0) return;
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
            gain.gain.setValueAtTime(volume * 0.4, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.08);
            osc.start(this.audioCtx.currentTime);
            osc.stop(this.audioCtx.currentTime + 0.08);
        } catch (e) { console.error('Errore wheel click:', e); }
    }

    playPopup() {
        const jingle = [
            { pitch: 'E4', duration: 0.1, delay: 0, waveform: 'triangle', vol: 0.3 },
            { pitch: 'A4', duration: 0.15, delay: 80, waveform: 'triangle', vol: 0.4 }
        ];
        this._playJingle(jingle);
    }

    playTick(pitchFactor = 1.0) {
        const volume = this.getEffectiveVolume();
        if (volume === 0) return;
        try {
            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(880 * pitchFactor, this.audioCtx.currentTime);
            gainNode.gain.setValueAtTime(volume * 0.2, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.06);
            oscillator.start(this.audioCtx.currentTime);
            oscillator.stop(this.audioCtx.currentTime + 0.06);
        } catch (e) { console.error('Errore tick:', e); }
    }

    playTimerEnd() {
        const volume = this.getEffectiveVolume();
        if (volume === 0) return;
        try {
            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(330, this.audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(165, this.audioCtx.currentTime + 0.5);
            gainNode.gain.setValueAtTime(volume * 0.3, this.audioCtx.currentTime);
            oscillator.start(this.audioCtx.currentTime);
            oscillator.stop(this.audioCtx.currentTime + 0.5);
        } catch (e) { console.error('Errore timer end:', e); }
    }


    // --- SISTEMA DI RIPRODUZIONE MUSICALE (Immutato) ---

    scheduler() {
        while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
            this.scheduleNotesForBeat(this.nextNoteTime);
            this.advanceNote();
        }
        this.schedulerTimer = setTimeout(() => this.scheduler(), this.lookahead);
    }
    
    advanceNote() {
        const secondsPerBeat = 60.0 / this.songData.tempo;
        this.nextNoteTime += 0.25 * secondsPerBeat; 

        if (this.nextNoteTime > this.startTime + this.songData.durationInBeats * secondsPerBeat) {
            this.startTime = this.nextNoteTime;
        }
    }

    scheduleNotesForBeat(beatTime) {
        const secondsPerBeat = 60.0 / this.songData.tempo;
        const currentBeatInSong = ((beatTime - this.startTime) / secondsPerBeat) % this.songData.durationInBeats;

        for (const track of this.songData.tracks) {
            for (const note of track.notes) {
                if (Math.abs(note.start - currentBeatInSong) < 0.01) {
                    this.playNote(note, track.instrument, beatTime);
                }
            }
        }
    }

    playNote(note, instrument, time) {
        if (!note.pitch || note.pitch === "REST") return;
        const volume = this.getEffectiveVolume('music');
        if (volume === 0) return;

        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        osc.type = instrument.waveform;
        osc.frequency.value = this.noteFrequencies[note.pitch] || 440;
        
        const { attack, decay, sustain, release } = instrument.envelope;
        const secondsPerBeat = 60.0 / this.songData.tempo;
        const noteDuration = note.duration * secondsPerBeat;
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(volume * 0.08, time + attack);
        gainNode.gain.linearRampToValueAtTime(volume * sustain * 0.08, time + attack + decay);
        gainNode.gain.setValueAtTime(volume * sustain * 0.08, time + noteDuration - release);
        gainNode.gain.linearRampToValueAtTime(0, time + noteDuration);

        osc.start(time);
        osc.stop(time + noteDuration);
    }
    
    startBackgroundMusic() {
        if (this.backgroundMusicPlaying || !this.songData || !this.audioEnabled) return;
        this.backgroundMusicPlaying = true;
        this.startTime = this.audioCtx.currentTime;
        this.nextNoteTime = this.audioCtx.currentTime;
        this.scheduler();
    }
    
    stopBackgroundMusic() {
        if (!this.backgroundMusicPlaying) return;
        this.backgroundMusicPlaying = false;
        clearTimeout(this.schedulerTimer);
    }
    
    updateSettings(settings) {
        this.audioEnabled = settings.audioEnabled;
        this.masterVolume = settings.masterVolume / 100;
        this.effectsVolume = settings.effectsVolume / 100;
        this.musicVolume = settings.musicVolume / 100;
        
        if (settings.backgroundMusicEnabled && !this.backgroundMusicPlaying) {
            this.startBackgroundMusic();
        } else if (!settings.backgroundMusicEnabled && this.backgroundMusicPlaying) {
            this.stopBackgroundMusic();
        }
    }
}

// Esporta per uso nel main.js
window.GameAudio = GameAudio;


