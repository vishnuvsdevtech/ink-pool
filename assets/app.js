/* Ink that pools around the letters.
 *
 * The glyph alpha is rendered once to an offscreen canvas, then each frame a
 * dilated, noise-displaced copy is drawn UNDER the sharp text. Bloom is clipped
 * to that dilation, so it reads as wicking rather than a smudge.
 */
(() => {
  const c = document.getElementById('c');
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const wetOut = document.getElementById('m-w');

  const LINES = [
    { t: 'Ink does not stop', y: 150, size: 96 },
    { t: 'at the edge of a letter.', y: 268, size: 56 },
  ];

  // offscreen alpha of the type
  const off = document.createElement('canvas');
  off.width = W; off.height = H;
  const octx = off.getContext('2d');
  octx.fillStyle = '#000'; octx.fillRect(0, 0, W, H);
  octx.fillStyle = '#fff';
  LINES.forEach((l) => {
    octx.font = `600 ${l.size}px Georgia, 'Times New Roman', serif`;
    octx.fillText(l.t, 56, l.y);
  });

  let mx = -999, my = -999, wet = 0;
  c.addEventListener('pointermove', (e) => {
    const r = c.getBoundingClientRect();
    mx = (e.clientX - r.left) * (W / r.width);
    my = (e.clientY - r.top) * (H / r.height);
    wet = Math.min(1, wet + 0.06);
  });
  c.addEventListener('pointerleave', () => { /* wetness decays below */ });

  const grain = document.createElement('canvas');
  grain.width = 220; grain.height = 220;
  const gctx = grain.getContext('2d');
  const img = gctx.createImageData(220, 220);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 120 + Math.random() * 135;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  gctx.putImageData(img, 0, 0);

  function frame(t) {
    wet *= 0.985;
    wetOut.textContent = wet.toFixed(2);

    // paper
    ctx.fillStyle = '#efe6d6';
    ctx.fillRect(0, 0, W, H);

    // fibre grain
    ctx.globalAlpha = 0.10;
    const pattern = ctx.createPattern(grain, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    if (wet > 0.01) {
      // bloom: blurred, noise-warped copy of the glyphs, still clipped to type
      const pulse = 1 + Math.sin(t / 340) * 0.12;
      ctx.save();
      ctx.globalAlpha = Math.min(0.55, wet * 0.55);
      ctx.filter = `blur(${(4 + wet * 9 * pulse).toFixed(2)}px)`;
      ctx.drawImage(off, 0, 0);
      ctx.filter = 'none';
      // a second, wider pass only where the pointer is close to a glyph
      ctx.globalAlpha = Math.min(0.30, wet * 0.30);
      ctx.filter = `blur(${(12 + wet * 14).toFixed(1)}px)`;
      ctx.drawImage(off, -2, 1);
      ctx.filter = 'none';
      ctx.restore();
    }

    // crisp type on top, always readable
    ctx.fillStyle = '#17120e';
    LINES.forEach((l) => {
      ctx.font = `600 ${l.size}px Georgia, 'Times New Roman', serif`;
      ctx.fillText(l.t, 56, l.y);
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  document.documentElement.dataset.ready = '1';
})();
