(() => {
    const canvas = document.querySelector(".water-intro canvas");
    if (!canvas || !window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

    const context = canvas.getContext("2d", { alpha: false });
    const bounds = canvas.getBoundingClientRect();
    if (!context || !bounds.width || !bounds.height) return;

    const resolution = 300 / Math.max(bounds.width, bounds.height);
    const width = Math.max(1, Math.round(bounds.width * resolution));
    const height = Math.max(1, Math.round(bounds.height * resolution));
    canvas.width = width;
    canvas.height = height;

    const frame = context.createImageData(width, height);
    const radius = new Float32Array(width * height);
    const lightDirection = new Float32Array(width * height);
    const ambient = new Float32Array(width * height);
    const scale = Math.min(width, height) / 2;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const u = (x - width * 0.5) / scale;
        const v = (y - height * 0.51) / scale;
        const distance = Math.hypot(u, v * 1.58);
        const texture = Math.sin(u * 16 + v * 21) * Math.sin(u * 9 - v * 11);
        radius[i] = distance + 0.024 * texture;
        lightDirection[i] = (-0.57 * u - 1.15 * v) / Math.max(distance, 0.08);
        ambient[i] = 13 * Math.exp(-0.8 * ((u + 0.4) ** 2 + (v + 0.5) ** 2))
          + 2.3 * texture;
        frame.data[i * 4 + 3] = 255;
      }
    }

    const start = performance.now();
    let previous = -Infinity;
    let animationFrame = 0;

    const draw = (timestamp) => {
      const elapsed = (timestamp - start) / 1000;
      if (elapsed >= 1.65) return;
      if (timestamp - previous >= 32) {
        previous = timestamp;
        const front = 0.13 + elapsed * 1.55;
        const fadeIn = Math.min(1, elapsed * 8 + 0.15);
        for (let i = 0; i < radius.length; i++) {
          const offset = radius[i] - front;
          const envelope = fadeIn * Math.exp(-((offset + 0.19) ** 2) / 0.057);
          const slope = Math.sin(offset * 36) * envelope * lightDirection[i];
          const reflection = 43 * slope + 30 * Math.max(0, slope) ** 2;
          const brightness = ambient[i] + reflection;
          const pixel = i * 4;
          frame.data[pixel] = 14 + brightness * 0.67;
          frame.data[pixel + 1] = 22 + brightness * 0.98;
          frame.data[pixel + 2] = 41 + brightness * 1.44;
        }
        context.putImageData(frame, 0, 0);
      }
      animationFrame = requestAnimationFrame(draw);
    };

    draw(start);
    return () => cancelAnimationFrame(animationFrame);
})();
