// main.js
(function () {
  const root = document.getElementById("dates");
  if (!root) return;

  const dates = Array.isArray(window.TOUR_DATES) ? window.TOUR_DATES : [];

  // Orden por fecha
  dates.sort((a, b) => (a.dateISO || "").localeCompare(b.dateISO || ""));

  root.innerHTML = dates.map((d, i) => {
    const city = escapeHtml(d.city || "");
    const country = escapeHtml(d.country || "");
    const venue = escapeHtml(d.venue || "");
    const date = formatDDMM(d.dateISO);
    const url = (d.ticketUrl || "").trim();

    // Si no hay link todavía, el botón queda deshabilitado
   const isDisabled = !url;

return `
  <article class="date-row ${i % 2 ? "is-alt" : ""}">
    <div class="date-left">
      <img class="date-icon" src="./assets/assets.svg" alt="" aria-hidden="true" />
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

      ${
        isDisabled
          ? `<span class="date-btn is-coming" aria-disabled="true">
               Coming Soon
             </span>`
          : `<a class="date-btn"
               href="${url}"
               target="_blank"
               rel="noopener">
               tickets
               <img class="btn-icon" src="./assets/tickets-icon.svg" alt="" aria-hidden="true" />
             </a>`
      }

    </div>
  </article>
`;
  }).join("");
})();

function formatDDMM(dateISO) {
  // dateISO: YYYY-MM-DD -> DD/MM (sin depender de timezone)
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

(function lockScrollToRightPanel(){
    if (window.matchMedia("(max-width: 900px)").matches) return;
  const inner = document.querySelector(".right__inner");
  const spacer = document.getElementById("scroll-spacer");
  if(!inner || !spacer) return;

  let maxScroll = 0;

  function viewportH(){
    // más estable que innerHeight para calcular el rango real del scroll
    return document.documentElement.clientHeight;
  }

  function recalc(){
    const contentH = inner.scrollHeight;
    const viewH = viewportH();

    maxScroll = Math.max(0, contentH - viewH);

    // clave: el rango de scroll del body es (spacerHeight - viewH)
    // entonces spacerHeight debe ser (maxScroll + viewH) exacto.
    spacer.style.height = inner.scrollHeight + "px";

    requestTick();
  }

  let ticking = false;
  function requestTick(){
    if(ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      ticking = false;

      const yRaw = window.scrollY;
      const y = Math.min(maxScroll, Math.max(0, yRaw));

      inner.style.transform = `translate3d(0, ${-y}px, 0)`;

      // si por cualquier razón el body se pasa del rango, lo corregimos
      // (esto elimina ese “extra” al final)
      if (yRaw > maxScroll) window.scrollTo(0, maxScroll);
    });
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", recalc);
  window.addEventListener("load", recalc);

  // Recalcula si cambia el alto del contenido (render, fuentes, etc.)
  const ro = new ResizeObserver(recalc);
  ro.observe(inner);

  // Recalcula cuando cargan imágenes dentro del panel derecho (por si acaso)
  inner.querySelectorAll("img").forEach(img => {
    if (!img.complete) img.addEventListener("load", recalc, { once: true });
  });

  recalc();
})();