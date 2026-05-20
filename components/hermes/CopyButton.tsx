"use client";

/**
 * components/hermes/CopyButton.tsx — Bouton "copier" pour Hermès OS.
 *
 * Copie le texte dans le presse-papier (navigator.clipboard), feedback visuel
 * 2s. Désactivé si le texte est vide.
 */

import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function CopyButton({
  text,
  label = "Copier",
  size = "md",
}: {
  text:   string;
  label?: string;
  size?:  "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);
  const disabled = !text.trim();

  const handleClick = async () => {
    if (disabled) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // navigator.clipboard peut échouer en iframe sandbox ou contexte non sécurisé.
      // Pas de toast en V1 ; on laisse l'utilisateur retenter.
    }
  };

  const padding = size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";
  const fontSize = size === "sm" ? "text-[11px]" : "text-[12px]";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-md ${padding} ${fontSize} font-medium transition`}
      style={{
        background:    copied ? "rgba(74,222,128,0.14)" : "rgba(84,182,210,0.10)",
        border:        copied
          ? "1px solid rgba(74,222,128,0.32)"
          : "1px solid rgba(84,182,210,0.28)",
        color:         copied ? "#86efac" : "#9ed7e8",
        opacity:       disabled ? 0.4 : 1,
        cursor:        disabled ? "not-allowed" : "pointer",
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      <span>{copied ? "Copié" : label}</span>
    </button>
  );
}
