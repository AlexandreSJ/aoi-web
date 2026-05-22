import { useEffect, useRef, useState } from "react";

const LEAF_COUNT = 50;
const REFERENCE_HEIGHT = 1080;

interface Leaf {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
  colorIndex: number;
}

const COLORS = ["#00aaff", "#0088dd", "#0077cc", "#33bbff", "#0099ee"];

function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, opacity: number, color: string | any) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;

  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.8, -size * 0.6, size * 0.8, size * 0.4, 0, size);
  ctx.bezierCurveTo(-size * 0.8, size * 0.4, -size * 0.8, -size * 0.6, 0, -size);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, -size * 0.8);
  ctx.lineTo(0, size * 0.8);
  ctx.strokeStyle = color;
  ctx.globalAlpha = opacity * 0.5;
  ctx.lineWidth = size * 0.05;
  ctx.stroke();

  ctx.restore();
}

export function FallingLeaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leavesRef = useRef<Leaf[]>([]);
  const animationRef = useRef<number>(0);
  const [blur, setBlur] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBlur(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const createLeaf = (): Leaf => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      size: 6 + Math.random() * 12,
      speedY: (0.2 + Math.random() * 1) * (canvas.height / REFERENCE_HEIGHT),
      speedX: -0.2 + Math.random() * 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: -0.02 + Math.random() * 0.04,
      opacity: 0.3 + Math.random() * 0.5,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.01 + Math.random() * 0.02,
      colorIndex: Math.floor(Math.random() * COLORS.length),
    });

    leavesRef.current = Array.from({ length: LEAF_COUNT }, () => {
      const leaf = createLeaf();
      leaf.y = Math.random() * canvas.height - canvas.height;
      return leaf;
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      leavesRef.current.forEach((leaf) => {
        leaf.y += leaf.speedY;
        leaf.wobble += leaf.wobbleSpeed;
        leaf.x += leaf.speedX + Math.sin(leaf.wobble) * 0.5;
        leaf.rotation += leaf.rotationSpeed;

        if (leaf.y > canvas.height + 20) {
          Object.assign(leaf, createLeaf());
        }
        if (leaf.x < -20) leaf.x = canvas.width + 20;
        if (leaf.x > canvas.width + 20) leaf.x = -20;

        drawLeaf(ctx, leaf.x, leaf.y, leaf.size, leaf.rotation, leaf.opacity, COLORS[leaf.colorIndex]);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        filter: blur ? "blur(4px)" : "none",
        transition: "filter 1.5s ease-out",
      }}
    />
  );
}
