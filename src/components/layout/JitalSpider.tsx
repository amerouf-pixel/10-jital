"use client";

import { useEffect, useState } from "react";

export default function JitalSpider() {
  const [position, setPosition] = useState({ x: 120, y: 150 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = 120;
    let currentY = 150;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX - 25;
      mouseY = e.clientY - 25;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const updatePosition = () => {
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;
      setPosition({ x: currentX, y: currentY });
      requestAnimationFrame(updatePosition);
    };

    const animId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        pointerEvents: "none",
      }}
      className="fixed top-0 left-0 z-50 select-none"
    >
      <div className="text-5xl filter drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse">
        🕷️
      </div>
    </div>
  );
}
