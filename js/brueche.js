/* ========================================
   MatheMagic — Bruch-Übungen
   Schrittweises Kürzen, Drag & Drop,
   Stützen, Ghostlösung
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
        if (den === 0) return { num: 0, den: 1 };
        const g = gcd(num, den);
        return { num: num / g, den: den / g };
    }

    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function fractionsEqual(n1, d1, n2, d2) {
        const s1 = simplify(n1, d1);
        const s2 = simplify(n2, d2);
        return s1.num === s2.num && s1.den === s2.den;
    }

    // Alle Teiler finden die Zähler und Nenner gemeinsam haben
    function commonDivisors(a, b) {
        const g = gcd(a, b);
        const divs = [];
        for (let i = 2; i <= g; i++) {
            if (g % i === 0) divs.push(i);
        }
        return divs;
    }

    // Zufälligen Teiler von n finden (≥2)
    function pickFactor(n) {
        const factors = [];
        for (let i = 2; i <= n; i++) {
            if (n % i === 0) factors.push(i);
        }
        return factors[randInt(0, factors.length - 1)];
    }

    // Fisher-Yates Shuffle
    function shuffleArray(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = randInt(0, i);
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // ---- Farben für Bruchstücke ----

    const PIECE_COLORS = {
        2: '#3B8EA5', 3: '#4CAF82', 4: '#E07A6A', 5: '#F0B429',
        6: '#6BB5CC', 8: '#8B6AAF', 10: '#C9886E', 12: '#6BA3D6'
    };

    function getPieceColor(den) {
        return PIECE_COLORS[den] || '#3B8EA5';
    }

    // ---- SVG ----

    const SVG_NS = 'http://www.w3.org/2000/svg';

    function adjustColor(hex, amount) {
        const num = parseInt(hex.slice(1), 16);
        let r = Math.min(255, Math.max(0, (num >> 16) + amount));
        let g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
        let b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
        return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
    }

    function renderFractionSVG(numerator, denominator, container, opts = {}) {
        container.innerHTML = '';
        const size = opts.size || 200;
        const cx = size / 2, cy = size / 2, r = size * 0.42;
        const color = opts.color || '#3B8EA5';
        const opacity = opts.opacity || 0.85;

        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

        const bgCircle = document.createElementNS(SVG_NS, 'circle');
        bgCircle.setAttribute('cx', cx); bgCircle.setAttribute('cy', cy);
        bgCircle.setAttribute('r', r); bgCircle.setAttribute('fill', '#f0f0f8');
        bgCircle.setAttribute('stroke', '#dfe6e9'); bgCircle.setAttribute('stroke-width', '2');
        svg.appendChild(bgCircle);

        const colors = [color, adjustColor(color, 20), adjustColor(color, -15),
                        adjustColor(color, 10), adjustColor(color, -8), adjustColor(color, 25)];
        for (let i = 0; i < numerator && i < denominator; i++) {
            const startA = (i / denominator) * 2 * Math.PI - Math.PI / 2;
            const endA = ((i + 1) / denominator) * 2 * Math.PI - Math.PI / 2;
            const x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
            const x2 = cx + r * Math.cos(endA), y2 = cy + r * Math.sin(endA);
            const la = (endA - startA) > Math.PI ? 1 : 0;
            const path = document.createElementNS(SVG_NS, 'path');
            const d = numerator === denominator
                ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
                : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2} Z`;
            path.setAttribute('d', d); path.setAttribute('fill', colors[i % colors.length]);
            path.setAttribute('stroke', 'white'); path.setAttribute('stroke-width', '2');
            path.setAttribute('opacity', String(opacity));
            svg.appendChild(path);
        }
        for (let i = 0; i < denominator; i++) {
            const angle = (i / denominator) * 2 * Math.PI - Math.PI / 2;
            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', cx); line.setAttribute('y1', cy);
            line.setAttribute('x2', cx + r * Math.cos(angle));
            line.setAttribute('y2', cy + r * Math.sin(angle));
            line.setAttribute('stroke', 'white'); line.setAttribute('stroke-width', '2');
            svg.appendChild(line);
        }
        const center = document.createElementNS(SVG_NS, 'circle');
        center.setAttribute('cx', cx); center.setAttribute('cy', cy);
        center.setAttribute('r', '3'); center.setAttribute('fill', 'white');
        svg.appendChild(center);
        container.appendChild(svg);
    }

    function renderMiniPieSVG(den) {
        const size = 44, cx = size / 2, cy = size / 2, r = 18;
        const color = getPieceColor(den);
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        const bg = document.createElementNS(SVG_NS, 'circle');
        bg.setAttribute('cx', cx); bg.setAttribute('cy', cy); bg.setAttribute('r', r);
        bg.setAttribute('fill', '#f0f0f8'); bg.setAttribute('stroke', '#dfe6e9');
        bg.setAttribute('stroke-width', '1.5'); svg.appendChild(bg);
        const startA = -Math.PI / 2;
        const endA = startA + (2 * Math.PI / den);
        const x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
        const x2 = cx + r * Math.cos(endA), y2 = cy + r * Math.sin(endA);
        const la = (endA - startA) > Math.PI ? 1 : 0;
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', den === 1
            ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
            : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2} Z`);
        path.setAttribute('fill', color); path.setAttribute('stroke', 'white');
        path.setAttribute('stroke-width', '1.5'); path.setAttribute('opacity', '0.85');
        svg.appendChild(path); return svg;
    }

    // ---- Punkteraster (Dot Grid) SVG ----

    function renderDotGridSVG(rows, cols, colored, container) {
        container.innerHTML = '';
        const dotR = 14, gap = 10;
        const cellSize = dotR * 2 + gap;
        const pad = 12;
        const width = cols * cellSize - gap + pad * 2;
        const height = rows * cellSize - gap + pad * 2;

        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Zufällige Auswahl der farbigen Punkte
        const indices = [];
        for (let i = 0; i < rows * cols; i++) indices.push(i);
        const shuffled = shuffleArray(indices);
        const coloredSet = new Set(shuffled.slice(0, colored));

        const colors = ['#3B8EA5', '#6BB5CC', '#4A9DB8'];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const idx = r * cols + c;
                const cx = pad + c * cellSize + dotR;
                const cy = pad + r * cellSize + dotR;
                const circle = document.createElementNS(SVG_NS, 'circle');
                circle.setAttribute('cx', cx);
                circle.setAttribute('cy', cy);
                circle.setAttribute('r', dotR);
                if (coloredSet.has(idx)) {
                    circle.setAttribute('fill', colors[idx % colors.length]);
                    circle.setAttribute('opacity', '0.85');
                } else {
                    circle.setAttribute('fill', '#e8eaef');
                }
                circle.setAttribute('stroke', '#d0d5dd');
                circle.setAttribute('stroke-width', '1.5');
                svg.appendChild(circle);
            }
        }
        container.appendChild(svg);
    }

    // ---- Rechteck-Brüche SVG ----

    function renderRectangleSVG(totalParts, coloredParts, container) {
        container.innerHTML = '';
        const w = 280, h = 120, pad = 4, r = 8;

        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

        // Hintergrund-Rechteck
        const bg = document.createElementNS(SVG_NS, 'rect');
        bg.setAttribute('x', pad); bg.setAttribute('y', pad);
        bg.setAttribute('width', w - pad * 2); bg.setAttribute('height', h - pad * 2);
        bg.setAttribute('rx', r); bg.setAttribute('fill', '#e8eaef');
        bg.setAttribute('stroke', '#d0d5dd'); bg.setAttribute('stroke-width', '2');
        svg.appendChild(bg);

        // Zufällige Auswahl der farbigen Streifen
        const indices = [];
        for (let i = 0; i < totalParts; i++) indices.push(i);
        const shuffled = shuffleArray(indices);
        const coloredSet = new Set(shuffled.slice(0, coloredParts));

        const stripW = (w - pad * 2) / totalParts;
        const colors = ['#3B8EA5', '#4A9DB8', '#6BB5CC'];

        for (let i = 0; i < totalParts; i++) {
            if (coloredSet.has(i)) {
                const rect = document.createElementNS(SVG_NS, 'rect');
                rect.setAttribute('x', pad + i * stripW);
                rect.setAttribute('y', pad);
                rect.setAttribute('width', stripW);
                rect.setAttribute('height', h - pad * 2);
                rect.setAttribute('fill', colors[i % colors.length]);
                rect.setAttribute('opacity', '0.8');
                // Abgerundete Ecken nur am Rand
                if (i === 0) rect.setAttribute('rx', r);
                if (i === totalParts - 1) rect.setAttribute('rx', r);
                svg.appendChild(rect);
            }
        }

        // Trennlinien
        for (let i = 1; i < totalParts; i++) {
            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', pad + i * stripW);
            line.setAttribute('y1', pad);
            line.setAttribute('x2', pad + i * stripW);
            line.setAttribute('y2', h - pad);
            line.setAttribute('stroke', 'white');
            line.setAttribute('stroke-width', '2');
            svg.appendChild(line);
        }

        container.appendChild(svg);
    }

    // ---- Klickbares Punkteraster (Einfärben-Modus) ----

    let paintState = { coloredSet: new Set(), total: 0 };

    function renderClickableGridSVG(rows, cols, container) {
        container.innerHTML = '';
        paintState = { coloredSet: new Set(), total: rows * cols };

        const dotR = 16, gap = 8;
        const cellSize = dotR * 2 + gap;
        const pad = 12;
        const width = cols * cellSize - gap + pad * 2;
        const height = rows * cellSize - gap + pad * 2;

        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.cursor = 'pointer';

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const idx = r * cols + c;
                const cx = pad + c * cellSize + dotR;
                const cy = pad + r * cellSize + dotR;
                const circle = document.createElementNS(SVG_NS, 'circle');
                circle.setAttribute('cx', cx);
                circle.setAttribute('cy', cy);
                circle.setAttribute('r', dotR);
                circle.setAttribute('fill', '#e8eaef');
                circle.setAttribute('stroke', '#d0d5dd');
                circle.setAttribute('stroke-width', '2');
                circle.style.cursor = 'pointer';
                circle.style.transition = 'fill 0.15s ease';

                circle.addEventListener('click', () => {
                    if (paintState.coloredSet.has(idx)) {
                        paintState.coloredSet.delete(idx);
                        circle.setAttribute('fill', '#e8eaef');
                        circle.setAttribute('stroke', '#d0d5dd');
                    } else {
                        paintState.coloredSet.add(idx);
                        circle.setAttribute('fill', '#3B8EA5');
                        circle.setAttribute('stroke', '#2A7189');
                    }
                    updatePaintCounter();
                });

                svg.appendChild(circle);
            }
        }
        container.appendChild(svg);
    }

    function updatePaintCounter() {
        const el = document.getElementById('paintCounter');
        if (el) {
            el.textContent = `${paintState.coloredSet.size} von ${paintState.total} eingefärbt`;
        }
    }

    function renderBuildCircle(pieces, svgEl) {
        svgEl.innerHTML = '';
        const size = 200, cx = size / 2, cy = size / 2, r = size * 0.42;
        const bg = document.createElementNS(SVG_NS, 'circle');
        bg.setAttribute('cx', cx); bg.setAttribute('cy', cy); bg.setAttribute('r', r);
        bg.setAttribute('fill', '#f0f0f8'); bg.setAttribute('stroke', '#dfe6e9');
        bg.setAttribute('stroke-width', '2'); svgEl.appendChild(bg);
        if (pieces.length === 0) return;
        let currentAngle = -Math.PI / 2;
        pieces.forEach(p => {
            const sliceAngle = (1 / p.den) * 2 * Math.PI;
            const endAngle = currentAngle + sliceAngle;
            const color = getPieceColor(p.den);
            const x1 = cx + r * Math.cos(currentAngle), y1 = cy + r * Math.sin(currentAngle);
            const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
            const la = sliceAngle > Math.PI ? 1 : 0;
            const path = document.createElementNS(SVG_NS, 'path');
            if (Math.abs(sliceAngle - 2 * Math.PI) < 0.001) {
                path.setAttribute('d', `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`);
            } else {
                path.setAttribute('d', `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2} Z`);
            }
            path.setAttribute('fill', color); path.setAttribute('stroke', 'white');
            path.setAttribute('stroke-width', '2'); path.setAttribute('opacity', '0.85');
            svgEl.appendChild(path); currentAngle = endAngle;
        });
        const center = document.createElementNS(SVG_NS, 'circle');
        center.setAttribute('cx', cx); center.setAttribute('cy', cy);
        center.setAttribute('r', '3'); center.setAttribute('fill', 'white');
        svgEl.appendChild(center);
    }

    // ---- Aufgaben-Generator ----

    const AVAILABLE_PIECES = [2, 3, 4, 5, 6, 8, 10, 12];

    const DIFFICULTY_CONFIG = {
        easy: {
            minDen: 2, maxDen: 6, simplifyMax: 12,
            modes: ['recognize', 'simplify', 'build'],
            buildDens: [2, 3, 4, 6],
            recognizeVisuals: ['pie', 'dotgrid', 'rectangle'],
            dotGridSizes: [[2, 3], [2, 4], [2, 5]],
            simplifyContexts: ['bare']
        },
        medium: {
            minDen: 2, maxDen: 10, simplifyMax: 48,
            modes: ['recognize', 'simplify', 'expand', 'add', 'build', 'paint'],
            buildDens: [2, 3, 4, 5, 6, 8],
            recognizeVisuals: ['pie', 'dotgrid', 'rectangle'],
            dotGridSizes: [[3, 4], [3, 5], [4, 5]],
            simplifyContexts: ['bare', 'xvony']
        },
        hard: {
            minDen: 2, maxDen: 12, simplifyMax: 100,
            modes: ['recognize', 'simplify', 'expand', 'add', 'build', 'paint'],
            buildDens: [2, 3, 4, 5, 6, 8, 10, 12],
            recognizeVisuals: ['pie', 'dotgrid', 'rectangle'],
            dotGridSizes: [[5, 6], [4, 8], [6, 6], [6, 8]],
            simplifyContexts: ['bare', 'xvony', 'massstab']
        }
    };

    function generateTask(mode, difficulty) {
        const cfg = DIFFICULTY_CONFIG[difficulty];
        const den = randInt(cfg.minDen, cfg.maxDen);

        switch (mode) {
            case 'recognize': {
                const visuals = cfg.recognizeVisuals;
                const visualType = visuals[randInt(0, visuals.length - 1)];

                if (visualType === 'dotgrid') {
                    const sizes = cfg.dotGridSizes;
                    const [rows, cols] = sizes[randInt(0, sizes.length - 1)];
                    const total = rows * cols;
                    const targetDen = pickFactor(total);
                    const targetNum = randInt(1, targetDen - 1);
                    const colored = (targetNum / targetDen) * total;
                    const s = simplify(colored, total);
                    return {
                        mode, visualType: 'dotgrid',
                        display: { num: colored, den: total, rows, cols },
                        showSVG: true,
                        answer: { num: s.num, den: s.den },
                        instruction: 'Welcher Anteil ist farbig? Kürze wenn möglich!',
                        hints: [
                            `Zähle die farbigen Plättchen.`,
                            `Es sind ${colored} von ${total} Plättchen farbig.`,
                            `${colored}/${total} = ${s.num}/${s.den}`
                        ]
                    };
                }

                if (visualType === 'rectangle') {
                    const totalParts = randInt(cfg.minDen, Math.min(cfg.maxDen, 10));
                    const coloredParts = randInt(1, totalParts - 1);
                    const s = simplify(coloredParts, totalParts);
                    return {
                        mode, visualType: 'rectangle',
                        display: { num: coloredParts, den: totalParts },
                        showSVG: true,
                        answer: { num: s.num, den: s.den },
                        instruction: 'Welcher Anteil des Rechtecks ist eingefärbt?',
                        hints: [
                            `Das Rechteck ist in ${totalParts} gleich große Teile aufgeteilt.`,
                            `${coloredParts} davon sind farbig.`,
                            `${coloredParts}/${totalParts} = ${s.num}/${s.den}`
                        ]
                    };
                }

                // Standard: Kreisdiagramm (pie)
                const num = randInt(1, den);
                return {
                    mode, visualType: 'pie',
                    display: { num, den }, showSVG: true,
                    answer: { num, den },
                    instruction: 'Welcher Bruch wird hier angezeigt?',
                    hints: [
                        `Der Kreis ist in ${den} gleich große Teile aufgeteilt.`,
                        `Zähle die farbigen Stücke — das ist der Zähler.`,
                        `${num} von ${den} Teilen sind farbig.`
                    ]
                };
            }
            case 'simplify': {
                const maxResult = cfg.simplifyMax || cfg.maxDen;
                const simpleDen = randInt(2, Math.min(12, maxResult));
                const simpleNum = randInt(1, simpleDen - 1);
                const maxFactor = Math.max(2, Math.floor(maxResult / simpleDen));
                const factor = randInt(2, maxFactor);
                const taskNum = simpleNum * factor;
                const taskDen = simpleDen * factor;

                // Kontext-Variante wählen
                const contexts = cfg.simplifyContexts;
                const context = contexts[randInt(0, contexts.length - 1)];

                let instruction = 'Kürze den Bruch Schritt für Schritt!';
                let contextText = null;

                if (context === 'xvony') {
                    contextText = `${taskNum} von ${taskDen} sind grau.`;
                    instruction = 'Schreibe als Bruch und kürze vollständig!';
                } else if (context === 'massstab') {
                    contextText = `${taskNum} cm von ${taskDen} cm — wie viel ist das als gekürzter Bruch?`;
                    instruction = 'Kürze den Bruch Schritt für Schritt!';
                }

                return {
                    mode, display: { num: taskNum, den: taskDen },
                    showSVG: false, contextText,
                    answer: { num: simpleNum, den: simpleDen },
                    instruction,
                    hints: [] // Dynamisch in showHint
                };
            }
            case 'expand': {
                const baseDen = randInt(2, Math.min(6, cfg.maxDen));
                const baseNum = randInt(1, baseDen - 1);
                const factor = randInt(2, Math.floor(cfg.maxDen / baseDen) || 2);
                const targetDen = baseDen * factor;
                const targetNum = baseNum * factor;
                return {
                    mode, display: { num: baseNum, den: baseDen, targetDen },
                    showSVG: false,
                    answer: { num: targetNum, den: targetDen },
                    instruction: `Erweitere den Bruch auf den Nenner ${targetDen}!`,
                    hints: [
                        `Mit welcher Zahl musst du ${baseDen} multiplizieren, um ${targetDen} zu erhalten?`,
                        `${baseDen} × ${factor} = ${targetDen}. Multipliziere den Zähler auch mit ${factor}.`,
                        `${baseNum} × ${factor} = ${targetNum}`
                    ]
                };
            }
            case 'add': {
                if (difficulty === 'easy' || difficulty === 'medium') {
                    const commonDen = den;
                    const num1 = randInt(1, commonDen - 1);
                    const num2 = randInt(1, commonDen - num1);
                    const resultNum = num1 + num2;
                    const s = simplify(resultNum, commonDen);
                    return {
                        mode, display: { num1, den1: commonDen, num2, den2: commonDen },
                        showSVG: false,
                        answer: { num: s.num, den: s.den },
                        instruction: 'Addiere die beiden Brüche!',
                        hints: [
                            `Die Nenner sind gleich — addiere direkt die Zähler.`,
                            `${num1} + ${num2} = ${resultNum}. Nenner bleibt ${commonDen}.`,
                            s.num !== resultNum ? `Kürze: ${resultNum}/${commonDen} = ${s.num}/${s.den}` : `Ergebnis: ${resultNum}/${commonDen}`
                        ]
                    };
                } else {
                    const den1 = randInt(2, 6), den2 = randInt(2, 6);
                    const num1 = randInt(1, den1 - 1), num2 = randInt(1, den2 - 1);
                    const cd = lcm(den1, den2);
                    const resultNum = num1 * (cd / den1) + num2 * (cd / den2);
                    const s = simplify(resultNum, cd);
                    return {
                        mode, display: { num1, den1, num2, den2 },
                        showSVG: false, answer: { num: s.num, den: s.den },
                        instruction: 'Addiere die beiden Brüche! Kürze das Ergebnis!',
                        hints: [
                            `Gemeinsamer Nenner: kgV von ${den1} und ${den2} = ${cd}`,
                            `${num1}/${den1} = ${num1*(cd/den1)}/${cd}  und  ${num2}/${den2} = ${num2*(cd/den2)}/${cd}`,
                            `${num1*(cd/den1)} + ${num2*(cd/den2)} = ${resultNum} → ${s.num}/${s.den}`
                        ]
                    };
                }
            }
            case 'build': return generateBuildTask(difficulty);
            case 'paint': return generatePaintTask(difficulty);
        }
    }

    function generatePaintTask(difficulty) {
        const cfg = DIFFICULTY_CONFIG[difficulty];
        const sizes = cfg.dotGridSizes;
        const [rows, cols] = sizes[randInt(0, sizes.length - 1)];
        const total = rows * cols;
        const targetDen = pickFactor(total);
        const targetNum = randInt(1, targetDen - 1);
        const targetColored = (targetNum / targetDen) * total;
        return {
            mode: 'paint',
            display: { rows, cols, total, targetColored, targetNum, targetDen },
            showSVG: true, answer: { colored: targetColored },
            instruction: `Der Anteil ist ${targetNum}/${targetDen}. Färbe die richtige Anzahl ein!`,
            hints: [
                `${targetNum}/${targetDen} von ${total} Plättchen — wie viele musst du einfärben?`,
                `${total} ÷ ${targetDen} = ${total / targetDen}. Dann × ${targetNum} = ${targetColored}.`,
                `Färbe genau ${targetColored} Plättchen ein.`
            ]
        };
    }

    function generateBuildTask(difficulty) {
        const cfg = DIFFICULTY_CONFIG[difficulty];
        const dens = cfg.buildDens;
        const targetDen = dens[randInt(0, dens.length - 1)];
        const targetNum = randInt(1, targetDen);
        const s = simplify(targetNum, targetDen);
        let solution = [];
        for (let i = 0; i < targetNum; i++) solution.push({ num: 1, den: targetDen });
        return {
            mode: 'build', target: { num: targetNum, den: targetDen },
            answer: { num: s.num, den: s.den }, showSVG: false,
            instruction: `Baue den Bruch ${targetNum}/${targetDen} aus Stücken zusammen!`,
            availableDens: dens, solution,
            hints: [
                `Du musst insgesamt ${targetNum}/${targetDen} zusammensetzen.`,
                `Tipp: ${targetNum} Stücke von 1/${targetDen} ergeben ${targetNum}/${targetDen}.`,
                `Lösung: ${targetNum} × (1/${targetDen}) = ${targetNum}/${targetDen}`
            ]
        };
    }

    // ---- UI: Standard-Aufgaben ----

    function createFractionHTML(num, den) {
        return `<div class="fraction">
            <span class="fraction-num">${num}</span>
            <span class="fraction-line"></span>
            <span class="fraction-den">${den}</span>
        </div>`;
    }

    function createInputHTML(idPrefix) {
        return `<div class="fraction-input" id="${idPrefix}Input">
            <input type="number" id="${idPrefix}Num" placeholder="?" autocomplete="off" inputmode="none" readonly>
            <span class="fraction-input-label">Zähler</span>
            <span class="fraction-line"></span>
            <input type="number" id="${idPrefix}Den" placeholder="?" autocomplete="off" inputmode="none" readonly>
            <span class="fraction-input-label">Nenner</span>
        </div>`;
    }

    function renderTask(task) {
        const display = document.getElementById('taskDisplay');
        const svgContainer = document.getElementById('svgContainer');
        const instruction = document.getElementById('taskInstruction');
        const buildArea = document.getElementById('buildArea');
        const paintArea = document.getElementById('paintArea');

        instruction.textContent = task.instruction;

        // Alle Spezialbereiche zurücksetzen
        buildArea.classList.remove('active');
        if (paintArea) paintArea.classList.remove('active');

        // Build-Modus
        if (task.mode === 'build') {
            display.style.display = 'none';
            svgContainer.style.display = 'none';
            buildArea.classList.add('active');
            renderBuildMode(task);
            return;
        }

        // Einfärben-Modus (kein Numpad nötig)
        if (task.mode === 'paint') {
            display.style.display = 'none';
            svgContainer.style.display = 'none';
            showNumpad(false);
            if (paintArea) {
                paintArea.classList.add('active');
                const paintGrid = document.getElementById('paintGrid');
                renderClickableGridSVG(task.display.rows, task.display.cols, paintGrid);
                updatePaintCounter();
            }
            return;
        }

        // Schrittweises Kürzen
        if (task.mode === 'simplify') {
            display.style.display = 'none';
            svgContainer.style.display = 'none';
            initSimplifyMode(task);
            return;
        }

        display.style.display = '';

        // SVG — nach visualType dispatchen
        if (task.showSVG) {
            svgContainer.style.display = 'block';
            switch (task.visualType) {
                case 'dotgrid':
                    renderDotGridSVG(task.display.rows, task.display.cols, task.display.num, svgContainer);
                    break;
                case 'rectangle':
                    renderRectangleSVG(task.display.den, task.display.num, svgContainer);
                    break;
                default: // 'pie' oder undefined
                    renderFractionSVG(task.display.num, task.display.den, svgContainer);
                    break;
            }
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
        setupInputNavigation();
    }

    // ---- Numpad-Steuerung ----

    let numpadActiveInput = null;
    let numpadInputs = [];
    let autoAdvanceTimer = null;

    function setupInputNavigation() {
        numpadInputs = Array.from(
            document.querySelectorAll('.task-area input[type="number"]:not(.divisor-input)')
        );

        numpadInputs.forEach((input, i) => {
            input.addEventListener('click', () => setActiveInput(input));
            input.addEventListener('focus', () => setActiveInput(input));

            // Keyboard-Fallback für Desktop
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
                    if (i < numpadInputs.length - 1) {
                        e.preventDefault();
                        setActiveInput(numpadInputs[i + 1]);
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCheck();
                    }
                }
            });
        });

        if (numpadInputs.length > 0) {
            setTimeout(() => setActiveInput(numpadInputs[0]), 50);
        }

        showNumpad(numpadInputs.length > 0);
    }

    function setActiveInput(input) {
        cancelAutoAdvance();
        numpadInputs.forEach(i => {
            i.classList.remove('numpad-active', 'numpad-waiting');
        });
        numpadActiveInput = input;
        input.classList.add('numpad-active');
        input.focus();
    }

    function advanceToNextInput() {
        cancelAutoAdvance();
        if (!numpadActiveInput) return;
        const idx = numpadInputs.indexOf(numpadActiveInput);
        if (idx < numpadInputs.length - 1) {
            setActiveInput(numpadInputs[idx + 1]);
        } else {
            // Letztes Feld → Prüfen-Button pulsieren und hinscrollen
            highlightCheckButton();
        }
    }

    function highlightCheckButton() {
        const btn = document.getElementById('checkBtn');
        if (!btn || btn.style.display === 'none') return;
        btn.classList.remove('btn-pulse');
        void btn.offsetWidth;
        btn.classList.add('btn-pulse');
        btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function cancelAutoAdvance() {
        if (autoAdvanceTimer) {
            clearTimeout(autoAdvanceTimer);
            autoAdvanceTimer = null;
        }
        if (numpadActiveInput) {
            numpadActiveInput.classList.remove('numpad-waiting');
        }
    }

    function startAutoAdvance() {
        cancelAutoAdvance();
        if (!numpadActiveInput) return;
        const idx = numpadInputs.indexOf(numpadActiveInput);

        numpadActiveInput.classList.add('numpad-waiting');
        autoAdvanceTimer = setTimeout(() => {
            autoAdvanceTimer = null;
            if (numpadActiveInput) {
                numpadActiveInput.classList.remove('numpad-waiting');
            }
            if (idx < numpadInputs.length - 1) {
                // Nächstes Feld
                advanceToNextInput();
            } else {
                // Letztes Feld → Prüfen-Button pulsieren
                highlightCheckButton();
            }
        }, 800);
    }

    function handleNumpadKey(val) {
        if (state.answered) {
            if (val === 'ok') nextTask();
            return;
        }

        if (val === 'ok') {
            cancelAutoAdvance();
            advanceToNextInput();
            return;
        }

        if (val === 'del') {
            cancelAutoAdvance();
            if (numpadActiveInput) {
                const cur = numpadActiveInput.value;
                numpadActiveInput.value = cur.slice(0, -1);
            }
            return;
        }

        // Ziffer eingeben
        if (numpadActiveInput) {
            const cur = numpadActiveInput.value;
            if (cur.length < 3) {
                numpadActiveInput.value = cur + val;
                // Auto-Advance starten nach jeder Ziffer
                startAutoAdvance();
            }
        }
    }

    function showNumpad(visible) {
        const numpad = document.getElementById('numpad');
        if (numpad) {
            numpad.classList.toggle('active', visible);
        }
    }

    function initNumpad() {
        const numpad = document.getElementById('numpad');
        if (!numpad) return;

        numpad.addEventListener('click', (e) => {
            const key = e.target.closest('.numpad-key');
            if (!key) return;
            e.preventDefault();
            handleNumpadKey(key.dataset.val);
        });

        // Touch: Prevent default um Doppel-Tap-Zoom zu verhindern
        numpad.addEventListener('touchend', (e) => {
            const key = e.target.closest('.numpad-key');
            if (!key) return;
            e.preventDefault();
            handleNumpadKey(key.dataset.val);
        });
    }

    // ---- Schrittweises Kürzen ----

    let sState = {
        origNum: 0, origDen: 0,
        curNum: 0, curDen: 0,
        steps: [],     // [{divisor, fromNum, fromDen, toNum, toDen}]
        isComplete: false,
        stepCount: 0
    };

    function initSimplifyMode(task) {
        sState = {
            origNum: task.display.num, origDen: task.display.den,
            curNum: task.display.num, curDen: task.display.den,
            steps: [], isComplete: false, stepCount: 0
        };

        const display = document.getElementById('taskDisplay');
        display.style.display = '';

        const contextHTML = task.contextText
            ? `<p class="task-context-text">${task.contextText}</p>`
            : '';

        display.innerHTML = `
            <div class="simplify-area">
                ${contextHTML}
                <div class="simplify-chain" id="simplifyChain"></div>
                <div class="step-label" id="stepLabel">Schritt 1</div>
                <div class="divisor-area" id="divisorArea">
                    <span class="divisor-prompt">Teile Zähler und Nenner durch:</span>
                    <input type="number" class="divisor-input" id="divisorInput"
                           placeholder="?" min="2" autocomplete="off" inputmode="none" readonly>
                </div>
                <div class="simplify-error-msg" id="simplifyError">&nbsp;</div>
            </div>`;

        renderSimplifyChain();

        // Divisor-Input in Numpad-System einbinden
        const divInput = document.getElementById('divisorInput');
        numpadInputs = [divInput];
        divInput.addEventListener('click', () => setActiveInput(divInput));
        divInput.addEventListener('focus', () => setActiveInput(divInput));
        divInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleCheck();
            }
        });
        setTimeout(() => setActiveInput(divInput), 50);
        showNumpad(true);
    }

    function renderSimplifyChain() {
        const chain = document.getElementById('simplifyChain');
        let html = '';

        // Ursprünglicher Bruch
        const isOrig = sState.steps.length === 0;
        html += `<div class="simplify-step ${isOrig ? 'current' : 'done'}">
            <span>${sState.origNum}</span>
            <span class="s-line"></span>
            <span>${sState.origDen}</span>
        </div>`;

        // Jeder Schritt
        sState.steps.forEach((step, i) => {
            const isLast = i === sState.steps.length - 1;
            const isFinal = isLast && sState.isComplete;
            html += `<div class="simplify-arrow">
                <span class="simplify-arrow-div">÷${step.divisor}</span>
                <span class="simplify-arrow-sym">→</span>
            </div>`;
            html += `<div class="simplify-step ${isFinal ? 'final' : isLast ? 'current' : 'done'}">
                <span>${step.toNum}</span>
                <span class="s-line"></span>
                <span>${step.toDen}</span>
            </div>`;
        });

        chain.innerHTML = html;
    }

    function handleSimplifyStep() {
        if (sState.isComplete) return;

        const divInput = document.getElementById('divisorInput');
        const errEl = document.getElementById('simplifyError');
        const divisor = parseInt(divInput.value);

        errEl.textContent = '\u00A0'; // Reset

        if (isNaN(divisor) || divisor < 2) {
            divInput.classList.remove('shake');
            void divInput.offsetWidth;
            divInput.classList.add('shake');
            errEl.textContent = 'Gib eine Zahl ab 2 ein.';
            return;
        }

        if (sState.curNum % divisor !== 0 || sState.curDen % divisor !== 0) {
            divInput.classList.remove('shake');
            void divInput.offsetWidth;
            divInput.classList.add('shake');
            if (sState.curNum % divisor !== 0 && sState.curDen % divisor !== 0) {
                errEl.textContent = `${divisor} teilt weder ${sState.curNum} noch ${sState.curDen}.`;
            } else if (sState.curNum % divisor !== 0) {
                errEl.textContent = `${divisor} teilt den Zähler ${sState.curNum} nicht gleichmäßig.`;
            } else {
                errEl.textContent = `${divisor} teilt den Nenner ${sState.curDen} nicht gleichmäßig.`;
            }
            return;
        }

        // Gültiger Schritt
        const newNum = sState.curNum / divisor;
        const newDen = sState.curDen / divisor;

        sState.steps.push({
            divisor,
            fromNum: sState.curNum, fromDen: sState.curDen,
            toNum: newNum, toDen: newDen
        });
        sState.curNum = newNum;
        sState.curDen = newDen;
        sState.stepCount++;

        const fullySimplified = gcd(newNum, newDen) === 1;

        if (fullySimplified) {
            sState.isComplete = true;
            renderSimplifyChain();

            // UI aktualisieren
            const stepLabel = document.getElementById('stepLabel');
            const divisorArea = document.getElementById('divisorArea');
            stepLabel.textContent = '';
            divisorArea.innerHTML = `<div class="simplify-complete-msg">
                Perfekt gekürzt! ${sState.origNum}/${sState.origDen} = ${newNum}/${newDen}
            </div>`;
            document.getElementById('simplifyError').textContent = '';

            // SVG zeigen
            const svgContainer = document.getElementById('svgContainer');
            svgContainer.style.display = 'block';
            renderFractionSVG(newNum, newDen, svgContainer);

            // Als korrekt werten
            state.answered = true;
            state.correctCount++;
            state.streak++;
            let pts = 10;
            if (state.streak >= 3) pts += 5;
            // Bonus für viele Schritte
            if (sState.stepCount >= 3) pts += 5;
            state.points += pts;
            state.sessionPoints += pts;
            updateScoreDisplay();
            launchConfetti();

            showFeedback(true, state.currentTask);
            showNumpad(false);
            document.getElementById('checkBtn').style.display = 'none';
            document.getElementById('nextBtn').style.display = 'none';
            setTimeout(() => { if (state.answered) nextTask(); }, 1500);
        } else {
            renderSimplifyChain();
            divInput.value = '';
            setActiveInput(divInput);

            const stepLabel = document.getElementById('stepLabel');
            stepLabel.textContent = `Schritt ${sState.stepCount + 1}`;

            const instruction = document.getElementById('taskInstruction');
            instruction.textContent = 'Gut gemacht! Kannst du noch weiter kürzen?';

            errEl.textContent = '\u00A0';
        }
    }

    // ---- Build-Modus ----

    let buildPieces = [];

    function renderBuildMode(task) {
        buildPieces = [];
        const palette = document.getElementById('piecesPalette');
        const added = document.getElementById('buildAdded');
        const sumEl = document.getElementById('buildSum');
        const buildSVG = document.getElementById('buildSVG');
        const dropLabel = document.getElementById('dropLabel');
        const ghostCircle = document.getElementById('ghostCircle');
        const numInput = document.getElementById('buildNum');
        const denInput = document.getElementById('buildDen');

        added.innerHTML = ''; sumEl.textContent = '';
        buildSVG.innerHTML = '';
        dropLabel.classList.remove('hidden');
        ghostCircle.classList.remove('show');
        if (numInput) numInput.value = '';
        if (denInput) denInput.value = '';

        renderBuildCircle(task.solution, document.getElementById('ghostSVG'));

        palette.innerHTML = '';
        task.availableDens.forEach(den => {
            const tile = document.createElement('div');
            tile.className = 'piece-tile'; tile.draggable = true; tile.dataset.den = den;
            const svgC = document.createElement('div');
            svgC.className = 'piece-tile-svg'; svgC.appendChild(renderMiniPieSVG(den));
            const label = document.createElement('div');
            label.className = 'piece-tile-label'; label.textContent = `1/${den}`;
            tile.appendChild(svgC); tile.appendChild(label);

            tile.addEventListener('click', () => addBuildPiece(den));
            tile.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', den); tile.classList.add('dragging'); });
            tile.addEventListener('dragend', () => tile.classList.remove('dragging'));

            let touchClone = null;
            tile.addEventListener('touchstart', (e) => {
                const t = e.touches[0];
                touchClone = tile.cloneNode(true);
                touchClone.style.cssText = `position:fixed;z-index:300;opacity:0.8;pointer-events:none;width:${tile.offsetWidth}px;left:${t.clientX-tile.offsetWidth/2}px;top:${t.clientY-tile.offsetHeight/2}px`;
                document.body.appendChild(touchClone);
            }, { passive: true });
            tile.addEventListener('touchmove', (e) => {
                if (!touchClone) return; e.preventDefault();
                const t = e.touches[0];
                touchClone.style.left = (t.clientX - tile.offsetWidth / 2) + 'px';
                touchClone.style.top = (t.clientY - tile.offsetHeight / 2) + 'px';
                const dz = document.getElementById('dropZone'), r = dz.getBoundingClientRect();
                dz.classList.toggle('drag-over', t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom);
            }, { passive: false });
            tile.addEventListener('touchend', (e) => {
                if (touchClone) { touchClone.remove(); touchClone = null; }
                const t = e.changedTouches[0], dz = document.getElementById('dropZone'), r = dz.getBoundingClientRect();
                dz.classList.remove('drag-over');
                if (t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom) addBuildPiece(den);
            });
            palette.appendChild(tile);
        });

        const dropZone = document.getElementById('dropZone');
        dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); };
        dropZone.ondragleave = () => dropZone.classList.remove('drag-over');
        dropZone.ondrop = (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); const d = parseInt(e.dataTransfer.getData('text/plain')); if (!isNaN(d)) addBuildPiece(d); };

        renderBuildCircle([], buildSVG);

        // Build-Inputs in Numpad-System einbinden
        const bNum = document.getElementById('buildNum');
        const bDen = document.getElementById('buildDen');
        if (bNum && bDen) {
            numpadInputs = [bNum, bDen];
            bNum.addEventListener('click', () => setActiveInput(bNum));
            bNum.addEventListener('focus', () => setActiveInput(bNum));
            bDen.addEventListener('click', () => setActiveInput(bDen));
            bDen.addEventListener('focus', () => setActiveInput(bDen));
            bNum.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
                    e.preventDefault(); setActiveInput(bDen);
                }
            });
            bDen.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleCheck(); }
            });
        }
        showNumpad(true);
    }

    function addBuildPiece(den) {
        let totalDen = 1;
        buildPieces.forEach(p => { totalDen = lcm(totalDen, p.den); });
        totalDen = lcm(totalDen, den);
        let totalNum = 0;
        buildPieces.forEach(p => { totalNum += totalDen / p.den; });
        totalNum += totalDen / den;
        if (totalNum > totalDen) return;
        buildPieces.push({ num: 1, den });
        updateBuildDisplay();
    }

    function removeBuildPiece(index) {
        buildPieces.splice(index, 1);
        updateBuildDisplay();
    }

    function updateBuildDisplay() {
        const buildSVG = document.getElementById('buildSVG');
        const added = document.getElementById('buildAdded');
        const sumEl = document.getElementById('buildSum');
        const dropLabel = document.getElementById('dropLabel');
        renderBuildCircle(buildPieces, buildSVG);
        dropLabel.classList.toggle('hidden', buildPieces.length > 0);
        added.innerHTML = '';
        buildPieces.forEach((p, i) => {
            const chip = document.createElement('div');
            chip.className = 'piece-chip pop-in';
            chip.innerHTML = `<span>1/${p.den}</span><button class="piece-chip-remove" title="Entfernen">×</button>`;
            chip.querySelector('.piece-chip-remove').addEventListener('click', () => removeBuildPiece(i));
            added.appendChild(chip);
        });
        if (buildPieces.length > 0) {
            let td = 1; buildPieces.forEach(p => { td = lcm(td, p.den); });
            let tn = 0; buildPieces.forEach(p => { tn += td / p.den; });
            const s = simplify(tn, td);
            sumEl.innerHTML = `Aktuell: <strong>${s.num}/${s.den}</strong>`;
        } else { sumEl.textContent = ''; }
    }

    function getBuildSum() {
        if (buildPieces.length === 0) return { num: 0, den: 1 };
        let td = 1; buildPieces.forEach(p => { td = lcm(td, p.den); });
        let tn = 0; buildPieces.forEach(p => { tn += td / p.den; });
        return simplify(tn, td);
    }

    // ---- Antwort prüfen ----

    function checkAnswer(task) {
        if (task.mode === 'paint') {
            return paintState.coloredSet.size === task.answer.colored;
        }
        if (task.mode === 'build') {
            const uN = parseInt(document.getElementById('buildNum')?.value);
            const uD = parseInt(document.getElementById('buildDen')?.value);
            if (isNaN(uN) || isNaN(uD)) return null;
            if (uD === 0) return false;
            const bs = getBuildSum();
            return fractionsEqual(bs.num, bs.den, task.target.num, task.target.den)
                && fractionsEqual(uN, uD, task.answer.num, task.answer.den);
        }
        const uN = parseInt(document.getElementById('ansNum')?.value);
        let uD;
        if (task.mode === 'expand') { uD = task.display.targetDen; }
        else { uD = parseInt(document.getElementById('ansDen')?.value); }
        if (isNaN(uN) || (task.mode !== 'expand' && isNaN(uD))) return null;
        if (uD === 0) return false;
        return fractionsEqual(uN, uD, task.answer.num, task.answer.den);
    }

    // ---- Stützenfunktion ----

    let hintLevel = 0;

    function showHint() {
        if (!state.currentTask || state.answered) return;

        // Dynamische Hints für Kürzen
        if (state.currentTask.mode === 'simplify' && !sState.isComplete) {
            const divs = commonDivisors(sState.curNum, sState.curDen);
            const hints = [
                `Suche eine Zahl, die ${sState.curNum} und ${sState.curDen} beide teilt.`,
                divs.length > 0 ? `Mögliche Teiler: ${divs.join(', ')}` : `ggT ist 1 — fertig!`,
                divs.length > 0 ? `Probiere es mit ${divs[0]}.` : `Der Bruch ist fertig gekürzt.`
            ];
            const hintBox = document.getElementById('hintBox');
            if (hintLevel >= hints.length) hintLevel = hints.length - 1;
            hintBox.textContent = '💡 ' + hints[hintLevel];
            hintBox.classList.add('show');
            if (hintLevel < hints.length - 1) hintLevel++;
            return;
        }

        const hints = state.currentTask.hints;
        if (!hints || hints.length === 0) return;
        if (hintLevel >= hints.length) hintLevel = hints.length - 1;
        const hintBox = document.getElementById('hintBox');
        hintBox.textContent = '💡 ' + hints[hintLevel];
        hintBox.classList.add('show');
        if (hintLevel < hints.length - 1) hintLevel++;
    }

    function hideHint() {
        document.getElementById('hintBox').classList.remove('show');
        hintLevel = 0;
    }

    // ---- Ghostlösung ----

    function showGhost() {
        if (!state.currentTask || state.answered) return;
        const task = state.currentTask;

        if (task.mode === 'paint') {
            // Kurz die Ziel-Anzahl anzeigen
            const el = document.getElementById('paintCounter');
            if (el) {
                const orig = el.textContent;
                el.textContent = `👻 ${task.answer.colored} Plättchen einfärben!`;
                el.classList.add('ghost-answer');
                setTimeout(() => { el.textContent = orig; el.classList.remove('ghost-answer'); }, 2500);
            }
            return;
        }

        if (task.mode === 'build') {
            const gc = document.getElementById('ghostCircle');
            gc.classList.add('show');
            setTimeout(() => gc.classList.remove('show'), 2500);
            return;
        }

        if (task.mode === 'simplify' && !sState.isComplete) {
            const divs = commonDivisors(sState.curNum, sState.curDen);
            if (divs.length > 0) {
                const divInput = document.getElementById('divisorInput');
                divInput.value = divs[divs.length - 1]; // Größten Teiler zeigen
                divInput.classList.add('ghost-answer');
                setTimeout(() => divInput.classList.add('fade-out'), 1200);
                setTimeout(() => {
                    divInput.value = '';
                    divInput.classList.remove('ghost-answer', 'fade-out');
                }, 2500);
            }
            return;
        }

        const nI = document.getElementById('ansNum');
        const dI = document.getElementById('ansDen');
        if (nI) { nI.value = task.answer.num; nI.classList.add('ghost-answer'); }
        if (dI) { dI.value = task.answer.den; dI.classList.add('ghost-answer'); }
        setTimeout(() => { if (nI) nI.classList.add('fade-out'); if (dI) dI.classList.add('fade-out'); }, 1200);
        setTimeout(() => {
            if (nI) { nI.value = ''; nI.classList.remove('ghost-answer', 'fade-out'); }
            if (dI) { dI.value = ''; dI.classList.remove('ghost-answer', 'fade-out'); }
        }, 2500);
    }

    // ---- Game State ----

    const state = {
        mode: 'recognize', difficulty: 'easy',
        currentTask: null, taskNumber: 0, totalTasks: 10,
        correctCount: 0, points: 0, streak: 0, stars: 0,
        sessionPoints: 0, answered: false
    };

    function updateScoreDisplay() {
        document.getElementById('pointsDisplay').textContent = `${state.points} Pkt`;
        document.getElementById('starsDisplay').textContent = `⭐ ${state.stars}`;
        document.getElementById('streakDisplay').textContent = state.streak >= 2 ? `🔥 ${state.streak}` : '';
    }

    function updateProgress() {
        document.getElementById('taskCounter').textContent = `Aufgabe ${state.taskNumber} von ${state.totalTasks}`;
        document.getElementById('correctCounter').textContent = `${state.correctCount} richtig`;
        document.getElementById('progressFill').style.width = `${(state.taskNumber / state.totalTasks) * 100}%`;
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
            if (task.mode === 'paint') {
                el.textContent = `❌ Leider falsch. Richtig wären ${a.colored} von ${task.display.total} Plättchen (= ${task.display.targetNum}/${task.display.targetDen}).`;
            } else if (task.mode === 'build') {
                el.textContent = `❌ Leider falsch. Richtig: ${task.target.num}/${task.target.den} = ${a.num}/${a.den}`;
            } else {
                el.textContent = `❌ Leider falsch. Richtig: ${a.num}/${a.den}`;
            }
        }
        if (task.mode !== 'simplify' && task.mode !== 'paint') {
            const inputDiv = task.mode === 'build' ? document.getElementById('buildAnswer') : document.getElementById('ansInput');
            if (inputDiv) {
                inputDiv.classList.remove('shake', 'glow-success');
                void inputDiv.offsetWidth;
                inputDiv.classList.add(correct ? 'glow-success' : 'shake');
            }
        }
    }

    function hideFeedback() {
        document.getElementById('feedback').classList.remove('show');
    }

    function showResults() {
        const overlay = document.getElementById('resultOverlay');
        const ratio = state.correctCount / state.totalTasks;
        document.getElementById('resultCorrect').textContent = state.correctCount;
        document.getElementById('resultWrong').textContent = state.totalTasks - state.correctCount;
        document.getElementById('resultPoints').textContent = state.sessionPoints;

        let earned = 0;
        if (state.sessionPoints >= 50) earned = 1;
        if (state.sessionPoints >= 100) earned = 2;
        if (state.sessionPoints >= 150) earned = 3;
        state.stars += earned;
        document.getElementById('resultStars').textContent = '⭐'.repeat(earned) + '☆'.repeat(3 - earned);

        if (ratio >= 0.9) { document.getElementById('resultEmoji').textContent = '🏆'; document.getElementById('resultTitle').textContent = 'Ausgezeichnet!'; document.getElementById('resultMessage').textContent = 'Du bist ein Bruch-Profi!'; }
        else if (ratio >= 0.7) { document.getElementById('resultEmoji').textContent = '🎉'; document.getElementById('resultTitle').textContent = 'Super gemacht!'; document.getElementById('resultMessage').textContent = 'Weiter so, du wirst immer besser!'; }
        else if (ratio >= 0.5) { document.getElementById('resultEmoji').textContent = '💪'; document.getElementById('resultTitle').textContent = 'Guter Versuch!'; document.getElementById('resultMessage').textContent = 'Übung macht den Meister — probier es nochmal!'; }
        else { document.getElementById('resultEmoji').textContent = '🌟'; document.getElementById('resultTitle').textContent = 'Weiter üben!'; document.getElementById('resultMessage').textContent = 'Jeder Fehler bringt dich weiter. Versuch es nochmal!'; }

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
        hideFeedback(); hideHint();
        nextTask();
    }

    function nextTask() {
        state.taskNumber++;
        state.answered = false;
        if (state.taskNumber > state.totalTasks) { showResults(); return; }
        hideFeedback(); hideHint();
        document.getElementById('checkBtn').style.display = '';
        document.getElementById('nextBtn').style.display = 'none';
        state.currentTask = generateTask(state.mode, state.difficulty);
        renderTask(state.currentTask);
        updateProgress();
        const taskArea = document.querySelector('.task-area');
        taskArea.classList.remove('task-enter');
        void taskArea.offsetWidth;
        taskArea.classList.add('task-enter');
    }

    function handleCheck() {
        if (state.answered) return;
        document.getElementById('checkBtn').classList.remove('btn-pulse');

        // Schrittweises Kürzen hat eigene Logik
        if (state.currentTask?.mode === 'simplify') {
            handleSimplifyStep();
            return;
        }

        const result = checkAnswer(state.currentTask);
        if (result === null) {
            const id = state.currentTask.mode === 'build' ? 'buildAnswer' : 'ansInput';
            const el = document.getElementById(id);
            if (el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
            return;
        }
        state.answered = true;
        if (result) {
            state.correctCount++; state.streak++;
            let pts = 10; if (state.streak >= 3) pts += 5;
            state.points += pts; state.sessionPoints += pts;
            launchConfetti();
        } else { state.streak = 0; }
        showFeedback(result, state.currentTask);
        updateScoreDisplay(); hideHint();

        if (!state.currentTask.showSVG && state.currentTask.mode !== 'add' && state.currentTask.mode !== 'build' && state.currentTask.mode !== 'paint') {
            const svgC = document.getElementById('svgContainer');
            const a = state.currentTask.answer;
            svgC.style.display = 'block';
            renderFractionSVG(a.num, a.den, svgC);
        }

        if (result) {
            // Richtig → nach 1.5s automatisch weiter
            document.getElementById('checkBtn').style.display = 'none';
            document.getElementById('nextBtn').style.display = 'none';
            setTimeout(() => { if (state.answered) nextTask(); }, 1500);
        } else {
            // Falsch → Nächste-Button zeigen, Kind liest die Lösung
            document.getElementById('checkBtn').style.display = 'none';
            document.getElementById('nextBtn').style.display = '';
            document.getElementById('nextBtn').focus();
        }
    }

    function updateTabs() {
        const cfg = DIFFICULTY_CONFIG[state.difficulty];
        document.querySelectorAll('.tab').forEach(tab => {
            const m = tab.dataset.mode;
            const ok = cfg.modes.includes(m);
            tab.disabled = !ok;
            if (!ok && tab.classList.contains('active')) {
                tab.classList.remove('active');
                state.mode = cfg.modes[0];
                document.querySelector(`.tab[data-mode="${state.mode}"]`).classList.add('active');
            }
        });
    }

    // ---- Init ----

    function init() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                if (tab.disabled) return;
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                state.mode = tab.dataset.mode;
                startRound();
            });
        });
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            state.difficulty = e.target.value; updateTabs(); startRound();
        });
        document.getElementById('checkBtn').addEventListener('click', handleCheck);
        document.getElementById('nextBtn').addEventListener('click', nextTask);
        document.getElementById('hintBtn').addEventListener('click', showHint);
        document.getElementById('ghostBtn').addEventListener('click', showGhost);
        document.getElementById('resetBtn').addEventListener('click', startRound);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
                if (state.answered) nextTask();
                else handleCheck();
            }
        });
        document.getElementById('restartBtn').addEventListener('click', startRound);

        initNumpad();
        updateTabs(); updateScoreDisplay(); startRound();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
