// main.js
(function () {
  const root = document.getElementById("dates");
  if (!root) return;

  const dates = Array.isArray(window.TOUR_DATES) ? window.TOUR_DATES : [];

  // Orden por fecha
  dates.sort((a, b) => (a.dateISO || "").localeCompare(b.dateISO || ""));

  const now = Date.now();

  root.innerHTML = dates
    .map((d, i) => {
      const city = escapeHtml(d.city || "");
      const country = escapeHtml(d.country || "");
      const venue = escapeHtml(d.venue || "");
      const date = formatDDMM(d.dateISO);

      const url = (d.ticketUrl || "").trim();

      // NUEVO: sold out manual
      const isSoldOut = d.soldOut === true;

      // saleStartUTC es OPCIONAL:
      // - si existe: habilita el botón cuando llegue esa hora
      // - si NO existe: si hay link, se habilita de inmediato
      const saleStart = d.saleStartUTC ? Date.parse(d.saleStartUTC) : null;
      const canBuy = !!url && (saleStart === null || now >= saleStart);

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
            ${ctaHtml}
          </div>
        </article>
      `;
    })
    .join("");
})();

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


(function renderMerch(){
  const track = document.getElementById("merchTrack");
  if (!track) return;

  // Cambia los src a los nombres reales de tus .webp en /assets
  const merch = [
    {
      name: "La Octava Maravilla Tour Tee - Black",
      price: "$45.00",
      url: "https://shop.la8vamaravilla.com/products/la-octava-maravilla-tour-tee-black?variant=52043042947365",
      img: "./assets/merch-tee-black.webp"
    },
    {
      name: "La Octava Maravilla Tour Tee - Dark Gray",
      price: "$45.00",
      url: "https://shop.la8vamaravilla.com/products/la-octava-maravilla-tour-tee-gray?variant=52043040588069",
      img: "./assets/merch-tee-dark-gray.webp"
    },
    {
      name: "La Octava Maravilla Tour Tee - Light Gray",
      price: "$45.00",
      url: "https://shop.la8vamaravilla.com/products/la-octava-maravilla-tour-tee-light-gray?variant=52043021615397",
      img: "./assets/merch-tee-light-gray.webp"
    },
    {
      name: "La Octava Maravilla Tour Hoodie - Black",
      price: "$100.00",
      url: "https://shop.la8vamaravilla.com/products/la-octava-maravilla-tour-hoodie-black?variant=52039130644773",
      img: "./assets/merch-hoodie-black.webp"
    },
    {
      name: "La Octava Maravilla Tour Hoodie - Dark Gray",
      price: "$100.00",
      url: "https://shop.la8vamaravilla.com/products/la-octava-maravilla-tour-hoodie-dark-gray?variant=52039128514853",
      img: "./assets/merch-hoodie-dark-gray.webp"
    },
    {
      name: "La Octava Maravilla Tour Hoodie - Light Gray",
      price: "$100.00",
      url: "https://shop.la8vamaravilla.com/products/la-octava-maravilla-tour-hoodie-light-gray?variant=52039118520613",
      img: "./assets/merch-hoodie-light-gray.webp"
    }
  ];

  track.innerHTML = merch.map((p) => `
    <a class="merch-card" href="${escapeAttr(p.url)}" target="_blank" rel="noopener">
      <div class="merch-card__media">
        <img class="merch-card__img" src="${escapeAttr(p.img)}" alt="${escapeHtml(p.name)}" loading="lazy" />
      </div>
      <div class="merch-card__meta">
        <div class="merch-card__name">${escapeHtml(p.name)}</div>
        <div class="merch-card__price">${escapeHtml(p.price)}</div>
      </div>
    </a>
  `).join("");
})();



/* =========================
   Fake scroll (desktop)
   - scroll en cualquier parte
   - solo se mueve .right__inner
========================= */
(function lockScrollToRightPanel(){
  if (window.matchMedia("(max-width: 900px)").matches) return;

  const layout = document.querySelector(".layout");
  const inner  = document.querySelector(".right__inner");
  const spacer = document.getElementById("scroll-spacer");
  const fullband = document.getElementById("fullband");
  if(!layout || !inner || !spacer || !fullband) return;

  let maxRight = 0;   // scroll máximo del panel derecho
  let fullH = 0;      // alto del merch
  let totalMax = 0;   // scroll total

  function viewH(){
    return document.documentElement.clientHeight;
  }

  function recalc(){
    const vh = viewH();

    // cuánto recorre la derecha
    const rightH = inner.scrollHeight;
    maxRight = Math.max(0, rightH - vh);

    // alto real de la franja
    fullH = fullband.scrollHeight;

    // scroll total = derecha + franja
    totalMax = maxRight + fullH;

    // altura del documento fake
    spacer.style.height = (vh + totalMax) + "px";

    tick();
  }

  let ticking = false;
  function tick(){
    if(ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      ticking = false;

      const yRaw = window.scrollY;
      const y = Math.min(totalMax, Math.max(0, yRaw));

      // 1) derecha: se mueve hasta su final
      const yRight = Math.min(maxRight, y);
      inner.style.transform = `translate3d(0, ${-yRight}px, 0)`;

      // 2) extra scroll: ya terminó la derecha => ahora se mueven ambas columnas + entra merch
      const yBand = Math.max(0, y - maxRight);

      layout.style.transform   = `translate3d(0, ${-yBand}px, 0)`;
      fullband.style.transform = `translate3d(0, ${-yBand}px, 0)`;

      if (yRaw > totalMax) window.scrollTo(0, totalMax);
    });
  }

  window.addEventListener("scroll", tick, { passive: true });
  window.addEventListener("resize", recalc);
  window.addEventListener("load", recalc);

  const ro = new ResizeObserver(recalc);
  ro.observe(inner);
  ro.observe(fullband);

  inner.querySelectorAll("img").forEach(img => {
    if (!img.complete) img.addEventListener("load", recalc, { once: true });
  });

  recalc();
})();