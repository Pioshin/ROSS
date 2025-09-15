/**
 * Sistema Audio per Ruota della Fortuna - Versione "Mike Bongiorno"
 * Gestisce effetti sonori e musica di sottofondo sintetica con un tocco anni '80
 */

class GameAudio {
    constructor() {
        this.audioCtx = null;
        this.masterVolume = 0.5;
        this.effectsVolume = 0.7;
        this.musicVolume = 0.3;
        this.audioEnabled = true;
        this.backgroundMusicEnabled = false;
        this.backgroundMusicPlaying = false;
        
        // Sequencer per la musica di sottofondo
        this.sequencerInterval = null;
        this.currentStep = 0;
        this.tempo = 120; // BPM
        
        // Supporto per JSON
        this.songData = null;
        this.useJsonSong = false;
        this.noteFrequencies = {
            'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
            'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.26, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
        };

        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('Audio non disponibile:', error);
            this.audioEnabled = false;
        }
    }

    getEffectiveVolume(type = 'effect') {
        if (!this.audioEnabled) return 0;
        const baseVolume = type === 'music' ? this.musicVolume : this.effectsVolume;
        return this.masterVolume * baseVolume;
    }

    // NUOVO: Suono per il giro della ruota
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
        } catch (error) {
            console.log('Errore riproduzione wheel click:', error);
        }
    }

    // Suoni base per timer (più "digitali")
    playTick(pitchFactor = 1.0) {
        const volume = this.getEffectiveVolume();
        if (volume === 0) return;
        
        try {
            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            
            oscillator.type = 'square'; // Più incisivo
            const baseFreq = 880 * pitchFactor;
            oscillator.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);
            
            gainNode.gain.setValueAtTime(volume * 0.2, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.06);
            
            oscillator.start(this.audioCtx.currentTime);
            oscillator.stop(this.audioCtx.currentTime + 0.06);
        } catch (error) {
            console.log('Errore riproduzione tick:', error);
        }
    }

    playTimerEnd() {
        const volume = this.getEffectiveVolume();
        if (volume === 0) return;
        
        try {
            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            
            oscillator.type = 'sawtooth'; // Suono più pieno
            oscillator.frequency.setValueAtTime(330, this.audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(165, this.audioCtx.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(volume * 0.3, this.audioCtx.currentTime);
            
            oscillator.start(this.audioCtx.currentTime);
            oscillator.stop(this.audioCtx.currentTime + 0.5);
        } catch (error) {
            console.log('Errore riproduzione timer end:', error);
        }
    }

    // Eventi di gioco (stile Fanfara TV)
    playSuccess() {
        const volume = this.getEffectiveVolume();
        if (volume === 0) return;
        
        try {
            const frequencies = [523.25, 659.26, 783.99, 1046.50]; // Arpeggio Do Maggiore
            frequencies.forEach((freq, i) => {
                setTimeout(() => {
                    const osc = this.audioCtx.createOscillator();
                    const gain = this.audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(this.audioCtx.destination);
                    
                    osc.type = 'square'; // Suono da videogioco classico
                    osc.frequency.value = freq;
                    
                    gain.gain.setValueAtTime(volume * 0.25, this.audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.2);
                    
                    osc.start();
                    osc.stop(this.audioCtx.currentTime + 0.2);
                }, i * 80); // Più veloce e squillante
            });
        } catch (error) {
            console.log('Errore riproduzione success:', error);
        }
    }

    playError() {
        const volume = this.getEffectiveVolume();
        if (volume === 0) return;
        
        try {
            // Classico cicalino di errore
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.type = 'sawtooth'; // Molto aspro
            osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
            
            gain.gain.setValueAtTime(volume * 0.4, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.3);
            
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.3);
        } catch (error) {
            console.log('Errore riproduzione error:', error);
        }
    }

    playJolly() {
        this.playSuccess(); // Riusiamo la fanfara per coerenza
    }

    playBankrupt() {
        const volume = this.getEffectiveVolume();
        if (volume === 0) return;
        
        try {
            // Effetto ancora più drammatico
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, this.audioCtx.currentTime + 1.2);
            
            gain.gain.setValueAtTime(volume * 0.5, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1.2);
            
            osc.start();
            osc.stop(this.audioCtx.currentTime + 1.2);
        } catch (error) {
            console.log('Errore riproduzione bankrupt:', error);
        }
    }

    playPassTurn() {
        const volume = this.getEffectiveVolume();
        if (volume === 0) return;
        
        try {
            // Suono di transizione "whoosh" elettronico
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(220, this.audioCtx.currentTime + 0.3);
            
            gain.gain.setValueAtTime(volume * 0.3, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.3);
            
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.3);
        } catch (error) {
            console.log('Errore riproduzione pass turn:', error);
        }
    }

    playWin() {
        const volume = this.getEffectiveVolume();
        if (volume === 0) return;
        
        try {
            // Fanfara di vittoria finale, più epica
            const melody = [261, 330, 392, 523, 392, 659, 784, 1047]; // Melodia trionfale
            melody.forEach((freq, i) => {
                setTimeout(() => {
                    const osc = this.audioCtx.createOscillator();
                    const gain = this.audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(this.audioCtx.destination);
                    
                    osc.type = 'sawtooth'; // Simula ottoni synth
                    osc.frequency.value = freq;
                    
                    gain.gain.setValueAtTime(volume * 0.35, this.audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.4);
                    
                    osc.start();
                    osc.stop(this.audioCtx.currentTime + 0.4);
                }, i * 150);
            });
        } catch (error) {
            console.log('Errore riproduzione win:', error);
        }
    }

    // Musica di sottofondo - RIVOLUZIONE FUNKY!
    startBackgroundMusic() {
        if (!this.audioEnabled || !this.backgroundMusicEnabled || this.backgroundMusicPlaying) return;
        this.backgroundMusicPlaying = true;
        
        // Se abbiamo una canzone JSON, usiamo quella
        if (this.useJsonSong && this.songData) {
            this.playJsonSong();
            
            // Programma la ripetizione della canzone
            const songDuration = (this.songData.durationInBeats || 16) * (60 / (this.songData.tempo || 120)) * 1000;
            this.sequencerInterval = setInterval(() => {
                if (this.backgroundMusicPlaying) {
                    this.playJsonSong();
                }
            }, songDuration);
            return;
        }
        
        // Altrimenti usiamo la musica built-in
        const bassLine = [130.81, null, 130.81, null, 164.81, null, 130.81, null]; // Basso funky (Do, Mi, Do)
        const chords = [
            [261.63, 329.63, 392.00], // Do Maggiore
            [293.66, 369.99, 440.00]  // Re Minore
        ];
        let chordIndex = 0;

        const tick = () => {
            const volume = this.getEffectiveVolume('music');
            if (volume === 0 || !this.backgroundMusicPlaying) return;

            const time = this.audioCtx.currentTime;
            
            // Bass Line
            const bassNote = bassLine[this.currentStep];
            if (bassNote) {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.type = 'triangle';
                osc.frequency.value = bassNote;
                gain.gain.setValueAtTime(volume * 0.4, time);
                gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
                osc.start(time);
                osc.stop(time + 0.2);
            }
            
            // Chords (Pads)
            if (this.currentStep === 0 || this.currentStep === 4) {
                 const chord = chords[chordIndex % chords.length];
                 chord.forEach(freq => {
                    const osc = this.audioCtx.createOscillator();
                    const gain = this.audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(this.audioCtx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(volume * 0.15, time);
                    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.8);
                    osc.start(time);
                    osc.stop(time + 0.8);
                 });
                 chordIndex++;
            }

            // Avanzamento del sequencer
            this.currentStep = (this.currentStep + 1) % bassLine.length;
        };

        const intervalTime = (60 / this.tempo) * 1000 / 2; // 8th notes
        this.sequencerInterval = setInterval(tick, intervalTime);
    }

    stopBackgroundMusic() {
        this.backgroundMusicPlaying = false;
        if (this.sequencerInterval) {
            clearInterval(this.sequencerInterval);
            this.sequencerInterval = null;
            this.currentStep = 0;
        }
    }

    async loadSong(jsonPath) {
        try {
            const response = await fetch(jsonPath);
            this.songData = await response.json();
            this.useJsonSong = true;
            console.log('Caricata composizione:', this.songData.title);
        } catch (error) {
            console.log('Errore caricamento canzone:', error);
            this.useJsonSong = false;
        }
    }

    playJsonSong() {
        if (!this.songData || !this.audioEnabled) return;
        
        const tempo = this.songData.tempo || 120;
        const beatDuration = (60 / tempo) * 1000;
        
        this.songData.tracks.forEach(track => {
            track.notes.forEach(note => {
                const startTime = note.start * beatDuration;
                const duration = note.duration * beatDuration;
                
                setTimeout(() => {
                    if (!this.backgroundMusicPlaying) return;
                    
                    const frequency = this.noteFrequencies[note.pitch];
                    if (!frequency) return;
                    
                    const volume = this.getEffectiveVolume('music');
                    if (volume === 0) return;
                    
                    try {
                        const osc = this.audioCtx.createOscillator();
                        const gain = this.audioCtx.createGain();
                        osc.connect(gain);
                        gain.connect(this.audioCtx.destination);
                        
                        osc.type = track.instrument.waveform || 'sine';
                        osc.frequency.value = frequency;
                        
                        const envelope = track.instrument.envelope || {};
                        const attack = envelope.attack || 0.01;
                        const decay = envelope.decay || 0.1;
                        const sustain = envelope.sustain || 0.5;
                        const release = envelope.release || 0.1;
                        
                        const now = this.audioCtx.currentTime;
                        const sustainLevel = volume * sustain * 0.3;
                        
                        gain.gain.setValueAtTime(0, now);
                        gain.gain.linearRampToValueAtTime(volume * 0.3, now + attack);
                        gain.gain.exponentialRampToValueAtTime(sustainLevel, now + attack + decay);
                        gain.gain.exponentialRampToValueAtTime(0.0001, now + (duration/1000) - release);
                        
                        osc.start(now);
                        osc.stop(now + duration/1000);
                    } catch (error) {
                        console.log('Errore riproduzione nota:', error);
                    }
                }, startTime);
            });
        });
    }

    updateSettings(settings) {
        this.audioEnabled = settings.audioEnabled;
        this.masterVolume = settings.masterVolume / 100;
        this.effectsVolume = settings.effectsVolume / 100;
        this.musicVolume = settings.musicVolume / 100;
        this.backgroundMusicEnabled = settings.backgroundMusicEnabled;
        
        if (this.backgroundMusicEnabled && !this.backgroundMusicPlaying) {
            this.startBackgroundMusic();
        } else if (!this.backgroundMusicEnabled && this.backgroundMusicPlaying) {
            this.stopBackgroundMusic();
        }
    }
}

// Esporta per uso nel main.js
window.GameAudio = GameAudio;
