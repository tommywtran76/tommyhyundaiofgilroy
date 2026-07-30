"use client";

import { useEffect, useRef, useState } from "react";

// Lightweight canvas signature pad (touch + mouse + stylus).
// Emits a PNG data URL whenever the drawing changes, empty string when cleared.

export default function SignaturePad({
  onChange,
  placeholder,
  clearLabel,
}: {
  onChange: (dataUrl: string) => void;
  placeholder: string;
  clearLabel: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#262424";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function pos(e: PointerEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const down = (e: PointerEvent) => {
      e.preventDefault();
      drawing.current = true;
      canvas.setPointerCapture(e.pointerId);
      const p = pos(e, canvas);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      // Dot for a tap
      ctx.lineTo(p.x + 0.1, p.y + 0.1);
      ctx.stroke();
      setHasInk(true);
    };
    const move = (e: PointerEvent) => {
      if (!drawing.current) return;
      const p = pos(e, canvas);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    const up = () => {
      if (!drawing.current) return;
      drawing.current = false;
      onChange(canvas.toDataURL("image/png"));
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointerleave", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointerleave", up);
    };
  }, [onChange]);

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setHasInk(false);
    onChange("");
  }

  return (
    <div>
      <div className="relative rounded-xl border border-blush bg-cream shadow-card overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-40 touch-none block"
          aria-label={placeholder}
        />
        {!hasInk && (
          <span className="absolute inset-0 flex items-center justify-center text-charcoal-soft/40 italic pointer-events-none text-lg">
            {placeholder}
          </span>
        )}
        <span className="absolute bottom-4 left-6 right-6 border-b border-blush pointer-events-none" />
      </div>
      <button
        type="button"
        onClick={clear}
        className="mt-2 text-sm text-charcoal-soft underline underline-offset-2"
      >
        {clearLabel}
      </button>
    </div>
  );
}
