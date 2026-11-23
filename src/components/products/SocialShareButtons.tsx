"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  buildAffiliateShareMessage,
  buildFacebookShareUrl,
  toShortAffiliateLink,
} from "@/utils/affiliate";

interface SocialShareButtonsProps {
  /** Lien d'affiliation produit (long ou court) — toujours raccourci + tagué 10jital-21. */
  url: string;
  /** Titre du produit utilisé dans les messages de partage. */
  title: string;
  className?: string;
}

type SharePlatform = "facebook" | "instagram" | "tiktok";

/* ---------- Icônes SVG (aucune dépendance externe) ---------- */

function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.397 20.997v-8.108h2.723l.408-3.16h-3.131V7.723c0-.911.253-1.533 1.561-1.533h1.67V3.352a22.49 22.49 0 0 0-2.434-.126c-2.407 0-4.056 1.47-4.056 4.168v2.335H7.504v3.16h2.634v8.107h3.26Z" />
    </svg>
  );
}

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.983c2.937 0 3.286.011 4.444.065 1.071.049 1.652.228 2.038.378.512.199.878.437 1.262.821.384.384.622.75.821 1.262.15.386.329.967.378 2.038.054 1.158.065 1.507.065 4.444s-.011 3.286-.065 4.444c-.049 1.071-.228 1.652-.378 2.038-.199.512-.437.878-.821 1.262a3.4 3.4 0 0 1-1.262.821c-.386.15-.967.329-2.038.378-1.158.054-1.507.065-4.444.065s-3.286-.011-4.444-.065c-1.071-.049-1.652-.228-2.038-.378a3.4 3.4 0 0 1-1.262-.821 3.4 3.4 0 0 1-.821-1.262c-.15-.386-.329-.967-.378-2.038-.054-1.158-.065-1.507-.065-4.444s.011-3.286.065-4.444c.049-1.071.228-1.652.378-2.038.199-.512.437-.878.821-1.262.384-.384.75-.622 1.262-.821.386-.15.967-.329 2.038-.378 1.158-.054 1.507-.065 4.444-.065ZM12 1c-2.987 0-3.361.013-4.534.066-1.171.053-1.97.24-2.67.511a5.39 5.39 0 0 0-1.949 1.27A5.39 5.39 0 0 0 1.578 4.79C1.307 5.49 1.12 6.29 1.067 7.46 1.013 8.633 1 9.008 1 11.995s.013 3.362.066 4.534c.053 1.171.24 1.97.511 2.67a5.39 5.39 0 0 0 1.27 1.949 5.39 5.39 0 0 0 1.949 1.27c.7.271 1.499.458 2.67.511 1.173.053 1.547.066 4.534.066s3.362-.013 4.534-.066c1.171-.053 1.97-.24 2.67-.511a5.39 5.39 0 0 0 1.949-1.27 5.39 5.39 0 0 0 1.27-1.949c.271-.7.458-1.499.511-2.67.053-1.172.066-1.547.066-4.534s-.013-3.362-.066-4.534c-.053-1.171-.24-1.97-.511-2.67a5.39 5.39 0 0 0-1.27-1.949 5.39 5.39 0 0 0-1.949-1.27c-.7-.271-1.499-.458-2.67-.511C15.362 1.013 14.987 1 12 1Zm0 5.351a5.65 5.65 0 1 0 0 11.3 5.65 5.65 0 0 0 0-11.3Zm0 9.318a3.668 3.668 0 1 1 0-7.336 3.668 3.668 0 0 1 0 7.336ZM18.925 6.13a1.32 1.32 0 1 1-2.64 0 1.32 1.32 0 0 1 2.64 0Z" />
    </svg>
  );
}

function TikTokIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22.066 7.128a6.083 6.083 0 0 1-3.55-1.145 6.086 6.086 0 0 1-2.437-3.959h-3.427l.007 12.575a2.616 2.616 0 1 1-1.964-2.524v-3.44a6.062 6.062 0 0 0-5.41 6.024 6.062 6.062 0 0 0 10.62 4.005 6.053 6.053 0 0 0 1.504-4V9.336a9.48 9.48 0 0 0 5.656 1.842l.001-4.05Z" />
    </svg>
  );
}

function ShareIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98m-.01-10.98-6.82 3.98" />
    </svg>
  );
}

/* ---------- Copie presse-papiers avec fallback ---------- */

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    throw new Error("clipboard indisponible");
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "-1000px";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

/* ---------- Composant ---------- */

export function SocialShareButtons({ url, title, className = "" }: SocialShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Lien court garanti : tag 10jital-21 appliqué, zéro paramètre superflu.
  const shortUrl = toShortAffiliateLink(url) || url;

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Fermeture au clic extérieur + touche Échap.
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  /** Instagram / TikTok : copie du texte prêt-à-coller puis ouverture de la plateforme. */
  const shareViaCopy = useCallback(
    async (platform: Extract<SharePlatform, "instagram" | "tiktok">) => {
      setIsOpen(false);
      const platformLabel = platform === "instagram" ? "Instagram" : "TikTok";
      const message = buildAffiliateShareMessage(title, shortUrl);
      const copied = await copyToClipboard(message);

      if (copied) {
        showToast(`Lien court copié ! Ouverture d'${platformLabel}…`);
      } else {
        showToast(`Impossible de copier le lien. Ouverture d'${platformLabel} quand même…`);
      }

      const target = platform === "instagram" ? "https://www.instagram.com" : "https://www.tiktok.com";
      setTimeout(() => {
        window.open(target, "_blank", "noopener,noreferrer");
      }, 350);
    },
    [shortUrl, showToast, title]
  );

  const handleFacebook = useCallback(() => {
    setIsOpen(false);
    const shareUrl = buildFacebookShareUrl(shortUrl, title);
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=640,height=560");
  }, [shortUrl, title]);

  const handlePlatform = useCallback(
    (platform: SharePlatform) => {
      if (platform === "facebook") {
        handleFacebook();
      } else {
        void shareViaCopy(platform);
      }
    },
    [handleFacebook, shareViaCopy]
  );

  const platformButtons: Array<{ key: SharePlatform; label: string; icon: React.ReactNode; classes: string }> = [
    {
      key: "facebook",
      label: "Facebook",
      icon: <FacebookIcon />,
      classes: "bg-[#1877F2] text-white hover:bg-[#0f62c4]",
    },
    {
      key: "instagram",
      label: "Instagram",
      icon: <InstagramIcon />,
      classes:
        "bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#962FBF] text-white hover:brightness-110",
    },
    {
      key: "tiktok",
      label: "TikTok",
      icon: <TikTokIcon />,
      classes: "bg-black text-white border border-white/20 hover:bg-neutral-800",
    },
  ];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Partager ${title}`}
        className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/40 bg-[#111428] px-3 py-2 text-xs font-semibold text-violet-200 transition-all duration-200 hover:border-violet-400 hover:bg-[#181b34] hover:text-white active:scale-95"
      >
        <ShareIcon />
        Partager
        <span className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▾</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-40 mb-2 w-max min-w-[190px] overflow-hidden rounded-2xl border border-violet-500/30 bg-[#0b0d17] p-1.5 shadow-2xl shadow-black/60"
        >
          <p className="px-3 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Partager ce produit
          </p>
          {platformButtons.map((platform) => (
            <button
              key={platform.key}
              type="button"
              role="menuitem"
              onClick={() => handlePlatform(platform.key)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${platform.classes}`}
            >
              {platform.icon}
              {platform.label}
            </button>
          ))}
          <p className="px-3 pb-1 pt-1.5 text-[9px] text-gray-600">
            🔗 lien court ?tag=10jital-21
          </p>
        </div>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 animate-[fadeUp_.25s_ease-out] rounded-2xl border border-cyan-400/40 bg-[#0b0d17]/95 px-5 py-3 text-sm font-medium text-cyan-200 shadow-2xl shadow-cyan-900/30 backdrop-blur-md"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default SocialShareButtons;
