document.addEventListener('DOMContentLoaded', () => {
    // Bottone Salva nella modale Maestra
    const maestraSaveBtn = document.getElementById('maestra-save-btn');
    if (maestraSaveBtn) {
        maestraSaveBtn.addEventListener('click', () => {
            savePlayersConfig();
            if (maestraPlayersMsg) {
                maestraPlayersMsg.textContent = 'Salvato!';
            }
            // Chiudi la modale subito dopo il salvataggio
            if (maestraPanelOverlay) {
                setTimeout(() => {
                    maestraPanelOverlay.classList.add('hidden');
                    if (maestraPlayersMsg) maestraPlayersMsg.textContent = '';
                }, 600);
            }
        });
    }
    // --- VARIABILI DOM PANNELLO MAESTRA ---
    const maestraAddPlayerBtn = document.getElementById('maestra-add-player-btn');
    const maestraNewPlayerInput = document.getElementById('maestra-new-player');
    const maestraPlayersMsg = document.getElementById('maestra-players-msg');
    const maestraPanelBtn = document.getElementById('maestra-panel-btn');
    const maestraPanelOverlay = document.getElementById('maestra-panel-overlay');
    const closeMaestraPanelBtn = document.getElementById('close-maestra-panel');
    const maestraAuthSection = document.getElementById('maestra-auth-section');
    const maestraPanelContent = document.getElementById('maestra-panel-content');
    const maestraAuthBtn = document.getElementById('maestra-auth-btn');
    const maestraPasswordInput = document.getElementById('maestra-password');
    const maestraAuthError = document.getElementById('maestra-auth-error');
    const maestraPlayersList = document.getElementById('maestra-players-list');

    // Variabili DOM per gestione turni
    const maestraRoundsCountInput = document.getElementById('maestra-rounds-count');
    const maestraRoundsList = document.getElementById('maestra-rounds-list');
    const maestraAddRoundBtn = document.getElementById('maestra-add-round-btn');
    const maestraSaveRoundsBtn = document.getElementById('maestra-save-rounds-btn');
    const maestraRoundsMsg = document.getElementById('maestra-rounds-msg');

    // Variabili DOM per controllo lettere
    const maestraLettersGrid = document.getElementById('maestra-letters-grid');
    const maestraRevealAllBtn = document.getElementById('maestra-reveal-all-btn');
    const maestraHideAllBtn = document.getElementById('maestra-hide-all-btn');
    const maestraResetLettersBtn = document.getElementById('maestra-reset-letters-btn');

    // Variabili DOM per personalizzazione ruota
    const maestraWheelType = document.getElementById('maestra-wheel-type');
    const maestraSegmentsCount = document.getElementById('maestra-segments-count');
    const maestraSegmentsGrid = document.getElementById('maestra-segments-grid');
    const maestraApplyWheelBtn = document.getElementById('maestra-apply-wheel-btn');
    const maestraResetWheelBtn = document.getElementById('maestra-reset-wheel-btn');
    const maestraSaveWheelBtn = document.getElementById('maestra-save-wheel-btn');
    const maestraWheelMsg = document.getElementById('maestra-wheel-msg');

    // --- STATO DEL GIOCO ---
    let playerScores = [];
    let roundScores = [];
    let playerJolly = [];
    let currentPlayerIndex = 0;
    let currentPhrase = '';
    let guessedLetters = [];
    let currentRoundIndex = 0;
    let wheelSpinning = false;
    let currentWheelAngle = 0;
    let allConsonantsRevealed = false;
    let currentSpinValue = null;
    let gameState = '';

    // Configurazione turni di gioco
    let gameRounds = [
        { type: 'CLASSIC', title: 'Round 1', description: 'Gira la ruota e indovina le consonanti!' },
        { type: 'CLASSIC', title: 'Round 2', description: 'Ancora un puzzle da risolvere!' },
        { type: 'FINALE', title: 'Round Finale', description: 'Il vincitore gioca per il super premio!'},
    ];

    // Configurazione personalizzata della ruota
    let customWheelConfig = null;

    // --- SALVATAGGIO E CARICAMENTO CONFIGURAZIONE GIOCATORI ---
    function savePlayersConfig() {
        const players = [];
        for (let i = 0; i < playerScores.length; i++) {
            const input = document.getElementById(`player-${i}-name`);
            players.push({
                name: input ? input.value : `Giocatore ${i+1}`,
                tot: playerScores[i],
                ora: roundScores[i],
                jolly: playerJolly[i]
            });
        }
        localStorage.setItem('ruota_players', JSON.stringify(players));
    }

    function loadPlayersConfig() {
        const data = localStorage.getItem('ruota_players');
        let players = [];
        if (data) {
            try {
                players = JSON.parse(data);
            } catch(e) { players = []; }
        }
        if (!players || players.length === 0) {
            players = [{ name: 'Giocatore 1', tot: 0, ora: 0, jolly: 0 }];
        }
        playerScores = [];
        roundScores = [];
        playerJolly = [];
        document.querySelectorAll('.player-score').forEach(el => el.remove());
    const scoresDiv = document.querySelector('.player-score')?.parentElement || document.querySelector('.grid');
        players.forEach((p, i) => {
            playerScores.push(p.tot);
            roundScores.push(p.ora);
            playerJolly.push(p.jolly);
            if (scoresDiv) {
                const newDiv = document.createElement('div');
                newDiv.className = 'player-score bg-gradient-to-br from-gray-600/30 to-blue-600/30 rounded-lg p-4 border border-gray-400/30';
                newDiv.innerHTML = `
                    <input type="text" id="player-${i}-name" value="${p.name}" class="player-name-input" />
                    <div class="score-row"><span class="score-label">TOT:</span> <span id="tot-${i}" class="score-value">${p.tot} punti</span></div>
                    <div class="score-row"><span class="score-label">ORA:</span> <span id="ora-${i}" class="score-value">${p.ora} punti</span></div>
                    <div class="score-row"><span class="score-label">JOLLY:</span> <span id="jolly-${i}" class="jolly-count">${p.jolly}</span></div>
                `;
                scoresDiv.appendChild(newDiv);
            }
        });
    }

    // Funzione aggiornata per gestire dinamicamente la lista
    function renderMaestraPlayers() {
        if (!maestraPlayersList) return;
        maestraPlayersList.innerHTML = '';
            // Intestazione colonne
            const header = document.createElement('div');
            header.className = 'flex gap-2 items-center mb-1';
            header.innerHTML = `
                <span class=\"w-40\"></span>
                <span class=\"w-20 text-xs text-gray-700 text-center\">TOT</span>
                <span class=\"w-20 text-xs text-gray-700 text-center\">ORA</span>
                <span class=\"w-20\"></span>
            `;
            maestraPlayersList.appendChild(header);
        for (let i = 0; i < playerScores.length; i++) {
            const input = document.getElementById(`player-${i}-name`);
            const name = input ? input.value : `Giocatore ${i+1}`;
            const div = document.createElement('div');
            div.className = 'flex gap-2 items-center';
            div.innerHTML = `
                <input type=\"text\" value=\"${name}\" data-idx=\"${i}\" class=\"maestra-player-name px-2 py-1 border rounded w-40 text-gray-900\" />
                <input type=\"number\" value=\"${playerScores[i]}\" data-idx=\"${i}\" data-type=\"tot\" class=\"maestra-player-tot px-2 py-1 border rounded w-20 text-gray-900 text-center\" min=\"0\" />
                <input type=\"number\" value=\"${roundScores[i]}\" data-idx=\"${i}\" data-type=\"ora\" class=\"maestra-player-ora px-2 py-1 border rounded w-20 text-gray-900 text-center\" min=\"0\" />
                <button class=\"maestra-set-turn px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-black rounded font-bold\" data-idx=\"${i}\">Turno</button>
                <button class=\"maestra-remove-player px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded\" data-idx=\"${i}\">Elimina</button>
            `;
            if (typeof currentPlayerIndex !== 'undefined' && i === currentPlayerIndex) {
                div.style.background = 'linear-gradient(90deg, #fef08a 0 10%, transparent 80%)';
            }
            maestraPlayersList.appendChild(div);
        }
        // Aggiorna la cornice luminosa nella griglia principale
        // Aggiorna gli indici
        document.querySelectorAll('.player-score').forEach((panel, i) => {
            panel.setAttribute('data-player-index', i);
        });
        // Aggiorna la visualizzazione del giocatore attivo
        updateActivePlayer();
    }

    // Modifica nome in tempo reale
    if (maestraPanelContent) {
    maestraPanelContent.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        if (e.target.classList.contains('maestra-player-name')) {
            const mainInput = document.getElementById(`player-${idx}-name`);
            if (mainInput) mainInput.value = e.target.value;
            savePlayersConfig();
        } else if (e.target.classList.contains('maestra-player-tot')) {
            const val = parseInt(e.target.value) || 0;
            playerScores[idx] = val;
            const totEl = document.getElementById(`tot-${idx}`);
            if (totEl) totEl.textContent = `${val} punti`;
            savePlayersConfig();
        } else if (e.target.classList.contains('maestra-player-ora')) {
            const val = parseInt(e.target.value) || 0;
            roundScores[idx] = val;
            const oraEl = document.getElementById(`ora-${idx}`);
            if (oraEl) oraEl.textContent = `${val} punti`;
            savePlayersConfig();
        }
    });
    // Assegna turno
    maestraPanelContent.addEventListener('click', (e) => {
        if (e.target.classList.contains('maestra-set-turn')) {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            currentPlayerIndex = idx;
            updateActivePlayer();
            renderMaestraPlayers();
        }
    });
        // Elimina giocatore
        maestraPanelContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('maestra-remove-player')) {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                if (playerScores.length > 1) {
                    playerScores.splice(idx, 1);
                    roundScores.splice(idx, 1);
                    playerJolly.splice(idx, 1);

                    // Rimuovi il pannello punteggio corrispondente
                    const scorePanel = document.querySelector(`.player-score[data-player-index="${idx}"]`);
                    if (scorePanel) scorePanel.remove();

                    // Aggiorna gli indici e gli ID degli elementi DOM rimanenti
                    document.querySelectorAll('.player-score').forEach((panel, newIdx) => {
                        panel.dataset.playerIndex = newIdx;
                        panel.querySelector('.player-name-input').id = `player-${newIdx}-name`;
                        panel.querySelector('.score-value').id = `tot-${newIdx}`;
                        panel.querySelectorAll('.score-value')[1].id = `ora-${newIdx}`;
                        panel.querySelector('.jolly-count').id = `jolly-${newIdx}`;
                    });
                    renderMaestraPlayers();
                    maestraPlayersMsg.textContent = '';
                    savePlayersConfig();
                } else {
                    maestraPlayersMsg.textContent = 'Deve esserci almeno un giocatore.';
                }
            }
        });
    }
    // Aggiungi giocatore
    if (maestraAddPlayerBtn) {
        maestraAddPlayerBtn.addEventListener('click', () => {
            const newName = maestraNewPlayerInput.value.trim();
            if (newName) {
                playerScores.push(0);
                roundScores.push(0);
                playerJolly.push(0);
                // Crea nuovo input DOM
                // Selettore valido per la griglia dei giocatori (usa solo la prima griglia con classe player-score)
                const scoresDiv = document.querySelector('.player-score')?.parentElement || document.querySelector('.grid');
                if (scoresDiv) {
                    const idx = playerScores.length - 1;
                    const newDiv = document.createElement('div');
                    newDiv.className = 'player-score bg-gradient-to-br from-gray-600/30 to-blue-600/30 rounded-lg p-4 border border-gray-400/30';
                    newDiv.innerHTML = `
                        <input type="text" id="player-${idx}-name" value="${newName}" class="player-name-input" />
                        <div class="score-row"><span class="score-label">TOT:</span> <span id="tot-${idx}" class="score-value">0 punti</span></div>
                        <div class="score-row"><span class="score-label">ORA:</span> <span id="ora-${idx}" class="score-value">0 punti</span></div>
                        <div class="score-row"><span class="score-label">JOLLY:</span> <span id="jolly-${idx}" class="jolly-count">0</span></div>
                    `;
                    scoresDiv.appendChild(newDiv);
                }
                renderMaestraPlayers();
                maestraNewPlayerInput.value = '';
                maestraPlayersMsg.textContent = '';
                savePlayersConfig();
            } else {
                maestraPlayersMsg.textContent = 'Inserisci un nome valido.';
            }
        });
    }

    // --- FUNZIONI GESTIONE TURNI ---

    function saveRoundsConfig() {
        const roundsConfig = gameRounds.map((round, index) => ({
            type: round.type,
            title: round.title,
            description: round.description
        }));
        localStorage.setItem('ruota_rounds', JSON.stringify(roundsConfig));
    }

    function loadRoundsConfig() {
        const data = localStorage.getItem('ruota_rounds');
        if (data) {
            try {
                const savedRounds = JSON.parse(data);
                if (savedRounds && savedRounds.length > 0) {
                    gameRounds = savedRounds;
                }
            } catch(e) {
                console.log('Errore caricamento configurazione turni:', e);
            }
        }
        // Aggiorna l'input del numero di turni
        if (maestraRoundsCountInput) {
            maestraRoundsCountInput.value = gameRounds.length;
        }
    }

    function renderMaestraRounds() {
        if (!maestraRoundsList) return;
        maestraRoundsList.innerHTML = '';

        gameRounds.forEach((round, index) => {
            const div = document.createElement('div');
            div.className = 'bg-gray-50 p-3 rounded-lg border';
            div.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <span class="font-semibold text-gray-700">Turno ${index + 1}:</span>
                    <select data-idx="${index}" data-field="type" class="maestra-round-type px-2 py-1 border rounded text-gray-900">
                        <option value="CLASSIC" ${round.type === 'CLASSIC' ? 'selected' : ''}>Classico</option>
                        <option value="FINALE" ${round.type === 'FINALE' ? 'selected' : ''}>Finale</option>
                    </select>
                    <button class="maestra-remove-round px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs" data-idx="${index}">Elimina</button>
                </div>
                <div class="mb-2">
                    <input type="text" placeholder="Titolo turno" value="${round.title}" data-idx="${index}" data-field="title" class="maestra-round-title w-full px-2 py-1 border rounded text-gray-900 text-sm" />
                </div>
                <div>
                    <input type="text" placeholder="Descrizione turno" value="${round.description}" data-idx="${index}" data-field="description" class="maestra-round-description w-full px-2 py-1 border rounded text-gray-900 text-xs" />
                </div>
            `;
            maestraRoundsList.appendChild(div);
        });
    }

    function updateRoundsFromCount() {
        const targetCount = parseInt(maestraRoundsCountInput.value) || 1;
        const currentCount = gameRounds.length;

        if (targetCount > currentCount) {
            // Aggiungi turni
            for (let i = currentCount; i < targetCount; i++) {
                const isLast = (i === targetCount - 1);
                gameRounds.push({
                    type: isLast ? 'FINALE' : 'CLASSIC',
                    title: isLast ? 'Round Finale' : `Round ${i + 1}`,
                    description: isLast ? 'Il vincitore gioca per il super premio!' : 'Gira la ruota e indovina le consonanti!'
                });
            }
        } else if (targetCount < currentCount) {
            // Rimuovi turni
            gameRounds = gameRounds.slice(0, targetCount);
            // Assicurati che l'ultimo sia sempre di tipo FINALE se ce n'è più di uno
            if (targetCount > 1) {
                gameRounds[targetCount - 1].type = 'FINALE';
                gameRounds[targetCount - 1].title = 'Round Finale';
                gameRounds[targetCount - 1].description = 'Il vincitore gioca per il super premio!';
            }
        }

        renderMaestraRounds();
    }

    // Event listeners per la gestione turni
    if (maestraRoundsCountInput) {
        maestraRoundsCountInput.addEventListener('input', updateRoundsFromCount);
    }

    if (maestraAddRoundBtn) {
        maestraAddRoundBtn.addEventListener('click', () => {
            const newRoundIndex = gameRounds.length;
            gameRounds.push({
                type: 'CLASSIC',
                title: `Round ${newRoundIndex + 1}`,
                description: 'Gira la ruota e indovina le consonanti!'
            });
            maestraRoundsCountInput.value = gameRounds.length;
            renderMaestraRounds();
            maestraRoundsMsg.textContent = '';
        });
    }

    if (maestraSaveRoundsBtn) {
        maestraSaveRoundsBtn.addEventListener('click', () => {
            saveRoundsConfig();

            // Se il round corrente è oltre il nuovo numero di turni, resetta il gioco
            if (currentRoundIndex >= gameRounds.length) {
                currentRoundIndex = 0;
                setupRound();
            }

            maestraRoundsMsg.textContent = 'Configurazione turni salvata!';

            // Chiudi la modale dopo il salvataggio
            if (maestraPanelOverlay) {
                setTimeout(() => {
                    maestraPanelOverlay.classList.add('hidden');
                    maestraRoundsMsg.textContent = '';
                }, 600);
            }
        });
    }

    // Event listener per modifiche ai turni
    if (maestraPanelContent) {
        maestraPanelContent.addEventListener('input', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            const field = e.target.getAttribute('data-field');

            if (e.target.classList.contains('maestra-round-type') ||
                e.target.classList.contains('maestra-round-title') ||
                e.target.classList.contains('maestra-round-description')) {

                if (idx >= 0 && idx < gameRounds.length && field) {
                    gameRounds[idx][field] = e.target.value;
                    maestraRoundsMsg.textContent = '';
                }
            }
        });

        maestraPanelContent.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            const field = e.target.getAttribute('data-field');

            if (e.target.classList.contains('maestra-round-type')) {
                if (idx >= 0 && idx < gameRounds.length && field) {
                    gameRounds[idx][field] = e.target.value;
                    maestraRoundsMsg.textContent = '';
                }
            }
        });

        maestraPanelContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('maestra-remove-round')) {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                if (gameRounds.length > 1) {
                    gameRounds.splice(idx, 1);
                    maestraRoundsCountInput.value = gameRounds.length;
                    renderMaestraRounds();
                    maestraRoundsMsg.textContent = '';
                } else {
                    maestraRoundsMsg.textContent = 'Deve esserci almeno un turno.';
                }
            }
        });
    }


    // Carica la configurazione all'avvio e aggiorna la lista nella modale
    loadPlayersConfig();
    loadRoundsConfig();
    renderMaestraPlayers();
    renderMaestraRounds();
    if (maestraPanelBtn) {
        maestraPanelBtn.addEventListener('click', () => {
            renderMaestraPlayers();
            renderMaestraRounds();
            renderMaestraLetters();
            renderMaestraWheel();
            maestraPanelOverlay.classList.remove('hidden');
            maestraAuthSection.classList.add('hidden');
            maestraPanelContent.classList.remove('hidden');
        });
    }
    if (closeMaestraPanelBtn) {
        closeMaestraPanelBtn.addEventListener('click', () => {
            maestraPanelOverlay.classList.add('hidden');
        });
    }
    const solveInput = document.getElementById('solve-input');
    // Costanti lettere italiane
    const CONSONANTS = [
        'B','C','D','F','G','H','L','M','N','P','Q','R','S','T','V','Z'
    ];
    const VOWELS = ['A','E','I','O','U'];
    // Bottoni risoluzione
    const submitSolveBtn = document.getElementById('submit-solve-btn');
    const cancelSolveBtn = document.getElementById('cancel-solve-btn');
    // Elementi del DOM
    const wheel = document.getElementById('wheel');
    const spinBtn = document.getElementById('spin-btn');
    const buyVowelBtn = document.getElementById('buy-vowel-btn');
    const solveBtn = document.getElementById('solve-btn');
    const nextRoundBtn = document.getElementById('next-round-btn');
    const keyboardContainer = document.getElementById('keyboard');

    const puzzleBoard = document.getElementById('puzzle-board');
    const categoryDisplay = document.getElementById('category');
    
    const solveInputContainer = document.getElementById('solve-input-container');


    const roundTitle = document.getElementById('round-title');
    const roundDescription = document.getElementById('round-description');
    
    // Variabili per l'audio e l'animazione realistica
    let audioCtx = null;
    let lastTickIndex = -1;
    let spinAnimationId = null;
    let spinStartTime = null;
    let spinDuration = 5000; // 5 secondi per rallentamento ancora più graduale
    let startAngle = 0;
    let targetAngle = 0;
    

    const wheelConfigs = {

        ROUND1: [300, 350, 400, 'PASSAMANO', 450, 500, 550, 'JOLLY', 600, 650, 'BANCA ROTTA', 700, 750, 800, 850, 900, 300, 400, 500, 600, 700, 800, 900, 'PASSAMANO'],
        ROUND2: [400, 450, 500, 'PASSAMANO', 550, 600, 650, 'JOLLY', 700, 750, 'BANCA ROTTA', 800, 850, 900, 950, 1000, 450, 550, 650, 750, 850, 950, 1000, 'PASSAMANO'],
        FINALE: [500, 600, 700, 'PASSAMANO', 800, 900, 1000, 'JOLLY', 1100, 1200, 'BANCA ROTTA', 1300, 900, 1000, 1100, 1200, 700, 800, 900, 1000, 1100, 1200, 1300, 'PASSAMANO']
    };
    let wheelSegments = [];
    
    function createWheelSegments() {
        const svg = document.querySelector('#wheel svg');
        svg.innerHTML = '';
        // Calcola la dimensione effettiva del contenitore SVG (responsive)
        let size = svg.clientWidth || svg.parentElement.clientWidth || 600;
        // Aggiorna anche la viewBox per mantenere proporzioni
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        const cx = size / 2;
        const cy = size / 2;
        const r = size / 2;
        const numSegments = wheelSegments.length;
        const angle = 360 / numSegments;
        const colors = [
            '#ff00ff', '#8a2be2', '#0000ff', '#00ffff', '#00ff00', '#ffff00',
            '#ff7f00', '#ff0000', '#ff1493', '#7fffd4', '#1e90ff', '#adff2f',
            '#ffd700', '#ff8c00', '#ff4500', '#dc143c', '#ff69b4', '#40e0d0',
            '#6a5acd', '#00fa9a', '#daa520', '#ff6347', '#ba55d3', '#87cefa'
        ];
        for (let i = 0; i < numSegments; i++) {
            const startAngle = (i * angle) * Math.PI / 180;
            const endAngle = ((i + 1) * angle) * Math.PI / 180;
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            const largeArc = angle > 180 ? 1 : 0;
            const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', colors[i % colors.length]);
            path.setAttribute('stroke', '#fff');
            path.setAttribute('stroke-width', size * 0.008);
            svg.appendChild(path);
            // Testo leggermente ruotato verso l'interno dello spicchio
            const textAngleDeg = (i * angle + angle / 2);
            const textAngle = textAngleDeg * Math.PI / 180;
            const tx = cx + (r * 0.68) * Math.cos(textAngle);
            const ty = cy + (r * 0.68) * Math.sin(textAngle);
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', tx);
            text.setAttribute('y', ty);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'central');
            text.setAttribute('font-family', 'Orbitron');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('font-size', Math.max(size * 0.035, 10));
            text.setAttribute('fill', '#000');
            // Ruota la parola di 90° rispetto al centro
            text.setAttribute('transform', `rotate(${textAngleDeg + 180} ${tx} ${ty})`);
            text.textContent = wheelSegments[i];
            svg.appendChild(text);
        }
    }

    // Frasi del gioco - ora caricate dinamicamente
    let phrases = [
        { category: "Città Italiane", phrase: "ROMA CAPUT MUNDI" },
        { category: "Città Italiane", phrase: "NAPOLI CITTA PARTENOPEA" },
        { category: "Città Italiane", phrase: "FIRENZE CULLA DEL RINASCIMENTO" },
        { category: "Luoghi Famosi", phrase: "TORRE DI PISA" },
        { category: "Luoghi Famosi", phrase: "PONTE VECCHIO" },
        { category: "Film Famosi", phrase: "IL SIGNORE DEGLI ANELLI" },
        { category: "Film Famosi", phrase: "RITORNO AL FUTURO" },
        { category: "Programmi TV", phrase: "LA CASA DI CARTA" },
        { category: "Opere Letterarie", phrase: "VENTIMILA LEGHE SOTTO I MARI" },
        { category: "Opere Letterarie", phrase: "I PROMESSI SPOSI" },
        { category: "Modi di Dire", phrase: "TRA IL DIRE E IL FARE" },
        { category: "Modi di Dire", phrase: "CHI TARDI ARRIVA MALE ALLOGGIA" },
        { category: "Cucina", phrase: "SPAGHETTI AGLIO OLIO E PEPERONCINO" },
        { category: "Sport", phrase: "CAMPIONATO DI SERIE A" },
        { category: "Tecnologia", phrase: "INTELLIGENZA ARTIFICIALE" },
        { category: "Musica", phrase: "FESTIVAL DI SANREMO" },
        { category: "Scienza", phrase: "ELETTROENCEFALOGRAFIA" },
        { category: "Storia", phrase: "GIULIO CESARE" },
        { category: "Automobili", phrase: "ALFA ROMEO GIULIA" },
        { category: "Viaggi", phrase: "GIRO DEL MONDO" },
        { category: "Geografia", phrase: "ISOLE CANARIE" },
        { category: "Arte", phrase: "NOTTE STELLATA DI VAN GOGH" },
        { category: "Animali", phrase: "CANE GATTO E CANARINO" },
        { category: "Clima", phrase: "CAMBIAMENTO CLIMATICO" },
    ];
    
    // --- Funzioni Caricamento Frasi JSON ---
    
    // Funzione per scoprire automaticamente TUTTI i file JSON nella cartella phrases
    async function discoverPhraseFiles() {
        try {
            const select = document.getElementById('phrase-file-select');
            if (!select) return;
    
            const availableFiles = [];
            const foundNames = new Set();
    
            // Helper function to process a filename
            const processFile = async (filename) => {
                if (filename === 'index.json' || foundNames.has(filename)) {
                    return;
                }
                foundNames.add(filename);
                try {
                    const response = await fetch(`phrases/${filename}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0) {
                            availableFiles.push({
                                path: `phrases/${filename}`,
                                name: filename.replace('.json', '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                filename: filename
                            });
                            console.log(`✅ ${filename} caricato e valido.`);
                        }
                    }
                } catch (error) {
                    console.warn(`⚠️ Errore durante l'elaborazione di ${filename}:`, error);
                }
            };
    
            // 1. Prova a caricare `index.json` (ideale per GitHub Pages)
            try {
                const indexResponse = await fetch('phrases/index.json');
                if (indexResponse.ok) {
                    const indexData = await indexResponse.json();
                    console.log('📁 Trovato index.json, elaborazione file...');
                    for (const filename of (indexData.files || [])) {
                        await processFile(filename);
                    }
                }
            } catch (indexError) {
                console.log('ℹ️ index.json non trovato, si procede con altri metodi.');
            }
    
            // 2. Prova a ottenere un directory listing (funziona su alcuni server)
            try {
                const dirResponse = await fetch('phrases/');
                if (dirResponse.ok) {
                    const dirHTML = await dirResponse.text();
                    const regex = /href="([^"/]+\.json)"/gi;
                    let match;
                    console.log('📁 Trovato directory listing, elaborazione file...');
                    while ((match = regex.exec(dirHTML)) !== null) {
                        await processFile(match[1]);
                    }
                }
            } catch (dirError) {
                console.log('ℹ️ Directory listing non disponibile.');
            }
    
            // 3. Popola il selettore e mostra un messaggio
            availableFiles.sort((a, b) => a.filename.localeCompare(b.filename));
            availableFiles.forEach(file => {
                const option = document.createElement('option');
                option.value = file.path;
                option.textContent = file.name;
                select.appendChild(option);
            });
    
            const messageDiv = document.createElement('div');
            messageDiv.className = 'fixed top-4 left-4 px-4 py-2 rounded-lg z-50';
            if (availableFiles.length > 0) {
                console.log(`🎯 Discovery completata: ${availableFiles.length} file trovati.`, availableFiles.map(f => f.filename));
                messageDiv.classList.add('bg-green-500', 'text-white');
                messageDiv.textContent = `🎉 Auto-discovery: ${availableFiles.length} set di frasi trovati!`;
            } else {
                console.warn('📁 Nessun file JSON valido trovato. Usando frasi di default.');
                messageDiv.classList.add('bg-yellow-500', 'text-white');
                messageDiv.textContent = 'Nessun set di frasi trovato. Aggiungi file .json in /phrases/.';
            }
            document.body.appendChild(messageDiv);
            setTimeout(() => messageDiv.remove(), 4000);
    
        } catch (error) {
            console.error('❌ Errore nella discovery automatica:', error);
        }
    }
    
    async function loadPhrasesFromJSON(filename) {
        try {
            console.log('Tentativo di fetch del file:', filename);
            const response = await fetch(filename);
            console.log('Response status:', response.status, response.ok);
            
            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }
            const jsonData = await response.json();
            console.log('Dati JSON caricati:', jsonData);
            
            // Converte il formato JSON {categoria: [frasi]} nel formato richiesto
            const newPhrases = [];
            for (const [category, phraseList] of Object.entries(jsonData)) {
                phraseList.forEach(phrase => {
                    newPhrases.push({
                        category: category,
                        phrase: phrase.toUpperCase()
                    });
                });
            }
            
            phrases = newPhrases;
            console.log(`Caricate ${phrases.length} frasi da ${filename}`);
            
            // Mostra messaggio di conferma
            const messageDiv = document.createElement('div');
            messageDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
            messageDiv.textContent = `✅ Caricate ${phrases.length} frasi da ${filename}`;
            document.body.appendChild(messageDiv);
            setTimeout(() => messageDiv.remove(), 3000);
            
            // Reset del gioco se necessario
            if (currentPhrase) {
                setupRound();
            }
            
        } catch (error) {
            console.error('Errore nel caricamento delle frasi:', error);
            
            // Mostra messaggio di errore
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
            errorDiv.textContent = `❌ Errore caricando ${filename}`;
            document.body.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }
    
    // --- Funzioni Audio ---
    
    function playTick(pitchFactor = 1.0) {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'triangle';
            // Frequenza variabile per simulare rallentamento
            const baseFreq = 440 * pitchFactor;
            oscillator.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.05);
            
            // Effetto wobble sulla freccetta
            const pointer = document.querySelector('.pointer');
            if (pointer) {
                pointer.classList.remove('wobble');
                void pointer.offsetWidth; // Forza il reflow
                pointer.classList.add('wobble');
            }
            
            // Effetto wobble anche sul pointer gigante se attivo - MEGA POTENTE!
            if (wheelEffects.isActive && wheelEffects.giantPointer) {
                console.log('🎯 WOBBLE MEGA del pointer gigante durante il click!');
                wheelEffects.giantPointer.classList.remove('wobble');
                void wheelEffects.giantPointer.offsetWidth; // Forza il reflow
                wheelEffects.giantPointer.classList.add('wobble');
                
                // Aggiungi anche un effetto flash temporaneo al puntatore
                wheelEffects.giantPointer.style.filter = 'drop-shadow(0 0 25px rgba(255, 255, 0, 1)) drop-shadow(0 0 50px rgba(255, 0, 255, 1))';
                setTimeout(() => {
                    if (wheelEffects.giantPointer) {
                        wheelEffects.giantPointer.style.filter = '';
                    }
                }, 200);
                
                console.log('Classi pointer gigante:', wheelEffects.giantPointer.className);
            }
        } catch (error) {
            console.log('Audio non disponibile:', error);
        }
    }
    
    // --- Funzioni Principali di Gioco ---

    function setupRound() {
        const round = gameRounds[currentRoundIndex];
        roundTitle.textContent = round.title;
        roundDescription.textContent = round.description;
        // Scegli ruota per round
        if (round.type === 'FINALE') wheelSegments = wheelConfigs.FINALE;
        else if (currentRoundIndex === 0) wheelSegments = wheelConfigs.ROUND1;
        else wheelSegments = wheelConfigs.ROUND2;
        createWheelSegments();
        
        // Scegli una frase casuale che non sia già stata usata
        const availablePhrases = phrases.filter(p => !p.used);
        const phraseData = availablePhrases[Math.floor(Math.random() * availablePhrases.length)];
        phraseData.used = true; // Marca come usata
        
        currentPhrase = phraseData.phrase.toUpperCase();
        categoryDisplay.textContent = `Categoria: ${phraseData.category}`;
        
        guessedLetters = [];
        roundScores = Array(playerScores.length).fill(0);
        allConsonantsRevealed = false;
        renderPuzzleBoard();
        updateKeyboard();
        updateScores();
        
        // Per il round finale, si danno alcune lettere
        if (round.type === 'FINALE') {
            // Logica speciale per il round finale, es. dare R, S, T, L, N, E
            ['R', 'S', 'T', 'L', 'N', 'E'].forEach(letter => {
                if (currentPhrase.includes(letter) && !guessedLetters.includes(letter)) {
                    guessedLetters.push(letter);
                }
            });
            renderPuzzleBoard();
            showPopup("Round Finale! Hai 3 consonanti e 1 vocale.", 'info');
        }

        setGameState('SPIN');
        updateActivePlayer();
    }
    
    function updateActivePlayer() {
        // Rimuovi la classe active da tutti i giocatori
        document.querySelectorAll('.player-score').forEach(playerBox => {
            if (playerBox) playerBox.classList.remove('active');
        });
        
        // Aggiungi la classe active al giocatore corrente
        const activePlayerBox = document.querySelector(`.player-score[data-player-index="${currentPlayerIndex}"]`);
        activePlayerBox?.classList.add('active');
    }
    
    function renderPuzzleBoard() {
        puzzleBoard.innerHTML = '';
        const rowsSpec = [12, 14, 14, 12];
        const totalRows = rowsSpec.length;
        const phrase = currentPhrase;

        // Layout delle lettere nelle righe
        function layoutPhraseIntoRows(phrase, rowsSpec) {
            const rows = rowsSpec.map(len => new Array(len).fill(null));
            const words = phrase.trim().split(/\s+/);
            let r = 0, c = 0;
            for (let w = 0; w < words.length && r < rowsSpec.length; w++) {
                const word = words[w].toUpperCase();
                const rowLen = rowsSpec[r];
                const remaining = rowLen - c;
                const need = (c > 0 ? 1 : 0) + word.length;
                if (need > remaining) {
                    r++; c = 0;
                    if (r >= rowsSpec.length) break;
                }
                if (word.length > rowsSpec[r]) {
                    for (let i = 0; i < rowsSpec[r] && i < word.length; i++) {
                        rows[r][i] = word[i];
                    }
                    let consumed = rowsSpec[r];
                    let remainChars = word.slice(consumed).split('');
                    r++; c = 0;
                    while (r < rowsSpec.length && remainChars.length) {
                        const take = Math.min(rowsSpec[r], remainChars.length);
                        for (let i = 0; i < take; i++) rows[r][i] = remainChars[i];
                        remainChars = remainChars.slice(take);
                        r++; c = 0;
                    }
                    continue;
                }
                if (c > 0) {
                    rows[r][c] = ' ';
                    c++;
                }
                for (let i = 0; i < word.length && c < rowsSpec[r]; i++) {
                    rows[r][c] = word[i];
                    c++;
                }
            }
            return rows;
        }

        // Genera la griglia 12-14-14-12 con celle spacer ai lati
        const layout = layoutPhraseIntoRows(phrase, rowsSpec);
        let cellIndex = 0;
        for (let r = 0; r < totalRows; r++) {
            const rowLen = rowsSpec[r];
            const isEdgeRow = (r === 0 || r === totalRows - 1);
            // Spacer a sinistra
            if (isEdgeRow) {
                const spacer = document.createElement('div');
                spacer.className = 'cell space';
                puzzleBoard.appendChild(spacer);
            }
            for (let c = 0; c < rowLen; c++) {
                const char = layout[r][c];
                const cell = document.createElement('div');
                cell.className = 'cell';
                if (char === null || char === ' ') {
                    cell.classList.add('space');
                    cell.textContent = '';
                } else {
                    if (guessedLetters.includes(char)) {
                        cell.textContent = char;
                        cell.classList.add('revealed');
                    } else {
                        cell.textContent = '\u00A0';
                    }
                }
                puzzleBoard.appendChild(cell);
                cellIndex++;
            }
            // Spacer a destra
            if (isEdgeRow) {
                const spacer = document.createElement('div');
                spacer.className = 'cell space';
                puzzleBoard.appendChild(spacer);
            }
        }

        // Effetto scia sulle celle rivelate
        const revealedCells = Array.from(puzzleBoard.querySelectorAll('.cell.revealed'));
        revealedCells.forEach((cell, idx) => {
            cell.classList.remove('highlight');
            setTimeout(() => {
                cell.classList.add('highlight');
            }, idx * 30);
        });
        
        // Sincronizza il tabellone zoomato se attivo
        if (wheelEffects && wheelEffects.zoomActive) {
            setTimeout(() => wheelEffects.copyPuzzleContent(), 100);
        }
    }

    function spinWheel() {
        if (allConsonantsRevealed) {
            showPopup('Tutte le consonanti sono rivelate: compra vocali o risolvi.', 'info');
            return;
        }
        if (wheelSpinning) return;
        
        // Inizializza audio context se necessario
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (error) {
                console.log('Audio non disponibile:', error);
            }
        }
        
        setGameState('SPINNING');
        wheelSpinning = true;
        
        // Attiva effetti visivi spettacolari!
        wheelEffects.startSpinningEffects();
        
        const numSegments = wheelSegments.length;
        const segmentDegrees = 360 / numSegments;
        
        // Precalcola l'esito
        const randomStopIndex = Math.floor(Math.random() * numSegments);
        const targetCenter = (randomStopIndex + 0.5) * segmentDegrees;
        const desiredMod = (90 - targetCenter + 360) % 360;
        const base = ((currentWheelAngle % 360) + 360) % 360;
        const needed = (desiredMod - base + 360) % 360;
        const spins = 360 * 3; // giri completi per animazione (ridotto da 5 a 3)
        
        startAngle = currentWheelAngle;
        targetAngle = currentWheelAngle + spins + needed;
        spinStartTime = performance.now();
        lastTickIndex = -1;
        
        // Inizia l'animazione personalizzata
        animateWheelSpin();
        
        // Salva il risultato per dopo
        setTimeout(() => {
            wheelSpinning = false;
            
            // Disattiva gli effetti visivi (che includeranno il wobble finale automaticamente)
            wheelEffects.stopSpinningEffects();
            
            const result = wheelSegments[randomStopIndex];
            handleSpinResult(result);
            currentWheelAngle = targetAngle;
        }, spinDuration);
    }
    
    function animateWheelSpin() {
        if (!wheelSpinning) return;
        
        const currentTime = performance.now();
        const elapsed = currentTime - spinStartTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // Curva che accelera rapidamente all'inizio e rallenta gradualmente
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        const smoothProgress = easeOutCubic(progress);
        
        // Calcola l'angolo corrente
        const currentAngle = startAngle + (targetAngle - startAngle) * smoothProgress;
        
        // Applica la rotazione
        wheel.style.transform = `rotate(${currentAngle}deg)`;
        
        // Calcola il segmento corrente per il suono tick
        const numSegments = wheelSegments.length;
        const segmentDegrees = 360 / numSegments;
        const pointerAngle = 90; // Freccetta alle ore 6
        const normalizedAngle = (currentAngle % 360 + 360) % 360;
        const currentTickIndex = Math.floor(((pointerAngle - normalizedAngle + 360) % 360) / segmentDegrees);
        
        // Riproduci il suono tick quando cambia segmento (con pitch variabile per realismo)
        if (currentTickIndex !== lastTickIndex && progress < 0.95) { // Smetti di fare tick quasi alla fine
            // Frequenza più bassa verso la fine per simulare rallentamento
            const pitchFactor = 1.0 - (progress * 0.3); // Diminuisce del 30% max
            playTick(pitchFactor);
            lastTickIndex = currentTickIndex;
        }
        
        // Continua l'animazione
        if (progress < 1) {
            spinAnimationId = requestAnimationFrame(animateWheelSpin);
        }
    }
    
    function handleSpinResult(result) {
        // Determina il tipo di risultato per gli effetti visivi
        let popupType = 'positive'; // default per i punti
        if (result === 'BANCA ROTTA' || result === 'PASSAMANO' || result === 'PERDI TURNO') {
            popupType = 'negative';
        } else if (result === 'JOLLY') {
            popupType = 'success';
        }
        
        showPopup(`${result}`, popupType);
        
        if (result === 'BANCA ROTTA') {
            gameAudio.playBankrupt();
            roundScores[currentPlayerIndex] = 0; // azzera ORA
            updateScores();
            if (tryUseJolly('BANCA ROTTA')) {
                setTimeout(() => setGameState('SPIN'), 1600);
            } else {
                stopTimerSafe();
                setTimeout(passTurn, 1600);
            }
        } else if (result === 'PASSAMANO' || result === 'PERDI TURNO') { // supporta vecchio testo
            gameAudio.playPassTurn();
            if (tryUseJolly('PASSAMANO')) {
                setTimeout(() => setGameState('SPIN'), 1600);
            } else {
                stopTimerSafe();
                setTimeout(passTurn, 1600);
            }
        } else if (result === 'JOLLY') {
            // Su JOLLY: il giocatore deve indovinare una consonante per riceverlo
            currentSpinValue = 'JOLLY';
            setGameState('GUESS_CONSONANT');
            // Timer gestito da setGameState con delay per zoom
        } else {
            currentSpinValue = result;
            setGameState('GUESS_CONSONANT');
            // Timer gestito da setGameState con delay per zoom
        }
    }
    
    function checkLetter(letter, value) {
        if (guessedLetters.includes(letter)) return; // Non dovrebbe succedere con la UI disabilitata

        guessedLetters.push(letter);
        updateKeyboard();
        const count = currentPhrase.split(letter).length - 1;

        // Caso speciale: se si sta giocando per il JOLLY
        if (value === 'JOLLY') {
            if (count > 0) {
                gameAudio.playJolly();
                showPopup(`Bravo! Hai trovato ${count} "${letter}" e VINCI UN JOLLY!`, 'success');
                renderPuzzleBoard();
                setTimeout(() => {
                    showJollyAnimation(currentPlayerIndex);
                    playerJolly[currentPlayerIndex]++;
                    updateScores();
                    evaluateConsonantsLeft();
                    setTimeout(() => {
                        if (!checkWinCondition()) {
                            if (!allConsonantsRevealed) {
                                setGameState('SPIN');
                                startActionTimer();
                            } else {
                                showPopup('Consonanti finite: compra vocali o risolvi.', 'info');
                                setGameState('ONLY_VOWELS');
                            }
                        }
                    }, 1200);
                }, 1200);
            } else {
                gameAudio.playError();
                showPopup(`La lettera "${letter}" non c'è. Niente Jolly!`, 'error');
                setTimeout(() => {
                    if (tryUseJolly('LETTERA ERRATA')) {
                        setTimeout(() => {
                            setGameState('SPIN');
                            startActionTimer();
                        }, 1000);
                    } else {
                        stopTimerSafe();
                        setTimeout(passTurn, 1000);
                    }
                }, 1200);
            }
            return;
        }

        if (count > 0) {
            gameAudio.playSuccess();
            showPopup(`Trovata! Ci sono ${count} "${letter}".`, 'success');
            if (value) { // Se è una consonante con valore
                roundScores[currentPlayerIndex] += count * value;
            }
            renderPuzzleBoard();
            updateScores();
            evaluateConsonantsLeft();
            // Dopo una lettera corretta, il giocatore può continuare
            setTimeout(() => {
                if (!checkWinCondition()) {
                    if (!allConsonantsRevealed) {
                        setGameState('SPIN');
                        startActionTimer();
                    } else {
                        showPopup('Consonanti finite: compra vocali o risolvi.', 'info');
                        setGameState('ONLY_VOWELS');
                    }
                }
            }, 2000);
        } else {
            gameAudio.playError();
            showPopup(`La lettera "${letter}" non c'è.`, 'error');
            if (tryUseJolly('LETTERA ERRATA')) {
                setTimeout(() => {
                    setGameState('SPIN');
                    startActionTimer();
                }, 2000);
            } else {
                stopTimerSafe();
                setTimeout(passTurn, 2000);
            }
        }
    }
    
    function passTurn() {
        // Ferma il timer prima di passare il turno
        stopTimerSafe();
        
        currentPlayerIndex = (currentPlayerIndex + 1) % playerScores.length;
        const playerName = document.getElementById(`player-${currentPlayerIndex}-name`).value;
        updateActivePlayer();
        showPopup(`Ora è il turno di ${playerName}`, 'info');
        setGameState('SPIN');
    }
    
    function checkWinCondition() {
        const phraseLetters = [...new Set(currentPhrase.replace(/[^A-Z]/g, ''))];
        const allGuessed = phraseLetters.every(letter => guessedLetters.includes(letter));
        if (allGuessed) {
            endRound();
            return true;
        }
        return false;
    }

    function endRound() {
        gameAudio.playWin();
        setGameState('ROUND_OVER');
        playerScores[currentPlayerIndex] += roundScores[currentPlayerIndex];
        updateScores();
        const playerName = document.getElementById(`player-${currentPlayerIndex}-name`).value;
        showPopup(`Round completato! ${playerName} vince il montepremi del round!`, 'success');
        
        // Cambia la label del pulsante se siamo all'ultimo round
        if (currentRoundIndex === gameRounds.length - 1) {
            nextRoundBtn.textContent = '🔄 RICOMINCIA';
        } else {
            nextRoundBtn.textContent = '➡️ PROSSIMO ROUND';
        }
        
        nextRoundBtn.classList.remove('hidden');
    }
    
    // --- Funzioni UI e Stato ---
    
    function setGameState(newState) {
        gameState = newState;
        updateUI();
        
        // Attiva zoom televisivo per gli stati di selezione lettere
        if (newState === 'GUESS_CONSONANT' || newState === 'BUY_VOWEL' || newState === 'ONLY_VOWELS') {
            // Delay lungo per permettere al popup di chiudersi completamente (2.5s + margin)
            setTimeout(() => {
                if (wheelEffects && wheelEffects.startPuzzleZoom && 
                    (gameState === 'GUESS_CONSONANT' || gameState === 'BUY_VOWEL' || gameState === 'ONLY_VOWELS')) {
                    wheelEffects.startPuzzleZoom();
                    
                    // Avvia il timer DOPO che l'animazione zoom è completata (1s + margin)
                    setTimeout(() => {
                        if (gameState === 'GUESS_CONSONANT') {
                            startConsonantTimer();
                        } else if (gameState === 'BUY_VOWEL' || gameState === 'ONLY_VOWELS') {
                            startActionTimer();
                        }
                    }, 1200); // Dopo l'animazione zoom
                }
            }, 2800); // Dopo che il popup si è chiuso
        } else if (wheelEffects && wheelEffects.zoomActive) {
            // Disattiva lo zoom per altri stati
            wheelEffects.stopPuzzleZoom();
        }
    }

    function updateUI() {
        // Gestione pulsanti principali
        const canSpin = gameState === 'SPIN' && !wheelSpinning && !allConsonantsRevealed;
        spinBtn.disabled = !canSpin;
        buyVowelBtn.disabled = !['SPIN','ONLY_VOWELS','BUY_VOWEL'].includes(gameState) || roundScores[currentPlayerIndex] < 500;
        solveBtn.disabled = !['SPIN','ONLY_VOWELS'].includes(gameState);

        // Gestione tastiera
        updateKeyboard();

         // Gestione UI round finale
        if (gameRounds[currentRoundIndex].type === 'FINALE') {
            spinBtn.style.display = 'none';
            buyVowelBtn.style.display = 'none';
        } else {
            spinBtn.style.display = 'block';
            buyVowelBtn.style.display = 'block';
        }
    }

    function createKeyboard() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        letters.split('').forEach(letter => {
            const key = document.createElement('button');
            key.className = 'key';
            key.textContent = letter;
            key.dataset.key = letter;
            key.addEventListener('click', () => handleKeyPress(letter));
            keyboardContainer.appendChild(key);
        });
    }

    function updateKeyboard() {
        const keys = keyboardContainer.querySelectorAll('.key');
        keys.forEach(key => {
            const letter = key.dataset.key;
            let disabled = true;

            if (guessedLetters.includes(letter)) {
                disabled = true;
            } else if (gameState === 'GUESS_CONSONANT' && CONSONANTS.includes(letter)) {
                disabled = false;
            } else if ((gameState === 'BUY_VOWEL' || gameState === 'ONLY_VOWELS') && VOWELS.includes(letter)) {
                disabled = false;
            }
            
            key.disabled = disabled;
        });
        
        // Sincronizza la tastiera zoomata se attiva
        if (wheelEffects && wheelEffects.zoomActive) {
            setTimeout(() => wheelEffects.copyPuzzleContent(), 50);
        }
    }
    
    function handleKeyPress(letter) {
        console.log('🎯 HandleKeyPress chiamata con:', letter);
        // Ferma immediatamente il timer quando si sceglie una lettera
        stopTimerSafe();
        
        if (gameState === 'GUESS_CONSONANT') {
            checkLetter(letter, currentSpinValue);
        } else if (gameState === 'BUY_VOWEL' || gameState === 'ONLY_VOWELS') {
            if (roundScores[currentPlayerIndex] >= 500) {
                roundScores[currentPlayerIndex] -= 500;
                updateScores();
                checkLetter(letter, null);
                setGameState('SPIN');
            } else {
                showPopup('Fondi insufficienti per vocale.', 'error');
            }
        }
    }

    function updateScores() {
        for (let i=0;i<playerScores.length;i++) {
            const totEl = document.getElementById(`tot-${i}`);
            const oraEl = document.getElementById(`ora-${i}`);
            const jEl = document.getElementById(`jolly-${i}`);
            if (totEl) totEl.textContent = `${playerScores[i]} punti`;
            if (oraEl) oraEl.textContent = `${roundScores[i]} punti`;
            if (jEl) jEl.textContent = playerJolly[i];
        }
    }

    function tryUseJolly(reason) {
        if (playerJolly[currentPlayerIndex] > 0) {
            playerJolly[currentPlayerIndex]--;
            updateScores();
            showPopup(`Usi un Jolly (${reason}) e mantieni il turno.`, 'info');
            return true;
        }
        return false;
    }

    function evaluateConsonantsLeft() {
        const consonantsInPhrase = [...new Set(currentPhrase.replace(/[^A-Z]/g,'').split('').filter(ch => CONSONANTS.includes(ch)))];
        allConsonantsRevealed = consonantsInPhrase.every(c => guessedLetters.includes(c));
        if (allConsonantsRevealed) {
            setGameState('ONLY_VOWELS');
        }
    }

    // Popup stile MotoreRuota
    function showPopup(message, type = 'info') {
        const popup = document.getElementById('popup-toast');
        const popupContent = popup.querySelector('.popup-content');
        // Se il messaggio è solo una cifra numerica, aggiungi " punti"
        if (/^\d+$/.test(message.trim())) {
            popupContent.textContent = `${message} punti`;
        } else {
            popupContent.textContent = message;
        }
        popup.classList.add('show');

        // Suono di comparsa popup
        gameAudio.playPopup();

        // Effetti visivi spettacolari solo per risultati positivi/successo
        if (type === 'success' || type === 'positive') {
            wheelEffects.startPopupEffects();
        }
        // Per 'error', 'negative', 'info' non ci sono effetti spettacolari
        // Chiudi con click o dopo 2.5s
        function hide() {
            popup.classList.remove('show');
            popup.removeEventListener('click', hide);
        }
        popup.addEventListener('click', hide);
        setTimeout(hide, 2500);
    }

    // Popup finale della vittoria - resta visibile fino al click
    function showFinalVictoryPopup(message) {
        const popup = document.getElementById('popup-toast');
        const popupContent = popup.querySelector('.popup-content');
        popupContent.textContent = message;
        popup.classList.add('show');

        // Suono di comparsa popup
        gameAudio.playPopup();

        // Effetti visivi spettacolari per la vittoria
        wheelEffects.startPopupEffects();

        // Il popup rimane visibile fino al click - NO setTimeout
        function hide() {
            popup.classList.remove('show');
            popup.removeEventListener('click', hide);
        }
        popup.addEventListener('click', hide);
    }
    
    // --- Event Listeners ---

    spinBtn.addEventListener('click', spinWheel);
    
    buyVowelBtn.addEventListener('click', () => {
        if (roundScores[currentPlayerIndex] >= 500) {
            setGameState('BUY_VOWEL');
        } else {
            showPopup("Non hai abbastanza soldi!", 'error');
        }
    });
    

    solveBtn.addEventListener('click', () => {
        setGameState('SOLVE');
        showPopup("Risolvi la frase!", 'info');
        solveInputContainer.classList.remove('hidden');
    });
    

    submitSolveBtn.addEventListener('click', () => {
        const solution = solveInput.value.trim().toUpperCase();
        if (solution === currentPhrase) {
            // Rivela tutte le lettere per l'effetto visivo
            const allLetters = [...new Set(currentPhrase.replace(/[^A-Z]/g, ''))];
            allLetters.forEach(l => {
                if (!guessedLetters.includes(l)) guessedLetters.push(l);
            });
            renderPuzzleBoard();
            solveInputContainer.classList.add('hidden');
            endRound();
        } else {
            solveInputContainer.classList.add('hidden');
            showPopup("Soluzione sbagliata!", 'error');
            if (tryUseJolly('SOLUZIONE ERRATA')) {
                setTimeout(() => {
                    setGameState('SPIN');
                    startActionTimer();
                }, 2000);
            } else {
                stopTimerSafe();
                setTimeout(passTurn, 2000);
            }
        }
        solveInput.value = '';
    });

    cancelSolveBtn.addEventListener('click', () => {
        solveInputContainer.classList.add('hidden');
        solveInput.value = '';
        setGameState('SPIN');
    });


    nextRoundBtn.addEventListener('click', () => {
        currentRoundIndex++;
        nextRoundBtn.classList.add('hidden');
        if (currentRoundIndex < gameRounds.length) {
            setupRound();
        } else {
            // Determina il vincitore finale e riavvia la partita
            let maxScore = Math.max(...playerScores);
            let winners = playerScores.map((score, index) => score === maxScore ? index : -1).filter(i => i !== -1);
            let message;
            if (winners.length === 1) {
                const winnerName = document.getElementById(`player-${winners[0]}-name`).value;
                message = `Il gioco è finito! Il vincitore è ${winnerName} con ${maxScore} punti!`;
            } else {
                message = `Il gioco è finito in pareggio con ${maxScore} punti!`;
            }
            showFinalVictoryPopup(message);

            // Reset immediato del gioco
            currentRoundIndex = 0;
            playerScores.fill(0);
            roundScores.fill(0);
            playerJolly.fill(0);
            phrases.forEach(p => delete p.used);
            updateScores(); // Aggiorna i punteggi visualizzati

            // Reset state al click sul popup
            const popup = document.getElementById('popup-toast');
            popup.addEventListener('click', function handler() {
                nextRoundBtn.classList.add('hidden');
                setupRound();
                popup.removeEventListener('click', handler);
            });
        }
    });



    // --- Event Listener per Caricamento Frasi ---
    const phraseFileSelect = document.getElementById('phrase-file-select');
    const loadPhrasesBtn = document.getElementById('load-phrases-btn');
    
    loadPhrasesBtn.addEventListener('click', () => {
        const selectedFile = phraseFileSelect.value;
        console.log('Tentativo di caricamento file:', selectedFile);
        
        if (selectedFile === 'default') {
            // Ricarica le frasi default
            location.reload();
        } else {
            loadPhrasesFromJSON(selectedFile);
        }
    });

    // --- Animazione Jolly ---
    function showJollyAnimation(playerIdx) {
        const jollyEl = document.getElementById(`jolly-${playerIdx}`);
        if (!jollyEl) return;
        jollyEl.style.transition = 'none';
        jollyEl.style.transform = 'scale(1.5)';
        jollyEl.style.color = '#00ffff';
        setTimeout(() => {
            jollyEl.style.transition = 'all 0.6s cubic-bezier(0.4,2,0.4,1)';
            jollyEl.style.transform = 'scale(1)';
            jollyEl.style.color = '';
        }, 100);
    }

    // --- Inizializzazione ---
    // --- SISTEMA AUDIO ---
    // Istanza globale del sistema audio (classe definita in gameAudio.js)
    const gameAudio = new GameAudio();
    
    // Carica la composizione JSON personalizzata
    gameAudio.loadSong('song.json');

    // --- SISTEMA EFFETTI VISIVI ---
    // Istanza globale per gli effetti spettacolari della ruota
    const wheelEffects = new WheelVisualEffects();
    wheelEffects.init();

    // --- TIMER E IMPOSTAZIONI ---
    const settingsBtn = document.getElementById('settings-btn');
    const settingsOverlay = document.getElementById('settings-overlay');
    const closeSettingsBtn = document.getElementById('close-settings');
    const enableTimerCheckbox = document.getElementById('enable-timer');
    const consonantTimerInput = document.getElementById('consonant-timer-seconds');
    const actionTimerInput = document.getElementById('action-timer-seconds');
    
    // Controlli audio
    const enableAudioCheckbox = document.getElementById('enable-audio');
    const masterVolumeSlider = document.getElementById('master-volume');
    const effectsVolumeSlider = document.getElementById('effects-volume');
    const musicVolumeSlider = document.getElementById('music-volume');
    const enableBackgroundMusicCheckbox = document.getElementById('enable-background-music');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');
    
    const timerContainer = document.getElementById('timer-container');
    const timerDisplay = document.getElementById('timer-display');

    let timerEnabled = false;
    let consonantTimerSeconds = 10;
    let actionTimerSeconds = 5;
    let timerInterval = null;
    let timerTimeout = null;

    function playBeep() {
        gameAudio.playTick();
    }
    
    function playEndSound() {
        gameAudio.playTimerEnd();
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            if (settingsOverlay) settingsOverlay.classList.remove('hidden');
            // Carica impostazioni timer
            if (enableTimerCheckbox) enableTimerCheckbox.checked = timerEnabled;
            if (consonantTimerInput) consonantTimerInput.value = consonantTimerSeconds;
            if (actionTimerInput) actionTimerInput.value = actionTimerSeconds;
            // Carica impostazioni audio
            if (enableAudioCheckbox) enableAudioCheckbox.checked = gameAudio.audioEnabled;
            if (masterVolumeSlider) masterVolumeSlider.value = gameAudio.masterVolume * 100;
            if (effectsVolumeSlider) effectsVolumeSlider.value = gameAudio.effectsVolume * 100;
            if (musicVolumeSlider) musicVolumeSlider.value = gameAudio.musicVolume * 100;
            if (enableBackgroundMusicCheckbox) enableBackgroundMusicCheckbox.checked = gameAudio.backgroundMusicEnabled;
        });
    }
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => {
            if (settingsOverlay) settingsOverlay.classList.add('hidden');
        });
    }
    if (enableTimerCheckbox) {
        enableTimerCheckbox.addEventListener('change', (e) => {
            timerEnabled = e.target.checked;
            if (!timerEnabled) {
                stopTimerSafe();
                if (timerContainer) timerContainer.style.display = 'none';
            }
        });
    }

    // Funzione per salvare le impostazioni
    function saveSettings() {
        // Salva le impostazioni timer
        if (consonantTimerInput) consonantTimerSeconds = parseInt(consonantTimerInput.value) || 10;
        if (actionTimerInput) actionTimerSeconds = parseInt(actionTimerInput.value) || 5;
        
        // Salva le impostazioni audio
        const audioSettings = {
            audioEnabled: enableAudioCheckbox ? enableAudioCheckbox.checked : true,
            masterVolume: masterVolumeSlider ? parseInt(masterVolumeSlider.value) : 50,
            effectsVolume: effectsVolumeSlider ? parseInt(effectsVolumeSlider.value) : 70,
            musicVolume: musicVolumeSlider ? parseInt(musicVolumeSlider.value) : 30,
            backgroundMusicEnabled: enableBackgroundMusicCheckbox ? enableBackgroundMusicCheckbox.checked : false
        };
        gameAudio.updateSettings(audioSettings);
        
        // Salva in localStorage per persistenza
        const allSettings = {
            timer: {
                enabled: timerEnabled,
                consonantSeconds: consonantTimerSeconds,
                actionSeconds: actionTimerSeconds
            },
            audio: audioSettings
        };
        localStorage.setItem('ruotaSettings', JSON.stringify(allSettings));
        
        // Feedback visivo
        showPopup('⚙️ Impostazioni salvate!', 'info');
    }

    // Funzione per ripristinare impostazioni di default
    function resetSettings() {
        // Reset timer
        timerEnabled = false;
        consonantTimerSeconds = 10;
        actionTimerSeconds = 5;
        if (enableTimerCheckbox) enableTimerCheckbox.checked = false;
        if (consonantTimerInput) consonantTimerInput.value = 10;
        if (actionTimerInput) actionTimerInput.value = 5;
        
        // Reset audio
        const defaultAudioSettings = {
            audioEnabled: true,
            masterVolume: 50,
            effectsVolume: 70,
            musicVolume: 30,
            backgroundMusicEnabled: false
        };
        gameAudio.updateSettings(defaultAudioSettings);
        
        if (enableAudioCheckbox) enableAudioCheckbox.checked = true;
        if (masterVolumeSlider) masterVolumeSlider.value = 50;
        if (effectsVolumeSlider) effectsVolumeSlider.value = 70;
        if (musicVolumeSlider) musicVolumeSlider.value = 30;
        if (enableBackgroundMusicCheckbox) enableBackgroundMusicCheckbox.checked = false;
        
        // Rimuovi dalle impostazioni salvate
        localStorage.removeItem('ruotaSettings');
        
        // Feedback visivo
        showPopup('🔄 Impostazioni ripristinate!', 'info');
    }

    // Funzione per caricare impostazioni salvate
    function loadSavedSettings() {
        const saved = localStorage.getItem('ruotaSettings');
        if (!saved) return;
        
        try {
            const settings = JSON.parse(saved);
            
            // Carica impostazioni timer
            if (settings.timer) {
                timerEnabled = settings.timer.enabled;
                consonantTimerSeconds = settings.timer.consonantSeconds;
                actionTimerSeconds = settings.timer.actionSeconds;
            }
            
            // Carica impostazioni audio
            if (settings.audio) {
                gameAudio.updateSettings(settings.audio);
            }
        } catch (error) {
            console.log('Errore caricamento impostazioni:', error);
        }
    }

    // Event listeners per i nuovi bottoni
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
    
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', resetSettings);
    }
    
    function startTimerSafe(seconds, onTimeout) {
        if (!timerEnabled || !timerContainer || !timerDisplay) return;
        timerDisplay.textContent = seconds;
        timerContainer.style.display = '';
        
        // Sincronizza anche il timer zoomato all'avvio se attivo
        if (wheelEffects && wheelEffects.zoomActive) {
            const zoomTimerContainer = document.getElementById('timer-zoom-container');
            const zoomTimerDisplay = document.getElementById('timer-zoom-display');
            if (zoomTimerContainer && zoomTimerDisplay) {
                zoomTimerContainer.style.display = 'block';
                zoomTimerDisplay.textContent = seconds;
                zoomTimerDisplay.classList.remove('warning'); // Reset warning class
            }
        }
        
        clearInterval(timerInterval);
        clearTimeout(timerTimeout);
        timerInterval = setInterval(() => {
            seconds--;
            timerDisplay.textContent = seconds;
            
            // Sincronizza timer zoomato se attivo
            if (wheelEffects && wheelEffects.zoomActive) {
                const zoomTimerDisplay = document.getElementById('timer-zoom-display');
                if (zoomTimerDisplay) {
                    zoomTimerDisplay.textContent = seconds;
                    if (seconds <= 3 && seconds > 0) {
                        zoomTimerDisplay.classList.add('warning');
                    } else {
                        zoomTimerDisplay.classList.remove('warning');
                    }
                }
            }
            
            playBeep();
            if (seconds <= 3) timerDisplay.classList.add('text-red-500');
            else timerDisplay.classList.remove('text-red-500');
            if (seconds <= 0) {
                clearInterval(timerInterval);
            }
        }, 1000);
        timerTimeout = setTimeout(() => {
            playEndSound();
            if (timerContainer) timerContainer.style.display = 'none';
            clearInterval(timerInterval);
            if (typeof onTimeout === 'function') onTimeout();
        }, seconds * 1000);
    }
    function stopTimerSafe() {
        clearInterval(timerInterval);
        clearTimeout(timerTimeout);
        if (timerContainer) timerContainer.style.display = 'none';
        if (timerDisplay) timerDisplay.classList.remove('text-red-500');
        
        // Nasconde anche il timer zoomato se attivo
        if (wheelEffects && wheelEffects.zoomActive) {
            const zoomTimerContainer = document.getElementById('timer-zoom-container');
            if (zoomTimerContainer) {
                zoomTimerContainer.style.display = 'none';
            }
        }
    }
    function startConsonantTimer() {
        if (!timerEnabled) return;
        startTimerSafe(consonantTimerSeconds, () => {
            showPopup('⏰ Tempo scaduto! Passa al prossimo giocatore.');
            passTurn();
        });
    }
    
    function startActionTimer() {
        if (!timerEnabled) return;
        startTimerSafe(actionTimerSeconds, () => {
            showPopup('⏰ Tempo scaduto! Passa al prossimo giocatore.');
            passTurn();
        });
    }
    
    function onPlayerActionSafe() {
        if (timerEnabled) stopTimerSafe();
    }
    
    // Aggiungi timer agli event listener esistenti
    spinBtn.addEventListener('click', onPlayerActionSafe);
    buyVowelBtn.addEventListener('click', onPlayerActionSafe);
    solveBtn.addEventListener('click', onPlayerActionSafe);

    // --- GESTIONE LETTERE MAESTRA ---
    function renderMaestraLetters() {
        if (!maestraLettersGrid || !currentPhrase) return;

        maestraLettersGrid.innerHTML = '';

        // Crea set di lettere uniche dalla frase corrente (solo lettere)
        const uniqueLetters = [...new Set(currentPhrase.split('').filter(char => /[A-Z]/.test(char)))].sort();

        uniqueLetters.forEach(letter => {
            const letterBtn = document.createElement('button');
            letterBtn.className = 'px-3 py-2 border border-pink-300 rounded-lg font-bold text-lg transition-colors';
            letterBtn.textContent = letter;
            letterBtn.dataset.letter = letter;

            // Controlla se la lettera è attualmente rivelata
            const isRevealed = guessedLetters.includes(letter);
            letterBtn.className += isRevealed ? ' bg-green-500 text-white' : ' bg-gray-100 text-gray-700 hover:bg-gray-200';

            letterBtn.addEventListener('click', () => toggleLetter(letter));
            maestraLettersGrid.appendChild(letterBtn);
        });
    }

    function toggleLetter(letter) {
        const index = guessedLetters.indexOf(letter);
        if (index === -1) {
            // Aggiungi la lettera se non è presente
            guessedLetters.push(letter);
        } else {
            // Rimuovi la lettera se è presente
            guessedLetters.splice(index, 1);
        }

        // Aggiorna il tabellone e la griglia lettere
        renderPuzzleBoard();
        renderMaestraLetters();
    }

    function revealAllLetters() {
        // Aggiungi tutte le lettere della frase a guessedLetters
        const allLetters = [...new Set(currentPhrase.split('').filter(char => /[A-Z]/.test(char)))];
        allLetters.forEach(letter => {
            if (!guessedLetters.includes(letter)) {
                guessedLetters.push(letter);
            }
        });

        renderPuzzleBoard();
        renderMaestraLetters();
    }

    function hideAllLetters() {
        // Rimuovi tutte le lettere da guessedLetters
        guessedLetters.length = 0;

        renderPuzzleBoard();
        renderMaestraLetters();
    }

    function resetToNormalGuessing() {
        // Reset alle lettere normalmente indovinate (consonanti già giocate)
        // Per ora manteniamo solo le vocali comprate e le consonanti indovinate correttamente
        // Questa logica può essere migliorata in base alle regole del gioco
        hideAllLetters();
    }

    function saveRoundsConfig() {
        localStorage.setItem('ruota_rounds', JSON.stringify(gameRounds));
    }

    // Event listeners per controllo lettere
    if (maestraRevealAllBtn) {
        maestraRevealAllBtn.addEventListener('click', revealAllLetters);
    }

    if (maestraHideAllBtn) {
        maestraHideAllBtn.addEventListener('click', hideAllLetters);
    }

    if (maestraResetLettersBtn) {
        maestraResetLettersBtn.addEventListener('click', resetToNormalGuessing);
    }

    // --- GESTIONE PERSONALIZZAZIONE RUOTA ---
    function renderMaestraWheel() {
        if (!maestraWheelType || !maestraSegmentsGrid) return;

        // Determina la configurazione attuale della ruota
        const selectedType = maestraWheelType.value;
        let currentSegments = [];

        if (selectedType === 'CUSTOM' && customWheelConfig) {
            currentSegments = customWheelConfig;
        } else if (selectedType === 'CUSTOM') {
            // Inizializza ruota custom con configurazione default
            currentSegments = [...wheelConfigs.ROUND1];
        } else {
            currentSegments = [...wheelConfigs[selectedType]];
        }

        // Aggiorna il campo numero spicchi
        maestraSegmentsCount.value = currentSegments.length;

        // Genera gli input per ogni spicchio
        maestraSegmentsGrid.innerHTML = '';
        currentSegments.forEach((segment, index) => {
            const div = document.createElement('div');
            div.className = 'flex items-center gap-2';
            div.innerHTML = `
                <label class="text-xs font-medium text-gray-600 min-w-0 flex-shrink-0">${index + 1}:</label>
                <input type="text" value="${segment}" data-segment-idx="${index}"
                       class="maestra-segment-input flex-1 px-2 py-1 border border-pink-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                       placeholder="Es: 500, JOLLY, BANCA ROTTA">
            `;
            maestraSegmentsGrid.appendChild(div);
        });
    }

    function updateSegmentsCount() {
        const targetCount = parseInt(maestraSegmentsCount.value) || 6;
        const currentInputs = maestraSegmentsGrid.querySelectorAll('.maestra-segment-input');
        const currentSegments = Array.from(currentInputs).map(input => input.value || '100');

        // Aggiusta il numero di segmenti
        if (targetCount > currentSegments.length) {
            // Aggiungi segmenti con valori default
            for (let i = currentSegments.length; i < targetCount; i++) {
                currentSegments.push(i % 4 === 0 ? 'PASSAMANO' : i % 8 === 0 ? 'JOLLY' : (300 + i * 50).toString());
            }
        } else if (targetCount < currentSegments.length) {
            // Rimuovi segmenti in eccesso
            currentSegments.splice(targetCount);
        }

        // Rigenera la griglia
        maestraSegmentsGrid.innerHTML = '';
        currentSegments.forEach((segment, index) => {
            const div = document.createElement('div');
            div.className = 'flex items-center gap-2';
            div.innerHTML = `
                <label class="text-xs font-medium text-gray-600 min-w-0 flex-shrink-0">${index + 1}:</label>
                <input type="text" value="${segment}" data-segment-idx="${index}"
                       class="maestra-segment-input flex-1 px-2 py-1 border border-pink-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                       placeholder="Es: 500, JOLLY, BANCA ROTTA">
            `;
            maestraSegmentsGrid.appendChild(div);
        });
    }

    function applyCustomWheel() {
        const inputs = maestraSegmentsGrid.querySelectorAll('.maestra-segment-input');
        const newSegments = Array.from(inputs).map(input => {
            const value = input.value.trim();
            // Converti numeri in numeri, mantieni stringhe come stringhe
            return /^\d+$/.test(value) ? parseInt(value) : value;
        });

        if (newSegments.length < 6) {
            maestraWheelMsg.textContent = 'Serve almeno 6 spicchi!';
            return;
        }

        // Applica immediatamente la nuova configurazione
        wheelSegments = newSegments;
        customWheelConfig = [...newSegments];
        localStorage.setItem('ruota_wheel_active', 'custom'); // Marca come attiva
        createWheelSegments();

        maestraWheelMsg.textContent = 'Ruota applicata! Gira per vedere i cambiamenti.';
        setTimeout(() => { maestraWheelMsg.textContent = ''; }, 3000);
    }

    function resetWheelToDefault() {
        customWheelConfig = null;
        maestraWheelType.value = 'ROUND1';
        localStorage.removeItem('ruota_wheel_active'); // Rimuovi la persistenza
        renderMaestraWheel();

        // Riapplica la configurazione standard basata sul round corrente
        const round = gameRounds[currentRoundIndex];
        if (round.type === 'FINALE') wheelSegments = wheelConfigs.FINALE;
        else if (currentRoundIndex === 0) wheelSegments = wheelConfigs.ROUND1;
        else wheelSegments = wheelConfigs.ROUND2;
        createWheelSegments();

        maestraWheelMsg.textContent = 'Ruota ripristinata alle impostazioni default.';
        setTimeout(() => { maestraWheelMsg.textContent = ''; }, 3000);
    }

    function saveWheelConfig() {
        const inputs = maestraSegmentsGrid.querySelectorAll('.maestra-segment-input');
        const segments = Array.from(inputs).map(input => {
            const value = input.value.trim();
            return /^\d+$/.test(value) ? parseInt(value) : value;
        });

        if (segments.length < 6) {
            maestraWheelMsg.textContent = 'Serve almeno 6 spicchi per salvare!';
            return;
        }

        // Salva la configurazione e imposta come attiva
        customWheelConfig = [...segments];
        localStorage.setItem('ruota_custom_wheel', JSON.stringify(segments));
        localStorage.setItem('ruota_wheel_active', 'custom'); // Marca come attiva

        maestraWheelMsg.textContent = 'Configurazione ruota salvata!';

        // Chiudi la modale dopo il salvataggio
        if (maestraPanelOverlay) {
            setTimeout(() => {
                maestraPanelOverlay.classList.add('hidden');
                maestraWheelMsg.textContent = '';
            }, 600);
        }
    }

    function loadCustomWheelConfig() {
        const saved = localStorage.getItem('ruota_custom_wheel');
        const activeWheel = localStorage.getItem('ruota_wheel_active');

        if (saved) {
            try {
                customWheelConfig = JSON.parse(saved);

                // Se la ruota personalizzata era attiva, applicala immediatamente
                if (activeWheel === 'custom') {
                    wheelSegments = [...customWheelConfig];
                }
            } catch(e) {
                console.log('Errore caricamento ruota personalizzata:', e);
            }
        }
    }

    // Event listeners per personalizzazione ruota
    if (maestraWheelType) {
        maestraWheelType.addEventListener('change', renderMaestraWheel);
    }

    if (maestraSegmentsCount) {
        maestraSegmentsCount.addEventListener('input', updateSegmentsCount);
    }

    if (maestraApplyWheelBtn) {
        maestraApplyWheelBtn.addEventListener('click', applyCustomWheel);
    }

    if (maestraResetWheelBtn) {
        maestraResetWheelBtn.addEventListener('click', resetWheelToDefault);
    }

    if (maestraSaveWheelBtn) {
        maestraSaveWheelBtn.addEventListener('click', saveWheelConfig);
    }

    // --- Inizializzazione ---
    loadSavedSettings(); // Carica impostazioni salvate
    loadCustomWheelConfig(); // Carica configurazione ruota personalizzata
    createKeyboard();
    createWheelSegments();
    setupRound();

    // Scopri automaticamente i file JSON disponibili
    discoverPhraseFiles();

    // Esponi funzioni globalmente per la tastiera zoomata
    window.handleKeyClick = handleKeyPress;
});