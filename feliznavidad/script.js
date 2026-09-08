/* =========================================
   SNOW EFFECT
========================================= */

const snowCanvas = document.getElementById("snow-canvas");
const ctx = snowCanvas.getContext("2d");

let width;
let height;
let snowflakes = [];

const snowConfig = {
  desktopCount: 105,
  mobileCount: 55,

  minSize: 2.2,
  maxSize: 7.5,

  minSpeed: 0.5,
  maxSpeed: 2,

  minOpacity: 0.22,
  maxOpacity: 0.8,

  wind: 0.08
};


/* =========================================
   RESIZE
========================================= */

function resizeSnowCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  width = window.innerWidth;
  height = window.innerHeight;

  snowCanvas.width = width * dpr;
  snowCanvas.height = height * dpr;

  snowCanvas.style.width = `${width}px`;
  snowCanvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  createSnowflakes();
}


/* =========================================
   CREATE SNOWFLAKES
========================================= */

function createSnowflakes() {
  const isMobile = window.innerWidth <= 600;

  const count = isMobile
    ? snowConfig.mobileCount
    : snowConfig.desktopCount;

  snowflakes = [];

  for (let i = 0; i < count; i++) {
    snowflakes.push(createSnowflake(true));
  }
}


function createSnowflake(randomY = false) {
  const size =
    Math.random() *
      (snowConfig.maxSize - snowConfig.minSize) +
    snowConfig.minSize;

  const speed =
    Math.random() *
      (snowConfig.maxSpeed - snowConfig.minSpeed) +
    snowConfig.minSpeed;

  const opacity =
    Math.random() *
      (snowConfig.maxOpacity - snowConfig.minOpacity) +
    snowConfig.minOpacity;

  /*
    Tipos:
    0 = pequeño / estrella
    1 = copo simple
    2 = copo detallado
  */

  const randomType = Math.random();

  let type;

  if (randomType < 0.55) {
    type = 0;
  } else if (randomType < 0.88) {
    type = 1;
  } else {
    type = 2;
  }

  return {
    x: Math.random() * width,

    y: randomY
      ? Math.random() * height
      : -15,

    size,
    speed,
    opacity,

    type,

    drift: Math.random() * 0.35 - 0.175,

    phase: Math.random() * Math.PI * 2,

    phaseSpeed:
      Math.random() * 0.008 + 0.003,

    rotation:
      Math.random() * Math.PI * 2,

    rotationSpeed:
      (Math.random() - 0.5) * 0.004
  };
}


/* =========================================
   SMALL STAR
========================================= */

function drawSmallStar(flake) {
  const size = flake.size * 0.75;

  ctx.beginPath();

  ctx.moveTo(-size, 0);
  ctx.lineTo(size, 0);

  ctx.moveTo(0, -size);
  ctx.lineTo(0, size);

  ctx.moveTo(-size * 0.65, -size * 0.65);
  ctx.lineTo(size * 0.65, size * 0.65);

  ctx.moveTo(size * 0.65, -size * 0.65);
  ctx.lineTo(-size * 0.65, size * 0.65);

  ctx.stroke();
}


/* =========================================
   SIMPLE SNOWFLAKE
========================================= */

function drawSimpleSnowflake(flake) {
  const size = flake.size;

  for (let i = 0; i < 3; i++) {
    ctx.rotate(Math.PI / 3);

    ctx.beginPath();

    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);

    ctx.stroke();
  }
}


/* =========================================
   DETAILED SNOWFLAKE
========================================= */

function drawDetailedSnowflake(flake) {
  const size = flake.size;

  for (let i = 0; i < 3; i++) {
    ctx.rotate(Math.PI / 3);

    ctx.beginPath();

    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);

    ctx.stroke();

    const branchPosition = size * 0.55;
    const branchSize = size * 0.28;

    ctx.beginPath();

    ctx.moveTo(branchPosition, 0);

    ctx.lineTo(
      branchPosition - branchSize,
      -branchSize
    );

    ctx.moveTo(branchPosition, 0);

    ctx.lineTo(
      branchPosition - branchSize,
      branchSize
    );

    ctx.moveTo(-branchPosition, 0);

    ctx.lineTo(
      -branchPosition + branchSize,
      -branchSize
    );

    ctx.moveTo(-branchPosition, 0);

    ctx.lineTo(
      -branchPosition + branchSize,
      branchSize
    );

    ctx.stroke();
  }
}


/* =========================================
   DRAW ONE FLAKE
========================================= */

function drawSnowflake(flake) {
  ctx.save();

  ctx.translate(flake.x, flake.y);

  ctx.rotate(flake.rotation);

  ctx.strokeStyle =
    `rgba(255, 255, 255, ${flake.opacity})`;

  ctx.lineWidth =
    flake.type === 2
      ? Math.max(0.55, flake.size * 0.11)
      : Math.max(0.45, flake.size * 0.1);

  ctx.lineCap = "round";

  /*
    Glow muy leve.
    Solo los copos medianos/grandes lo tienen.
  */

  if (flake.size > 3) {
    ctx.shadowColor =
      `rgba(255, 255, 255, ${flake.opacity * 0.22})`;

    ctx.shadowBlur = flake.size * 0.8;
  }

  if (flake.type === 0) {
    drawSmallStar(flake);
  }

  if (flake.type === 1) {
    drawSimpleSnowflake(flake);
  }

  if (flake.type === 2) {
    drawDetailedSnowflake(flake);
  }

  ctx.restore();
}


/* =========================================
   ANIMATION
========================================= */

function drawSnow() {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < snowflakes.length; i++) {
    const flake = snowflakes[i];

    flake.phase += flake.phaseSpeed;
    flake.rotation += flake.rotationSpeed;

    flake.y += flake.speed;

    /*
      Movimiento lateral orgánico.
    */

    flake.x +=
      snowConfig.wind +
      flake.drift +
      Math.sin(flake.phase) * 0.12;

    /*
      Si llega abajo, vuelve a entrar arriba.
    */

    if (flake.y > height + 20) {
      snowflakes[i] = createSnowflake(false);
      continue;
    }

    /*
      Wrap horizontal.
    */

    if (flake.x > width + 20) {
      flake.x = -20;
    }

    if (flake.x < -20) {
      flake.x = width + 20;
    }

    drawSnowflake(flake);
  }

  requestAnimationFrame(drawSnow);
}


/* =========================================
   INIT
========================================= */

window.addEventListener(
  "resize",
  resizeSnowCanvas
);

resizeSnowCanvas();
drawSnow();