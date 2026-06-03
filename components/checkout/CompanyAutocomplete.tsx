"use client";

/**
 * CompanyAutocomplete.tsx — Champ "Nom de société" intelligent.
 *
 * Source de données : recherche-entreprises.api.gouv.fr (Etalab, État
 * français). 100% gratuit, sans clé API, contient TOUTES les entreprises
 * françaises immatriculées au RCS / Répertoire SIRENE. C'est l'API que
 * Pennylane, Qonto, Indy, Shine et la plupart des logiciels comptables
 * utilisent en production.
 *
 * Comportement :
 *   - Tape "hm global" → suggestions avec nom complet + adresse + SIRET
 *   - Tape un SIRET 14 chiffres → l'API filtre l'entreprise correspondante
 *   - Clic sur une suggestion → onSelect émet TOUT (company, siret, street,
 *     postcode, city) que le parent répartit dans son state
 *   - Si l'API est down → fallback silencieux, l'utilisateur saisit à la main
 *
 * Endpoint :
 *   https://recherche-entreprises.api.gouv.fr/search?q=<query>&limit=5
 *
 * Schéma de réponse pertinent :
 *   results[].nom_complet            → "HM GLOBAL AGENCE EURL"
 *   results[].siege.siret            → "84126865900018"
 *   results[].siege.adresse          → "20 RUE DES TUILERIES 67460 SOUFFELWEYERSHEIM"
 *   results[].siege.code_postal      → "67460"
 *   results[].siege.libelle_commune  → "SOUFFELWEYERSHEIM" (parfois absent)
 *   results[].siege.numero_voie / type_voie / libelle_voie pour reconstituer
 *   "20 Rue des Tuileries" sans le CP/ville
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Building2, MapPin } from "lucide-react";

export type CompanySuggestion = {
  /** Nom commercial / raison sociale (déjà mis en forme propre) */
  company: string;
  /** SIRET 14 chiffres du siège social */
  siret: string;
  /** Adresse de rue uniquement, sans CP ni ville */
  street: string;
  /** Code postal du siège */
  postcode: string;
  /** Ville du siège */
  city: string;
};

type Props = {
  value: string;
  onChange: (company: string) => void;
  /** Appelé quand l'utilisateur sélectionne une entreprise. Le parent doit
   *  répartir les champs dans son state (company + siret + adresse complète). */
  onSelect: (data: CompanySuggestion) => void;
  placeholder?: string;
  className?: string;
  id?: string;
};

// Schéma JSON de l'API (champs utilisés uniquement, tout le reste ignoré)
type ApiSiege = {
  siret?: string;
  adresse?: string;
  code_postal?: string;
  libelle_commune?: string;
  numero_voie?: string;
  type_voie?: string;
  libelle_voie?: string;
  complement_adresse?: string;
};
type ApiResult = {
  nom_complet?: string;
  nom_raison_sociale?: string;
  siege?: ApiSiege;
};

