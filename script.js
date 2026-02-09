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
    // Shorter cooldown on mobile for more responsive movement
    const isMobile = window.innerWidth <= 480;
    const FLEE_COOLDOWN_MS = isMobile ? 280 : 420;

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

      // Make "Yes" grow slowly and mostly horizontally - NO CAP, keeps growing forever!
      // Growth rate: 0.04 per attempt horizontally, 0.013 vertically
      // After 15 attempts: scaleX = 1.6, scaleY = 1.195
      // After 30 attempts: scaleX = 2.2, scaleY = 1.39
      // After 50 attempts: scaleX = 3.0, scaleY = 1.65
      // It will keep growing indefinitely!
      const scaleX = 1 + noAttempts * 0.04;
      const scaleY = 1 + noAttempts * 0.013;
      
      // Directly set transform - no limits, ensure it works on mobile too
      yesBtn.style.setProperty('transform', `scaleX(${scaleX}) scaleY(${scaleY})`, 'important');
      yesBtn.style.setProperty('-webkit-transform', `scaleX(${scaleX}) scaleY(${scaleY})`, 'important');

      // Change the "No" button text each time (more variety)
      // Use modulo so it keeps changing instead of getting stuck on the last message.
      const idx = (noAttempts - 1) % noMessages.length;
      noBtn.textContent = noMessages[idx];
    }

    function isPointInYesButton(x, y) {
      const yesRect = yesBtn.getBoundingClientRect();
      return (
        x >= yesRect.left &&
        x <= yesRect.right &&
        y >= yesRect.top &&
        y <= yesRect.bottom
      );
    }

    function getYesButtonBounds() {
      const yesRect = yesBtn.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();
      return {
        left: yesRect.left - contRect.left - 20, // extra padding
        right: yesRect.right - contRect.left + 20,
        top: yesRect.top - contRect.top - 20,
        bottom: yesRect.bottom - contRect.top + 20,
      };
    }

    function fleeFrom(clientX, clientY, force = false) {
      if (!container) return;
      if (!isValentineScreenActive()) return;

      const now = Date.now();
      if (!force && now - lastFleeAt < FLEE_COOLDOWN_MS) return;
      lastFleeAt = now;

      const contRect = container.getBoundingClientRect();
      const noRect = noBtn.getBoundingClientRect();
      const yesBounds = getYesButtonBounds();

      const padding = 12;
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

      // More random movement - sometimes jump far, sometimes medium, always unpredictable
      // On mobile, make jumps consistently larger for better randomness
      const isMobile = window.innerWidth <= 480;
      const baseJump = isMobile ? 180 : 240;
      const jumpVariation = isMobile ? 250 : 200;
      // Add more randomness - sometimes jump very far, sometimes medium
      const jumpMultiplier = Math.random() < 0.3 ? 1.5 : (Math.random() < 0.6 ? 1.0 : 0.7);
      const jump = (baseJump + Math.random() * jumpVariation) * jumpMultiplier;
      const jitter = isMobile ? 100 : 70; // More jitter on mobile for randomness

      const currentLeft = noRect.left - contRect.left;
      const currentTop = noRect.top - contRect.top;

      let attempts = 0;
      let left, top;
      let noBtnWidth = noRect.width;
      let noBtnHeight = noRect.height;

      // Add extra randomness - sometimes move in completely different direction
      const randomDirection = Math.random() < 0.25; // 25% chance to ignore pointer direction
      if (randomDirection) {
        dx = (Math.random() - 0.5) * 2;
        dy = (Math.random() - 0.5) * 2;
        const newMag = Math.hypot(dx, dy) || 1;
        dx /= newMag;
        dy /= newMag;
      }

      // Try to find a position that avoids Yes button area
      do {
        // More random positioning with larger jitter
        left = currentLeft + dx * jump + (Math.random() - 0.5) * jitter * 1.5;
        top = currentTop + dy * jump + (Math.random() - 0.5) * jitter * 1.5;

        // Clamp to container bounds
        left = clamp(left, padding, Math.max(maxLeft, padding));
        top = clamp(top, padding, Math.max(maxTop, padding));

        // Check if this position overlaps with Yes button
        const noLeft = left;
        const noRight = left + noBtnWidth;
        const noTop = top;
        const noBottom = top + noBtnHeight;

        const overlapsYes =
          noRight >= yesBounds.left &&
          noLeft <= yesBounds.right &&
          noBottom >= yesBounds.top &&
          noTop <= yesBounds.bottom;

        if (!overlapsYes || attempts > 8) break;
        attempts++;

        // If overlapping, try moving further away
        dx += (Math.random() - 0.5) * 0.3;
        dy += (Math.random() - 0.5) * 0.3;
        const newMag = Math.hypot(dx, dy) || 1;
        dx /= newMag;
        dy /= newMag;
      } while (attempts < 10);

      noBtn.style.left = `${left}px`;
      noBtn.style.top = `${top}px`;

      registerFlee();
    }

    // Initial placement (so absolute positioning starts nicely, avoiding Yes button)
    requestAnimationFrame(() => {
      if (!container) return;
      const contRect = container.getBoundingClientRect();
      const yesBounds = getYesButtonBounds();
      
      // Try to place No button away from Yes button initially
      let initialLeft = contRect.width * 0.7;
      let initialTop = contRect.height * 0.3;
      
      // If it would overlap, move it
      if (
        initialLeft + noBtn.offsetWidth >= yesBounds.left &&
        initialLeft <= yesBounds.right &&
        initialTop + noBtn.offsetHeight >= yesBounds.top &&
        initialTop <= yesBounds.bottom
      ) {
        initialLeft = contRect.width * 0.15;
        initialTop = contRect.height * 0.6;
      }
      
      placeNoButton(initialLeft, initialTop);
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

