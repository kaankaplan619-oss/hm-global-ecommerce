"use client";

/**
 * AddressAutocomplete.tsx — Champ adresse intelligent avec suggestions.
 *
 * Source de données : api-adresse.data.gouv.fr (Base Adresse Nationale,
 * service officiel de l'État français). 100% gratuit, sans clé API,
 * gouvernemental, couvre TOUTES les adresses livrables en France
 * métropolitaine + DOM-TOM. Données à jour quotidiennement.
 *
 * Comportement :
 *   - Debounce 250ms pour limiter les appels (politesse + UX)
 *   - Min 4 caractères avant de chercher (évite les requêtes inutiles)
 *   - Top 5 suggestions max
 *   - Au clic sur une suggestion → fill street + postcode + city via onSelect
 *   - Si l'API échoue (réseau, downtime) → fallback silencieux sur saisie
 *     manuelle. Le client peut TOUJOURS taper son adresse à la main.
 *   - Aucune dépendance npm (fetch natif + React hooks)
 *
 * Endpoint API :
 *   https://api-adresse.data.gouv.fr/search/?q=<query>&limit=5&autocomplete=1
 *
 * Format de réponse pertinent :
 *   features[].properties.label    → "12 Rue de la Paix, 67000 Strasbourg"
 *   features[].properties.name     → "12 Rue de la Paix"
 *   features[].properties.postcode → "67000"
 *   features[].properties.city     → "Strasbourg"
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

export type AddressSuggestion = {
  label: string;
  street: string;
  postcode: string;
  city: string;
};

type Props = {
  value: string;
  onChange: (street: string) => void;
  /** Appelé quand l'utilisateur sélectionne une suggestion. Le parent
   *  doit propager postcode + city dans son state. */
  onSelect: (data: AddressSuggestion) => void;
  placeholder?: string;
  /** Classe CSS additionnelle pour l'input wrapper. */
  className?: string;
  id?: string;
};

type ApiFeature = {
  properties?: {
    label?: string;
    name?: string;
    postcode?: string;
    city?: string;
  };
};

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "12 rue de la Paix",
  className = "",
  id,
}: Props) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
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
    if (trimmed.length < 4) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      // Annule la requête précédente si elle est encore en vol
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const url =
          "https://api-adresse.data.gouv.fr/search/?" +
          new URLSearchParams({
            q: trimmed,
            limit: "5",
            autocomplete: "1",
          }).toString();

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: { features?: ApiFeature[] } = await res.json();
        const list: AddressSuggestion[] = (data.features ?? []).map((f) => ({
          label:    f.properties?.label    ?? "",
          street:   f.properties?.name     ?? "",
          postcode: f.properties?.postcode ?? "",
          city:     f.properties?.city     ?? "",
        }));

        setSuggestions(list);
        setOpen(list.length > 0);
        setHighlightedIndex(-1);
      } catch (err) {
        // Abort intentionnel = ignore. Sinon, fallback silencieux sur
        // saisie manuelle (pas d'alerte qui dégraderait l'UX).
        if ((err as Error).name !== "AbortError") {
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

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

  // ── Sélection (clavier ou souris) ──────────────────────────────────────
  // ⚠️ BUG FIX (2026-05-26) — On NE peut PAS appeler onChange(sug.street)
  // après onSelect(sug). En effet :
  //   1. onSelect(sug) → parent fait setBillingAddress({...prev, street, postalCode, city})
  //   2. onChange(sug.street) → parent fait setBillingAddress({...prev, street})
  // Comme React batche les setState et que les deux closures capturent le
  // MÊME `billingAddress` stale, le 2ᵉ écrase le 1ᵉʳ → postalCode et city
  // étaient perdus. C'est ce qui s'est produit chez Kaan : seul `street`
  // restait rempli. Solution : onSelect suffit (il set street + postcode +
  // city d'un coup), pas besoin du onChange supplémentaire.
  const pick = (sug: AddressSuggestion) => {
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

  // Compute conditional show state for clarity
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
        autoComplete="address-line1"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-controls="address-suggestions"
      />

      {/* Spinner discret pendant le fetch */}
      {loading && (
        <Loader2
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--hm-text-muted)]"
        />
      )}

      {/* Dropdown des suggestions */}
      {showDropdown && (
        <ul
          id="address-suggestions"
          role="listbox"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-[var(--hm-line)] bg-white shadow-lg"
        >
          {suggestions.map((sug, i) => (
            <li
              key={`${sug.label}-${i}`}
              role="option"
              aria-selected={i === highlightedIndex}
              onMouseDown={(e) => {
                // mousedown plutôt que click pour éviter que l'onBlur de
                // l'input ne ferme la dropdown avant qu'on ait pu cliquer
                e.preventDefault();
                pick(sug);
              }}
              onMouseEnter={() => setHighlightedIndex(i)}
              className={`flex cursor-pointer items-start gap-2 px-3 py-2.5 text-sm transition ${
                i === highlightedIndex
                  ? "bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
                  : "text-[var(--hm-text)]"
              }`}
            >
              <MapPin
                size={14}
                className={`mt-0.5 shrink-0 ${
                  i === highlightedIndex
                    ? "text-[var(--hm-primary)]"
                    : "text-[var(--hm-text-muted)]"
                }`}
              />
              <span className="leading-tight">{sug.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
