/* ========================================
   MatheMagic — Konfetti-Animation
   Leichtgewichtig, CSS-basiert
   ======================================== */

function launchConfetti() {
    const colors = ['#6C5CE7', '#00B894', '#FDCB6E', '#FF6B6B', '#a29bfe', '#55efc4', '#fd79a8', '#74b9ff'];
    const count = 25;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';

        // Zufaellige Position, Groesse, Farbe
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = -10 + 'px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.width = (Math.random() * 8 + 6) + 'px';
        particle.style.height = (Math.random() * 8 + 6) + 'px';
        particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';

        // Zufaellige Animation-Dauer und Verzoegerung
        const duration = 1 + Math.random() * 1;
        const delay = Math.random() * 0.4;
        particle.style.animationDuration = duration + 's';
        particle.style.animationDelay = delay + 's';

        // Leichte horizontale Drift
        const drift = (Math.random() - 0.5) * 200;
        particle.style.setProperty('--drift', drift + 'px');

        document.body.appendChild(particle);

        // Aufraeumen
        setTimeout(() => {
            particle.remove();
        }, (duration + delay) * 1000 + 100);
    }
}
