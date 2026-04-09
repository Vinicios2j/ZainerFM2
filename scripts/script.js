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
// 2. CONFIG API
// ==========================
const API_BASE = 'https://zinerapi.squareweb.app'; 

// ==========================
// 3. ELEMENTOS
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

let isPlaying = false;
let lastVolume = 1;
let streamUrl = 'https://server28.srvsh.com.br:9046/;';

// ==========================
// 4. CARREGAR CONFIG DA RÁDIO
// ==========================
async function carregarConfigRadio() {
    try {
        const response = await fetch(`${API_BASE}/api/config`);
        const data = await response.json();

        if (!response.ok || !data.config) return;

        if (data.config.streamUrl) {
            streamUrl = data.config.streamUrl;
        }
    } catch (error) {
        console.warn('Não foi possível carregar config da rádio:', error);
    }
}

// ==========================
// 5. CARREGAR PROGRAMAÇÕES
// ==========================
async function carregarProgramacoesSite() {
    const container = document.getElementById('programacao-lista');
    if (!container) return;

    container.innerHTML = '<p style="color:#fff;">Carregando programação...</p>';

    try {
        const [progRes, adsRes] = await Promise.all([
            fetch(`${API_BASE}/api/programacoes`),
            fetch(`${API_BASE}/api/anuncios`)
        ]);

        const progData = await progRes.json();
        const adsData = await adsRes.json();

        const programacoes = progData.programacoes || [];
        const anuncios = (adsData.anuncios || []).filter(item => item.tipo === 'card');

        let html = '';

        if (!programacoes.length) {
            container.innerHTML = '<p style="color:#fff;">Nenhuma programação cadastrada.</p>';
            return;
        }

        programacoes.forEach((item, index) => {
            html += `
                <div class="card reveal">
                    <div class="card-img" style="background-image: url('${item.imagem || ''}');"></div>
                    <div class="card-body">
                        <span class="tag">${item.horario || ''}</span>
                        <h3>${item.titulo || ''}</h3>
                        <p>${item.descricao || ''}</p>
                    </div>
                </div>
            `;

            if (index === 1 && anuncios[0]) {
                html += `
                    <div class="card reveal ad-card">
                        <div class="ad-box-mini">
                            <small>${anuncios[0].subtitulo || 'Patrocínio'}</small>
                            <div class="ad-content">${anuncios[0].titulo || 'Seu Anúncio Aqui!'}</div>
                        </div>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar programação:', error);
        container.innerHTML = '<p style="color:#fff;">Erro ao carregar programação.</p>';
    }
}

// ==========================
// 6. CARREGAR BANNER
// ==========================
async function carregarBannerSite() {
    const banner = document.getElementById('banner-anuncio');
    if (!banner) return;

    try {
        const response = await fetch(`${API_BASE}/api/anuncios`);
        const data = await response.json();

        const bannerItem = (data.anuncios || []).find(item => item.tipo === 'banner');

        if (!bannerItem) {
            banner.innerHTML = `
                <small>Publicidade / Google AdSense</small>
                <div class="ad-placeholder-pro">BANNER 728x90</div>
            `;
            return;
        }

        banner.innerHTML = `
            <small>${bannerItem.subtitulo || 'Publicidade'}</small>
            <div class="ad-placeholder-pro">
                ${
                    bannerItem.imagem
                        ? `<a href="${bannerItem.link || '#'}" target="_blank">
                                <img src="${bannerItem.imagem}" alt="${bannerItem.titulo || 'Banner'}" style="max-width:100%; max-height:90px; object-fit:contain;">
                           </a>`
                        : (bannerItem.titulo || 'BANNER 728x90')
                }
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar banner:', error);
        banner.innerHTML = `
            <small>Publicidade</small>
            <div class="ad-placeholder-pro">Erro ao carregar banner</div>
        `;
    }
}

// ==========================
// 7. STATUS DA RÁDIO VIA API
// ==========================
async function verificarStatusRadioAPI() {
    try {
        const response = await fetch(`${API_BASE}/api/radio/status`);
        const data = await response.json();

        if (!response.ok) {
            atualizarStatusRadio(false);
            return;
        }

        atualizarStatusRadio(!!data.online);
    } catch (error) {
        console.error('Erro ao verificar status da rádio:', error);
        atualizarStatusRadio(false);
    }
}

// ==========================
// 8. INICIAR ÁUDIO
// ==========================
function setupAudio() {
    if (!radioAudio) return;

    if (!radioAudio.src || radioAudio.src !== streamUrl) {
        radioAudio.src = streamUrl;
    }

    radioAudio.volume = 1;
    radioAudio.crossOrigin = 'anonymous';
}

// ==========================
// 9. TOCAR / PAUSAR
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
        alert('Não foi possível iniciar a rádio agora.');
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
// 10. MUTE / VOLUME
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
// 11. VISUAL
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

    if (statusText && playing) {
        statusText.textContent = 'Ao vivo agora';
    }

    updateVolumeIcon();
}

function atualizarStatusRadio(online) {
    if (!statusDot || !statusText) return;

    if (online) {
        statusDot.style.background = '#00ff66';
        statusDot.classList.add('pulse-anim');
        statusText.textContent = 'Ao vivo agora';
    } else {
        statusDot.style.background = '#555';
        statusDot.classList.remove('pulse-anim');
        statusText.textContent = 'Offline';
    }
}

// ==========================
// 12. EVENTOS DO ÁUDIO
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
// 13. EVENTOS DOS BOTÕES
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
// 14. HEADER AO ROLAR
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
// 15. FECHAR ANÚNCIO STICKY
// ==========================
if (closeAdBtn && stickyAd) {
    closeAdBtn.addEventListener('click', () => {
        stickyAd.style.display = 'none';
    });
}

// ==========================
// 16. AUTO PLAY INTELIGENTE
// ==========================
function iniciarAutoPlay() {
    if (!radioAudio) return;

    setupAudio();
    radioAudio.volume = 0.2;

    radioAudio.play()
        .then(() => {
            updateUI(true);
        })
        .catch(err => {
            console.log('Autoplay bloqueado:', err);
        });

    document.removeEventListener('click', iniciarAutoPlay);
    document.removeEventListener('scroll', iniciarAutoPlay);
    document.removeEventListener('keydown', iniciarAutoPlay);
}

document.addEventListener('click', iniciarAutoPlay);
document.addEventListener('scroll', iniciarAutoPlay);
document.addEventListener('keydown', iniciarAutoPlay);

// ==========================
// 17. ESTADO INICIAL
// ==========================
(async function init() {
    setupAudio();
    updateUI(false);

    if (volumeControl) {
        volumeControl.value = 100;
    }

    await carregarConfigRadio();
    await carregarProgramacoesSite();
    await carregarBannerSite();
    await verificarStatusRadioAPI();

    setInterval(verificarStatusRadioAPI, 60000);
})();