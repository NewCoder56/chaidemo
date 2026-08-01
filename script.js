/* ============================================================
   CONFIG
   ============================================================ */
// 3 August 2026, 12:00 AM Pakistan Standard Time (UTC+5)
// = 2 August 2026, 19:00:00 UTC — fixed offset regardless of visitor's timezone.
const TARGET_UTC_MS = Date.parse("2024-01-01T00:00:00Z");
const SECRET_NAME = "chai";

/* ============================================================
   LOADER
   ============================================================ */
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").classList.add("loader-hide");
  }, 900);
});

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
const scrollProgress = document.getElementById("scrollProgress");
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = pct + "%";

  const backToTop = document.getElementById("backToTop");
  if (scrollTop > 400) backToTop.classList.remove("hidden");
  else backToTop.classList.add("hidden");
}
window.addEventListener("scroll", updateScrollProgress, { passive: true });

document.getElementById("backToTop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ============================================================
   LIVE CLOCK + DATE (visitor's local time, for a friendly touch)
   ============================================================ */
const liveClockEl = document.getElementById("liveClock");
const liveDateEl = document.getElementById("liveDate");

function pad(n) { return String(n).padStart(2, "0"); }

function updateLiveClock() {
  const now = new Date();
  liveClockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  liveDateEl.textContent = now.toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
}
updateLiveClock();
setInterval(updateLiveClock, 1000);

/* ============================================================
   COUNTDOWN (Pakistan Standard Time target, timezone-safe)
   ============================================================ */
const cdDays = document.getElementById("cd-days");
const cdHours = document.getElementById("cd-hours");
const cdMinutes = document.getElementById("cd-minutes");
const cdSeconds = document.getElementById("cd-seconds");
const lockedBtn = document.getElementById("lockedBtn");
const openBtn = document.getElementById("openBtn");
const unlockNote = document.getElementById("unlockNote");

let unlocked = false;

function updateCountdown() {
  const nowMs = Date.now();
  const diff = TARGET_UTC_MS - nowMs;

  if (diff <= 0) {
    cdDays.textContent = "00";
    cdHours.textContent = "00";
    cdMinutes.textContent = "00";
    cdSeconds.textContent = "00";
    if (!unlocked) revealUnlock();
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  cdDays.textContent = pad(days);
  cdHours.textContent = pad(hours);
  cdMinutes.textContent = pad(minutes);
  cdSeconds.textContent = pad(seconds);
}

function revealUnlock() {
  unlocked = true;
  lockedBtn.classList.add("hidden");
  openBtn.classList.remove("hidden");
  unlockNote.textContent = "Your surprise is ready. Tap the button above.";
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ============================================================
   PAGE NAVIGATION
   ============================================================ */
const page1 = document.getElementById("page1");
const page2 = document.getElementById("page2");
const page3 = document.getElementById("page3");

function goToPage(fromPage, toPage) {
  fromPage.classList.add("page-transition-out");
  setTimeout(() => {
    fromPage.classList.add("hidden");
    fromPage.classList.remove("page-transition-out");
    toPage.classList.remove("hidden");
    toPage.classList.add("page-transition-in");
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    setTimeout(() => toPage.classList.remove("page-transition-in"), 750);
  }, 550);
}

openBtn.addEventListener("click", () => {
  goToPage(page1, page2);
  setTimeout(() => document.getElementById("secretInput").focus(), 700);
});

/* ============================================================
   SECRET NAME GATE
   ============================================================ */
const secretForm = document.getElementById("secretForm");
const secretInput = document.getElementById("secretInput");
const secretError = document.getElementById("secretError");
const secretSuccess = document.getElementById("secretSuccess");

secretForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = secretInput.value.trim().toLowerCase();

  if (value !== SECRET_NAME) {
    secretError.classList.remove("hidden");
    secretInput.style.borderColor = "#c96a80";
    secretForm.style.animation = "none";
    // force reflow so the shake can replay
    void secretForm.offsetWidth;
    secretForm.style.animation = "shake 0.4s ease";
    return;
  }

  secretError.classList.add("hidden");
  secretForm.classList.add("hidden");
  secretSuccess.classList.remove("hidden");

  setTimeout(() => {
    goToPage(page2, page3);
    startCelebration();
  }, 1100);
});

/* ============================================================
   CELEBRATION: confetti, fireworks, typewriter, ambient hearts
   ============================================================ */
let celebrationStarted = false;

function startCelebration() {
  if (celebrationStarted) return;
  celebrationStarted = true;

  launchConfettiBurst();
  startFireworks();
  runTypewriter();
  seedAmbient("celebration");
}

/* ---- Typewriter effect ---- */
function runTypewriter() {
  const el = document.getElementById("typewriterLine");
  const text = "a little celebration, just for you";
  let i = 0;
  el.textContent = "";
  const interval = setInterval(() => {
    el.textContent += text.charAt(i);
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      setTimeout(() => { el.style.borderRight = "none"; }, 900);
    }
  }, 45);
}

/* ---- Confetti (canvas) ---- */
const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");
let confettiPieces = [];
const confettiColors = ["#e8b4a8", "#d9b66a", "#cbb9f0", "#f7d9e3", "#fff", "#f0dcae"];

function resizeCanvases() {
  [confettiCanvas, document.getElementById("fireworksCanvas")].forEach(c => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  });
}
resizeCanvases();
window.addEventListener("resize", resizeCanvases);