// Met en forme proprement un nom d'entreprise SCREAMING_CASE → Title Case.
// L'API renvoie "HM GLOBAL AGENCE EURL", on veut afficher "HM Global Agence EURL"
// (sauf acronymes connus type SAS, SARL, EURL, SCI… qu'on garde en majuscules).
const KEEP_UPPER = new Set([
  "SAS","SASU","SARL","EURL","SA","SCI","SNC","SCP","GIE","SCEA","SCOP",
  "EARL","SCA","SCM","SC","SCS","SE","SEM","SEL","SPRL","SCIC",
  "HM", // marque propre Kaan — protégée
]);
function prettifyCompanyName(raw: string): string {
  return raw
    .split(/\s+/)
    .map((token) => {
      if (KEEP_UPPER.has(token)) return token;
      // Mots avec apostrophe / tiret : capitalise après chaque séparateur
      return token
        .toLowerCase()
        .replace(/(^|[\s\-'])(\w)/g, (_m, sep, c) => sep + c.toUpperCase());
    })
    .join(" ");
}

// Reconstitue "12 Rue de la Paix" depuis numero_voie + type_voie + libelle_voie
// (champs structurés de l'API) — plus propre que `adresse` qui contient tout
// concaténé en majuscules.
function buildStreet(siege: ApiSiege): string {
  const parts = [
    siege.numero_voie,
    siege.type_voie,
    siege.libelle_voie,
  ].filter((s): s is string => !!s && s.trim().length > 0);
  if (parts.length === 0) {
    // Fallback : récupère ce qu'on peut de adresse brute en retirant CP/ville
    if (siege.adresse && siege.code_postal) {
      // Coupe au CP : "20 RUE DES TUILERIES 67460 SOUFFELWEYERSHEIM"
      const cutIdx = siege.adresse.indexOf(siege.code_postal);
      if (cutIdx > 0) return prettifyCompanyName(siege.adresse.slice(0, cutIdx).trim());
    }
    return "";
  }
  return prettifyCompanyName(parts.join(" "));
}

export default function CompanyAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "HM Global Agence — commencez à taper le nom ou le SIRET…",
  className = "",
  id,
}: Props) {
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch debouncé ─────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = value.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const url =
          "https://recherche-entreprises.api.gouv.fr/search?" +
          new URLSearchParams({
            q: trimmed,
            limit: "5",
            // page: "1" implicite
          }).toString();

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: { results?: ApiResult[] } = await res.json();
        const list: CompanySuggestion[] = (data.results ?? [])
          .map((r) => {
            const siege = r.siege ?? {};
            const rawName = r.nom_complet ?? r.nom_raison_sociale ?? "";
            return {
              company:  prettifyCompanyName(rawName),
              siret:    siege.siret ?? "",
              street:   buildStreet(siege),
              postcode: siege.code_postal ?? "",
              city:     siege.libelle_commune
                ? prettifyCompanyName(siege.libelle_commune)
                : "",
            };
          })
          // Filtre les entreprises sans SIRET (cas marginal mais possible)
          .filter((c) => c.company.length > 0 && c.siret.length === 14);

        setSuggestions(list);
        setOpen(list.length > 0);
        setHighlightedIndex(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        setLoading(false);
      }
    }, 300); // 300 ms — un peu plus long que pour les adresses (API plus lente)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  // ── Click outside pour fermer la dropdown ──────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (sug: CompanySuggestion) => {
    onSelect(sug);
    setOpen(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      pick(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = useMemo(
    () => open && suggestions.length > 0,
    [open, suggestions.length],
  );

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <input
        id={id}
        type="text"
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="organization"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-controls="company-suggestions"
      />

      {loading && (
        <Loader2
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--hm-text-muted)]"
        />
      )}

      {showDropdown && (
        <ul
          id="company-suggestions"
          role="listbox"
          className="absolute z-30 mt-1 max-h-80 w-full overflow-y-auto rounded-xl border border-[var(--hm-line)] bg-white shadow-lg"
        >
          {suggestions.map((sug, i) => (
            <li
              key={sug.siret}
              role="option"
              aria-selected={i === highlightedIndex}
              onMouseDown={(e) => {
                // mousedown plutôt que click pour éviter que le blur ferme
                // la dropdown avant le pick
                e.preventDefault();
                pick(sug);
              }}
              onMouseEnter={() => setHighlightedIndex(i)}
              className={`flex cursor-pointer items-start gap-2.5 px-3 py-3 text-sm transition ${
                i === highlightedIndex
                  ? "bg-[var(--hm-accent-soft-rose)]"
                  : ""
              }`}
            >
              <Building2
                size={16}
                className={`mt-0.5 shrink-0 ${
                  i === highlightedIndex
                    ? "text-[var(--hm-primary)]"
                    : "text-[var(--hm-text-muted)]"
                }`}
              />
              <div className="flex-1 leading-tight">
                <p className={`font-semibold ${
                  i === highlightedIndex
                    ? "text-[var(--hm-primary)]"
                    : "text-[var(--hm-text)]"
                }`}>
                  {sug.company}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--hm-text-soft)]">
                  <MapPin size={10} />
                  {sug.street}{sug.postcode && `, ${sug.postcode}`}{sug.city && ` ${sug.city}`}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-[var(--hm-text-muted)]">
                  SIRET {sug.siret.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, "$1 $2 $3 $4")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
