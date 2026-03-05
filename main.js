// main.js

/* =========================
   Render Tour Dates
========================= */
(function renderDates() {
  const root = document.getElementById("dates");
  if (!root) return;

  const dates = Array.isArray(window.TOUR_DATES) ? window.TOUR_DATES : [];

  // Si no hay data, muestra nada (o un mensaje si prefieres)
  if (!dates.length) {
    root.innerHTML = "";
    return;
  }

  // Orden por fecha (YYYY-MM-DD)
  dates.sort((a, b) => (a.dateISO || "").localeCompare(b.dateISO || ""));

  const now = Date.now();

  root.innerHTML = dates
    .map((d, i) => {
      const city = escapeHtml(d.city || "");
      const country = escapeHtml(d.country || "");
      const venue = escapeHtml(d.venue || "");
      const date = formatDDMM(d.dateISO);

      const url = (d.ticketUrl || "").trim();

      // Flags
      const isSoldOut = d.soldOut === true;
      const isNew = d.isNew === true || d.isNew === "true" || d.isNew === 1;

      // Si existe saleStartUTC, solo habilita cuando llegue esa hora.
      // Si NO existe, y hay url, habilita de inmediato.
      const saleStart = d.saleStartUTC ? Date.parse(d.saleStartUTC) : null;
      const canBuy = !!url && (saleStart === null || now >= saleStart);

      // Icono: normal vs "new"
      const iconSrc = isNew ? "./assets/assets_new.svg" : "./assets/assets.svg";

      // CTA
      const ctaHtml = isSoldOut
        ? `<span class="date-btn is-soldout" aria-disabled="true">Sold Out</span>`
        : canBuy
          ? `<a class="date-btn"
                 href="${escapeAttr(url)}"
                 target="_blank"
                 rel="noopener">
                 Tickets
                 <img class="btn-icon" src="./assets/tickets-icon.svg" alt="" aria-hidden="true" />
               </a>`
          : `<span class="date-btn is-coming" aria-disabled="true">Coming Soon</span>`;

      return `
        <article class="date-row ${i % 2 ? "is-alt" : ""}">
          <div class="date-left">
            <img class="date-icon" src="${iconSrc}" alt="" aria-hidden="true" />
            <div class="date-place">
              <div class="date-city">${city}</div>
              <div class="date-country">${country}</div>
            </div>
          </div>

          <div class="date-mid">
            <div class="date-venue">${venue}</div>
          </div>

          <div class="date-right">
            <div class="date-day">${date}</div>
            ${ctaHtml}
          </div>
        </article>
      `;
    })
    .join("");
})();

/* =========================
   Helpers
========================= */
function formatDDMM(dateISO) {
  // YYYY-MM-DD -> DD/MM (sin depender de timezone)
  if (!dateISO || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return "";
  const [, mm, dd] = dateISO.split("-");
  return `${dd}/${mm}`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}

// Para atributos (href, etc.). Evita romper el HTML si hay comillas.
function escapeAttr(str) {
  return String(str).replace(/["'<>\u0000-\u001F\u007F]/g, (ch) => {
    const map = {
      '"': "&quot;",
      "'": "&#39;",
      "<": "&lt;",
      ">": "&gt;",
    };
    return map[ch] || "";
  });
}

/* =========================
   Fake scroll (desktop)
   - scroll en cualquier parte
   - solo se mueve .right__inner
========================= */
(function lockScrollToRightPanel() {
  if (window.matchMedia("(max-width: 900px)").matches) return;

  const inner = document.querySelector(".right__inner");
  const spacer = document.getElementById("scroll-spacer");
  if (!inner || !spacer) return;

  let maxScroll = 0;

  function viewportH() {
    return document.documentElement.clientHeight;
  }

  function recalc() {
    const contentH = inner.scrollHeight;
    const viewH = viewportH();

    maxScroll = Math.max(0, contentH - viewH);

    // Altura fake exacta = alto del contenido derecho
    spacer.style.height = contentH + "px";

    requestTick();
  }

  let ticking = false;
  function requestTick() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      ticking = false;

      const yRaw = window.scrollY;
      const y = Math.min(maxScroll, Math.max(0, yRaw));

      inner.style.transform = `translate3d(0, ${-y}px, 0)`;

      // evita scroll “fantasma”
      if (yRaw > maxScroll) window.scrollTo(0, maxScroll);
    });
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", recalc);
  window.addEventListener("load", recalc);

  // Recalcula si cambia el alto del contenido (fechas nuevas, fuentes, etc.)
  const ro = new ResizeObserver(recalc);
  ro.observe(inner);

  // Por si hay imágenes dentro del panel derecho
  inner.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", recalc, { once: true });
  });

  recalc();
})();