function launchConfettiBurst() {
  confettiPieces = [];
  const count = 140;
  for (let i = 0; i < count; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * confettiCanvas.height * 0.5,
      w: 6 + Math.random() * 5,
      h: 8 + Math.random() * 6,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      speedY: 1.5 + Math.random() * 2.5,
      speedX: -1 + Math.random() * 2,
      rotation: Math.random() * 360,
      rotationSpeed: -6 + Math.random() * 12,
      opacity: 1,
    });
  }
  requestAnimationFrame(animateConfetti);

  // gentle trickle after initial burst
  setTimeout(() => {
    const trickle = setInterval(() => {
      if (!document.getElementById("page3") || document.getElementById("page3").classList.contains("hidden")) {
        clearInterval(trickle);
        return;
      }
      for (let i = 0; i < 3; i++) {
        confettiPieces.push({
          x: Math.random() * confettiCanvas.width,
          y: -20,
          w: 5 + Math.random() * 4,
          h: 7 + Math.random() * 5,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          speedY: 1 + Math.random() * 2,
          speedX: -1 + Math.random() * 2,
          rotation: Math.random() * 360,
          rotationSpeed: -6 + Math.random() * 12,
          opacity: 1,
        });
      }
    }, 900);
  }, 2500);
}

let confettiRunning = false;
function animateConfetti() {
  confettiRunning = true;
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiPieces.forEach(p => {
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotationSpeed;
    if (p.y > confettiCanvas.height + 20) p.opacity -= 0.02;

    confettiCtx.save();
    confettiCtx.globalAlpha = Math.max(p.opacity, 0);
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    confettiCtx.restore();
  });

  confettiPieces = confettiPieces.filter(p => p.opacity > 0 && p.y < confettiCanvas.height + 50);

  if (document.getElementById("page3") && !document.getElementById("page3").classList.contains("hidden")) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiRunning = false;
  }
}

/* ---- Soft Fireworks (canvas) ---- */
const fireworksCanvas = document.getElementById("fireworksCanvas");
const fwCtx = fireworksCanvas.getContext("2d");
let fwParticles = [];
let fireworksActive = false;

function spawnFirework() {
  const x = fireworksCanvas.width * (0.2 + Math.random() * 0.6);
  const y = fireworksCanvas.height * (0.2 + Math.random() * 0.35);
  const colors = ["#e8b4a8", "#d9b66a", "#cbb9f0", "#f7d9e3", "#f0dcae"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const particleCount = 26;

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount;
    const speed = 1 + Math.random() * 2;
    fwParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color,
      size: 1.5 + Math.random() * 1.5,
    });
  }
}

function animateFireworks() {
  fwCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

  fwParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.02;
    p.alpha -= 0.012;

    fwCtx.save();
    fwCtx.globalAlpha = Math.max(p.alpha, 0);
    fwCtx.fillStyle = p.color;
    fwCtx.beginPath();
    fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    fwCtx.fill();
    fwCtx.restore();
  });

  fwParticles = fwParticles.filter(p => p.alpha > 0);

  if (fireworksActive) requestAnimationFrame(animateFireworks);
}

function startFireworks() {
  fireworksActive = true;
  requestAnimationFrame(animateFireworks);
  spawnFirework();
  let bursts = 0;
  const fwInterval = setInterval(() => {
    if (document.getElementById("page3").classList.contains("hidden") || bursts >= 6) {
      clearInterval(fwInterval);
      return;
    }
    spawnFirework();
    bursts++;
  }, 1400);
}

/* ============================================================
   AMBIENT LAYER: floating balloons / hearts / sparkles
   ============================================================ */
const ambientLayer = document.getElementById("ambientLayer");
const balloonEmojis = ["🎈", "🎈", "🎈"];
const heartEmojis = ["💗", "💜", "🩷"];
const sparkleEmojis = ["✨", "⭐"];

function createAmbientItem(emoji, size) {
  const el = document.createElement("span");
  el.className = "ambient-item";
  el.textContent = emoji;
  el.style.left = Math.random() * 100 + "%";
  el.style.fontSize = size + "px";
  el.style.setProperty("--drift", (Math.random() * 80 - 40) + "px");
  const duration = 9 + Math.random() * 8;
  el.style.animationDuration = duration + "s";
  el.style.animationDelay = (Math.random() * 6) + "s";
  ambientLayer.appendChild(el);

  setTimeout(() => el.remove(), (duration + 6) * 1000);
}

function seedAmbient(mode) {
  const count = mode === "celebration" ? 10 : 6;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const roll = Math.random();
      if (roll < 0.45) createAmbientItem(balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)], 26 + Math.random() * 16);
      else if (roll < 0.8) createAmbientItem(heartEmojis[Math.floor(Math.random() * heartEmojis.length)], 16 + Math.random() * 10);
      else createAmbientItem(sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)], 14 + Math.random() * 8);
    }, i * 700);
  }
}

// Continuous gentle ambient loop across the whole experience
seedAmbient("landing");
setInterval(() => seedAmbient("landing"), 8000);

/* ============================================================
   BACKGROUND MUSIC (no autoplay)
   ============================================================ */
const musicToggle = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");
const bgMusic = document.getElementById("bgMusic");
let musicPlaying = false;

musicToggle.addEventListener("click", () => {
  if (!musicPlaying) {
    bgMusic.play().catch(() => {
      // Playback blocked or source unavailable — fail silently, keep UI consistent.
    });
    musicIcon.textContent = "❚❚";
    musicToggle.setAttribute("aria-label", "Pause music");
  } else {
    bgMusic.pause();
    musicIcon.textContent = "▶";
    musicToggle.setAttribute("aria-label", "Play music");
  }
  musicPlaying = !musicPlaying;
});