/* ========================================
   MatheMagic — Bruch-Uebungen
   ======================================== */

(() => {
    'use strict';

    // ---- Mathe-Hilfsfunktionen ----

    function gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) { [a, b] = [b, a % b]; }
        return a;
    }

    function lcm(a, b) {
        return (a * b) / gcd(a, b);
    }

    function simplify(num, den) {
        const g = gcd(num, den);
        return { num: num / g, den: den / g };
    }

    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // ---- SVG Kreisdiagramm ----

    function renderFractionSVG(numerator, denominator, container) {
        container.innerHTML = '';
        const size = 180;
        const cx = size / 2, cy = size / 2, r = 75;

        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');

        // Hintergrundkreis
        const bgCircle = document.createElementNS(ns, 'circle');
        bgCircle.setAttribute('cx', cx);
        bgCircle.setAttribute('cy', cy);
        bgCircle.setAttribute('r', r);
        bgCircle.setAttribute('fill', '#f0f0f8');
        bgCircle.setAttribute('stroke', '#dfe6e9');
        bgCircle.setAttribute('stroke-width', '2');
        svg.appendChild(bgCircle);

        // Segmente
        const colors = ['#6C5CE7', '#a29bfe', '#5541d9', '#7c6ff0', '#8b7ff2', '#6350e0'];
        for (let i = 0; i < numerator; i++) {
            const startAngle = (i / denominator) * 2 * Math.PI - Math.PI / 2;
            const endAngle = ((i + 1) / denominator) * 2 * Math.PI - Math.PI / 2;

            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);

            const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;

            const path = document.createElementNS(ns, 'path');
            const d = numerator === denominator
                ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
                : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            path.setAttribute('d', d);
            path.setAttribute('fill', colors[i % colors.length]);
            path.setAttribute('stroke', 'white');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('opacity', '0.85');
            svg.appendChild(path);
        }

        // Trennlinien fuer alle Segmente
        for (let i = 0; i < denominator; i++) {
            const angle = (i / denominator) * 2 * Math.PI - Math.PI / 2;
            const line = document.createElementNS(ns, 'line');
            line.setAttribute('x1', cx);
            line.setAttribute('y1', cy);
            line.setAttribute('x2', cx + r * Math.cos(angle));
            line.setAttribute('y2', cy + r * Math.sin(angle));
            line.setAttribute('stroke', 'white');
            line.setAttribute('stroke-width', '2');
            svg.appendChild(line);
        }

        // Mittelpunkt
        const center = document.createElementNS(ns, 'circle');
        center.setAttribute('cx', cx);
        center.setAttribute('cy', cy);
        center.setAttribute('r', '3');
        center.setAttribute('fill', 'white');
        svg.appendChild(center);

        container.appendChild(svg);
    }

    // ---- Aufgaben-Generator ----

    const DIFFICULTY_CONFIG = {
        easy:   { minDen: 2, maxDen: 6,  modes: ['recognize', 'simplify'] },
        medium: { minDen: 2, maxDen: 10, modes: ['recognize', 'simplify', 'expand', 'add'] },
        hard:   { minDen: 2, maxDen: 12, modes: ['recognize', 'simplify', 'expand', 'add'] }
    };

    function generateTask(mode, difficulty) {
        const cfg = DIFFICULTY_CONFIG[difficulty];
        const den = randInt(cfg.minDen, cfg.maxDen);

        switch (mode) {
            case 'recognize': {
                const num = randInt(1, den);
                return {
                    mode,
                    display: { num, den },
                    showSVG: true,
                    answer: { num, den },
                    instruction: 'Welcher Bruch wird hier angezeigt?'
                };
            }
            case 'simplify': {
                // Bruch erzeugen der kuerzbar ist
                const simpleDen = randInt(2, Math.min(6, cfg.maxDen));
                const simpleNum = randInt(1, simpleDen - 1);
                const factor = randInt(2, Math.floor(cfg.maxDen / simpleDen) || 2);
                const taskNum = simpleNum * factor;
                const taskDen = simpleDen * factor;
                return {
                    mode,
                    display: { num: taskNum, den: taskDen },
                    showSVG: false,
                    answer: { num: simpleNum, den: simpleDen },
                    instruction: 'Kuerze diesen Bruch so weit wie moeglich!'
                };
            }
            case 'expand': {
                const baseDen = randInt(2, Math.min(6, cfg.maxDen));
                const baseNum = randInt(1, baseDen - 1);
                const factor = randInt(2, Math.floor(cfg.maxDen / baseDen) || 2);
                const targetDen = baseDen * factor;
                const targetNum = baseNum * factor;
                return {
                    mode,
                    display: { num: baseNum, den: baseDen, targetDen },
                    showSVG: false,
                    answer: { num: targetNum, den: targetDen },
                    instruction: `Erweitere den Bruch auf den Nenner ${targetDen}!`
                };
            }
            case 'add': {
                if (difficulty === 'easy' || difficulty === 'medium') {
                    // Gleicher Nenner
                    const commonDen = den;
                    const num1 = randInt(1, commonDen - 1);
                    const num2 = randInt(1, commonDen - num1);
                    const resultNum = num1 + num2;
                    const s = simplify(resultNum, commonDen);
                    return {
                        mode,
                        display: { num1, den1: commonDen, num2, den2: commonDen },
                        showSVG: false,
                        answer: { num: s.num, den: s.den },
                        instruction: 'Addiere die beiden Brueche!'
                    };
                } else {
                    // Verschiedene Nenner
                    const den1 = randInt(2, 6);
                    const den2 = randInt(2, 6);
                    const num1 = randInt(1, den1 - 1);
                    const num2 = randInt(1, den2 - 1);
                    const commonDen = lcm(den1, den2);
                    const resultNum = num1 * (commonDen / den1) + num2 * (commonDen / den2);
                    const s = simplify(resultNum, commonDen);
                    return {
                        mode,
                        display: { num1, den1, num2, den2 },
                        showSVG: false,
                        answer: { num: s.num, den: s.den },
                        instruction: 'Addiere die beiden Brueche! Kuerze das Ergebnis!'
                    };
                }
            }
        }
    }

    // ---- UI Rendering ----

    function createFractionHTML(num, den, cls = '') {
        return `<div class="fraction ${cls}">
            <span class="fraction-num">${num}</span>
            <span class="fraction-line"></span>
            <span class="fraction-den">${den}</span>
        </div>`;
    }

    function createInputHTML(idPrefix) {
        return `<div class="fraction-input" id="${idPrefix}Input">
            <input type="number" id="${idPrefix}Num" placeholder="?" autocomplete="off">
            <span class="fraction-line"></span>
            <input type="number" id="${idPrefix}Den" placeholder="?" autocomplete="off">
        </div>`;
    }

    function renderTask(task) {
        const display = document.getElementById('taskDisplay');
        const svgContainer = document.getElementById('svgContainer');
        const instruction = document.getElementById('taskInstruction');

        instruction.textContent = task.instruction;

        // SVG
        if (task.showSVG) {
            svgContainer.style.display = 'block';
            renderFractionSVG(task.display.num, task.display.den, svgContainer);
        } else {
            svgContainer.style.display = 'none';
            svgContainer.innerHTML = '';
        }

        // Aufgabe + Eingabe
        let html = '';
        switch (task.mode) {
            case 'recognize':
                html = createInputHTML('ans');
                break;
            case 'simplify':
                html = createFractionHTML(task.display.num, task.display.den)
                    + '<span class="fraction-equals">=</span>'
                    + createInputHTML('ans');
                break;
            case 'expand':
                html = createFractionHTML(task.display.num, task.display.den)
                    + '<span class="fraction-equals">=</span>'
                    + `<div class="fraction-input" id="ansInput">
                        <input type="number" id="ansNum" placeholder="?" autocomplete="off">
                        <span class="fraction-line"></span>
                        <span class="fraction-den" style="font-size:1.5rem;font-weight:700;padding:8px;">${task.display.targetDen}</span>
                    </div>`;
                break;
            case 'add':
                html = createFractionHTML(task.display.num1, task.display.den1)
                    + '<span class="fraction-operator">+</span>'
                    + createFractionHTML(task.display.num2, task.display.den2)
                    + '<span class="fraction-equals">=</span>'
                    + createInputHTML('ans');
                break;
        }
        display.innerHTML = html;

        // Focus auf erstes Input
        const firstInput = display.querySelector('input');
        if (firstInput) setTimeout(() => firstInput.focus(), 50);
    }

    // ---- Antwort pruefen ----

    function checkAnswer(task) {
        const numInput = document.getElementById('ansNum');
        const denInput = document.getElementById('ansDen');

        const userNum = parseInt(numInput?.value);
        let userDen;

        if (task.mode === 'expand') {
            userDen = task.display.targetDen;
        } else {
            userDen = parseInt(denInput?.value);
        }

        if (isNaN(userNum) || (task.mode !== 'expand' && isNaN(userDen))) {
            return null; // Unvollstaendig
        }
        if (userDen === 0) return false;

        // Aequivalente Brueche akzeptieren
        const userSimp = simplify(userNum, userDen);
        const ansSimp = simplify(task.answer.num, task.answer.den);

        return userSimp.num === ansSimp.num && userSimp.den === ansSimp.den;
    }

    // ---- Game State ----

    const state = {
        mode: 'recognize',
        difficulty: 'easy',
        currentTask: null,
        taskNumber: 0,
        totalTasks: 10,
        correctCount: 0,
        points: 0,
        streak: 0,
        stars: 0,
        sessionPoints: 0,
        answered: false
    };

    // ---- UI Updates ----

    function updateScoreDisplay() {
        document.getElementById('pointsDisplay').textContent = `${state.points} Pkt`;
        document.getElementById('starsDisplay').textContent = `⭐ ${state.stars}`;
        document.getElementById('streakDisplay').textContent =
            state.streak >= 2 ? `🔥 ${state.streak}` : '';
    }

    function updateProgress() {
        document.getElementById('taskCounter').textContent =
            `Aufgabe ${state.taskNumber} von ${state.totalTasks}`;
        document.getElementById('correctCounter').textContent =
            `${state.correctCount} richtig`;
        document.getElementById('progressFill').style.width =
            `${(state.taskNumber / state.totalTasks) * 100}%`;
    }

    function showFeedback(correct, task) {
        const el = document.getElementById('feedback');
        el.classList.remove('correct', 'wrong', 'show');

        if (correct) {
            el.className = 'feedback correct show';
            el.textContent = '✅ Richtig! Super!';
        } else {
            const a = task.answer;
            el.className = 'feedback wrong show';
            el.textContent = `❌ Leider falsch. Richtig: ${a.num}/${a.den}`;
        }

        // Animation auf Eingabe
        const inputDiv = document.getElementById('ansInput');
        if (inputDiv) {
            inputDiv.classList.remove('shake', 'glow-success');
            void inputDiv.offsetWidth; // Reflow
            inputDiv.classList.add(correct ? 'glow-success' : 'shake');
        }
    }

    function hideFeedback() {
        const el = document.getElementById('feedback');
        el.classList.remove('show');
    }

    // ---- Ergebnis ----

    function showResults() {
        const overlay = document.getElementById('resultOverlay');
        const wrong = state.totalTasks - state.correctCount;
        const ratio = state.correctCount / state.totalTasks;

        document.getElementById('resultCorrect').textContent = state.correctCount;
        document.getElementById('resultWrong').textContent = wrong;
        document.getElementById('resultPoints').textContent = state.sessionPoints;

        // Sterne
        let earnedStars = 0;
        if (state.sessionPoints >= 50) earnedStars = 1;
        if (state.sessionPoints >= 100) earnedStars = 2;
        if (state.sessionPoints >= 150) earnedStars = 3;
        state.stars += earnedStars;

        document.getElementById('resultStars').textContent =
            '⭐'.repeat(earnedStars) + '☆'.repeat(3 - earnedStars);

        // Emoji + Nachricht
        if (ratio >= 0.9) {
            document.getElementById('resultEmoji').textContent = '🏆';
            document.getElementById('resultTitle').textContent = 'Ausgezeichnet!';
            document.getElementById('resultMessage').textContent = 'Du bist ein Bruch-Profi!';
        } else if (ratio >= 0.7) {
            document.getElementById('resultEmoji').textContent = '🎉';
            document.getElementById('resultTitle').textContent = 'Super gemacht!';
            document.getElementById('resultMessage').textContent = 'Weiter so, du wirst immer besser!';
        } else if (ratio >= 0.5) {
            document.getElementById('resultEmoji').textContent = '💪';
            document.getElementById('resultTitle').textContent = 'Guter Versuch!';
            document.getElementById('resultMessage').textContent = 'Uebung macht den Meister — probier es nochmal!';
        } else {
            document.getElementById('resultEmoji').textContent = '🌟';
            document.getElementById('resultTitle').textContent = 'Weiter ueben!';
            document.getElementById('resultMessage').textContent = 'Jeder Fehler bringt dich weiter. Versuch es nochmal!';
        }

        overlay.classList.add('show');
        updateScoreDisplay();
    }

    // ---- Spielablauf ----

    function startRound() {
        state.taskNumber = 0;
        state.correctCount = 0;
        state.sessionPoints = 0;
        state.answered = false;
        document.getElementById('resultOverlay').classList.remove('show');
        hideFeedback();
        nextTask();
    }

    function nextTask() {
        state.taskNumber++;
        state.answered = false;

        if (state.taskNumber > state.totalTasks) {
            showResults();
            return;
        }

        hideFeedback();
        document.getElementById('checkBtn').style.display = '';
        document.getElementById('nextBtn').style.display = 'none';

        state.currentTask = generateTask(state.mode, state.difficulty);
        renderTask(state.currentTask);
        updateProgress();
    }

    function handleCheck() {
        if (state.answered) return;

        const result = checkAnswer(state.currentTask);
        if (result === null) {
            // Felder nicht ausgefuellt
            const inputDiv = document.getElementById('ansInput');
            if (inputDiv) {
                inputDiv.classList.remove('shake');
                void inputDiv.offsetWidth;
                inputDiv.classList.add('shake');
            }
            return;
        }

        state.answered = true;

        if (result) {
            state.correctCount++;
            state.streak++;
            let pts = 10;
            if (state.streak >= 3) pts += 5;
            state.points += pts;
            state.sessionPoints += pts;
            launchConfetti();
        } else {
            state.streak = 0;
        }

        showFeedback(result, state.currentTask);
        updateScoreDisplay();

        // SVG Feedback fuer nicht-Erkennen Modi
        if (!state.currentTask.showSVG && state.currentTask.mode !== 'add') {
            const svgContainer = document.getElementById('svgContainer');
            const ans = state.currentTask.answer;
            svgContainer.style.display = 'block';
            renderFractionSVG(ans.num, ans.den, svgContainer);
        }

        document.getElementById('checkBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = '';
        document.getElementById('nextBtn').focus();
    }

    // ---- Tab-Verwaltung ----

    function updateTabs() {
        const cfg = DIFFICULTY_CONFIG[state.difficulty];
        document.querySelectorAll('.tab').forEach(tab => {
            const mode = tab.dataset.mode;
            const available = cfg.modes.includes(mode);
            tab.disabled = !available;
            if (!available && tab.classList.contains('active')) {
                tab.classList.remove('active');
                state.mode = cfg.modes[0];
                document.querySelector(`.tab[data-mode="${state.mode}"]`).classList.add('active');
            }
        });
    }

    // ---- Init ----

    function init() {
        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                if (tab.disabled) return;
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                state.mode = tab.dataset.mode;
                startRound();
            });
        });

        // Schwierigkeit
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            state.difficulty = e.target.value;
            updateTabs();
            startRound();
        });

        // Pruefen
        document.getElementById('checkBtn').addEventListener('click', handleCheck);

        // Naechste
        document.getElementById('nextBtn').addEventListener('click', nextTask);

        // Enter-Taste
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (state.answered) {
                    nextTask();
                } else {
                    handleCheck();
                }
            }
        });

        // Nochmal spielen
        document.getElementById('restartBtn').addEventListener('click', startRound);

        // Start
        updateTabs();
        updateScoreDisplay();
        startRound();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
