"use client";
import { useEffect, useRef, useState } from "react";

interface CounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({ target, duration = 1800, prefix = "", suffix = "", decimals = 0 }: CounterProps) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      // Ease out expo
      const eased = 1 - Math.pow(2, -10 * progress);
      setValue(eased * target);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else setValue(target);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return (
    <span>
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  );
}
