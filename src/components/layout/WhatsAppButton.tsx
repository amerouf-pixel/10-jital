"use client";

import React from "react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212600000000";
const DEFAULT_MESSAGE = "Bonjour 10-JITAL ! J'aimerais avoir plus d'informations sur un produit de la boutique.";

export default function WhatsAppButton() {
  const cleanNumber = WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactez-nous sur WhatsApp"
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.45)] hover:scale-105 active:scale-95 transition-all duration-300 group"
    >
      {/* Halo animé pour attirer l'oeil sur mobile */}
      <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 blur-md group-hover:opacity-60 animate-pulse pointer-events-none" />

      {/* Icône officielle WhatsApp SVG */}
      <svg
        className="w-6 h-6 sm:w-6 sm:h-6 fill-current relative z-10 shrink-0"
        viewBox="0 0 24 24"
      >
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.126.556 4.124 1.529 5.856l-1.529 5.584 5.715-1.499c1.693.923 3.633 1.459 5.699 1.459 6.627 0 12-5.373 12-12s-5.373-12-12.414-11.4z" />
      </svg>

      {/* Texte compact sur mobile et complet sur desktop */}
      <span className="relative z-10 text-xs sm:text-sm tracking-wide pr-1">
        WhatsApp
      </span>
    </a>
  );
}