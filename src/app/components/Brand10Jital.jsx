'use client';
import React from 'react';

export default function Brand10Jital() {
  return (
    <>
      <style>{`
        @keyframes jitalGlow {
          0%, 100% { border-color: rgba(0, 210, 255, 0.45); box-shadow: 0 0 14px rgba(0, 210, 255, 0.25); }
          50% { border-color: rgba(255, 107, 0, 0.5); box-shadow: 0 0 20px rgba(255, 107, 0, 0.35); }
        }
        @keyframes jitalShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .jital-badge-fixed {
          position: fixed; top: 16px; left: 16px; z-index: 99999;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 14px; border-radius: 14px;
          background: rgba(9, 13, 22, 0.88); backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          animation: jitalGlow 5s infinite ease-in-out;
          text-decoration: none !important; font-family: 'Inter', system-ui, sans-serif;
          transition: transform 0.25s ease;
        }
        .jital-badge-fixed:hover { transform: translateY(-2px) scale(1.03); }
        .jital-badge-10 { font-weight: 900; font-size: 15px; color: #00d2ff; text-shadow: 0 0 10px rgba(0,210,255,0.7); }
        .jital-badge-txt {
          font-weight: 800; font-size: 15px; letter-spacing: 0.8px;
          background: linear-gradient(90deg, #ffffff, #ff6b00, #ff9f43, #ffffff);
          background-size: 250% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: jitalShimmer 4s ease infinite;
        }
        .jital-sig-fixed {
          position: fixed; bottom: 14px; left: 16px; z-index: 99999;
          font-family: 'Inter', system-ui, sans-serif; pointer-events: none;
          display: flex; flex-direction: column; gap: 2px;
        }
        .jital-sig-fixed strong { font-size: 10px; letter-spacing: 1.8px; color: #f8fafc; text-transform: uppercase; }
        .jital-sig-fixed span { font-size: 9px; color: rgba(148, 163, 184, 0.78); }
      `}</style>

      <a href="https://10-jital.vercel.app/" target="_blank" rel="noopener noreferrer" className="jital-badge-fixed" aria-label="10JITAL">
        <span className="jital-badge-10">10</span>
        <span className="jital-badge-txt">JITAL</span>
      </a>
      <div className="jital-sig-fixed">
        <strong>10JITAL PRODUCTION</strong>
        <span>© 2026 10JITAL PROD — Tous droits réservés</span>
      </div>
    </>
  );
}
