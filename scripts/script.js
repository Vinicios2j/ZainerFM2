// ==========================
// 1. ANIMAÇÕES
// ==========================
if (typeof ScrollReveal !== 'undefined') {
    const sr = ScrollReveal({
        origin: 'top',
        distance: '50px',
        duration: 2000,
        reset: false
    });

    sr.reveal('.reveal', { delay: 200 });
    sr.reveal('.card', { interval: 200 });
}

// ==========================
// 2. ELEMENTOS
// ==========================
const floatingPlayBtn = document.getElementById('floating-play-btn');
const mainPlayBtn = document.getElementById('main-play-btn');
const muteBtn = document.getElementById('mute-btn');
const volumeControl = document.getElementById('volume-control');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const radioAudio = document.getElementById('radio-audio');
const closeAdBtn = document.querySelector('.close-ad');
const stickyAd = document.querySelector('.sticky-ad');

// ==========================
// 3. STREAM DIRETO
// ==========================
const streamUrl = 'https://server28.srvsh.com.br:9046/;';

let isPlaying = false;
let lastVolume = 1;

// ==========================
// 4. INICIAR ÁUDIO
// ==========================
function setupAudio() {
    if (!radioAudio) return;

    if (!radioAudio.src) {
        radioAudio.src = streamUrl;
    }

    radioAudio.volume = 1;
    radioAudio.crossOrigin = 'anonymous';
}

// ==========================
// 5. TOCAR / PAUSAR
// ==========================
async function playRadio() {
    if (!radioAudio) return;

    try {
        setupAudio();
        await radioAudio.play();
        isPlaying = true;
        updateUI(true);
    } catch (error) {
        console.error('Erro ao tocar rádio:', error);
        alert('Não foi possível iniciar a rádio agora. Pode ser bloqueio do navegador ou o servidor não estar aceitando reprodução no navegador.');
    }
}

function pauseRadio() {
    if (!radioAudio) return;

    radioAudio.pause();
    isPlaying = false;
    updateUI(false);
}

async function toggleRadio() {
    if (!radioAudio) return;

    if (radioAudio.paused) {
        await playRadio();
    } else {
        pauseRadio();
    }
}

// ==========================
// 6. MUTE / VOLUME
// ==========================
function updateVolumeIcon() {
    if (!muteBtn || !radioAudio) return;

    if (radioAudio.muted || radioAudio.volume === 0) {
        muteBtn.textContent = '🔇';
    } else if (radioAudio.volume <= 0.5) {
        muteBtn.textContent = '🔉';
    } else {
        muteBtn.textContent = '🔊';
    }
}

function setVolume(value) {
    if (!radioAudio) return;

    const volume = Math.max(0, Math.min(1, value / 100));
    radioAudio.volume = volume;
    radioAudio.muted = volume === 0;

    if (volume > 0) {
        lastVolume = volume;
    }

    updateVolumeIcon();
}

function toggleMute() {
    if (!radioAudio) return;

    if (radioAudio.muted || radioAudio.volume === 0) {
        radioAudio.muted = false;
        radioAudio.volume = lastVolume > 0 ? lastVolume : 1;

        if (volumeControl) {
            volumeControl.value = Math.round(radioAudio.volume * 100);
        }
    } else {
        lastVolume = radioAudio.volume;
        radioAudio.muted = true;

        if (volumeControl) {
            volumeControl.value = 0;
        }
    }

    updateVolumeIcon();
}

// ==========================
// 7. VISUAL
// ==========================
function updateUI(playing) {
    if (floatingPlayBtn) {
        floatingPlayBtn.innerHTML = playing ? '⏸' : '▶';
        floatingPlayBtn.style.background = playing ? '#FFD700' : '#ffffff';
        floatingPlayBtn.style.color = '#000000';
    }

    if (mainPlayBtn) {
        mainPlayBtn.innerHTML = playing ? 'Pausar Rádio' : 'Ouvir Agora';
    }

    if (statusDot) {
        statusDot.style.background = playing ? '#00ff66' : '#555';

        if (playing) {
            statusDot.classList.add('pulse-anim');
        } else {
            statusDot.classList.remove('pulse-anim');
        }
    }

    if (statusText) {
        statusText.textContent = playing ? 'Ao vivo agora' : 'Offline';
    }

    updateVolumeIcon();
}

// ==========================
// 8. EVENTOS DO ÁUDIO
// ==========================
if (radioAudio) {
    radioAudio.addEventListener('playing', () => {
        isPlaying = true;
        updateUI(true);
    });

    radioAudio.addEventListener('pause', () => {
        isPlaying = false;
        updateUI(false);
    });

    radioAudio.addEventListener('ended', () => {
        isPlaying = false;
        updateUI(false);
    });

    radioAudio.addEventListener('volumechange', () => {
        if (volumeControl) {
            if (radioAudio.muted) {
                volumeControl.value = 0;
            } else {
                volumeControl.value = Math.round(radioAudio.volume * 100);
            }
        }

        updateVolumeIcon();
    });

    radioAudio.addEventListener('error', (e) => {
        console.error('Erro no elemento de áudio:', e);
        isPlaying = false;
        updateUI(false);
    });
}

// ==========================
// 9. EVENTOS DOS BOTÕES
// ==========================
if (floatingPlayBtn) {
    floatingPlayBtn.addEventListener('click', toggleRadio);
}

if (mainPlayBtn) {
    mainPlayBtn.addEventListener('click', toggleRadio);
}

if (muteBtn) {
    muteBtn.addEventListener('click', toggleMute);
}

if (volumeControl) {
    volumeControl.addEventListener('input', (e) => {
        setVolume(Number(e.target.value));
    });
}

// ==========================
// 10. HEADER AO ROLAR
// ==========================
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (!header) return;

    if (window.scrollY > 50) {
        header.classList.add('header-active');
    } else {
        header.classList.remove('header-active');
    }
});

// ==========================
// 11. FECHAR ANÚNCIO STICKY
// ==========================
if (closeAdBtn && stickyAd) {
    closeAdBtn.addEventListener('click', () => {
        stickyAd.style.display = 'none';
    });
}

// ==========================
// 12. ESTADO INICIAL
// ==========================
setupAudio();
updateUI(false);

if (volumeControl) {
    volumeControl.value = 100;
}

function verificarHorarioLocal() {
const agora = new Date();

```
const horaAtual = agora.getHours();
const minutoAtual = agora.getMinutes();

const horarioAtual = horaAtual * 60 + minutoAtual;

// 🔥 DEFINE AQUI
const inicio = 8 * 60;   // 08:00
const fim = 18 * 60;     // 18:00

const estaOnline = horarioAtual >= inicio && horarioAtual <= fim;

atualizarStatusRadio(estaOnline);
```

}

function atualizarStatusRadio(online) {
if (!statusDot || !statusText) return;

```
if (online) {
    statusDot.style.background = '#00ff66';
    statusDot.classList.add('pulse-anim');
    statusText.textContent = 'Ao vivo agora';
} else {
    statusDot.style.background = '#555';
    statusDot.classList.remove('pulse-anim');
    statusText.textContent = 'Offline';
}
```

}

// roda ao carregar
verificarHorarioLocal();

// atualiza a cada 1 minuto
setInterval(verificarHorarioLocal, 60000);
