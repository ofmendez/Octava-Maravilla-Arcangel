// Fix de viewport height en móvil (evita scroll por barras del navegador)
function setVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVh();
window.addEventListener('resize', setVh);

// Countdown
const dd = document.getElementById('dd');
const hh = document.getElementById('hh');
const mm = document.getElementById('mm');
const ss = document.getElementById('ss');

function pad2(n) { return String(n).padStart(2, '0'); }

const TARGET_ISO = "2026-03-02T10:00:00-05:00";
const target = new Date(TARGET_ISO);

function tick(){
  const now = new Date();
  let diff = target - now;
  if (diff < 0) diff = 0;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  dd.textContent = pad2(days);
  hh.textContent = pad2(hours);
  mm.textContent = pad2(mins);
  ss.textContent = pad2(secs);
}

tick();
setInterval(tick, 1000);

// Detectar timezone
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Detectar idioma / región
const locale = navigator.language || navigator.userLanguage;

// Enviar como evento a GA
gtag('event', 'user_context', {
  timezone: timezone,
  locale: locale
});

function getUTMParams() {
  const params = new URLSearchParams(window.location.search);

  const utmData = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content')
  };

  gtag('event', 'utm_visit', utmData);
}

getUTMParams();