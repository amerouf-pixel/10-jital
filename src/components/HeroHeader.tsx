"use client";

import { useState } from "react";
import Hero3D from "@/components/layout/Hero3D";

type HeroHeaderProps = {
  title: string;
  subtitle: string;
};

export function HeroHeader({ title, subtitle }: HeroHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-8 mb-12">
      {/* Titre Ã  gauche */}
      <div>
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-4">
          <span className="block">{title}</span>
          <span className="block text-violet-500">{subtitle}</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl">
          Plateforme professionnelle avec boutique, blog, dÃ©tection de tendances,
          suivi des prix, alertes et sÃ©lecteur de devises MAD/EUR/USD.
        </p>
      </div>

      {/* Logo 3D Ã  droite */}
      <div className="w-32 h-32 flex-shrink-0">
        <Hero3D  />
      </div>
    </div>
  );
}

