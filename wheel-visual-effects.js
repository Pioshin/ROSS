/**
 * Sistema di Effetti Visivi Spettacolari per la Ruota della Fortuna
 * Gestisce le animazioni immersive durante il giro della ruota
 */

class WheelVisualEffects {
    constructor() {
        this.wheel = null;
        this.overlay = null;
        this.lights = null;
        this.particles = null;
        this.popupLights = null;
        this.popup = null;
        this.giantPointer = null;
        this.isActive = false;
        this.popupEffectsActive = false;
        
        // Zoom televisivo
        this.zoomOverlay = null;
        this.zoomContainer = null;
        this.zoomCloseBtn = null;
        this.zoomActive = false;
    }

    init() {
        // Riferimenti agli elementi
        this.wheel = document.getElementById('wheel');
        this.overlay = document.getElementById('spinning-overlay');
        this.lights = document.getElementById('wheel-lights');
        this.particles = document.getElementById('wheel-particles');
        this.popupLights = document.getElementById('popup-lights');
        this.popup = document.getElementById('popup-toast');
        this.giantPointer = document.getElementById('giant-pointer');
        
        if (!this.wheel || !this.overlay || !this.lights || !this.particles) {
            console.log('Alcuni elementi per gli effetti visivi non sono stati trovati');
            return false;
        }
        
        if (!this.popupLights || !this.popup) {
            console.log('Elementi popup per gli effetti non trovati, ma continuo...');
        }
        
        if (!this.giantPointer) {
            console.log('Pointer gigante non trovato, ma continuo...');
        }
        
        // Inizializza elementi zoom televisivo
        this.zoomOverlay = document.getElementById('puzzle-zoom-overlay');
        this.zoomContainer = document.getElementById('puzzle-zoom-container');
        this.zoomCloseBtn = document.getElementById('puzzle-zoom-close');
        
        if (this.zoomOverlay && this.zoomContainer && this.zoomCloseBtn) {
            // Event listener per chiudere lo zoom
            this.zoomCloseBtn.addEventListener('click', () => this.stopPuzzleZoom());
            this.zoomOverlay.addEventListener('click', (e) => {
                if (e.target === this.zoomOverlay) {
                    this.stopPuzzleZoom();
                }
            });
            console.log('Sistema zoom televisivo inizializzato');
        } else {
            console.log('Elementi zoom televisivo non trovati');
        }
        
        console.log('Sistema effetti visivi inizializzato');
        return true;
    }

    startSpinningEffects() {
        if (this.isActive || !this.wheel) return;
        
        console.log('🎆 Attivando effetti spettacolari!');
        this.isActive = true;

        // Attiva la ruota gigante con effetti luminosi
        this.wheel.classList.add('wheel-spinning-effects');
        this.wheel.classList.remove('wheel-normal');

        // Attiva overlay scuro
        this.overlay.classList.add('active');

        // Attiva luci colorate
        this.lights.classList.add('active');

        // Attiva il pointer gigante con wobbling continuo
        if (this.giantPointer) {
            this.giantPointer.classList.add('active');
            
            // Wobble automatico all'inizio per assicurarsi che sia visibile
            setTimeout(() => {
                if (this.isActive && this.giantPointer) {
                    console.log('🎯 Wobble automatico del pointer gigante all\'inizio!');
                    this.giantPointer.classList.add('wobble');
                }
            }, 300);
        }

        // Attiva particelle dopo un piccolo delay
        setTimeout(() => {
            if (this.isActive) {
                this.particles.classList.add('active');
            }
        }, 500);
    }

    stopSpinningEffects() {
        if (!this.isActive || !this.wheel) return;
        
        console.log('🎯 Disattivando effetti con wobble finale');
        
        // WOBBLE FINALE del pointer gigante PRIMA di disattivarlo
        if (this.giantPointer) {
            console.log('🎯 Wobble finale durante la disattivazione!');
            this.giantPointer.classList.remove('wobble');
            void this.giantPointer.offsetWidth; // Forza il reflow
            this.giantPointer.classList.add('wobble');
        }
        
        this.isActive = false;

        // Riporta la ruota alla normalità
        this.wheel.classList.remove('wheel-spinning-effects');
        this.wheel.classList.add('wheel-normal');

        // Disattiva tutti gli effetti
        this.overlay.classList.remove('active');
        this.lights.classList.remove('active');
        this.particles.classList.remove('active');
        
        // Disattiva il pointer gigante DOPO il wobble (1.5s duration)
        if (this.giantPointer) {
            setTimeout(() => {
                if (this.giantPointer) {
                    this.giantPointer.classList.remove('active');
                    this.giantPointer.classList.remove('wobble');
                }
            }, 1600); // Poco dopo la durata dell'animazione wobble
        }

        // Rimuovi la classe wheel-normal dopo la transizione
        setTimeout(() => {
            if (this.wheel) {
                this.wheel.classList.remove('wheel-normal');
            }
        }, 600);
    }

