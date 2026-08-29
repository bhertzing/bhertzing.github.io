/* Blog sky — unlabeled constellation.
   Pulse, hop, and ack flash behavior lifted from app/src/aevum/constellation.js.
   No vault note names. Full-viewport projection so it reads in the gutters. */
(function () {
  "use strict";
  var canvas = document.getElementById("skyCanvas");
  if (!canvas) return;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    canvas.remove();
    return;
  }

  var ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  var TINT = {
    signal: [56, 189, 248],
    vitality: [45, 212, 191],
    aurum: [250, 204, 21],
    mind: [167, 139, 250],
  };
  var TINTS = [TINT.signal, TINT.vitality, TINT.aurum, TINT.mind];
  var SPARK_CYAN = [56, 189, 248];
  var SPARK_WHITE = [232, 236, 244];
  var ACK_MS = 260;

  var points = [];
  var edges = [];
  var byId = {};
  var neuralPulses = [];
  var nodeAcks = Object.create(null);
  var nextPulseAt = 0;
  var burstUntil = 0;
  var nextBurstAt = 0;
  var rotY = 0;
  var rotX = 0.32;
  var ROT_Y_SPEED = 0.00012;
  var raf = 0;
  var lastT = 0;
  var dpr = 1;
  var w = 0;
  var h = 0;
  var hidden = false;

  function rgba(rgb, a) {
    return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
  }

  function mixRgb(rgb, toward, t) {
    return [
      Math.round(rgb[0] + (toward[0] - rgb[0]) * t),
      Math.round(rgb[1] + (toward[1] - rgb[1]) * t),
      Math.round(rgb[2] + (toward[2] - rgb[2]) * t),
    ];
  }

  function roleRadius(role, childCount) {
    var n = childCount || 0;
    var r;
    if (role === "root") r = 8.25;
    else if (role === "leaf") r = 3.15;
    else {
      var base = role === "hub" ? 4.25 : 4.55;
      r = Math.min(role === "hub" ? 11.4 : 8.6, base + 0.95 * Math.sqrt(n));
    }
    return r * 1.56;
  }

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    points = [];
    edges = [];
    byId = {};
    var i;
    var hubN = 8;
    var leafN = 40;
    var childCounts = { n0: hubN };

    function add(id, role, parentId, ring, angle, lat, rgb) {
      var p = {
        id: id,
        role: role,
        parentId: parentId || null,
        ring: ring,
        angle: angle,
        lat: lat,
        rgb: rgb.slice(),
        radius: 4,
        x: 0,
        y: 0,
        z: 0,
        sx: 0,
        sy: 0,
        depth: 1,
        drawR: 4,
        active: 0.4,
        ackFlash: 0,
        ackRgb: rgb.slice(),
      };
      points.push(p);
      byId[id] = p;
      return p;
    }

    add("n0", "root", null, 0, 0, 0, TINT.signal);
    for (i = 0; i < hubN; i++) {
      var hid = "h" + i;
      childCounts[hid] = 0;
      add(
        hid,
        "hub",
        "n0",
        2,
        (i / hubN) * Math.PI * 2 + 0.18,
        Math.sin(i * 2.399) * 0.82,
        TINTS[i % TINTS.length]
      );
    }
    for (i = 0; i < leafN; i++) {
      var parent = "h" + (i % hubN);
      childCounts[parent] = (childCounts[parent] || 0) + 1;
      var sib = childCounts[parent] - 1;
      add(
        "l" + i,
        "leaf",
        parent,
        3,
        byId[parent].angle + (sib - 1.5) * 0.18,
        byId[parent].lat + Math.sin(sib * 1.7) * 0.22,
        TINTS[(i + 1) % TINTS.length]
      );
    }

    for (i = 0; i < points.length; i++) {
      points[i].radius = roleRadius(points[i].role, childCounts[points[i].id] || 0);
    }

    function link(a, b) {
      if (!a || !b) return;
      edges.push([a, b]);
    }
    for (i = 0; i < points.length; i++) {
      if (points[i].parentId && byId[points[i].parentId]) {
        link(points[i], byId[points[i].parentId]);
      }
    }
  }

  function projectPoints() {
    var cy = Math.cos(rotY);
    var sy = Math.sin(rotY);
    var cx = Math.cos(rotX);
    var sx = Math.sin(rotX);
    var i;
    for (i = 0; i < points.length; i++) {
      var p = points[i];
      var lon = p.angle;
      var lat = p.lat;
      var rad = 0.42 + p.ring * 0.32;
      var px = Math.cos(lat) * Math.cos(lon) * rad * 1.35;
      var py = Math.sin(lat) * rad * 0.82;
      var pz = Math.cos(lat) * Math.sin(lon) * rad;
      var x1 = px * cy + pz * sy;
      var z1 = -px * sy + pz * cy;
      var y1 = py * cx - z1 * sx;
      var z2 = py * sx + z1 * cx;
      var depth = 1.35 + z2 * 0.28;
      var scale = (w * 0.52) / Math.max(0.85, depth);
      p.x = w * 0.5 + x1 * scale;
      p.y = h * 0.5 + y1 * scale * (h / Math.max(w, 1)) * 1.35;
      p.z = z2;
      p.depth = Math.max(0.55, Math.min(1.25, 1.05 / Math.max(0.85, depth)));
      p.drawR = p.radius * Math.max(0.65, Math.min(1.35, p.depth));
      p.active = (p.role === "root" ? 0.55 : p.role === "hub" ? 0.48 : 0.34) * (0.55 + 0.45 * p.depth);
    }
  }

  function edgeRgb(a, b) {
    if (a.role === "root") return b.rgb.slice();
    if (b.role === "root") return a.rgb.slice();
    return [
      Math.round((a.rgb[0] + b.rgb[0]) / 2),
      Math.round((a.rgb[1] + b.rgb[1]) / 2),
      Math.round((a.rgb[2] + b.rgb[2]) / 2),
    ];
  }

  function ancestors(node) {
    var chain = [];
    var p = node;
    var guard = 0;
    while (p && guard++ < 10) {
      chain.push(p);
      if (!p.parentId || !byId[p.parentId] || p.parentId === p.id) break;
      p = byId[p.parentId];
    }
    return chain;
  }

  function pathBetween(a, b) {
    if (!a || !b || a.id === b.id) return null;
    var upA = ancestors(a);
    var seen = Object.create(null);
    var i;
    for (i = 0; i < upA.length; i++) seen[upA[i].id] = i;
    var upB = ancestors(b);
    var lcaB = -1;
    var j;
    for (j = 0; j < upB.length; j++) {
      if (seen[upB[j].id] !== undefined) {
        lcaB = j;
        break;
      }
    }
    if (lcaB < 0) return null;
    var lcaA = seen[upB[lcaB].id];
    var path = upA.slice(0, lcaA + 1);
    var k;
    for (k = lcaB - 1; k >= 0; k--) path.push(upB[k]);
    return path.length >= 3 ? path : null;
  }

  function pickEndpoint() {
    var leaves = [];
    var rest = [];
    var i;
    for (i = 0; i < points.length; i++) {
      if (points[i].role === "root") continue;
      if (points[i].role === "leaf") leaves.push(points[i]);
      else rest.push(points[i]);
    }
    var pool = leaves.length && Math.random() < 0.8 ? leaves : rest.length ? rest : points;
    if (!pool.length) return null;
    return pool[(Math.random() * pool.length) | 0];
  }

  function pickActivityPath() {
    var tries = 0;
    while (tries++ < 10) {
      var path = pathBetween(pickEndpoint(), pickEndpoint());
      if (path && path.length >= 3) return path;
    }
    return null;
  }

  function pulseStyle() {
    return "bead";
  }

  function tintPulse(from, to) {
    var rgb = edgeRgb(from, to);
    var keepTint = false;
    var sparkRoll = Math.random();
    if (sparkRoll < 0.14) {
      rgb = SPARK_WHITE.slice();
      keepTint = true;
    } else if (sparkRoll < 0.28) {
      rgb = SPARK_CYAN.slice();
      keepTint = true;
    }
    return { rgb: rgb, keepTint: keepTint };
  }

  function pushPulse(from, to, hops) {
    var style = pulseStyle();
    var tint = tintPulse(from, to);
    neuralPulses.push({
      from: from,
      to: to,
      hops: hops || null,
      hop: 0,
      t: 0,
      acked: false,
      style: style,
      rgb: tint.rgb,
      keepTint: !!(hops || tint.keepTint),
      speed: hops ? 0.00135 + Math.random() * 0.0009 : 0.00055 + Math.random() * 0.00055,
      width: hops ? 1.8 + Math.random() * 1.6 : 1.5 + Math.random() * 1.8,
      seed: Math.random(),
    });
  }

  function spawnNeuralPulse() {
    if (Math.random() < 0.42) {
      var path = pickActivityPath();
      if (path) {
        pushPulse(path[0], path[1], path);
        return;
      }
    }
    if (!edges.length) return;
    var edge = edges[(Math.random() * edges.length) | 0];
    var from = edge[0];
    var to = edge[1];
    if (Math.random() < 0.5) {
      from = edge[1];
      to = edge[0];
    }
    pushPulse(from, to, null);
  }

  function ackNode(node, rgb, now) {
    if (!node) return;
    nodeAcks[node.id] = { start: (now || performance.now()) - 16, rgb: rgb || node.rgb };
  }

  function ackEnvelope(now, start) {
    var u = (now - start) / ACK_MS;
    if (u >= 1 || u <= 0) return 0;
    if (u < 0.18) return u / 0.18;
    return Math.max(0, 1 - (u - 0.18) / 0.82);
  }

  function applyNodeAcks(now) {
    var i;
    for (i = 0; i < points.length; i++) {
      var p = points[i];
      var ack = nodeAcks[p.id];
      p.ackFlash = 0;
      p.ackRgb = p.rgb;
      if (!ack) continue;
      var env = ackEnvelope(now, ack.start);
      if (env <= 0) {
        delete nodeAcks[p.id];
        continue;
      }
      p.ackFlash = env;
      p.ackRgb = ack.rgb;
      p.active = Math.min(1, p.active + env * 0.22);
      p.drawR *= 1 + env * 0.13;
    }
  }

  function updateNeuralPulses(now, dt) {
    if (!edges.length) {
      neuralPulses = [];
      nodeAcks = Object.create(null);
      return;
    }
    var rateScale = 1;
    var alphaBoost = 1;

    if (now >= nextBurstAt) {
      if (Math.random() < 0.22) burstUntil = now + 1800 + Math.random() * 2800;
      nextBurstAt = now + 7000 + Math.random() * 14000;
    }
    var inBurst = now < burstUntil;
    var baseGap = inBurst ? 160 : 850;
    if (now >= nextPulseAt) {
      spawnNeuralPulse();
      if (inBurst && Math.random() < 0.45) spawnNeuralPulse();
      nextPulseAt = now + baseGap * rateScale * (0.55 + Math.random() * 0.9);
    }

    var i;
    for (i = neuralPulses.length - 1; i >= 0; i--) {
      var pul = neuralPulses[i];
      pul.t += pul.speed * dt;
      pul.alphaBoost = alphaBoost;
      var arriveAt = pul.style === "flash" ? 0.32 : 0.86;
      if (!pul.acked && pul.t >= arriveAt) {
        pul.acked = true;
        ackNode(pul.to, pul.rgb, now);
      }
      if (pul.t >= 1) {
        var hops = pul.hops;
        if (hops && pul.hop + 1 < hops.length - 1) {
          pul.hop += 1;
          pul.from = hops[pul.hop];
          pul.to = hops[pul.hop + 1];
          pul.t = 0;
          pul.acked = false;
          if (!pul.keepTint) pul.rgb = edgeRgb(pul.from, pul.to);
        } else {
          neuralPulses.splice(i, 1);
        }
      }
    }
    if (neuralPulses.length > 28) neuralPulses.splice(0, neuralPulses.length - 28);
  }

  function drawNeuralPulses() {
    var i;
    for (i = 0; i < neuralPulses.length; i++) {
      var pul = neuralPulses[i];
      var a = pul.from;
      var b = pul.to;
      if (!a || !b) continue;
      var boost = pul.alphaBoost || 1;
      var depth = ((a.depth || 1) + (b.depth || 1)) / 2;
      var t = pul.t;

      if (pul.style === "flash") {
        var envelope = t < 0.35 ? t / 0.35 : 1 - (t - 0.35) / 0.65;
        envelope = Math.max(0, envelope);
        var alpha = envelope * 0.55 * boost * Math.max(0.5, depth);
        if (alpha < 0.02) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = rgba(pul.rgb, alpha);
        ctx.lineWidth = (pul.width + 1.2) * depth;
        ctx.stroke();
        continue;
      }

      if (pul.style === "segment") {
        var span = 0.14 + pul.seed * 0.1;
        var t0 = Math.max(0, t - span);
        var t1 = Math.min(1, t);
        var x0 = a.x + (b.x - a.x) * t0;
        var y0 = a.y + (b.y - a.y) * t0;
        var x1 = a.x + (b.x - a.x) * t1;
        var y1 = a.y + (b.y - a.y) * t1;
        var sa = (1 - Math.abs(t - 0.5) * 0.6) * 0.75 * boost * Math.max(0.5, depth);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = rgba(pul.rgb, sa);
        ctx.lineWidth = pul.width * depth;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.lineCap = "butt";
        ctx.beginPath();
        ctx.arc(x1, y1, (2.2 + pul.width * 0.4) * depth, 0, Math.PI * 2);
        ctx.fillStyle = rgba(pul.rgb, sa);
        ctx.fill();
        continue;
      }

      var x = a.x + (b.x - a.x) * t;
      var y = a.y + (b.y - a.y) * t;
      var fade = t < 0.1 ? t / 0.1 : t > 0.85 ? (1 - t) / 0.15 : 1;
      var ba = fade * 0.85 * boost * Math.max(0.5, depth);
      var r = (2.4 + pul.width) * depth;
      var glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
      glow.addColorStop(0, rgba(pul.rgb, ba));
      glow.addColorStop(0.45, rgba(pul.rgb, ba * 0.35));
      glow.addColorStop(1, rgba(pul.rgb, 0));
      ctx.beginPath();
      ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = rgba(pul.rgb, Math.min(1, ba + 0.15));
      ctx.fill();
    }
  }

  function drawOrb(p) {
    var r = p.drawR;
    if (r < 0.4) return;
    var x = p.x;
    var y = p.y;
    var rgb = p.rgb;
    var a = Math.max(0, Math.min(1, p.active));
    var bodyA = Math.min(1, 0.82 + a * 0.18);
    var depth = Math.max(0.55, Math.min(1.25, p.depth || 1));
    var lit = 0.62 + 0.38 * depth;
    var hx = x - r * 0.36;
    var hy = y - r * 0.40;
    var hi = mixRgb(rgb, [255, 255, 255], 0.48 * lit);
    var mid = mixRgb(rgb, [18, 24, 36], 0.08);
    var shade = mixRgb(rgb, [6, 10, 18], 0.55);
    var rim = mixRgb(rgb, [4, 7, 14], 0.78);
    var glowR = r * (p.role === "leaf" ? 1.85 : 2.15);
    var glow = ctx.createRadialGradient(x, y, r * 0.2, x, y, glowR);
    glow.addColorStop(0, rgba(rgb, a * 0.28 * lit));
    glow.addColorStop(0.42, rgba(rgb, a * 0.08));
    glow.addColorStop(1, rgba(rgb, 0));
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
    var body = ctx.createRadialGradient(hx, hy, r * 0.06, x + r * 0.22, y + r * 0.28, r * 1.08);
    body.addColorStop(0, rgba(hi, bodyA));
    body.addColorStop(0.28, rgba(mid, bodyA));
    body.addColorStop(0.68, rgba(shade, bodyA));
    body.addColorStop(1, rgba(rim, bodyA));
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();
    var specX = x - r * 0.32;
    var specY = y - r * 0.36;
    var specR = r * (p.role === "leaf" ? 0.28 : 0.34);
    if (p.ackFlash) specR *= 1 + p.ackFlash * 0.16;
    var specA = 0.58 * a * lit + (p.ackFlash || 0) * 0.14;
    var spec = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
    spec.addColorStop(0, "rgba(255,255,255," + Math.min(1, specA).toFixed(3) + ")");
    spec.addColorStop(0.35, "rgba(255,255,255," + (0.18 * a * lit + (p.ackFlash || 0) * 0.06).toFixed(3) + ")");
    spec.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(specX, specY, specR, 0, Math.PI * 2);
    ctx.fillStyle = spec;
    ctx.fill();
  }

  function drawAckFlash(p) {
    var env = p.ackFlash;
    if (!env || env < 0.02) return;
    var r = Math.max(p.role === "root" ? 8.4 : p.drawR, 3);
    var rgb = p.ackRgb || p.rgb;
    var white = mixRgb(rgb, [255, 255, 255], 0.38);
    var glowR = r * (0.84 + env * 0.72);
    var glow = ctx.createRadialGradient(p.x, p.y, r * 0.15, p.x, p.y, glowR);
    glow.addColorStop(0, rgba(white, env * 0.28));
    glow.addColorStop(0.35, rgba(rgb, env * 0.16));
    glow.addColorStop(1, rgba(rgb, 0));
    ctx.beginPath();
    ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x, p.y, r + 1.8 + env * 4.8, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(white, env * 0.28);
    ctx.lineWidth = 0.66 + env * 0.66;
    ctx.stroke();
  }

  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (hidden) {
      lastT = now;
      return;
    }
    var dt = lastT ? Math.min(48, now - lastT) : 16;
    lastT = now;
    rotY += ROT_Y_SPEED * dt;

    projectPoints();
    updateNeuralPulses(now, dt);
    applyNodeAcks(now);

    ctx.clearRect(0, 0, w, h);

    var i;
    for (i = 0; i < edges.length; i++) {
      var a = edges[i][0];
      var b = edges[i][1];
      if ((a.z + b.z) * 0.5 < -0.55) continue;
      var depthFadeE = 0.55 + 0.45 * ((a.depth + b.depth) / 2);
      var lineA = Math.max(a.active * 0.55, b.active * 0.55, 0.08) * depthFadeE;
      if (lineA < 0.02) continue;
      var rgb = edgeRgb(a, b);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = rgba(rgb, lineA);
      ctx.lineWidth = (a.role === "root" || b.role === "root" ? 1.25 : 1) * ((a.depth + b.depth) / 2);
      ctx.stroke();
    }

    drawNeuralPulses();

    var drawOrder = points.slice().sort(function (aa, bb) {
      return aa.z - bb.z;
    });
    for (i = 0; i < drawOrder.length; i++) {
      var p = drawOrder[i];
      if (p.z < -0.7) continue;
      drawOrb(p);
    }
    for (i = 0; i < drawOrder.length; i++) {
      drawAckFlash(drawOrder[i]);
    }
  }

  function onVis() {
    hidden = document.hidden;
    if (!hidden) lastT = 0;
  }

  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });
  document.addEventListener("visibilitychange", onVis);

  resize();
  seed();
  nextPulseAt = performance.now() + 400;
  nextBurstAt = performance.now() + 5000;
  raf = requestAnimationFrame(tick);
})();
