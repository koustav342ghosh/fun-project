// Simple state-based screen navigation
(function () {
  const screens = Array.from(document.querySelectorAll(".screen"));
  const celebrate = document.getElementById("celebrate");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");

  const order = ["intro", "q1", "q2", "q3", "q4", "q5", "valentine", "final"];
  let currentIndex = 0;
  let noAttempts = 0;
  const noMessages = [
    "Think twice 🤔",
    "Are you sure? 😏",
    "Umm… really? 👀",
    "Try again 😌",
    "Not allowed 😈",
    "Bad choice 😤",
    "That button is suspicious…",
    "You meant ‘Yes’ 😇",
    "Nope nope nope 🙅‍♀️",
    "Reconsider! 🥺",
    "Final answer? 😏",
    "Locking in… NO? 🤨",
    "This isn’t KBC 😭",
    "Plot twist: only Yes works ✨",
    "Nice try 😜",
    "Come onnnn 🫶",
    "Be honest 😌",
    "You’re chasing the wrong one 🏃‍♀️",
    "Still no? 😳",
    "Ok now it’s personal 😤",
    "😂",
    "YES is right there 👉",
    "Stoppppp 😭",
    "Last LAST chance 😇",
    "Too late now 😜",
  ];

  function getScreenByName(name) {
    return screens.find((s) => s.dataset.screen === name);
  }

  function showScreenByIndex(index) {
    if (index < 0 || index >= order.length) return;
    const currentName = order[currentIndex];
    const nextName = order[index];
    const current = getScreenByName(currentName);
    const next = getScreenByName(nextName);
    if (!next) return;

    if (current) current.classList.remove("active");
    next.classList.add("active");
    currentIndex = index;
  }

  function goNext() {
    showScreenByIndex(currentIndex + 1);
  }

  // Handle "Start" button on intro
  document.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", goNext);
  });

  // Handle MCQ questions: all options are "correct"
  document.querySelectorAll(".options .option").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Show celebration overlay briefly
      celebrate.classList.remove("hidden");
      celebrate.classList.add("show");

      setTimeout(() => {
        celebrate.classList.remove("show");
        // tiny delay so the fade-out feels smooth before hiding
        setTimeout(() => {
          celebrate.classList.add("hidden");
          goNext();
        }, 180);
      }, 1400);
    });
  });

  // Tricky "No" button behaviour
  if (noBtn && yesBtn) {
    const container = noBtn.parentElement;
    let lastPointer = { x: 0, y: 0 };
    let lastFleeAt = 0;
    const FLEE_COOLDOWN_MS = 420;

    function clamp(v, min, max) {
      return Math.min(Math.max(v, min), max);
    }

    function isValentineScreenActive() {
      const screen = container?.closest?.(".screen");
      return Boolean(screen && screen.classList.contains("active"));
    }

    function placeNoButton(left, top) {
      const contRect = container.getBoundingClientRect();
      const padding = 10;
      const maxLeft = contRect.width - noBtn.offsetWidth - padding;
      const maxTop = contRect.height - noBtn.offsetHeight - padding;

      noBtn.style.left = `${clamp(left, padding, Math.max(maxLeft, padding))}px`;
      noBtn.style.top = `${clamp(top, padding, Math.max(maxTop, padding))}px`;
    }

    function registerFlee() {
      noAttempts += 1;

      // Make "Yes" grow gently (and cap it so it never looks huge)
      const scale = Math.min(1 + noAttempts * 0.04, 1.35);
      yesBtn.style.transform = `scale(${scale})`;

      // Change the "No" button text each time (more variety)
      // Use modulo so it keeps changing instead of getting stuck on the last message.
      const idx = (noAttempts - 1) % noMessages.length;
      noBtn.textContent = noMessages[idx];
    }

    function fleeFrom(clientX, clientY, force = false) {
      if (!container) return;
      if (!isValentineScreenActive()) return;

      const now = Date.now();
      if (!force && now - lastFleeAt < FLEE_COOLDOWN_MS) return;
      lastFleeAt = now;

      const contRect = container.getBoundingClientRect();
      const noRect = noBtn.getBoundingClientRect();

      const padding = 10;
      const maxLeft = contRect.width - noRect.width - padding;
      const maxTop = contRect.height - noRect.height - padding;

      // Vector pointing away from pointer -> button center
      const noCenterX = noRect.left + noRect.width / 2;
      const noCenterY = noRect.top + noRect.height / 2;
      let dx = noCenterX - clientX;
      let dy = noCenterY - clientY;
      const mag = Math.hypot(dx, dy) || 1;
      dx /= mag;
      dy /= mag;

      // Big jump so it's hard to catch
      const jump = 220 + Math.random() * 220;
      const jitter = 60;

      const currentLeft = noRect.left - contRect.left;
      const currentTop = noRect.top - contRect.top;

      const left = currentLeft + dx * jump + (Math.random() - 0.5) * jitter;
      const top = currentTop + dy * jump + (Math.random() - 0.5) * jitter;

      noBtn.style.left = `${clamp(left, padding, Math.max(maxLeft, padding))}px`;
      noBtn.style.top = `${clamp(top, padding, Math.max(maxTop, padding))}px`;

      registerFlee();
    }

    // Initial placement (so absolute positioning starts nicely)
    requestAnimationFrame(() => {
      if (!container) return;
      // place it slightly to the right of center to start
      const contRect = container.getBoundingClientRect();
      placeNoButton(contRect.width * 0.62, contRect.height * 0.25);
    });

    // Desktop: actively flee when pointer gets close (hard to catch)
    container.addEventListener("mousemove", (e) => {
      lastPointer = { x: e.clientX, y: e.clientY };
      if (!isValentineScreenActive()) return;

      const noRect = noBtn.getBoundingClientRect();
      const noCenterX = noRect.left + noRect.width / 2;
      const noCenterY = noRect.top + noRect.height / 2;
      const dist = Math.hypot(noCenterX - e.clientX, noCenterY - e.clientY);

      if (dist < 140) {
        fleeFrom(e.clientX, e.clientY);
      }
    });

    // Extra: if they directly hover the button, jump immediately
    noBtn.addEventListener("mouseenter", (e) => {
      const x = e?.clientX ?? lastPointer.x;
      const y = e?.clientY ?? lastPointer.y;
      fleeFrom(x, y, true);
    });

    // Mobile: run away when they try to tap
    noBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const t = e.touches[0];
      if (t) fleeFrom(t.clientX, t.clientY, true);
    });

    // Mobile: also flee when finger gets close (dragging toward it)
    container.addEventListener(
      "touchmove",
      (e) => {
        if (!isValentineScreenActive()) return;
        const t = e.touches[0];
        if (!t) return;
        e.preventDefault();

        const noRect = noBtn.getBoundingClientRect();
        const noCenterX = noRect.left + noRect.width / 2;
        const noCenterY = noRect.top + noRect.height / 2;
        const dist = Math.hypot(noCenterX - t.clientX, noCenterY - t.clientY);

        if (dist < 160) {
          fleeFrom(t.clientX, t.clientY);
        }
      },
      { passive: false }
    );

    // In case they somehow manage to click/tap it
    noBtn.addEventListener("click", (e) => {
      e.preventDefault();
      fleeFrom(lastPointer.x, lastPointer.y, true);
    });

    // Yes moves to final screen
    yesBtn.addEventListener("click", () => {
      showScreenByIndex(order.indexOf("final"));
    });
  }
})();

