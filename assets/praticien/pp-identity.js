// Fond et mouvements typographiques adaptés de la page d’accueil de Pratiques et pratiques.
// https://pratiquesetpratiques.github.io/fr/about.html
(() => {
  "use strict";

  const backgroundFonts = ["Space Mono", "Special Elite", "Archivo", "Archivo Black", "Homemade Apple"];
  const headingFonts = ["Archivo Black", "Special Elite", "Archivo", "Space Mono", "Homemade Apple"];
  const hieroglyphFont = "Noto Sans Egyptian Hieroglyphs";
  const greekFont = "Noto Sans";
  const hieroglyphs = { a: "𓄿", q: "𓈎", i: "𓇋", t: "𓏏", m: "𓅓" };
  const greek = { p: "π", a: "α", t: "τ", i: "ι", e: "ε" };
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const globeMotion = document.getElementById("globe-stage")?.dataset.motion;
  let paused = globeMotion === "paused" || (globeMotion !== "running" && motion.matches);
  const canvas = document.createElement("canvas");
  canvas.id = "pp-identity-background";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const context = canvas.getContext("2d");
  const glyphs = [];
  const backgroundStamps = new Map();

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let startedAt = null;
  let elapsed = 0;
  let ready = false;
  let lastBackground = -Infinity;
  let lastHeading = -Infinity;
  let frame = 0;

  const word = "pratiques";
  const fontSize = 13;
  const columnWidth = 18;
  const characterHeight = 16;
  const wordHeight = word.length * characterHeight;
  const stampSize = 28;
  const headingFontInterval = 12;
  const backgroundInterval = 100;

  function fontAt(phase, fonts) {
    const index = Math.floor((Math.sin(phase) + 1) / 2 * fonts.length) % fonts.length;
    return fonts[index];
  }

  function alternativeGlyphs(letter) {
    const key = letter.toLowerCase();
    const forms = [];
    if (hieroglyphs[key]) forms.push({ letter: hieroglyphs[key], family: hieroglyphFont, size: .75 });
    if (greek[key]) forms.push({ letter: greek[key], family: greekFont, size: .75 });
    return forms;
  }

  function widthForGlyph(letter, weight) {
    if (!context) return undefined;
    let width = 0;
    const fonts = [...headingFonts, "PP Garamond", greekFont];
    const forms = fonts.map(family => ({ letter, family, size: family === "Homemade Apple" ? .75 : 1 }));
    forms.push(...alternativeGlyphs(letter));
    for (const form of forms) {
      context.font = `${weight} ${form.size * 100}px "${form.family}"`;
      width = Math.max(width, context.measureText(form.letter).width);
    }
    return `${(width / 100 + .018).toFixed(3)}em`;
  }

  function prepareHeadings() {
    for (const label of document.querySelectorAll(".pp-action-label")) {
      const letters = Array.from(label.textContent.trim(), (letter, index) => {
        const slot = document.createElement("span");
        slot.className = `f${index % 4 + 1}`;
        slot.textContent = letter === " " ? "\u00a0" : letter;
        return slot;
      });
      if (label.closest("button")?.hasAttribute("aria-label")) label.setAttribute("aria-hidden", "true");
      label.replaceChildren(...letters);
    }
    const families = ":is(.f1, .f2, .f3, .f4)";
    const slots = document.querySelectorAll(`.site-header ${families}, .intro ${families}, .pp-action-label ${families}`);
    for (const slot of slots) {
      const original = slot.textContent;
      const weight = getComputedStyle(slot).fontWeight;
      const character = document.createElement("span");
      character.className = "pp-type-character";
      character.textContent = original;
      const width = slot.closest(".site-header")
        ? `${slot.getBoundingClientRect().width * 1.8}px`
        : widthForGlyph(original, weight);
      if (width) slot.style.setProperty("--pp-glyph-width", width);
      slot.classList.add("pp-type-glyph");
      slot.replaceChildren(character);
      glyphs.push({ element: character, original, alternatives: alternativeGlyphs(original) });
    }
  }

  function backgroundStamp(letter, family, size) {
    const key = family + ":" + size + ":" + letter;
    if (backgroundStamps.has(key)) return backgroundStamps.get(key);

    const stamp = document.createElement("canvas");
    stamp.width = stamp.height = Math.ceil(stampSize * pixelRatio);
    const paint = stamp.getContext("2d");
    const scale = stamp.width / stampSize;
    paint.setTransform(scale, 0, 0, scale, 0, 0);
    paint.textAlign = "center";
    paint.textBaseline = "middle";
    paint.fillStyle = "#fff";
    paint.font = `${size}px "${family}"`;
    paint.fillText(letter, stampSize / 2, stampSize / 2);
    backgroundStamps.set(key, stamp);
    return stamp;
  }

  function drawBackground(time) {
    if (!ready || !context || !width || !height) return;

    context.clearRect(0, 0, width, height);

    const rows = Math.ceil((height + wordHeight * 2) / characterHeight);
    const columns = Math.ceil(width / columnWidth) + 1;
    const span = height + wordHeight;
    const scroll = time % wordHeight;

    for (let column = 0; column < columns; column++) {
      const x = column * columnWidth + columnWidth / 2;
      const dx = (x - width / 2) / (width / 2);
      const stagger = column % 2 === 0 ? 0 : wordHeight / 2;
      const columnFonts = Array.from(word, (_, index) => fontAt(column * .9 + index * .5 + time * .28, backgroundFonts));

      for (let row = 0; row < rows; row++) {
        const rawY = row * characterHeight + stagger + scroll - wordHeight;
        const y = ((rawY % span) + span) % span - wordHeight;
        if (y < -characterHeight || y > height + characterHeight) continue;

        const index = row % word.length;
        const letter = word[index];
        const position = column * 97 + row;
        const slot = Math.floor(time * .06 + position / 7);
        const hieroglyph = position % 7 === slot % 7 ? hieroglyphs[letter] : "";
        const dy = (y - height / 2) / (height / 2);
        context.globalAlpha = Math.min(.6, .03 + (dx * dx + dy * dy) * .6);
        const family = hieroglyph ? hieroglyphFont : columnFonts[index];
        const size = hieroglyph ? Math.round(fontSize * .75) : fontSize;
        const stamp = backgroundStamp(hieroglyph || letter, family, size);
        context.drawImage(stamp, x - stampSize / 2, y - stampSize / 2, stampSize, stampSize);
      }
    }
    context.globalAlpha = 1;
  }

  function resize() {
    if (!context) return;
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (ratio !== pixelRatio) backgroundStamps.clear();
    pixelRatio = ratio;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const activeTime = startedAt === null ? 0 : performance.now() - startedAt;
    drawBackground((elapsed + activeTime) / 1000);
  }

  function updateHeadings(time, animate) {
    glyphs.forEach((glyph, index) => {
      const { element, original, alternatives } = glyph;
      const fontStep = animate ? Math.floor(time / headingFontInterval + index * .37) : -1;
      if (glyph.fontStep !== fontStep) {
        const phase = index + fontStep;
        const alternate = animate && alternatives.length && phase % 7 === 0
          ? alternatives[phase % alternatives.length]
          : null;
        const letter = alternate?.letter ?? original;
        const family = alternate?.family ?? (animate ? headingFonts[phase % headingFonts.length] : "");
        const scale = alternate?.size ?? (family === "Homemade Apple" ? .75 : 1);
        if (element.textContent !== letter) element.textContent = letter;
        element.style.fontFamily = family ? `"${family}"` : "";
        element.style.fontSize = scale === 1 ? "" : `${scale}em`;
        glyph.fontStep = fontStep;
      }
    });
  }

  function tick(timestamp) {
    const seconds = Math.max(0, (elapsed + timestamp - startedAt) / 1000);
    if (timestamp - lastBackground >= backgroundInterval) {
      drawBackground(seconds);
      lastBackground = timestamp;
    }
    if (timestamp - lastHeading >= 80) {
      updateHeadings(seconds, true);
      lastHeading = timestamp;
    }
    frame = requestAnimationFrame(tick);
  }

  function syncMotion() {
    cancelAnimationFrame(frame);
    document.body.classList.toggle("pp-motion-paused", paused);
    const now = performance.now();
    if (startedAt !== null) elapsed += now - startedAt;
    startedAt = null;
    if (!ready) return;

    if (paused) {
      drawBackground(elapsed / 1000);
      updateHeadings(elapsed / 1000, false);
    } else {
      startedAt = now;
      lastBackground = -Infinity;
      lastHeading = -Infinity;
      frame = requestAnimationFrame(tick);
    }
  }

  function setPaused(value) {
    if (paused === value) return;
    paused = value;
    syncMotion();
  }

  document.addEventListener("praticien:motion", event => {
    if (typeof event.detail?.paused === "boolean") setPaused(event.detail.paused);
  });
  if (!globeMotion) motion.addEventListener("change", () => setPaused(motion.matches));
  resize();

  const faceSamples = [
    ...[...headingFonts, "PP Garamond", greekFont].flatMap(family =>
      [400, 700].map(weight => [`${weight} 16px "${family}"`, "Le Praticien · Tous les numéros"])),
    [`16px "${hieroglyphFont}"`, Object.values(hieroglyphs).join("")],
    [`16px "${greekFont}"`, Object.values(greek).join("")]
  ];

  Promise.allSettled(faceSamples.map(([font, sample]) => document.fonts.load(font, sample)))
    .then(() => {
      prepareHeadings();
      ready = true;
      syncMotion();
    });

  window.addEventListener("resize", resize, { passive: true });
})();
