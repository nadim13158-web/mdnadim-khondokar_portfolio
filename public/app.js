(function () {
  'use strict';

  var ASSETS = window.__PORTFOLIO_ASSETS__ || {};
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var fine = window.matchMedia && window.matchMedia('(pointer:fine)').matches;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* 0. Hydrate Deduplicated Studio Assets */
  $$('[data-asset]').forEach(function (img) {
    var k = img.getAttribute('data-asset');
    if (ASSETS[k]) img.src = ASSETS[k];
  });

  /* Safe Smooth Scroll Helper */
  function smoothScrollTo(selector) {
    var id = selector.replace(/^#/, '');
    var el = id === 'top' ? document.body : document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href && href.length >= 1) {
      e.preventDefault();
      smoothScrollTo(href);
    }
  });

  /* 1. Boot Preloader */
  var boot = $('#boot');
  function dismissBoot() { if (boot) boot.classList.add('done'); }
  setTimeout(dismissBoot, 740);
  window.addEventListener('load', function () { setTimeout(dismissBoot, 520); });

  /* =========================================================================
   * 2. ULTRA-PREMIUM SPIDER-TECH CURSOR (Z-INDEX 2147483647 — NEVER HIDDEN)
   * ========================================================================= */
  var mx = window.innerWidth * 0.5;
  var my = window.innerHeight * 0.45;
  var hx = mx, hy = my;
  var prevHx = mx, prevHy = my;
  var cursorRoot = $('#cursor-root');
  var curCore = $('#cur-core');
  var curHalo = $('#cur-halo');
  var curLbl = $('#cur-lbl');
  var trailCvs = $('#cur-trail');
  var trailCtx = trailCvs ? trailCvs.getContext('2d') : null;
  var trailPts = [];
  var isHoveringInteractive = false;

  function resizeTrail() {
    if (!trailCvs) return;
    trailCvs.width = window.innerWidth;
    trailCvs.height = window.innerHeight;
  }

  if (fine && cursorRoot) {
    resizeTrail();
    window.addEventListener('resize', resizeTrail);

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      curCore.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      trailPts.push({ x: mx, y: my, life: 1.0 });
      if (trailPts.length > 18) trailPts.shift();
    }, { passive: true });

    window.addEventListener('mousedown', function (e) {
      curCore.classList.add('down');
      var rip = document.createElement('div');
      rip.className = 'cur-ripple';
      rip.style.left = e.clientX + 'px';
      rip.style.top = e.clientY + 'px';
      cursorRoot.appendChild(rip);
      setTimeout(function () { rip.remove(); }, 540);
    });

    window.addEventListener('mouseup', function () {
      curCore.classList.remove('down');
    });

    document.addEventListener('mouseover', function (e) {
      var hit = e.target.closest('a,button,input,textarea,.duo,.cd,[data-cursor]');
      isHoveringInteractive = !!hit;
      curHalo.classList.toggle('hover', isHoveringInteractive);

      var vHit = e.target.closest('[data-venom-btn]');
      curHalo.classList.toggle('venom-lock', !!vHit);

      var cNode = e.target.closest('[data-cursor]');
      var txt = cNode ? cNode.getAttribute('data-cursor') : '';
      if (txt) {
        curLbl.textContent = txt;
        curHalo.classList.add('has-lbl');
      } else {
        curHalo.classList.remove('has-lbl');
      }
    });

    (function loopPremiumCursor() {
      prevHx = hx;
      prevHy = hy;
      hx += (mx - hx) * 0.19;
      hy += (my - hy) * 0.19;

      var vx = hx - prevHx;
      var vy = hy - prevHy;
      var speed = Math.sqrt(vx * vx + vy * vy);

      if (!isHoveringInteractive && speed > 0.6 && !reducedMotion) {
        var angle = Math.atan2(vy, vx) * (180 / Math.PI);
        var stretch = Math.min(0.38, speed * 0.016);
        curHalo.style.transform =
          'translate3d(' + hx.toFixed(1) + 'px,' + hy.toFixed(1) + 'px,0) rotate(' +
          angle.toFixed(1) + 'deg) scale(' + (1 + stretch).toFixed(2) + ',' + (1 - stretch * 0.36).toFixed(2) + ')';
      } else {
        curHalo.style.transform = 'translate3d(' + hx.toFixed(1) + 'px,' + hy.toFixed(1) + 'px,0)';
      }

      if (trailCtx) {
        trailCtx.clearRect(0, 0, trailCvs.width, trailCvs.height);
        if (trailPts.length > 2) {
          for (var i = 1; i < trailPts.length; i++) {
            var p0 = trailPts[i - 1];
            var p1 = trailPts[i];
            p1.life *= 0.88;
            if (p1.life > 0.04) {
              trailCtx.beginPath();
              trailCtx.moveTo(p0.x, p0.y);
              trailCtx.lineTo(p1.x, p1.y);
              var alpha = (i / trailPts.length) * p1.life * 0.36;
              trailCtx.strokeStyle = 'rgba(255,45,120,' + alpha.toFixed(3) + ')';
              trailCtx.lineWidth = (i / trailPts.length) * 2.3;
              trailCtx.lineCap = 'round';
              trailCtx.stroke();
            }
          }
          trailPts[0].life *= 0.88;
          while (trailPts.length && trailPts[0].life < 0.05) trailPts.shift();
        }
      }

      /* Spidey-AI Lenses Subtle Cursor Tracking */
      var spLenses = $('#spideyLenses');
      var aiFab = $('#aiFab');
      if (spLenses && aiFab) {
        var fr = aiFab.getBoundingClientRect();
        var fcx = fr.left + fr.width * 0.5;
        var fcy = fr.top + fr.height * 0.5;
        var ldx = Math.max(-2.2, Math.min(2.2, (mx - fcx) / 180));
        var ldy = Math.max(-1.8, Math.min(1.8, (my - fcy) / 180));
        spLenses.style.transform = 'translate(' + ldx.toFixed(2) + 'px,' + ldy.toFixed(2) + 'px)';
      }

      requestAnimationFrame(loopPremiumCursor);
    })();
  }

  /* =========================================================================
   * 3. DARK GLOSSY BLACK OUTER-EDGE VENOM SYMBIOTE + MAGNETIC ATTRACTION
   *    (100% Pure Obsidian Wet-Black + Crisp Silver/White Wet Specular — ZERO Purple!)
   * ========================================================================= */
  var venomButtons = [];
  var DPR = Math.min(2, window.devicePixelRatio || 1);

  /* Returns exact point (x,y) and outward normal (nx,ny) on rounded pill perimeter for u in [0,1) */
  function pillPerimeterPoint(u, x0, y0, w, h) {
    var r = h * 0.5;
    var straight = Math.max(2, w - h);
    var totalLen = 2 * straight + 2 * Math.PI * r;
    var d = (((u % 1) + 1) % 1) * totalLen;

    if (d < straight) {
      /* Top edge left -> right */
      return { x: x0 + r + d, y: y0, nx: 0, ny: -1 };
    }
    d -= straight;
    if (d < Math.PI * r) {
      /* Right semicircle (-90deg -> +90deg) */
      var angR = -Math.PI * 0.5 + (d / r);
      return {
        x: x0 + r + straight + Math.cos(angR) * r,
        y: y0 + r + Math.sin(angR) * r,
        nx: Math.cos(angR),
        ny: Math.sin(angR)
      };
    }
    d -= Math.PI * r;
    if (d < straight) {
      /* Bottom edge right -> left */
      return { x: x0 + r + straight - d, y: y0 + h, nx: 0, ny: 1 };
    }
    d -= straight;
    /* Left semicircle (+90deg -> +270deg) */
    var angL = Math.PI * 0.5 + (d / r);
    return {
      x: x0 + r + Math.cos(angL) * r,
      y: y0 + r + Math.sin(angL) * r,
      nx: Math.cos(angL),
      ny: Math.sin(angL)
    };
  }

  /* Draw an organic S-curved, flared-base wet-glossy 3D black Venom tentacle */
  function drawGlossyVenomTendril(ctx, x0, y0, txBase, tyBase, c1x, c1y, c2x, c2y, x1, y1, baseW, tipW) {
    var steps = 14;
    var leftPts = [];
    var rightPts = [];
    var spinePts = [];

    for (var i = 0; i <= steps; i++) {
      var s = i / steps;
      var inv = 1 - s;
      /* Cubic Bezier position */
      var px = inv * inv * inv * x0 + 3 * inv * inv * s * c1x + 3 * inv * s * s * c2x + s * s * s * x1;
      var py = inv * inv * inv * y0 + 3 * inv * inv * s * c1y + 3 * inv * s * s * c2y + s * s * s * y1;

      /* Cubic Bezier derivative tangent */
      var dtx = 3 * inv * inv * (c1x - x0) + 6 * inv * s * (c2x - c1x) + 3 * s * s * (x1 - c2x);
      var dty = 3 * inv * inv * (c1y - y0) + 6 * inv * s * (c2y - c1y) + 3 * s * s * (y1 - c2y);
      var tLen = Math.sqrt(dtx * dtx + dty * dty) || 1;
      var nx = -dty / tLen;
      var ny = dtx / tLen;

      /* Flared liquid gusset at base (s < 0.25) tapering to slim whip neck + slight bulbous tip */
      var gusset = Math.pow(inv, 2.4) * (baseW * 0.68);
      var bodyW = baseW * 0.48 * Math.pow(inv, 0.72) + tipW * (0.75 + 0.35 * Math.sin(s * Math.PI));
      var halfW = (gusset + bodyW) * 0.5;
      if (i === 0) {
        /* Anchor smoothly along pill tangent */
        nx = txBase;
        ny = tyBase;
      }

      spinePts.push({ x: px, y: py, nx: nx, ny: ny, w: halfW });
      leftPts.push({ x: px + nx * halfW, y: py + ny * halfW });
      rightPts.push({ x: px - nx * halfW, y: py - ny * halfW });
    }

    /* 1. Pitch-black liquid symbiote silhouette + soft dark-silver rim aura */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(leftPts[0].x, leftPts[0].y);
    for (var j = 1; j <= steps; j++) ctx.lineTo(leftPts[j].x, leftPts[j].y);
    for (var k = steps; k >= 0; k--) ctx.lineTo(rightPts[k].x, rightPts[k].y);
    ctx.closePath();

    ctx.shadowColor = 'rgba(205, 218, 236, 0.24)';
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#030305';
    ctx.fill();
    ctx.restore();

    /* Glossy bulbous symbiote droplet at tip */
    ctx.beginPath();
    ctx.arc(x1, y1, tipW * 1.18, 0, Math.PI * 2);
    ctx.fillStyle = '#030305';
    ctx.fill();

    /* 2. Broken Wet-Tar Specular Glint along upper-lit S-curve crest */
    ctx.beginPath();
    for (var m = 2; m < steps; m++) {
      var sp = spinePts[m];
      var sx = sp.x - 0.5 - sp.nx * (sp.w * 0.34);
      var sy = sp.y - 0.6 - Math.abs(sp.ny) * (sp.w * 0.34);
      if (m === 2) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = 'rgba(245, 250, 255, 0.72)';
    ctx.lineWidth = 0.9;
    ctx.lineCap = 'round';
    ctx.stroke();

    /* Crisp pinhole wet highlight on droplet tip */
    ctx.beginPath();
    ctx.arc(x1 - 0.5, y1 - 0.5, Math.max(0.6, tipW * 0.42), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
    ctx.fill();
  }

  function setupVenomButtons() {
    venomButtons = [];
    $$('[data-venom-btn]').forEach(function (btn) {
      var cvs = $('.venom-cvs', btn);
      if (!cvs) return;
      var vctx = cvs.getContext('2d');

      /* 10 sinuous sweeping outer-border symbiote tentacles */
      var tendrils = [];
      for (var i = 0; i < 10; i++) {
        tendrils.push({
          uBase: i / 10 + (i % 2) * 0.018,
          speed: 1.25 + (i % 4) * 0.36,
          phase: i * 1.62,
          dir: i % 2 === 0 ? 1 : -1,
          maxLen: 11 + (i % 3) * 5.5
        });
      }

      venomButtons.push({
        btn: btn,
        cvs: cvs,
        ctx: vctx,
        w: 0,
        h: 0,
        bx: 0, by: 0,
        vx: 0, vy: 0,
        attract: 0,
        reachX: 0, reachY: 0,
        phase: Math.random() * 6.28,
        tendrils: tendrils
      });
    });
  }
  setupVenomButtons();

  function renderVenomSymbiote(now) {
    var t = now * 0.001;

    for (var idx = 0; idx < venomButtons.length; idx++) {
      var vb = venomButtons[idx];
      var bRect = vb.btn.getBoundingClientRect();
      if (bRect.width < 10 || bRect.bottom < -80 || bRect.top > window.innerHeight + 80) continue;

      var padX = 42, padY = 38;
      var cssW = Math.round(bRect.width + padX * 2);
      var cssH = Math.round(bRect.height + padY * 2);
      if (vb.w !== cssW || vb.h !== cssH) {
        vb.w = cssW;
        vb.h = cssH;
        vb.cvs.width = Math.round(cssW * DPR);
        vb.cvs.height = Math.round(cssH * DPR);
      }

      /* Magnetic Spring Attraction toward Pointer */
      var restCx = bRect.left + bRect.width * 0.5 - vb.bx;
      var restCy = bRect.top + bRect.height * 0.5 - vb.by;
      var dx = mx - restCx;
      var dy = my - restCy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var MAG_ZONE = 138;

      var targetX = 0, targetY = 0, targetAttract = 0;
      if (fine && dist < MAG_ZONE) {
        var pull = 1 - dist / MAG_ZONE;
        targetX = dx * 0.36 * pull;
        targetY = dy * 0.42 * pull;
        targetAttract = pull;
      }

      vb.vx = (vb.vx + (targetX - vb.bx) * 0.16) * 0.74;
      vb.vy = (vb.vy + (targetY - vb.by) * 0.16) * 0.74;
      vb.bx += vb.vx;
      vb.by += vb.vy;
      vb.attract += (targetAttract - vb.attract) * 0.15;

      vb.btn.style.transform = 'translate3d(' + vb.bx.toFixed(2) + 'px,' + vb.by.toFixed(2) + 'px,0)';

      var ctx = vb.ctx;
      ctx.save();
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      var pillX = padX, pillY = padY;
      var pillW = cssW - padX * 2;
      var pillH = cssH - padY * 2;

      /* A. Asymmetric Liquid Black-Tar Lobes Hugging the OUTSIDE Border of the Button */
      var N_COLLAR = 56;
      var collarPts = [];
      for (var c = 0; c < N_COLLAR; c++) {
        var u = c / N_COLLAR;
        var bp = pillPerimeterPoint(u, pillX, pillY, pillW, pillH);
        var lobe =
          Math.pow(0.5 + 0.5 * Math.sin(u * Math.PI * 8 + t * 2.4 + vb.phase), 1.6) * 5.2 +
          Math.pow(0.5 + 0.5 * Math.cos(u * Math.PI * 14 - t * 1.9), 1.8) * 3.1 +
          1.4 + vb.attract * 2.4;
        collarPts.push({
          x: bp.x + bp.nx * lobe,
          y: bp.y + bp.ny * lobe,
          nx: bp.nx,
          ny: bp.ny,
          lobe: lobe
        });
      }

      ctx.save();
      ctx.beginPath();
      for (var cIdx = 0; cIdx < N_COLLAR; cIdx++) {
        var p0 = collarPts[cIdx];
        var p1 = collarPts[(cIdx + 1) % N_COLLAR];
        var midX = (p0.x + p1.x) * 0.5;
        var midY = (p0.y + p1.y) * 0.5;
        if (cIdx === 0) ctx.moveTo(midX, midY);
        else ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
      }
      ctx.closePath();
      ctx.shadowColor = 'rgba(205, 218, 236, 0.22)';
      ctx.shadowBlur = 7;
      ctx.fillStyle = '#020204';
      ctx.fill();
      ctx.restore();

      /* Localized Wet-Oil Specular Glints ONLY on Convex Lit Wave Crests (no continuous grey wire!) */
      for (var sIdx = 0; sIdx < N_COLLAR; sIdx++) {
        var cpA = collarPts[sIdx];
        var cpB = collarPts[(sIdx + 1) % N_COLLAR];
        /* Studio light hits upper & left-facing crests + high-bulge lobes */
        var lightDot = -cpA.ny * 0.72 - cpA.nx * 0.35;
        if (cpA.lobe > 4.2 && lightDot > -0.15) {
          ctx.beginPath();
          ctx.moveTo(cpA.x - cpA.nx * 0.8, cpA.y - cpA.ny * 0.8);
          ctx.lineTo(cpB.x - cpB.nx * 0.8, cpB.y - cpB.ny * 0.8);
          var glintAlpha = Math.min(0.78, Math.max(0.14, (lightDot + 0.25) * 0.72));
          ctx.strokeStyle = 'rgba(245, 250, 255,' + glintAlpha.toFixed(2) + ')';
          ctx.lineWidth = 1.05;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      /* B. Sweeping S-Curved Liquid Symbiote Tentacles + Concave Meniscus Slime Webbing */
      var activeTips = [];
      for (var ti = 0; ti < vb.tendrils.length; ti++) {
        var td = vb.tendrils[ti];
        var driftU = td.uBase + Math.sin(t * 0.65 + td.phase) * 0.032;
        var anchor = pillPerimeterPoint(driftU, pillX, pillY, pillW, pillH);

        var pulse = 0.38 + 0.62 * (0.5 + 0.5 * Math.sin(t * td.speed + td.phase));
        var len = td.maxLen * pulse + vb.attract * 5.5;
        var tangX = -anchor.ny;
        var tangY = anchor.nx;

        /* Sweeping S-curve: sweeps tangentially along edge first, then curls outward */
        var sweep1 = td.dir * (6.5 + Math.sin(t * td.speed * 1.2 + td.phase) * 4.5);
        var sweep2 = -td.dir * (4.0 + Math.cos(t * td.speed * 1.5 + td.phase) * 5.5);

        var c1x = anchor.x + anchor.nx * (len * 0.35) + tangX * sweep1;
        var c1y = anchor.y + anchor.ny * (len * 0.35) + tangY * sweep1;
        var c2x = anchor.x + anchor.nx * (len * 0.78) + tangX * sweep2;
        var c2y = anchor.y + anchor.ny * (len * 0.78) + tangY * sweep2;
        var endX = anchor.x + anchor.nx * len + tangX * (sweep1 * 0.55 + sweep2 * 0.45);
        var endY = anchor.y + anchor.ny * len + tangY * (sweep1 * 0.55 + sweep2 * 0.45);

        activeTips.push({
          ax: anchor.x, ay: anchor.y,
          mx: c1x, my: c1y,
          ex: endX, ey: endY,
          nx: anchor.nx, ny: anchor.ny
        });

        drawGlossyVenomTendril(
          ctx,
          anchor.x - anchor.nx * 1.5, anchor.y - anchor.ny * 1.5,
          tangX, tangY,
          c1x, c1y, c2x, c2y,
          endX, endY,
          7.6, 1.15
        );
      }

      /* Concave meniscus slime strands stretching between neighboring tentacles */
      for (var wi = 0; wi < activeTips.length; wi++) {
        var aTip = activeTips[wi];
        var bTip = activeTips[(wi + 1) % activeTips.length];
        var wdx = aTip.ex - bTip.ex;
        var wdy = aTip.ey - bTip.ey;
        var wDist = Math.sqrt(wdx * wdx + wdy * wdy);
        if (wDist < 38) {
          /* Pull control point inward toward button border for authentic stretched-slime meniscus! */
          var pullInX = ((aTip.ax + bTip.ax) * 0.5 + (aTip.mx + bTip.mx) * 0.5) * 0.5;
          var pullInY = ((aTip.ay + bTip.ay) * 0.5 + (aTip.my + bTip.my) * 0.5) * 0.5;
          ctx.beginPath();
          ctx.moveTo(aTip.mx, aTip.my);
          ctx.quadraticCurveTo(pullInX, pullInY, bTip.mx, bTip.my);
          ctx.strokeStyle = '#030305';
          ctx.lineWidth = 2.1;
          ctx.stroke();
          ctx.strokeStyle = 'rgba(240, 247, 255, 0.46)';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      /* C. Magnetic Cursor-Seeking S-Curved Venom Tentacles Erupting from Outer Border! */
      if (vb.attract > 0.03) {
        var cvsRect = vb.cvs.getBoundingClientRect();
        var localMx = mx - cvsRect.left;
        var localMy = my - cvsRect.top;
        vb.reachX += (localMx - vb.reachX) * 0.24;
        vb.reachY += (localMy - vb.reachY) * 0.24;

        var centerPx = pillX + pillW * 0.5;
        var centerPy = pillY + pillH * 0.5;
        var angToCur = Math.atan2(vb.reachY - centerPy, vb.reachX - centerPx);
        var baseU = ((angToCur + Math.PI * 0.5) / (Math.PI * 2) + 1) % 1;
        var reachPoints = [];

        for (var rIdx = -1.5; rIdx <= 1.5; rIdx += 1.0) {
          var uOff = baseU + rIdx * 0.048;
          var rAnchor = pillPerimeterPoint(uOff, pillX, pillY, pillW, pillH);
          var rTangX = -rAnchor.ny, rTangY = rAnchor.nx;
          var reachFactor = Math.min(1.0, vb.attract * 1.18);

          var txEnd = rAnchor.x + (vb.reachX - rAnchor.x) * (0.72 * reachFactor) + Math.sin(t * 5 + rIdx * 2) * 3.5;
          var tyEnd = rAnchor.y + (vb.reachY - rAnchor.y) * (0.72 * reachFactor) + Math.cos(t * 4.5 + rIdx * 2) * 3.5;
          txEnd = Math.max(4, Math.min(cssW - 4, txEnd));
          tyEnd = Math.max(4, Math.min(cssH - 4, tyEnd));

          var sWave = Math.sin(t * 6.0 + rIdx * 1.8) * 8.0;
          var rc1x = rAnchor.x + (txEnd - rAnchor.x) * 0.34 + rTangX * sWave;
          var rc1y = rAnchor.y + (tyEnd - rAnchor.y) * 0.34 + rTangY * sWave;
          var rc2x = rAnchor.x + (txEnd - rAnchor.x) * 0.72 - rTangX * (sWave * 0.65);
          var rc2y = rAnchor.y + (tyEnd - rAnchor.y) * 0.72 - rTangY * (sWave * 0.65);

          drawGlossyVenomTendril(
            ctx,
            rAnchor.x - rAnchor.nx * 1.5, rAnchor.y - rAnchor.ny * 1.5,
            rTangX, rTangY,
            rc1x, rc1y, rc2x, rc2y,
            txEnd, tyEnd,
            8.4, 1.3
          );
          reachPoints.push({ x: txEnd, y: tyEnd, ax: rAnchor.x, ay: rAnchor.y, mx: rc1x, my: rc1y });
        }

        /* Concave slime strands webbing the cursor-seeking tentacles together */
        for (var ri = 0; ri < reachPoints.length - 1; ri++) {
          var rp0 = reachPoints[ri];
          var rp1 = reachPoints[ri + 1];
          ctx.beginPath();
          ctx.moveTo(rp0.mx, rp0.my);
          ctx.quadraticCurveTo((rp0.ax + rp1.ax) * 0.5, (rp0.ay + rp1.ay) * 0.5, rp1.mx, rp1.my);
          ctx.strokeStyle = '#030305';
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.strokeStyle = 'rgba(242, 248, 255, 0.50)';
          ctx.lineWidth = 0.65;
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    requestAnimationFrame(renderVenomSymbiote);
  }
  requestAnimationFrame(renderVenomSymbiote);

  /* =========================================================================
   * 4. AMBIENT WEB-CONSTELLATION BACKGROUND CANVAS
   * ========================================================================= */
  var cvs = $('#web-canvas');
  var ctx = cvs ? cvs.getContext('2d') : null;
  var cw = 0, ch = 0, pts = [];
  function resizeWebCanvas() {
    if (!cvs) return;
    cw = cvs.width = window.innerWidth;
    ch = cvs.height = window.innerHeight;
    var count = Math.min(44, Math.max(18, Math.floor((cw * ch) / 36000)));
    pts = [];
    for (var i = 0; i < count; i++) {
      pts.push({
        x: Math.random() * cw,
        y: Math.random() * ch,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.4 + 0.6,
        red: i % 5 === 0
      });
    }
  }
  if (cvs && ctx) {
    resizeWebCanvas();
    window.addEventListener('resize', resizeWebCanvas);
    (function drawWeb() {
      ctx.clearRect(0, 0, cw, ch);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > cw) p.vx *= -1;
        if (p.y < 0 || p.y > ch) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.red ? 'rgba(209,22,43,0.62)' : 'rgba(255,255,255,0.26)';
        ctx.fill();

        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < 142) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            var a = (1 - d / 142) * 0.11;
            ctx.strokeStyle = (p.red || q.red) ? 'rgba(209,22,43,' + (a * 1.4) + ')' : 'rgba(255,255,255,' + a + ')';
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
        if (fine) {
          var mdx = p.x - mx, mdy = p.y - my;
          var md = Math.sqrt(mdx * mdx + mdy * mdy);
          if (md < 175) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
            ctx.strokeStyle = 'rgba(255,45,120,' + ((1 - md / 175) * 0.16) + ')';
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawWeb);
    })();
  }

  /* =========================================================================
   * 5. HERO REALISTIC 3D SPIDER-MAN SPOTLIGHT + SUIT MODE TOGGLE
   * ========================================================================= */
  var hd = $('#hd'), heroBase = $('#heroBase'), heroReveal = $('#heroReveal');
  var suitBtn = $('#suitToggle'), suitTxt = $('#suitTxt');
  var cyberActive = false;

  if (suitBtn) {
    suitBtn.addEventListener('click', function () {
      cyberActive = !cyberActive;
      document.body.classList.toggle('cyber-mode', cyberActive);
      suitBtn.classList.toggle('cyber', cyberActive);
      suitTxt.textContent = cyberActive ? 'SUIT: STEALTH' : 'SUIT: CLASSIC';
      if (ASSETS.classic && ASSETS.cyber) {
        heroBase.src = cyberActive ? ASSETS.cyber : ASSETS.classic;
        heroReveal.src = cyberActive ? ASSETS.classic : ASSETS.cyber;
      }
    });
  }

  if (hd) {
    var tx = 0.5, ty = 0.36, cx = 0.5, cy = 0.36, autoScan = true, t0 = performance.now();
    $('#top').addEventListener('mousemove', function (e) {
      autoScan = false;
      var r = hd.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      var px = (e.clientX / window.innerWidth - 0.5) * -22;
      var py = (e.clientY / window.innerHeight - 0.5) * -12;
      hd.style.transform = 'translateX(-50%) translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px)';
    }, { passive: true });
    $('#top').addEventListener('mouseleave', function () {
      autoScan = true;
      hd.style.transform = 'translateX(-50%)';
    });
    (function animHero(t) {
      if (autoScan) {
        var s = (t - t0) / 2100;
        tx = 0.5 + Math.sin(s) * 0.17;
        ty = 0.36 + Math.sin(s * 1.6) * 0.11;
      }
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      hd.style.setProperty('--mx', (cx * 100).toFixed(2) + '%');
      hd.style.setProperty('--my', (cy * 100).toFixed(2) + '%');
      requestAnimationFrame(animHero);
    })(t0);
  }

  /* 6. Mobile Drawer */
  var drawer = $('#drawer');
  $('#menuOpen').addEventListener('click', function () { drawer.classList.add('open'); });
  $('#menuClose').addEventListener('click', function () { drawer.classList.remove('open'); });
  $$('.d-lk').forEach(function (a) {
    a.addEventListener('click', function () { drawer.classList.remove('open'); });
  });

  /* 7. Dual Persona Slider */
  var duo = $('#duo'), duoPct = $('#duoPct'), dgDuo = false;
  function updateDuo(clientX) {
    var r = duo.getBoundingClientRect();
    var p = Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100));
    duo.style.setProperty('--p', p.toFixed(1) + '%');
    var leftP = Math.round(p);
    duoPct.textContent = leftP + '% / ' + (100 - leftP) + '%';
  }
  if (duo) {
    duo.addEventListener('pointerdown', function (e) {
      dgDuo = true; updateDuo(e.clientX);
      try { duo.setPointerCapture(e.pointerId); } catch (_) {}
    });
    duo.addEventListener('pointermove', function (e) {
      if (dgDuo || e.pointerType === 'mouse') updateDuo(e.clientX);
    });
    duo.addEventListener('pointerup', function () { dgDuo = false; });
  }

  /* 8. Scroll Reveal + Skill Bars */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.14 });
  $$('.rv').forEach(function (el, i) {
    el.style.transitionDelay = ((i % 3) * 0.09) + 's';
    io.observe(el);
  });

  /* =========================================================================
   * 9. 3D PROJECT STAGE SLIDER (CONTINUOUS SMOOTH AUTO-SLIDE + MANUAL CONTROLS)
   * ========================================================================= */
  var stageWrap = $('#stageWrap');
  var stageViewport = $('#stageViewport');
  var allCards = $$('.cd', stageViewport);
  var stageDots = $('#stageDots');
  var stageCount = $('#stageCount');
  var isGridMode = false;
  var currentFilter = 'all';
  var visibleCards = allCards.slice();
  var activeSlide = 0;
  var autoSlideTimer = null;
  var AUTO_SLIDE_MS = 3200;

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function resetAutoSlide() {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(function () {
      if (isGridMode || reducedMotion) return;
      if (document.hidden) return;
      if (modalBg && modalBg.classList.contains('open')) return;
      if (dragStartX !== null) return;
      if (visibleCards.length <= 1) return;
      activeSlide = (activeSlide + 1) % visibleCards.length;
      layout3DStage();
    }, AUTO_SLIDE_MS);
  }

  function rebuildDots() {
    stageDots.innerHTML = '';
    visibleCards.forEach(function (_, idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 's-dot' + (idx === activeSlide ? ' on' : '');
      b.setAttribute('aria-label', 'Go to slide ' + (idx + 1));
      b.addEventListener('click', function () {
        activeSlide = idx;
        layout3DStage();
        resetAutoSlide();
      });
      stageDots.appendChild(b);
    });
  }

  function layout3DStage() {
    if (isGridMode) {
      allCards.forEach(function (c) {
        var match = currentFilter === 'all' || c.getAttribute('data-cat') === currentFilter;
        c.classList.remove('is-active', 'is-side', 'is-far', 'is-hidden');
        c.classList.toggle('cat-hide', !match);
        c.style.transform = '';
        c.style.opacity = '';
        c.style.zIndex = '';
      });
      return;
    }

    var total = visibleCards.length;
    if (total === 0) return;
    activeSlide = ((activeSlide % total) + total) % total;

    allCards.forEach(function (c) {
      c.classList.remove('cat-hide', 'is-active', 'is-side', 'is-far', 'is-hidden');
      if (visibleCards.indexOf(c) === -1) {
        c.classList.add('is-hidden');
      }
    });

    var isMobile = window.innerWidth < 700;

    visibleCards.forEach(function (card, idx) {
      var diff = idx - activeSlide;
      if (total > 2) {
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;
      }

      var absD = Math.abs(diff);
      if (diff === 0) {
        card.classList.add('is-active');
        card.style.zIndex = '25';
        card.style.opacity = '1';
        card.style.transform = 'translate3d(0, 0, 80px) rotateY(0deg) scale(1)';
      } else if (absD === 1) {
        card.classList.add('is-side');
        card.style.zIndex = '15';
        card.style.opacity = isMobile ? '0.35' : '0.82';
        var tx1 = diff * (isMobile ? 74 : 56);
        var ry1 = diff * -30;
        card.style.transform = 'translate3d(' + tx1 + '%, 0, -135px) rotateY(' + ry1 + 'deg) scale(0.86)';
      } else if (absD === 2) {
        card.classList.add('is-far');
        card.style.zIndex = '8';
        card.style.opacity = isMobile ? '0' : '0.42';
        var tx2 = diff > 0 ? 94 : -94;
        var ry2 = diff > 0 ? -46 : 46;
        card.style.transform = 'translate3d(' + tx2 + '%, 0, -290px) rotateY(' + ry2 + 'deg) scale(0.72)';
      } else {
        card.classList.add('is-hidden');
      }
    });

    $$('.s-dot', stageDots).forEach(function (d, i) {
      d.classList.toggle('on', i === activeSlide);
    });
    stageCount.textContent = pad2(activeSlide + 1) + ' / ' + pad2(total);
  }

  function stepSlide(delta) {
    if (visibleCards.length <= 1) return;
    activeSlide = (activeSlide + delta + visibleCards.length) % visibleCards.length;
    layout3DStage();
    resetAutoSlide();
  }

  $('#stagePrev').addEventListener('click', function () { stepSlide(-1); });
  $('#stageNext').addEventListener('click', function () { stepSlide(1); });

  /* Touch & Mouse Drag Swipe on 3D Stage + Auto-Slide Reset */
  var dragStartX = null, didSwipe = false;
  stageViewport.addEventListener('pointerdown', function (e) {
    if (isGridMode) return;
    dragStartX = e.clientX;
    didSwipe = false;
  });
  stageViewport.addEventListener('pointermove', function (e) {
    if (dragStartX === null || isGridMode) return;
    var dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 46) {
      didSwipe = true;
      stepSlide(dx < 0 ? 1 : -1);
      dragStartX = null;
    }
  });
  window.addEventListener('pointerup', function () { dragStartX = null; });

  window.addEventListener('keydown', function (e) {
    if (modalBg.classList.contains('open') || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
    var wr = $('#work').getBoundingClientRect();
    if (wr.top < window.innerHeight * 0.8 && wr.bottom > 100) {
      if (e.key === 'ArrowRight') stepSlide(1);
      if (e.key === 'ArrowLeft') stepSlide(-1);
    }
  });

  allCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      if (!fine) return;
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');

      if (isGridMode || card.classList.contains('is-active')) {
        var rxDeg = (0.5 - py) * 11;
        var ryDeg = (px - 0.5) * 12;
        var zLift = isGridMode ? '0px' : '92px';
        card.style.transition = 'transform 0.12s ease-out, border-color 0.35s, box-shadow 0.35s';
        card.style.transform = 'translate3d(0, -4px, ' + zLift + ') rotateX(' + rxDeg.toFixed(2) + 'deg) rotateY(' + ryDeg.toFixed(2) + 'deg)';
      }
    });
    card.addEventListener('mouseleave', function () {
      card.style.transition = '';
      layout3DStage();
    });
  });

  $('#view3d').addEventListener('click', function () {
    isGridMode = false;
    $('#view3d').classList.add('act');
    $('#viewGrid').classList.remove('act');
    stageWrap.classList.remove('grid-mode');
    layout3DStage();
  });
  $('#viewGrid').addEventListener('click', function () {
    isGridMode = true;
    $('#viewGrid').classList.add('act');
    $('#view3d').classList.remove('act');
    stageWrap.classList.add('grid-mode');
    layout3DStage();
  });

  $$('.f-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.f-btn').forEach(function (b) { b.classList.remove('act'); });
      btn.classList.add('act');
      currentFilter = btn.getAttribute('data-filter');
      visibleCards = allCards.filter(function (c) {
        return currentFilter === 'all' || c.getAttribute('data-cat') === currentFilter;
      });
      activeSlide = 0;
      rebuildDots();
      layout3DStage();
    });
  });

  window.addEventListener('resize', layout3DStage);

  /* Classified Dossier Modal */
  var dossiers = [
    {
      code: 'FILE_01 // GRAPHIC DESIGN DOSSIER',
      title: 'Brand & Social Media Creatives',
      desc: 'Clean, eye-catching visuals designed to make brands stand out on crowded feeds. Every asset balances bold focal hierarchy, cohesive color contrast, and crisp typography.',
      items: [
        'Social media post & carousel series (Instagram, Facebook, LinkedIn)',
        'Promotional ad banners & product highlight graphics',
        'Visual identity elements, logos & brand color palettes',
        'High-resolution export packages ready for instant publishing'
      ],
      svc: 'Social Media Creatives'
    },
    {
      code: 'FILE_02 // EDITORIAL & CAMPAIGN ART',
      title: 'Posters, Banners & Key Visuals',
      desc: 'Dramatic poster compositions, YouTube thumbnails, and digital campaign banners engineered to capture attention within a split second.',
      items: [
        'Event, music, sports & promotional poster designs',
        'High-CTR YouTube thumbnails & channel cover branding',
        'Photo compositing, lighting effects & studio color grading',
        'Print-ready & screen-optimized deliverables'
      ],
      svc: 'Graphic Design'
    },
    {
      code: 'FILE_03 // FRONTEND CODE LAB',
      title: 'Learning to Code & Interactive Web UI',
      desc: 'Bridging graphic design with clean web development. Building modern, responsive layouts with semantic HTML5, custom CSS3 styling, and interactive JavaScript.',
      items: [
        'Personal portfolio & clean single-page landing layouts',
        'Responsive dark-mode UI design with Flexbox & CSS Grid',
        'Smooth CSS animations, hover effects & interactive DOM features',
        'Designed first with a graphic designer’s eye for detail'
      ],
      svc: 'Web / Landing Page'
    },
    {
      code: 'FILE_04 // CREATOR BRANDING KIT',
      title: 'Creator & Channel Branding Kits',
      desc: 'Cohesive visual branding built for YouTubers, streamers, and content creators who want an unmistakable dark/neon aesthetic across every platform.',
      items: [
        'Custom YouTube & social channel banners + matching profile marks',
        'Stream starting/ending screens & clean HUD overlays',
        'Reusable high-impact thumbnail design styleframes',
        'Consistent typography & color system tailored to your persona'
      ],
      svc: 'Creator Branding Kit'
    },
    {
      code: 'FILE_05 // OPEN COLLABORATION',
      title: 'Your Next Project Starts Here',
      desc: 'Looking for custom visuals, social media creatives, or a sleek personal web page? Tell me what you are building and let’s bring it to life together.',
      items: [
        'Direct 1-on-1 communication with MD Nadim Khondokar',
        'Tailored design concepts built specifically around your brand',
        'Careful revisions until the visual hits the mark',
        'Fast turnaround & clean organized deliverables'
      ],
      svc: 'Graphic Design'
    }
  ];

  var modalBg = $('#modalBg'), currentSvc = 'Graphic Design';
  function openModal(idx) {
    var d = dossiers[idx];
    if (!d) return;
    $('#mCode').textContent = d.code;
    $('#mTitle').textContent = d.title;
    $('#mDesc').textContent = d.desc;
    var mList = $('#mList');
    mList.innerHTML = '';
    d.items.forEach(function (it) {
      var row = document.createElement('div');
      row.textContent = it;
      mList.appendChild(row);
    });
    currentSvc = d.svc;
    modalBg.classList.add('open');
  }
  function closeModal() { modalBg.classList.remove('open'); }

  allCards.forEach(function (card) {
    card.addEventListener('click', function () {
      if (didSwipe) { didSwipe = false; return; }
      var visIdx = visibleCards.indexOf(card);
      if (!isGridMode && visIdx !== -1 && visIdx !== activeSlide) {
        activeSlide = visIdx;
        layout3DStage();
        resetAutoSlide();
        return;
      }
      openModal(parseInt(card.getAttribute('data-id'), 10));
    });
  });

  $('#mClose').addEventListener('click', closeModal);
  $('#mDismiss').addEventListener('click', closeModal);
  modalBg.addEventListener('click', function (e) { if (e.target === modalBg) closeModal(); });

  $('#mStart').addEventListener('click', function () {
    closeModal();
    selectService(currentSvc);
    smoothScrollTo('#contact');
    setTimeout(function () { $('#n').focus(); }, 480);
  });

  rebuildDots();
  layout3DStage();
  resetAutoSlide();

  /* =========================================================================
   * 10. UNIQUE SPIDEY-VINYL 2-SONG AUTO-DJ PLAYLIST
   *     Track 1: BARSAAT — Banjaare (Spidey Ed.)
   *     Track 2: ALFAAZ  — Hamza Malik x Zain Zohaib
   *     Auto-plays next song seamlessly when current song finishes!
   * ========================================================================= */
  var STANDALONE_SONGS = window.__STANDALONE_SONGS__ || {};
  var PLAYLIST = [
    {
      id: 'barsaat',
      title: 'BARSAAT',
      artist: 'BANJAARE · SPIDEY ED.',
      src: STANDALONE_SONGS.barsaat || '/barsaat.mp3',
      fallbackDur: 185.36
    },
    {
      id: 'alfaaz',
      title: 'ALFAAZ',
      artist: 'HAMZA MALIK · ZAIN ZOHAIB',
      src: STANDALONE_SONGS.alfaaz || '/alfaaz.mp3',
      fallbackDur: 219.90
    }
  ];

  var trackIdx = 0;
  var autoNextMode = true; /* Default ON: song 1 ends -> song 2 auto-plays -> song 1 auto-plays! */
  var musicWidget = $('#musicWidget');
  var bgSong = $('#bgSong');
  var musicOrb = $('#musicOrb');
  var musicPill = $('#musicPill');
  var musicBadge = $('#musicBadge');
  var musicTitle = $('#musicTitle');
  var musicArtist = $('#musicArtist');
  var musicTrackBadge = $('#musicTrackBadge');
  var musicFill = $('#musicFill');
  var musicTime = $('#musicTime');
  var musicSeek = $('#musicSeek');
  var musicPrev = $('#musicPrev');
  var musicNext = $('#musicNext');
  var musicLoop = $('#musicLoop');
  var deckTimer = null;

  function loadTrackMeta(idx, shouldPlay) {
    trackIdx = ((idx % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length;
    var trk = PLAYLIST[trackIdx];
    if (!bgSong) return;

    bgSong.loop = !autoNextMode;
    bgSong.src = trk.src;
    bgSong.load();

    if (musicTitle) musicTitle.textContent = trk.title;
    if (musicArtist) musicArtist.textContent = trk.artist;
    if (musicTrackBadge) musicTrackBadge.textContent = (trackIdx + 1) + '/' + PLAYLIST.length;

    syncMusicUI();

    if (shouldPlay) {
      var p = bgSong.play();
      if (p && typeof p.then === 'function') {
        p.then(syncMusicUI).catch(function () {
          setTimeout(function () {
            var pRetry = bgSong.play();
            if (pRetry && typeof pRetry.catch === 'function') pRetry.catch(function () {});
          }, 80);
        });
      }
    }
  }

  function showDeckBriefly(ms) {
    if (!musicWidget) return;
    musicWidget.classList.add('deck-open');
    if (deckTimer) clearTimeout(deckTimer);
    deckTimer = setTimeout(function () {
      musicWidget.classList.remove('deck-open');
    }, ms || 4500);
  }

  function fmtTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' + s : s);
  }

  function syncMusicUI() {
    if (!bgSong) return;
    var trk = PLAYLIST[trackIdx];
    var playing = !bgSong.paused && !bgSong.ended;
    musicWidget.classList.toggle('playing', playing);
    musicBadge.textContent = playing ? '❚❚' : '▶';
    musicOrb.setAttribute('data-cursor', playing ? 'PAUSE' : 'PLAY SONG');

    if (musicTitle) musicTitle.textContent = trk.title;
    if (musicArtist) musicArtist.textContent = trk.artist;
    if (musicTrackBadge) musicTrackBadge.textContent = (trackIdx + 1) + '/' + PLAYLIST.length;

    var dur = (isFinite(bgSong.duration) && bgSong.duration > 1) ? bgSong.duration : trk.fallbackDur;
    var cur = bgSong.currentTime || 0;
    var pct = Math.max(0, Math.min(100, (cur / dur) * 100));
    musicFill.style.width = pct.toFixed(2) + '%';
    musicSeek.setAttribute('aria-valuenow', String(Math.round(pct)));
    musicTime.textContent = fmtTime(cur) + ' / ' + fmtTime(dur);
    if (musicPill) {
      musicPill.textContent = playing ? ('♪ ' + trk.title + ' · ' + fmtTime(cur)) : ('♪ ' + trk.title);
    }
  }

  if (bgSong && musicOrb) {
    /* Initialize Track 1 source cleanly (critical for standalone data URI mode too) */
    bgSong.loop = false;
    if (STANDALONE_SONGS.barsaat) {
      bgSong.src = STANDALONE_SONGS.barsaat;
    }

    /* Direct synchronous user-gesture play/pause (100% iOS Safari, Android Chrome & PC safe) */
    musicOrb.addEventListener('click', function () {
      if (bgSong.paused || bgSong.ended) {
        if (bgSong.ended) bgSong.currentTime = 0;
        showDeckBriefly(4500);
        var playPromise = bgSong.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(syncMusicUI).catch(function () {
            bgSong.load();
            var p2 = bgSong.play();
            if (p2 && typeof p2.catch === 'function') p2.catch(function () {});
          });
        }
      } else {
        bgSong.pause();
      }
      syncMusicUI();
    });

    if (musicPill) {
      musicPill.addEventListener('click', function () {
        showDeckBriefly(6500);
      });
    }

    if (musicPrev) {
      musicPrev.addEventListener('click', function () {
        showDeckBriefly(5000);
        loadTrackMeta(trackIdx - 1, true);
      });
    }
    if (musicNext) {
      musicNext.addEventListener('click', function () {
        showDeckBriefly(5000);
        loadTrackMeta(trackIdx + 1, true);
      });
    }

    document.addEventListener('pointerdown', function (e) {
      if (musicWidget && !musicWidget.contains(e.target)) {
        musicWidget.classList.remove('deck-open');
      }
    });

    bgSong.addEventListener('play', syncMusicUI);
    bgSong.addEventListener('playing', syncMusicUI);
    bgSong.addEventListener('pause', syncMusicUI);
    bgSong.addEventListener('loadedmetadata', syncMusicUI);
    bgSong.addEventListener('durationchange', syncMusicUI);
    bgSong.addEventListener('timeupdate', syncMusicUI);

    /* AUTO-ADVANCE TO NEXT SONG WHEN CURRENT SONG FINISHES! */
    bgSong.addEventListener('ended', function () {
      if (autoNextMode) {
        showDeckBriefly(4500);
        loadTrackMeta(trackIdx + 1, true);
      } else {
        bgSong.currentTime = 0;
        var rp = bgSong.play();
        if (rp && typeof rp.catch === 'function') rp.catch(function () {});
        syncMusicUI();
      }
    });

    /* Interactive Touch & Mouse Scrubbing across full track */
    var seeking = false;
    function seekFromPointer(clientX) {
      var trk = PLAYLIST[trackIdx];
      var r = musicSeek.getBoundingClientRect();
      if (r.width <= 0) return;
      var ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      var dur = (isFinite(bgSong.duration) && bgSong.duration > 1) ? bgSong.duration : trk.fallbackDur;
      try {
        bgSong.currentTime = ratio * dur;
      } catch (_) {}
      syncMusicUI();
    }

    musicSeek.addEventListener('pointerdown', function (e) {
      seeking = true;
      showDeckBriefly(6500);
      seekFromPointer(e.clientX);
      try { musicSeek.setPointerCapture(e.pointerId); } catch (_) {}
    });
    musicSeek.addEventListener('pointermove', function (e) {
      if (seeking) seekFromPointer(e.clientX);
    });
    musicSeek.addEventListener('pointerup', function () { seeking = false; });
    musicSeek.addEventListener('pointercancel', function () { seeking = false; });

    musicLoop.addEventListener('click', function () {
      autoNextMode = !autoNextMode;
      bgSong.loop = !autoNextMode;
      showDeckBriefly(5000);
      musicLoop.classList.toggle('on', autoNextMode);
      musicLoop.textContent = autoNextMode ? 'AUTO-NEXT' : 'REPEAT 1';
    });

    syncMusicUI();
  }

  /* =========================================================================
   * 11. NAVBAR SCROLL SPY + PROGRESS BAR
   * ========================================================================= */
  var secs = ['top', 'about', 'skills', 'work', 'process', 'contact'];
  window.addEventListener('scroll', function () {
    $('#nv').classList.toggle('s', window.scrollY > 40);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    $('#bar').style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';

    var curId = 'top';
    for (var i = 0; i < secs.length; i++) {
      var el = document.getElementById(secs[i]);
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.38) {
        curId = secs[i];
      }
    }
    $$('.lk a').forEach(function (a) {
      a.classList.toggle('act', a.getAttribute('href') === '#' + curId);
    });
  }, { passive: true });

  /* =========================================================================
   * 12. SECURE BACKEND EMAIL CONTACT FORM + COPY EMAIL
   * ========================================================================= */
  var formLoadTs = Date.now();
  var selectedService = 'Graphic Design';

  function selectService(val) {
    selectedService = val;
    $$('.svc-p').forEach(function (p) {
      p.classList.toggle('on', p.getAttribute('data-val') === val);
    });
  }
  $$('.svc-p').forEach(function (p) {
    p.addEventListener('click', function () { selectService(p.getAttribute('data-val')); });
  });

  var copyBtn = $('#copyBtn');
  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    } catch (_) {}
  }
  copyBtn.addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText('nadim13158@gmail.com').catch(function () { fallbackCopy('nadim13158@gmail.com'); });
    } else {
      fallbackCopy('nadim13158@gmail.com');
    }
    copyBtn.textContent = 'COPIED ✓';
    setTimeout(function () { copyBtn.textContent = 'COPY EMAIL'; }, 2200);
  });

  var directEmailFocus = $('#directEmailFocus');
  if (directEmailFocus) {
    directEmailFocus.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('nadim13158@gmail.com').catch(function () { fallbackCopy('nadim13158@gmail.com'); });
      } else {
        fallbackCopy('nadim13158@gmail.com');
      }
      showFormStatus('ok', '↓ WRITE YOUR MESSAGE BELOW — DELIVERS DIRECTLY TO NADIM13158@GMAIL.COM!');
      $('#n').focus();
    });
  }

  function showFormStatus(kind, text) {
    var st = $('#txStatus');
    st.className = 'tx-status ' + kind;
    st.textContent = text;
  }

  /* Browser-direct Web3Forms JSON submission (passes Cloudflare on Web3Forms Free Plan — ZERO mailto popup!) */
  function sendDirectViaWeb3Forms(accessKey, name, email, service, message) {
    return fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: '[Portfolio Hire] ' + service + ' — ' + name,
        from_name: 'MD Nadim Portfolio',
        name: name,
        email: email,
        replyto: email,
        Mission_Type: service,
        message: message,
        botcheck: ''
      })
    }).then(function (r) {
      return r.json().then(function (d) { return { status: r.status, data: d }; });
    });
  }

  $('#fm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#n').value.trim();
    var email = $('#e').value.trim();
    var message = $('#m').value.trim();
    var hp = $('#website_hp').value;

    /* Silent honeypot drop for automated bots */
    if (hp && hp.trim() !== '') {
      showFormStatus('ok', '✓ MESSAGE SENT DIRECTLY TO MD NADIM KHONDOKAR!');
      $('#fm').reset();
      return;
    }

    if (name.length < 2) {
      showFormStatus('err', 'Please enter your name (at least 2 characters).');
      $('#n').focus();
      return;
    }
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(email)) {
      showFormStatus('err', 'Please enter a valid email address.');
      $('#e').focus();
      return;
    }
    if (message.length < 5) {
      showFormStatus('err', 'Please write a short description of your project.');
      $('#m').focus();
      return;
    }

    var txBtn = $('#txBtn');
    txBtn.disabled = true;
    txBtn.textContent = 'SENDING DIRECTLY...';

    if (window.location.protocol === 'file:' || window.location.protocol === 'about:') {
      if (window.__WEB3FORMS_KEY__) {
        sendDirectViaWeb3Forms(window.__WEB3FORMS_KEY__, name, email, selectedService, message)
          .then(function (wRes) {
            txBtn.disabled = false;
            txBtn.textContent = 'SEND MESSAGE DIRECTLY ↗';
            if (wRes.data && wRes.data.success) {
              showFormStatus('ok', '✓ MESSAGE DELIVERED DIRECTLY TO MD NADIM KHONDOKAR’S EMAIL!');
              $('#fm').reset();
              formLoadTs = Date.now();
            } else {
              showFormStatus('err', (wRes.data && wRes.data.message) || 'Could not send message right now.');
            }
          })
          .catch(function () {
            txBtn.disabled = false;
            txBtn.textContent = 'SEND MESSAGE DIRECTLY ↗';
            showFormStatus('err', 'Offline preview mode — deploy on Vercel with WEB3FORMS_ACCESS_KEY for live direct email delivery.');
          });
        return;
      }
      txBtn.disabled = false;
      txBtn.textContent = 'SEND MESSAGE DIRECTLY ↗';
      showFormStatus('err', 'Offline file preview — deploy on Vercel for live direct inbox delivery to nadim13158@gmail.com!');
      return;
    }

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        service: selectedService,
        message: message,
        website_hp: hp,
        form_ts: formLoadTs
      })
    })
      .then(function (r) { return r.json().then(function (d) { return { status: r.status, data: d }; }); })
      .then(function (res) {
        if (res.data && res.data.ok && res.data.mode === 'sent') {
          txBtn.disabled = false;
          txBtn.textContent = 'SEND MESSAGE DIRECTLY ↗';
          showFormStatus('ok', '✓ ' + (res.data.message || 'MESSAGE DELIVERED DIRECTLY TO MD NADIM KHONDOKAR!'));
          $('#fm').reset();
          formLoadTs = Date.now();
          return;
        }

        /* Web3Forms client-side relay (avoids Cloudflare 403 on serverless IPs, delivers straight to Gmail!) */
        if (res.data && res.data.ok && res.data.mode === 'web3forms_client' && res.data.accessKey) {
          return sendDirectViaWeb3Forms(res.data.accessKey, name, email, selectedService, message)
            .then(function (wRes) {
              txBtn.disabled = false;
              txBtn.textContent = 'SEND MESSAGE DIRECTLY ↗';
              if (wRes.data && wRes.data.success) {
                showFormStatus('ok', '✓ MESSAGE DELIVERED DIRECTLY TO MD NADIM KHONDOKAR’S EMAIL!');
                $('#fm').reset();
                formLoadTs = Date.now();
              } else {
                showFormStatus('err', (wRes.data && wRes.data.message) || 'Web3Forms rejected key — please verify your WEB3FORMS_ACCESS_KEY in Vercel.');
              }
            });
        }

        txBtn.disabled = false;
        txBtn.textContent = 'SEND MESSAGE DIRECTLY ↗';
        showFormStatus('err', (res.data && res.data.error) || 'Could not send right now. Please check WEB3FORMS_ACCESS_KEY in Vercel Environment Variables.');
      })
      .catch(function () {
        txBtn.disabled = false;
        txBtn.textContent = 'SEND MESSAGE DIRECTLY ↗';
        showFormStatus('err', 'Network error while sending — please check your internet connection and try again.');
      });
  });

  /* =========================================================================
   * 13. UNIQUE SPIDEY-AI CLIENT ASSISTANT (ONLINE API + OFFLINE FALLBACK)
   * ========================================================================= */
  var aiWidget = $('#aiWidget');
  var aiFab = $('#aiFab');
  var aiClose = $('#aiClose');
  var aiMsgs = $('#aiMsgs');
  var aiForm = $('#aiForm');
  var aiInp = $('#aiInp');

  function offlineSpideyBrain(raw) {
    var q = raw.toLowerCase();
    var isBanglish = /\b(ki|kivabe|koto|kaj|korbo|lagbe|taka|dam|kothay|jogajog|ache|paro|ami|amar)\b/.test(q);
    if (/(service|offer|skill|ki ki kaj|ki kaj|সার্ভিস|কাজ)/.test(q)) {
      return {
        reply: isBanglish
          ? 'MD Nadim Khondokar দুইটা দিকে কাজ করেন: ১) Graphic Design (Social Media Creatives, Ad Banners, Posters, YouTube Thumbnails, Branding) এবং ২) Frontend Web UI (HTML5, CSS3 ও JavaScript দিয়ে ক্লিন রেসপনসিভ ওয়েব পেজ)।'
          : 'MD Nadim Khondokar crafts Graphic Design (social media creatives, ad banners, posters, YouTube thumbnails, creator branding) plus clean Frontend Web UI with HTML5, CSS3, and JavaScript!',
        action: { label: 'Explore 3D Projects ↗', target: '#work' }
      };
    }
    if (/(hire|contact|email|book|jogajog|hire korbo|মেইল)/.test(q)) {
      return {
        reply: isBanglish
          ? 'নিচের বাটনে ক্লিক করে "Hire Me" ফর্মে আপনার প্রজেক্টের বিস্তারিত লিখে পাঠিয়ে দিন, অথবা nadim13158@gmail.com-এ মেইল করুন। ২৪ ঘণ্টার মধ্যে রিপ্লাই পাবেন!'
          : 'Click below to jump straight to the Hire Me form and send your project brief directly to Nadim, or email nadim13158@gmail.com. Typical response time is under 24 hours!',
        action: { label: 'Go to Hire Me Form →', target: '#contact' }
      };
    }
    if (/(price|cost|budget|rate|koto|dam|দাম|বাজেট)/.test(q)) {
      return {
        reply: isBanglish
          ? 'প্রজেক্টের ধরনের ওপর বাজেট নির্ভর করে, তবে Nadim সবসময় ন্যায্য ও ক্লায়েন্ট-বান্ধব রেটে কাজ করেন। ফর্মে আইডিয়াটা জানালে দ্রুত কোটেশন পাবেন!'
          : 'Rates are tailored to your project scope (single poster/thumbnail vs. full social pack or landing page) and kept very fair. Share your idea in the Hire Me form for a fast quote!',
        action: { label: 'Request a Quote →', target: '#contact' }
      };
    }
    if (/(song|music|barsaat|banjaare|alfaaz|hamza|gan|গান)/.test(q)) {
      return {
        reply: isBanglish
          ? 'বাম নিচের কোণায় থাকা Spider-Vinyl মিউজিক আইকনে ক্লিক করলেই Banjaare-এর "Barsaat" এবং Hamza Malik-এর "Alfaaz" প্লে হবে — একটা গান শেষ হলে পরেরটা অটো প্লে হবে!'
          : 'Tap the spinning Spider-Vinyl disc in the bottom-left corner anytime to listen to "Barsaat" by Banjaare and "Alfaaz" by Hamza Malik — when one track ends, the next track auto-plays automatically!'
      };
    }
    return {
      reply: isBanglish
        ? 'হ্যালো! আমি Spidey-AI। আপনি Nadim-এর Graphic Design, Website UI, ডেলিভারি টাইম বা কীভাবে Hire করবেন — যেকোনো প্রশ্ন করতে পারেন!'
        : 'Hey! I’m Spidey-AI, Nadim’s client assistant. Ask me about Graphic Design, Social Media Creatives, Web Landing Pages, turnaround time, or how to hire Nadim!',
      action: { label: 'Hire Nadim Now →', target: '#contact' }
    };
  }

  function appendAiMessage(role, text, action) {
    var wrap = document.createElement('div');
    wrap.className = 'ai-msg ' + role;
    var p = document.createElement('div');
    p.textContent = text;
    wrap.appendChild(p);

    if (role === 'bot' && action && action.label && action.target) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ai-act-btn';
      btn.textContent = action.label;
      btn.addEventListener('click', function () {
        smoothScrollTo(action.target);
        if (window.innerWidth < 640) aiWidget.classList.remove('open');
      });
      wrap.appendChild(btn);
    }

    aiMsgs.appendChild(wrap);
    aiMsgs.scrollTop = aiMsgs.scrollHeight;
  }

  appendAiMessage(
    'bot',
    'Hey! 🕷️ I’m Spidey-AI — MD Nadim Khondokar’s assistant. Confused about any service, project, or how to hire Nadim? Ask me in English or Banglish!',
    { label: 'Explore 3D Projects ↗', target: '#work' }
  );

  function toggleAi(forceOpen) {
    var next = typeof forceOpen === 'boolean' ? forceOpen : !aiWidget.classList.contains('open');
    aiWidget.classList.toggle('open', next);
    if (next) setTimeout(function () { aiInp.focus(); }, 250);
  }

  aiFab.addEventListener('click', function () { toggleAi(); });
  aiClose.addEventListener('click', function () { toggleAi(false); });

  function askSpidey(question) {
    var q = question.trim().slice(0, 400);
    if (!q) return;
    appendAiMessage('user', q);
    aiInp.value = '';

    var typing = document.createElement('div');
    typing.className = 'ai-msg bot';
    typing.textContent = 'Spider-Sense scanning...';
    aiMsgs.appendChild(typing);
    aiMsgs.scrollTop = aiMsgs.scrollHeight;

    if (window.location.protocol === 'file:' || window.location.protocol === 'about:') {
      setTimeout(function () {
        typing.remove();
        var ans = offlineSpideyBrain(q);
        appendAiMessage('bot', ans.reply, ans.action);
      }, 340);
      return;
    }

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        typing.remove();
        if (data && data.reply) {
          appendAiMessage('bot', data.reply, data.action);
        } else {
          var fb = offlineSpideyBrain(q);
          appendAiMessage('bot', fb.reply, fb.action);
        }
      })
      .catch(function () {
        typing.remove();
        var fb = offlineSpideyBrain(q);
        appendAiMessage('bot', fb.reply, fb.action);
      });
  }

  aiForm.addEventListener('submit', function (e) {
    e.preventDefault();
    askSpidey(aiInp.value);
  });

  $$('.ai-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      askSpidey(chip.getAttribute('data-ask') || '');
    });
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
      drawer.classList.remove('open');
      aiWidget.classList.remove('open');
    }
  });
})();
