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
        
        // Definiamo la nostra sequenza musicale
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
