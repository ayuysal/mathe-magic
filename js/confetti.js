/* ========================================
   MatheMagic — Konfetti-Animation
   Leichtgewichtig, CSS-basiert
   ======================================== */

function launchConfetti() {
    const colors = ['#3B8EA5', '#8B6AAF', '#4CAF82', '#F0B429', '#E07A6A', '#6BB5CC', '#B89DD4', '#7DD4A8'];
    const count = 25;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';

        // Zufällige Position, Größe, Farbe
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = -10 + 'px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.width = (Math.random() * 8 + 6) + 'px';
        particle.style.height = (Math.random() * 8 + 6) + 'px';
        particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';

        // Zufällige Animation-Dauer und Verzögerung
        const duration = 1 + Math.random() * 1;
        const delay = Math.random() * 0.4;
        particle.style.animationDuration = duration + 's';
        particle.style.animationDelay = delay + 's';

        // Leichte horizontale Drift
        const drift = (Math.random() - 0.5) * 200;
        particle.style.setProperty('--drift', drift + 'px');

        document.body.appendChild(particle);

        // Aufräumen
        setTimeout(() => {
            particle.remove();
        }, (duration + delay) * 1000 + 100);
    }
}
