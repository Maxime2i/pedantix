// Confettis de victoire (10 s), désactivables dans « Couleurs ».
const COLORS = ["DodgerBlue", "OliveDrab", "Gold", "Pink", "SlateBlue", "LightBlue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"];
const DURATION = 10_000;

interface Piece {
  color: string;
  x: number;
  y: number;
  d: number;
  tilt: number;
  angle: number;
  speed: number;
}

export function launchConfetti(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.className = "confetti";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  const spawn = (p: Partial<Piece> = {}): Piece => ({
    color: COLORS[(Math.random() * COLORS.length) | 0],
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    d: 10 * Math.random() + 5,
    tilt: 0,
    angle: 0,
    speed: 0.07 * Math.random() + 0.05,
    ...p,
  });
  const pieces = Array.from({ length: Math.round(canvas.width / 2) }, () => spawn());
  const start = performance.now();
  let phase = 0;

  function frame(now: number) {
    const running = now - start < DURATION;
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    phase += 0.01;
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      p.angle += p.speed;
      p.x += Math.sin(phase);
      p.y += 0.5 * (Math.cos(phase) + p.d + 2);
      p.tilt = 15 * Math.sin(p.angle);
      if (p.y > canvas.height || p.x < -20 || p.x > canvas.width + 20) {
        if (running) pieces[i] = spawn({ y: -15 });
        else pieces.splice(i, 1);
      }
    }
    for (const p of pieces) {
      ctx!.beginPath();
      ctx!.lineWidth = p.d;
      ctx!.strokeStyle = p.color;
      const x = p.x + p.tilt;
      ctx!.moveTo(x + p.d / 2, p.y);
      ctx!.lineTo(x, p.y + p.tilt + p.d / 2);
      ctx!.stroke();
    }
    if (pieces.length) requestAnimationFrame(frame);
    else {
      window.removeEventListener("resize", resize);
      canvas.remove();
    }
  }
  requestAnimationFrame(frame);
}