    startPopupEffects() {
        if (this.popupEffectsActive || !this.popup || !this.popupLights) return;
        
        console.log('🎉 Attivando effetti spettacolari popup!');
        this.popupEffectsActive = true;

        // Attiva effetti CSS del popup
        this.popup.classList.add('popup-spectacular');

        // Attiva luci intorno al popup
        this.popupLights.classList.add('active');

        // Disattiva effetti dopo 2.5 secondi (durata del popup)
        setTimeout(() => {
            this.stopPopupEffects();
        }, 2500);
    }

    stopPopupEffects() {
        if (!this.popupEffectsActive || !this.popup || !this.popupLights) return;
        
        console.log('🎯 Disattivando effetti popup');
        this.popupEffectsActive = false;

        // Disattiva effetti CSS del popup
        this.popup.classList.remove('popup-spectacular');

        // Disattiva luci
        this.popupLights.classList.remove('active');
    }

    startPuzzleZoom() {
        if (this.zoomActive || !this.zoomOverlay || !this.zoomContainer) return;
        
        console.log('🔍 Attivando zoom televisivo!');
        this.zoomActive = true;
        
        // Copia il contenuto del tabellone e tastiera originali
        this.copyPuzzleContent();
        
        // Attiva l'overlay con effetti spettacolari
        this.zoomOverlay.classList.add('active');
        
        setTimeout(() => {
            if (this.zoomContainer) {
                this.zoomContainer.classList.add('active', 'puzzle-zoom-spectacular');
            }
        }, 100);
    }
    
    stopPuzzleZoom() {
        if (!this.zoomActive || !this.zoomOverlay || !this.zoomContainer) return;
        
        console.log('🔍 Disattivando zoom televisivo');
        this.zoomActive = false;
        
        // Animazione di uscita
        this.zoomContainer.classList.remove('active', 'puzzle-zoom-spectacular');
        
        setTimeout(() => {
            this.zoomOverlay.classList.remove('active');
        }, 300);
    }
    
    copyPuzzleContent() {
        // Copia la categoria
        const originalCategory = document.getElementById('category');
        const zoomCategory = document.getElementById('category-zoom');
        if (originalCategory && zoomCategory) {
            zoomCategory.textContent = originalCategory.textContent;
        }
        
        // Copia il timer se attivo
        const originalTimer = document.getElementById('timer-container');
        const originalTimerDisplay = document.getElementById('timer-display');
        const zoomTimerContainer = document.getElementById('timer-zoom-container');
        const zoomTimerDisplay = document.getElementById('timer-zoom-display');
        
        if (originalTimer && zoomTimerContainer && zoomTimerDisplay) {
            const isTimerVisible = originalTimer.style.display !== 'none';
            zoomTimerContainer.style.display = isTimerVisible ? 'block' : 'none';
            
            if (isTimerVisible && originalTimerDisplay) {
                const timerValue = originalTimerDisplay.textContent.trim();
                zoomTimerDisplay.textContent = timerValue;
                
                // Applica classe warning se il timer è basso
                const timeLeft = parseInt(timerValue);
                if (timeLeft <= 3 && timeLeft > 0) {
                    zoomTimerDisplay.classList.add('warning');
                } else {
                    zoomTimerDisplay.classList.remove('warning');
                }
            }
        }
        
        // Copia il tabellone
        const originalBoard = document.getElementById('puzzle-board');
        const zoomBoard = document.getElementById('puzzle-board-zoom');
        if (originalBoard && zoomBoard) {
            zoomBoard.innerHTML = originalBoard.innerHTML;
        }
        
        // Copia la tastiera
        const originalKeyboard = document.getElementById('keyboard');
        const zoomKeyboard = document.getElementById('keyboard-zoom');
        if (originalKeyboard && zoomKeyboard) {
            zoomKeyboard.innerHTML = originalKeyboard.innerHTML;
            
            // Riattacca gli event listener per i tasti nella tastiera zoomata
            const keys = zoomKeyboard.querySelectorAll('.key');
            keys.forEach(key => {
                key.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const letter = key.dataset.letter || key.textContent.trim();
                    console.log('🔍 Click lettera zoom:', letter);
                    
                    if (letter && window.handleKeyClick) {
                        window.handleKeyClick(letter);
                        
                        // Chiudi lo zoom dopo aver cliccato una lettera
                        setTimeout(() => {
                            this.stopPuzzleZoom();
                        }, 300);
                    } else {
                        console.log('❌ Lettera o handler non trovati:', letter, !!window.handleKeyClick);
                    }
                });
            });
        }
    }
}

// Istanza globale per l'uso nel main.js
window.WheelVisualEffects = WheelVisualEffects;