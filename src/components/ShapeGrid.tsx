import { useRef, useEffect } from 'react';
import './ShapeGrid.css';

interface ShapeGridProps {
  direction?: 'right' | 'left' | 'up' | 'down' | 'diagonal';
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
  shape?: 'square' | 'hexagon' | 'triangle' | 'circle';
  hoverTrailAmount?: number;
  className?: string;
}

const ShapeGrid: React.FC<ShapeGridProps> = ({
  direction = 'right', speed = 1, borderColor = '#999', squareSize = 40,
  hoverFillColor = '#222', shape = 'square', hoverTrailAmount = 0, className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquare = useRef<{ x: number; y: number } | null>(null);
  const trailCells = useRef<{ x: number; y: number }[]>([]);
  const cellOpacities = useRef(new Map<string, number>());
  const visibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const isHex = shape === 'hexagon', isTri = shape === 'triangle';
    const hexH = squareSize * 1.5, hexV = squareSize * Math.sqrt(3);

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    window.addEventListener('resize', resize); resize();

    // Pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const drawHex = (cx: number, cy: number, s: number) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i; i === 0 ? ctx.moveTo(cx + s * Math.cos(a), cy + s * Math.sin(a)) : ctx.lineTo(cx + s * Math.cos(a), cy + s * Math.sin(a)); } ctx.closePath(); };
    const drawCircle = (cx: number, cy: number, s: number) => { ctx.beginPath(); ctx.arc(cx, cy, s / 2, 0, Math.PI * 2); ctx.closePath(); };
    const drawTri = (cx: number, cy: number, s: number, flip: boolean) => { ctx.beginPath(); if (flip) { ctx.moveTo(cx, cy + s/2); ctx.lineTo(cx + s/2, cy - s/2); ctx.lineTo(cx - s/2, cy - s/2); } else { ctx.moveTo(cx, cy - s/2); ctx.lineTo(cx + s/2, cy + s/2); ctx.lineTo(cx - s/2, cy + s/2); } ctx.closePath(); };

    const drawGrid = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const fill = (draw: () => void, key: string) => { const a = cellOpacities.current.get(key); if (a) { ctx.globalAlpha = a; draw(); ctx.fillStyle = hoverFillColor; ctx.fill(); ctx.globalAlpha = 1; } draw(); ctx.strokeStyle = borderColor; ctx.stroke(); };

      if (isHex) {
        const cs = Math.floor(gridOffset.current.x / hexH);
        const ox = ((gridOffset.current.x % hexH) + hexH) % hexH, oy = ((gridOffset.current.y % hexV) + hexV) % hexV;
        for (let c = -2; c < Math.ceil(W / hexH) + 3; c++) for (let r = -2; r < Math.ceil(H / hexV) + 3; r++) { const cx = c * hexH + ox, cy = r * hexV + ((c + cs) % 2 !== 0 ? hexV / 2 : 0) + oy; fill(() => drawHex(cx, cy, squareSize), `${c},${r}`); }
      } else if (isTri) {
        const hw = squareSize / 2, cs = Math.floor(gridOffset.current.x / hw), rs = Math.floor(gridOffset.current.y / squareSize);
        const ox = ((gridOffset.current.x % hw) + hw) % hw, oy = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;
        for (let c = -2; c < Math.ceil(W / hw) + 4; c++) for (let r = -2; r < Math.ceil(H / squareSize) + 4; r++) { const cx = c * hw + ox, cy = r * squareSize + squareSize / 2 + oy, flip = ((c + cs + r + rs) % 2 + 2) % 2 !== 0; fill(() => drawTri(cx, cy, squareSize, flip), `${c},${r}`); }
      } else if (shape === 'circle') {
        const ox = ((gridOffset.current.x % squareSize) + squareSize) % squareSize, oy = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;
        for (let c = -2; c < Math.ceil(W / squareSize) + 3; c++) for (let r = -2; r < Math.ceil(H / squareSize) + 3; r++) { const cx = c * squareSize + squareSize / 2 + ox, cy = r * squareSize + squareSize / 2 + oy; fill(() => drawCircle(cx, cy, squareSize), `${c},${r}`); }
      } else {
        const ox = ((gridOffset.current.x % squareSize) + squareSize) % squareSize, oy = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;
        for (let c = -2; c < Math.ceil(W / squareSize) + 3; c++) for (let r = -2; r < Math.ceil(H / squareSize) + 3; r++) { const sx = c * squareSize + ox, sy = r * squareSize + oy, key = `${c},${r}`, a = cellOpacities.current.get(key); if (a) { ctx.globalAlpha = a; ctx.fillStyle = hoverFillColor; ctx.fillRect(sx, sy, squareSize, squareSize); ctx.globalAlpha = 1; } ctx.strokeStyle = borderColor; ctx.strokeRect(sx, sy, squareSize, squareSize); }
      }
      const g = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.sqrt(W**2 + H**2)/2);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    };

    const updateOpacities = () => {
      const targets = new Map<string, number>();
      if (hoveredSquare.current) targets.set(`${hoveredSquare.current.x},${hoveredSquare.current.y}`, 1);
      if (hoverTrailAmount > 0) trailCells.current.forEach((t, i) => { const k = `${t.x},${t.y}`; if (!targets.has(k)) targets.set(k, (trailCells.current.length - i) / (trailCells.current.length + 1)); });
      for (const [k] of targets) if (!cellOpacities.current.has(k)) cellOpacities.current.set(k, 0);
      for (const [k, v] of cellOpacities.current) { const n = v + ((targets.get(k) || 0) - v) * 0.15; n < 0.005 ? cellOpacities.current.delete(k) : cellOpacities.current.set(k, n); }
    };

    // Throttle to ~15fps
    let lastTime = 0;
    const FPS_MS = 1000 / 15;

    const animate = (now: number) => {
      rafRef.current = requestAnimationFrame(animate);
      if (!visibleRef.current) return;
      if (now - lastTime < FPS_MS) return;
      lastTime = now;
      const s = Math.max(speed, 0.1), wx = isHex ? hexH * 2 : squareSize, wy = isHex ? hexV : isTri ? squareSize * 2 : squareSize;
      if (direction === 'right')    gridOffset.current.x = (gridOffset.current.x - s + wx) % wx;
      if (direction === 'left')     gridOffset.current.x = (gridOffset.current.x + s + wx) % wx;
      if (direction === 'up')       gridOffset.current.y = (gridOffset.current.y + s + wy) % wy;
      if (direction === 'down')     gridOffset.current.y = (gridOffset.current.y - s + wy) % wy;
      if (direction === 'diagonal') { gridOffset.current.x = (gridOffset.current.x - s + wx) % wx; gridOffset.current.y = (gridOffset.current.y - s + wy) % wy; }
      updateOpacities(); drawGrid();
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect(), mx = e.clientX - rect.left, my = e.clientY - rect.top;
      let col: number, row: number;
      if (isHex) { const cs = Math.floor(gridOffset.current.x / hexH), ox = ((gridOffset.current.x % hexH) + hexH) % hexH, oy = ((gridOffset.current.y % hexV) + hexV) % hexV; col = Math.round((mx - ox) / hexH); row = Math.round((my - oy - ((col + cs) % 2 !== 0 ? hexV / 2 : 0)) / hexV); }
      else if (isTri) { const hw = squareSize / 2, ox = ((gridOffset.current.x % hw) + hw) % hw, oy = ((gridOffset.current.y % squareSize) + squareSize) % squareSize; col = Math.round((mx - ox) / hw); row = Math.floor((my - oy) / squareSize); }
      else { const ox = ((gridOffset.current.x % squareSize) + squareSize) % squareSize, oy = ((gridOffset.current.y % squareSize) + squareSize) % squareSize; col = Math.floor((mx - ox) / squareSize); row = Math.floor((my - oy) / squareSize); }
      if (!hoveredSquare.current || hoveredSquare.current.x !== col || hoveredSquare.current.y !== row) { if (hoveredSquare.current && hoverTrailAmount > 0) { trailCells.current.unshift({ ...hoveredSquare.current }); if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount; } hoveredSquare.current = { x: col, y: row }; }
    };
    const onLeave = () => { if (hoveredSquare.current && hoverTrailAmount > 0) { trailCells.current.unshift({ ...hoveredSquare.current }); if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount; } hoveredSquare.current = null; };

    canvas.addEventListener('mousemove', onMove); canvas.addEventListener('mouseleave', onLeave);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize, shape, hoverTrailAmount]);

  return <canvas ref={canvasRef} className={`shapegrid-canvas ${className}`} />;
};

export default ShapeGrid;
