// main.js

/* =========================
   Render Tour Dates
========================= */
(function renderDates() {
  const root = document.getElementById("dates");
  if (!root) return;

  const dates = Array.isArray(window.TOUR_DATES) ? window.TOUR_DATES : [];

  if (!dates.length) {
    root.innerHTML = "";
    return;
  }

  dates.sort((a, b) => (a.dateISO || "").localeCompare(b.dateISO || ""));

  const now = Date.now();

  root.innerHTML = dates
    .map((d, i) => {
      const city = escapeHtml(d.city || "");
      const country = escapeHtml(d.country || "");
      const venue = escapeHtml(d.venue || "");
      const date = formatDDMM(d.dateISO);

      const url = (d.ticketUrl || "").trim();

      const isSoldOut = d.soldOut === true;
      const isNew = d.isNew === true || d.isNew === "true" || d.isNew === 1;

      const saleStart = d.saleStartUTC ? Date.parse(d.saleStartUTC) : null;
      const canBuy = !!url && (saleStart === null || now >= saleStart);

      const iconSrc = isNew ? "./assets/assets_new.svg" : "./assets/assets.svg";

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
   Render Merch
========================= */
(function renderMerch() {
  const track = document.getElementById("merchTrack");
  if (!track) return;

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
   Wheel horizontal en merch
========================= */
(function enableMerchWheel() {
  document.addEventListener("wheel", (e) => {
    const track = e.target.closest?.(".merch__track");
    if (!track) return;

    const canScroll = track.scrollWidth > track.clientWidth + 2;
    if (!canScroll) return;

    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      track.scrollLeft += e.deltaY;
    }
  }, { passive: false });
})();

/* =========================
   Helpers
========================= */
function formatDDMM(dateISO) {
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
========================= */
(function lockScrollToRightPanel(){
  // En mobile NO usamos fake scroll
  if (window.matchMedia("(max-width: 900px)").matches) return;

  const layout = document.querySelector(".layout");
  const inner  = document.querySelector(".right__inner");
  const spacer = document.getElementById("scroll-spacer");
  const fullband = document.getElementById("fullband");

  if(!layout || !inner || !spacer || !fullband) return;

  let maxRight = 0;   // cuánto “recorre” la derecha
  let bandH = 0;      // alto total del merch (fullband)
  let totalMax = 0;   // scroll total

  function viewH(){
    return document.documentElement.clientHeight;
  }

  function recalc(){
    const vh = viewH();

    // Derecha: recorrido = scrollHeight - viewport
    const rightH = inner.scrollHeight;
    maxRight = Math.max(0, rightH - vh);

    // Banda: alto real del contenido
    bandH = fullband.scrollHeight;

    // Scroll total: derecha + banda
    totalMax = maxRight + bandH;

    // Documento fake: viewport + totalMax
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

      // A) mover derecha hasta su final
      const yRight = Math.min(maxRight, y);
      inner.style.transform = `translate3d(0, ${-yRight}px, 0)`;

      // B) cuando se acaba la derecha, se mueve TODO el split y entra la banda
      const yBand = Math.max(0, y - maxRight);
      layout.style.transform   = `translate3d(0, ${-yBand}px, 0)`;
      fullband.style.transform = `translate3d(0, ${-yBand}px, 0)`;

      // clamp total
      if (yRaw > totalMax) window.scrollTo(0, totalMax);
    });
  }

  window.addEventListener("scroll", tick, { passive: true });
  window.addEventListener("resize", recalc);
  window.addEventListener("load", recalc);

  const ro = new ResizeObserver(recalc);
  ro.observe(inner);
  ro.observe(fullband);

  // por si cargan imágenes dentro del panel derecho
  inner.querySelectorAll("img").forEach(img => {
    if (!img.complete) img.addEventListener("load", recalc, { once: true });
  });

  recalc();
})();