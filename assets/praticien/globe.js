"use strict";

function createGlobe(stage, topicWords, onSelect, locale, displayLabel) {
  const canvas = document.getElementById("globe-lines");
  const controls = document.getElementById("globe-nodes");
  const context = canvas.getContext("2d");
  const paused = new URLSearchParams(location.search).get("animation") === "0";
  const typefaces = ["Archivo Black", "Special Elite", "Archivo", "Space Mono", "Homemade Apple"];
  const colors = ["#241e2a", "#8d3221", "#20415d", "#49306b", "#764061", "#475626"];
  const offsets = [[0, 0], [-9, 0], [9, 0], [0, -9], [0, 9], [-14, -10], [14, 10],
    [-14, 10], [14, -10], [0, -16], [0, 16]];
  const detourOffsets = [...offsets, [0, -32], [0, 32], [0, -54], [0, 54], [-35, 0], [35, 0]];
  const detourDuration = 820;
  const magnification = 1.16;
  const edgePadding = 8;
  const segmenter = typeof Intl.Segmenter === "function" ? new Intl.Segmenter(locale, {granularity: "grapheme"}) : null;
  const gesturePositions = [
    ["Pister une référence", -.49, -.66, .58],
    ["Lire les sarcophages", .45, -.43, .78],
    ["Chercher en quatre langues", -.65, .04, .76],
    ["Faire circuler une revue", .57, .08, .82],
    ["Chanter en égyptien ancien", -.43, .58, .68],
    ["Dater un strigile", .45, .45, .69],
    ["Exposer avec l’IA", -.91, .17, -.42],
    ["Filmer l’Égypte", .81, .29, -.52],
    ["Mesurer l’audience", .24, -.55, -.80]
  ];
  const frontPoints = [];
  for (let row = 0; row < 15; row++) {
    const y = -.95 + row * 1.90 / 14;
    const span = Math.sqrt(1 - y * y);
    const count = Math.max(2, Math.round(9 * span));
    for (let column = 0; column < count; column++) {
      const x = ((column + .5) / count * 2 - 1) * span;
      frontPoints.push([x, y, Math.sqrt(1 - x * x - y * y)]);
    }
  }
  // Scatter different topics over the visible hemisphere, with a second face to discover by rotating.
  const slots = [...frontPoints];
  let seed = 91837;
  for (let index = slots.length - 1; index > 0; index--) {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    const other = seed % (index + 1);
    [slots[index], slots[other]] = [slots[other], slots[index]];
  }
  const frontCount = Math.min(slots.length, Math.round(topicWords.length * .68));
  const gestures = gesturePositions.map(([name]) => name);
  const words = gesturePositions.map(([name, x, y, z]) => ({key: "gestures", value: name, label: displayLabel(name), point: [x, y, z]}));
  topicWords.forEach((item, i) => {
    let point;
    if (i < frontCount) {
      point = slots[i];
    } else {
      const backIndex = i - frontCount;
      const z = -.13 - .84 * (backIndex + .5) / (topicWords.length - frontCount);
      const radius = Math.sqrt(1 - z * z);
      const angle = backIndex * 2.3999632;
      point = [radius * Math.cos(angle), radius * Math.sin(angle), z];
    }
    words.push({...item, point});
  });
  const keys = [...new Set(words.map(word => word.key))];
  const points = words.map((word, index) => {
    const length = Math.hypot(...word.point);
    const control = document.createElement("button");
    control.type = "button";
    control.className = "globe-node cloud-" + (word.key === "gestures" ? "gesture" : "topic")
      + " cloud-tone-" + index % 6;
    const face = document.createElement("span");
    face.className = "cloud-word";
    face.setAttribute("aria-hidden", "true");
    const run = document.createElement("span");
    run.className = "cloud-letters";
    const letters = segmenter ? Array.from(segmenter.segment(word.label), item => item.segment) : Array.from(word.label);
    const glyphs = letters.map((letter, position) => {
      const span = document.createElement("span");
      span.className = "cloud-letter";
      span.textContent = letter;
      run.append(span);
      return {span, letter, phase: index * .83 + position * .37, fontIndex: -1, colorIndex: -1};
    });
    face.append(run);
    control.append(face);
    control.setAttribute("aria-label", word.label);
    control.setAttribute("aria-pressed", "false");
    control.addEventListener("click", event => {
      if (event.detail && performance.now() < suppressClickUntil) return;
      if (control.getAttribute("aria-disabled") !== "true") onSelect(word.key, word.value);
    });
    controls.append(control);
    control.tabIndex = -1;
    return {...word, point: word.point.map(coordinate => coordinate / length), control, run, glyphs,
      width: 0, height: 0, x: 0, y: 0, depth: 0, screenX: 0, screenY: 0,
      offsetIndex: 0, offsetX: 0, offsetY: 0, visible: false, hiddenAt: -Infinity,
      pullX: 0, pullY: 0,
      selected: false, available: true, related: false};
  });

  let yaw = -.13;
  let pitch = .07;
  let width = 0;
  let height = 0;
  let ratio = 1;
  let drag = null;
  let pointerInside = false;
  let restUntil = 0;
  let suppressClickUntil = 0;
  let orientation = null;
  let inView = true;
  let frame = 0;
  let lastTick = null;
  let lastPacking = -Infinity;
  let packingDirty = true;
  let wordsSettling = false;
  let lastAttractor = null;
  let lastTypeFrame = -Infinity;
  let startedAt = null;
  let connections = [];
  let detourStarted = null;
  let lineDrawn = false;
  let previousFocus = "";

  function sphereRadius() {
    return Math.min(width * .48, height * .445);
  }

  function projectWords() {
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const radius = sphereRadius();
    for (const item of points) {
      const [x, y, z] = item.point;
      const turnZ = z * cosYaw - x * sinYaw;
      item.x = (x * cosYaw + z * sinYaw) * radius;
      item.y = (y * cosPitch - turnZ * sinPitch) * radius;
      item.depth = y * sinPitch + turnZ * cosPitch;
    }
  }

  function keepWordInside(x, y, halfWidth, halfHeight) {
    const radius = sphereRadius();
    const wide = halfWidth * magnification;
    const tall = halfHeight * magnification;
    const verticalRoom = Math.max(0, Math.sqrt(Math.max(0, radius ** 2 - wide ** 2)) - tall);
    const safeY = Math.min(verticalRoom, Math.max(-verticalRoom, y));
    const edgeY = Math.abs(safeY) + tall;
    const horizontalRoom = Math.max(0, Math.sqrt(Math.max(0, radius ** 2 - edgeY ** 2)) - wide);
    return {x: Math.min(horizontalRoom, Math.max(-horizontalRoom, x)), y: safeY};
  }

  function wordBox(item, offsetX, offsetY, scale) {
    const halfWidth = scale * item.width / 2;
    const halfHeight = scale * item.height / 2;
    return {...keepWordInside(item.x + offsetX, item.y + offsetY, halfWidth, halfHeight), halfWidth, halfHeight};
  }

  function depthScale(item) {
    return Math.min(.76 + .31 * Math.max(0, item.depth), sphereRadius() * 1.87 / (magnification * Math.max(item.width, 1)));
  }

  function packingBox(item, offsetX, offsetY, scale) {
    const box = wordBox(item, offsetX, offsetY, scale);
    if (item.related) {
      box.halfWidth *= 1.12;
      box.halfHeight *= 1.12;
    }
    return box;
  }

  function measure() {
    const measured = new Map();
    if (context) {
      const sizes = points.map(item => parseFloat(getComputedStyle(item.control).fontSize));
      points.forEach((item, index) => {
        const size = sizes[index];
        for (const glyph of item.glyphs) {
          const key = size + ":" + glyph.letter;
          let spanWidth = measured.get(key);
          if (spanWidth === undefined) {
            spanWidth = Math.max(...typefaces.map(family => {
              const scale = family === "Homemade Apple" ? .77 : 1;
              context.font = (size * scale) + 'px "' + family + '"';
              return context.measureText(glyph.letter).width;
            }));
            measured.set(key, spanWidth);
          }
          glyph.span.style.inlineSize = (spanWidth + .05) + "px";
        }
      });
    }
    for (const item of points) {
      item.width = item.control.offsetWidth;
      item.height = item.control.offsetHeight;
    }
    packingDirty = true;
    schedule();
  }

  function animateLetters(time) {
    if (paused || drag?.active || time - lastTypeFrame < 210) return;
    lastTypeFrame = time;
    const age = time - startedAt;
    for (const item of points) {
      if (!item.visible || item.control.matches(":hover, :focus-visible")) continue;
      for (const glyph of item.glyphs) {
        const index = Math.floor(age / 5500 + glyph.phase) % typefaces.length;
        if (index !== glyph.fontIndex) {
          glyph.fontIndex = index;
          glyph.span.style.fontFamily = '"' + typefaces[index] + '"';
          glyph.span.style.fontWeight = typefaces[index] === "Archivo" ? "600" : "400";
          glyph.span.style.fontSize = typefaces[index] === "Homemade Apple" ? ".77em" : "";
        }
        const colorIndex = Math.floor(age / 2850 + glyph.phase) % colors.length;
        if (colorIndex !== glyph.colorIndex) {
          glyph.colorIndex = colorIndex;
          glyph.span.style.setProperty("--cloud-letter-color", colors[colorIndex]);
        }
      }
    }
  }

  function packWords(time, focused) {
    const placed = [];
    const overlaps = box => placed.some(other => Math.abs(box.x - other.x) < box.halfWidth + other.halfWidth + 3
      && Math.abs(box.y - other.y) < box.halfHeight + other.halfHeight + 2);
    function priority(item) {
      const roomForShortWords = width < 360 && item.key !== "gestures" ? item.width / 160 : 0;
      return item.depth + (item.related ? 30 : 0) + (item.control === focused ? 20 : 0) + (item.selected ? 6 : 0)
        + (item.key === "gestures" ? 3 : 0) + (item.available ? 1.3 : 0)
        + (item.visible ? .16 : 0) - roomForShortWords;
    }
    const candidates = points.filter(item => item.related || item.control === focused || item.depth > (item.visible ? .025 : .09));
    candidates.sort((a, b) => priority(b) - priority(a));
    const visible = new Set();
    for (const item of candidates) {
      const scale = depthScale(item);
      const previousBox = item.visible && packingBox(item, item.offsetX, item.offsetY, scale);
      const offsetCount = item.related ? detourOffsets.length : item.key === "gestures" ? 1 : offsets.length;
      if (item.offsetIndex >= offsetCount) item.offsetIndex = 0;
      for (let attempt = -1; attempt < offsetCount; attempt++) {
        const index = attempt < 0 ? item.offsetIndex : attempt;
        if (attempt === item.offsetIndex) continue;
        const [offsetX, offsetY] = detourOffsets[index];
        const box = packingBox(item, offsetX, offsetY, scale);
        if (overlaps(box)) continue;
        if (previousBox && overlaps(previousBox)) {
          item.offsetX = offsetX;
          item.offsetY = offsetY;
        } else if (previousBox) {
          placed.push(previousBox);
        }
        placed.push(box);
        visible.add(item);
        item.offsetIndex = index;
        if (!item.visible) {
          item.offsetX = offsetX;
          item.offsetY = offsetY;
        }
        break;
      }
    }
    for (const item of points) {
      const visibleNow = visible.has(item);
      if (visibleNow === item.visible) continue;
      item.visible = visibleNow;
      const leavingEdge = !visibleNow && item.depth <= .025;
      if (leavingEdge) item.hiddenAt = time;
      item.control.classList.toggle("is-leaving", leavingEdge);
      item.control.classList.toggle("is-visible", visibleNow);
      item.control.tabIndex = visibleNow && item.available ? 0 : -1;
    }
    lastPacking = time;
    packingDirty = false;
  }

  function drawLine(time) {
    if (!context || (!lineDrawn && connections.length < 2)) return;
    if (lineDrawn) context.clearRect(0, 0, width, height);
    const [a, b] = connections;
    lineDrawn = Boolean(a?.visible && b?.visible);
    if (!lineDrawn) return;
    if (detourStarted === null) {
      detourStarted = time;
      a.control.classList.add("detour-reached");
    }
    const progress = paused ? 1 : Math.min(1, (time - detourStarted) / detourDuration);
    if (progress === 1 && !b.control.classList.contains("detour-reached")) b.control.classList.add("detour-reached");
    const t = progress * progress * (3 - 2 * progress);
    const dx = b.screenX - a.screenX;
    const dy = b.screenY - a.screenY;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    const dimensions = [a, b].map(item => {
      const scale = depthScale(item) * magnification;
      return {item, halfWidth: item.width * scale / 2, halfHeight: item.height * scale / 2};
    });
    const space = side => Math.min(...dimensions.map(({item, halfWidth, halfHeight}) => horizontal
      ? (side < 0 ? item.screenY : height - item.screenY) - halfHeight
      : (side < 0 ? item.screenX : width - item.screenX) - halfWidth));
    const side = space(-1) > space(1) ? -1 : 1;
    const inside = (value, limit) => Math.min(limit - edgePadding, Math.max(edgePadding, value));
    const [start, end] = dimensions.map(({item, halfWidth, halfHeight}) => ({
      x: inside(item.screenX + (horizontal ? 0 : side * (halfWidth + 7)), width),
      y: inside(item.screenY + (horizontal ? side * (halfHeight + 7) : 0), height),
    }));
    const bend = Math.min(64, Math.max(27, Math.hypot(dx, dy) * .42));
    const midX = inside((start.x + end.x) / 2 + (horizontal ? 0 : side * bend), width);
    const midY = inside((start.y + end.y) / 2 + (horizontal ? side * bend : 0), height);
    const leadX = start.x + (midX - start.x) * t;
    const leadY = start.y + (midY - start.y) * t;
    const tipX = (1 - t) * leadX + t * (midX + (end.x - midX) * t);
    const tipY = (1 - t) * leadY + t * (midY + (end.y - midY) * t);

    context.beginPath();
    context.moveTo(start.x, start.y);
    context.quadraticCurveTo(leadX, leadY, tipX, tipY);
    context.lineCap = "round";
    context.strokeStyle = "#fff9ee";
    context.lineWidth = 6;
    context.stroke();
    const gradient = context.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, "#8d3221");
    gradient.addColorStop(.5, "#c25522");
    gradient.addColorStop(1, "#20415d");
    context.strokeStyle = gradient;
    context.lineWidth = 2.8;
    context.stroke();

    for (const [x, y, color] of [[start.x, start.y, "#8d3221"], [tipX, tipY, t < 1 ? "#c25522" : "#20415d"]]) {
      context.beginPath();
      context.arc(x, y, 4.3, 0, Math.PI * 2);
      context.fillStyle = "#fff9ee";
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = color;
      context.stroke();
    }
  }

  function overlapArea(x, y, box, other) {
    const dx = Math.abs(x - other.x - other.item.pullX);
    const dy = Math.abs(y - other.y - other.item.pullY);
    return Math.max(0, box.halfWidth + other.halfWidth + 1 - dx)
      * Math.max(0, box.halfHeight + other.halfHeight + 1 - dy);
  }

  function pullWords(boxes, attractor, elapsed) {
    const center = attractor && boxes.find(box => box.item.control === attractor);
    const reach = sphereRadius() * .98;
    const blend = 1 - Math.exp(-elapsed * 12);
    for (const box of boxes) {
      const {item, x, y} = box;
      if (box === center) continue;
      let pullX = 0;
      let pullY = 0;
      if (center && item.visible) {
        const dx = center.x + center.item.pullX - x;
        const dy = center.y + center.item.pullY - y;
        const distance = Math.hypot(dx, dy);
        const strength = 19 * Math.max(0, 1 - distance / reach) ** 1.4 / Math.max(distance, 1);
        pullX = dx * strength;
        pullY = dy * strength;

        // Leave room for the enlarged word where the surrounding words are already close.
        const gapX = box.halfWidth + center.halfWidth * magnification + 2 - Math.abs(dx);
        const gapY = box.halfHeight + center.halfHeight * magnification + 2 - Math.abs(dy);
        if (gapX < gapY && gapY > 0) pullX = Math.sign(dx || 1) * Math.min(Math.abs(pullX), -gapX);
        else if (gapX > 0) pullY = Math.sign(dy || 1) * Math.min(Math.abs(pullY), -gapY);
      }
      if (item.pullX === pullX && item.pullY === pullY) continue;
      if (paused || drag?.active || !item.visible) {
        item.pullX = item.pullY = 0;
        continue;
      }
      const nextX = approach(item.pullX, pullX, blend, .12);
      const nextY = approach(item.pullY, pullY, blend, .12);
      const beforeX = item.pullX;
      const beforeY = item.pullY;
      const fits = (offsetX, offsetY) => boxes.every(other => other === box || !other.item.visible
        || overlapArea(x + offsetX, y + offsetY, box, other) <= overlapArea(x + beforeX, y + beforeY, box, other) + .01);
      if (!center || fits(nextX, nextY)) {
        item.pullX = nextX;
        item.pullY = nextY;
      } else if (fits(nextX, item.pullY)) {
        item.pullX = nextX;
      } else if (fits(item.pullX, nextY)) {
        item.pullY = nextY;
      }
      wordsSettling ||= (item.pullX !== beforeX || item.pullY !== beforeY)
        && (item.pullX !== pullX || item.pullY !== pullY);
    }
  }

  function draw(time, elapsed, focused, attractor, repack) {
    projectWords();
    if (packingDirty || (repack && time - lastPacking > (drag?.active ? 36 : 85))) packWords(time, focused);
    const blend = paused ? 1 : 1 - Math.exp(-elapsed * 14);
    wordsSettling = false;
    const boxes = [];
    for (const item of points) {
      if (!item.visible && time - item.hiddenAt > 170) {
        item.pullX = item.pullY = 0;
        continue;
      }
      const [targetX, targetY] = detourOffsets[item.offsetIndex];
      item.offsetX = approach(item.offsetX, targetX, blend, .15);
      item.offsetY = approach(item.offsetY, targetY, blend, .15);
      wordsSettling ||= item.offsetX !== targetX || item.offsetY !== targetY;
      const scale = depthScale(item);
      boxes.push({item, scale, ...wordBox(item, item.offsetX, item.offsetY, scale)});
    }
    pullWords(boxes, attractor, elapsed);
    for (const {item, scale, x, y, halfWidth, halfHeight} of boxes) {
      const position = item.pullX || item.pullY
        ? keepWordInside(x + item.pullX, y + item.pullY, halfWidth, halfHeight) : {x, y};
      item.screenX = width / 2 + position.x;
      item.screenY = height * .48 + position.y;
      item.control.style.transform = `translate3d(${item.screenX.toFixed(2)}px, ${item.screenY.toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      item.control.style.setProperty("--globe-depth", String(1 + Math.round(Math.max(item.depth, 0) * 8)));
      if (item.key !== "gestures") item.run.style.opacity = (.70 + .30 * Math.max(0, item.depth)).toFixed(2);
    }
    if (!stage.dataset.ready) stage.dataset.ready = "true";
    drawLine(time);
  }

  function approach(value, target, blend, tolerance) {
    return Math.abs(value - target) < tolerance ? target : value + (target - value) * blend;
  }

  function tick(time) {
    frame = 0;
    startedAt ??= time;
    const elapsed = lastTick === null ? 1 / 60 : Math.min((time - lastTick) / 1000, .04);
    lastTick = time;
    const active = document.activeElement;
    const focused = controls.contains(active) && active.matches(":focus-visible") ? active : null;
    const attractor = !paused && pointerInside && !drag?.active && !orientation
      ? controls.querySelector('.globe-node.is-visible:not([aria-disabled="true"]):hover') : null;
    const previousYaw = yaw;
    const previousPitch = pitch;
    if (!paused && !drag) {
      const follow = 1 - Math.exp(-elapsed * 8);
      if (orientation) {
        yaw = approach(yaw, orientation.yaw, follow, .001);
        pitch = approach(pitch, orientation.pitch, follow, .001);
        if (yaw === orientation.yaw && pitch === orientation.pitch) orientation = null;
      } else if (!attractor && !drag && !focused && !connections.length && time > restUntil) {
        yaw = (yaw + elapsed * .094) % (Math.PI * 2);
      }
    }
    const moved = previousYaw !== yaw || previousPitch !== pitch;
    const repack = moved || drag?.changed;
    const tracing = !paused && detourStarted !== null && time <= detourStarted + detourDuration + 40;
    if (width && height && (repack || packingDirty || wordsSettling || tracing || attractor !== lastAttractor)) {
      draw(time, elapsed, focused, attractor, repack);
      lastAttractor = attractor;
      if (drag) drag.changed = false;
    }
    animateLetters(time);
    if (!paused && inView) schedule();
    else lastTick = null;
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(tick);
  }
  function resize() {
    const newWidth = stage.clientWidth;
    const newHeight = stage.clientHeight;
    if (width === newWidth && height === newHeight) return;
    width = newWidth;
    height = newHeight;
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    measure();
  }

  function turnTo(nextYaw, nextPitch) {
    const delta = nextYaw - yaw;
    const nearestYaw = yaw + Math.atan2(Math.sin(delta), Math.cos(delta));
    if (paused) {
      yaw = nearestYaw;
      pitch = nextPitch;
      packingDirty = true;
    } else {
      orientation = {yaw: nearestYaw, pitch: nextPitch};
      restUntil = performance.now() + 1700;
    }
    schedule();
  }

  stage.dataset.motion = paused ? "paused" : "running";
  document.getElementById("rotate-left").addEventListener("click", () => turnTo((orientation?.yaw ?? yaw) - .55, pitch));
  document.getElementById("rotate-right").addEventListener("click", () => turnTo((orientation?.yaw ?? yaw) + .55, pitch));
  stage.addEventListener("pointerenter", event => { pointerInside = event.pointerType === "mouse"; });
  stage.addEventListener("pointerleave", () => {
    if (drag && !drag.active) drag = null;
    pointerInside = false;
    restUntil = 0;
    schedule();
  });
  controls.addEventListener("focusin", () => { packingDirty = true; schedule(); });
  stage.addEventListener("pointerdown", event => {
    if (drag || !event.isPrimary || event.button !== 0) return;
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY, active: false, changed: false};
  });
  stage.addEventListener("pointermove", event => {
    if (drag?.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.active) {
      if (Math.hypot(dx, dy) < (event.pointerType === "touch" ? 9 : 6)) return;
      drag.active = true;
      stage.setPointerCapture(event.pointerId);
      stage.classList.add("dragging");
      orientation = null;
    }
    const radiansPerPixel = 1.15 / Math.max(95, sphereRadius());
    yaw += dx * radiansPerPixel;
    pitch = Math.min(1.12, Math.max(-1.12, pitch - dy * radiansPerPixel));
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.changed = true;
    schedule();
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"]) {
    stage.addEventListener(event, input => {
      if (drag?.id !== input.pointerId) return;
      // A touch that starts on a word transfers capture to the globe when it becomes a drag.
      if (event === "lostpointercapture" && input.target !== stage) return;
      if (drag.active) {
        const now = performance.now();
        suppressClickUntil = now + 180;
        restUntil = now + 1300;
        packingDirty = true;
      }
      drag = null;
      stage.classList.remove("dragging");
      schedule();
    });
  }
  if (typeof IntersectionObserver === "function") {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) schedule();
    }).observe(stage);
  }
  if (typeof ResizeObserver === "function") new ResizeObserver(resize).observe(stage);
  else window.addEventListener("resize", resize);
  resize();
  document.fonts?.ready.then(measure);
  document.fonts?.addEventListener("loadingdone", measure);

  return {
    gestures,
    keys,
    getOrientation: () => ({yaw, pitch}),
    restoreOrientation: ({yaw, pitch}) => turnTo(yaw, pitch),
    update(counts, filters, related, narrowed) {
      const previousConnections = connections;
      connections = related.map(({key, value}) => points.find(item => item.key === key && item.value === value)).filter(Boolean);
      if (connections.length !== previousConnections.length || connections.some((item, index) => item !== previousConnections[index])) {
        for (const item of previousConnections) item.control.classList.remove("detour-reached");
        detourStarted = null;
      }
      for (const item of points) {
        const count = counts.get(item.key)?.get(item.value) || 0;
        item.selected = filters.get(item.key)?.has(item.value) || false;
        item.available = Boolean(count || item.selected);
        item.related = connections.includes(item);
        item.control.setAttribute("aria-pressed", String(item.selected));
        item.control.setAttribute("aria-disabled", String(!item.available));
        item.control.classList.toggle("related", item.related);
        item.control.tabIndex = item.visible && item.available ? 0 : -1;
        item.control.title = displayLabel(item.value) + " · " + count + (count === 1 ? " publication" : " publications");
      }
      let focus = connections;
      if (!focus.length) focus = points.filter(item => item.selected);
      if (!focus.length && narrowed) focus = points.filter(item => item.available && item.key === "gestures");
      const signature = focus.map(item => item.value).join("|");
      projectWords();
      const front = focus.filter(item => item.depth > .16);
      if (signature && signature !== previousFocus && (connections.length > 1 || !front.length)) {
        const [x, y, z] = focus.slice(0, connections.length > 1 ? 2 : 1)
          .reduce(([x, y, z], item) => [x + item.point[0], y + item.point[1], z + item.point[2]], [0, 0, 0]);
        turnTo(Math.atan2(-x, z), Math.atan2(y, Math.hypot(x, z)));
      }
      previousFocus = signature;
      packingDirty = true;
      schedule();
    }
  };
}
