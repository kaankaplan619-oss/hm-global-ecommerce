"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Upload, X, CheckCircle, AlertCircle, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { computeUnitPrice, formatPrice, PRICING_CONFIG } from "@/data/pricing";
import { TECHNIQUES, PLACEMENTS } from "@/data/techniques";
import { validateLogoFile, formatFileSize, ALLOWED_FILE_EXTENSIONS } from "@/lib/utils";
import type { Product, Technique, Placement, ProductColor } from "@/types";

// ── Position indicative du logo selon l'emplacement ──────────────────────────
// Exprimée en % relatif au conteneur image (aspect-[3/4] avec p-8 padding)
const LOGO_POSITION: Record<Placement, React.CSSProperties> = {
  "coeur":     { top: "31%", left: "41%", transform: "translate(-50%, -50%)" },
  "dos":       { top: "34%", left: "50%", transform: "translate(-50%, -50%)" },
  "coeur-dos": { top: "31%", left: "41%", transform: "translate(-50%, -50%)" },
};

interface Props {
  product: Product;
  selectedColor?: ProductColor | null;
  onColorChange?: (color: ProductColor | null) => void;
}

export default function ProductConfigurator({
  product,
  selectedColor,
  onColorChange,
}: Props) {
  const { addItem } = useCartStore();

  // Config state
  const [technique, setTechnique] = useState<Technique>(product.techniques[0]);
  const [placement, setPlacement] = useState<Placement>(product.placements[0]);
  const [size, setSize] = useState<string>("");
  const [internalColor, setInternalColor] = useState<ProductColor | null>(
    product.colors.find((c) => c.available) ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const color = selectedColor ?? internalColor;

  // Crée / révoque l'URL blob du logo pour l'aperçu
  useEffect(() => {
    if (!logoFile) { setLogoPreviewUrl(null); return; }
    const url = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const handleColorChange = useCallback(
    (nextColor: ProductColor | null) => {
      if (onColorChange) {
        onColorChange(nextColor);
        return;
      }
      setInternalColor(nextColor);
    },
    [onColorChange]
  );

  // Price computation
  const basePrice = product.pricing[technique] as number;
  const unitPrice = computeUnitPrice({ basePrice, technique, placement });
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
  const freeShipping = quantity >= PRICING_CONFIG.freeShippingThreshold;

  const availableTechniques = TECHNIQUES.filter((t) => product.techniques.includes(t.id));
  const availablePlacements = PLACEMENTS.filter((p) => product.placements.includes(p.id));

  // File handling
  const handleFileChange = useCallback((file: File | null) => {
    setFileError("");
    if (!file) {
      setLogoFile(null);
      return;
    }
    const validation = validateLogoFile(file);
    if (!validation.valid) {
      setFileError(validation.error!);
      return;
    }
    setLogoFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  }, [handleFileChange]);

  // Add to cart
  const handleAddToCart = () => {
    if (!size) return;
    if (!color) return;

    addItem({
      product,
      quantity,
      size,
      color,
      technique,
      placement,
      logoFile: logoFile
        ? { name: logoFile.name, size: logoFile.size, type: logoFile.type }
        : undefined,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const canAdd = !!size && !!color && color.available;
  const shippingPiecesLeft = Math.max(0, PRICING_CONFIG.freeShippingThreshold - quantity);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Couleur ───────────────────────────────────────────── */}
      <div>
        <label className="label">
          Couleur
          {color && (
            <span className="ml-2 font-medium normal-case text-[var(--hm-text)]">{color.label}</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((c) => (
            <button
              key={c.id}
              onClick={() => c.available && handleColorChange(c)}
              disabled={!c.available}
              title={c.label}
              className={`relative h-9 min-w-9 rounded-full border-2 transition-all
                ${!c.available ? "cursor-not-allowed opacity-30" : "cursor-pointer hover:scale-105"}
                ${color?.id === c.id
                  ? "scale-105 border-[var(--hm-primary)] shadow-[0_8px_20px_rgba(177,63,116,0.18)]"
                  : "border-white shadow-[inset_0_0_0_1px_var(--hm-line)]"
                }`}
              style={{ backgroundColor: c.hex }}
            >
              <span className="sr-only">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Taille ────────────────────────────────────────────── */}
      <div>
        <label className="label">Taille</label>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => {
            const active = size === s.label;
            return (
              <button
                type="button"
                key={s.label}
                onClick={() => s.available && !s.soldOut && setSize(s.label)}
                disabled={!s.available || s.soldOut}
                aria-pressed={active}
                className={`relative flex h-10 min-w-[50px] items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-all
                  ${active
                    ? "ring-2 ring-[rgba(76,47,111,0.08)] shadow-[0_10px_24px_rgba(76,47,111,0.18)]"
                    : s.soldOut || !s.available
                    ? "cursor-not-allowed border-[var(--hm-line)] bg-[var(--hm-surface)] text-[var(--hm-text-muted)]"
                    : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)] hover:bg-[var(--hm-accent-soft-purple)]/35 hover:text-[var(--hm-text)]"
                  }`}
                style={
                  active
                    ? {
                        backgroundColor: "var(--hm-purple)",
                        borderColor: "var(--hm-purple)",
                        color: "#ffffff",
                      }
                    : undefined
                }
              >
                <span className="relative z-10 leading-none">{s.label}</span>
                {s.soldOut && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-x-2 top-1/2 h-[1px] rotate-12 bg-[var(--hm-text-muted)]/70" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {!size && (
          <p className="mt-2 text-[11px] text-[var(--hm-text-muted)]">
            Sélectionnez une taille pour continuer
          </p>
        )}
      </div>

      {/* ── Technique ─────────────────────────────────────────── */}
      <div>
        <label className="label">Technique de personnalisation</label>
        <div className="flex flex-col gap-2">
          {availableTechniques.map((tech) => {
            const techPrice = computeUnitPrice({
              basePrice: product.pricing[tech.id] as number,
              technique: tech.id,
              placement,
            });
            const active = technique === tech.id;

            return (
              <button
                key={tech.id}
                onClick={() => setTechnique(tech.id)}
                className={`w-full rounded-[1rem] border p-3 text-left transition-all
                  ${active
                    ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] shadow-[0_10px_24px_rgba(177,63,116,0.08)]"
                    : "border-[var(--hm-line)] bg-white hover:border-[var(--hm-primary)]/30"
                  }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2
                        ${active ? "border-[var(--hm-primary)]" : "border-[var(--hm-line)]"}`}
                    >
                      {active && <div className="h-2 w-2 rounded-full bg-[var(--hm-primary)]" />}
                    </div>
                    <div>
                      <span
                        className={`text-sm font-semibold ${active ? "text-[var(--hm-text)]" : "text-[var(--hm-text-soft)]"}`}
                      >
                        {tech.label}
                      </span>
                      {tech.id === "broderie" && (
                        <span className="ml-2 badge badge-info text-[8px]">Premium</span>
                      )}
                      {tech.id === "dtf" && (
                        <span className="ml-2 badge badge-gold text-[8px]">Populaire</span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${active ? "text-[var(--hm-primary)]" : "text-[var(--hm-text-muted)]"}`}
                  >
                    {formatPrice(techPrice)}
                  </span>
                </div>
                {active && (
                  <p className="mt-2 ml-7 text-xs text-[var(--hm-text-soft)]">{tech.description}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Avertissement softshell DTF/Flex ─────────────────── */}
      {product.category === "softshells" && (technique === "dtf" || technique === "flex") && (
        <div className="-mt-2 flex items-start gap-2 rounded-lg border border-[#facc1533] bg-[#facc1511] p-3">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-[#b45309]" />
          <p className="text-xs text-[#b45309]">
            La broderie est recommandée pour les softshells — le tissu technique supporte moins bien l&rsquo;impression DTF/Flex sur le long terme.
          </p>
        </div>
      )}

      {/* ── Emplacement ───────────────────────────────────────── */}
      <div>
        <label className="label">Emplacement du marquage</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {availablePlacements.map((plc) => {
            const placementSurcharge =
              technique === "broderie"
                ? product.pricing.broDeriePlacementSurcharge[plc.id]
                : product.pricing.placements[plc.id];

            const active = placement === plc.id;
            return (
              <button
                key={plc.id}
                onClick={() => setPlacement(plc.id)}
                className={`rounded-[1rem] border p-3 text-center transition-all
                  ${active
                    ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] shadow-[0_10px_24px_rgba(177,63,116,0.08)]"
                    : "border-[var(--hm-line)] bg-white hover:border-[var(--hm-primary)]/30"
                  }`}
              >
                <span
                  className={`block text-xs font-semibold ${active ? "text-[var(--hm-text)]" : "text-[var(--hm-text-soft)]"}`}
                >
                  {plc.label}
                </span>
                {placementSurcharge > 0 && (
                  <span className="text-[10px] text-[var(--hm-primary)]">+{formatPrice(placementSurcharge)}</span>
                )}
                {placementSurcharge === 0 && (
                  <span className="text-[10px] text-[var(--hm-text-muted)]">Inclus</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Quantité ──────────────────────────────────────────── */}
      <div>
        <label className="label">Quantité</label>
        <div className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] transition-colors hover:border-[var(--hm-primary)]/30 hover:text-[var(--hm-text)]"
              >
                <Minus size={14} />
              </button>
              <span className="w-12 text-center text-2xl font-semibold text-[var(--hm-text)]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] transition-colors hover:border-[var(--hm-primary)]/30 hover:text-[var(--hm-text)]"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              {freeShipping ? (
                <span className="inline-flex rounded-full bg-[#dcfce7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#166534]">
                  Livraison offerte
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-soft)] ring-1 ring-[var(--hm-line)]">
                  Livraison dès {PRICING_CONFIG.freeShippingThreshold} pièces
                </span>
              )}
              <p className="text-[11px] text-[var(--hm-text-soft)]">
                {freeShipping
                  ? "Seuil atteint pour cette commande."
                  : `Encore ${shippingPiecesLeft} pièce${shippingPiecesLeft > 1 ? "s" : ""} pour l'obtenir.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Logo upload ───────────────────────────────────────── */}
      <div>
        <label className="label">Votre logo / fichier</label>
        {!logoFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative cursor-pointer rounded-[1.25rem] border-2 border-dashed border-[var(--hm-line)] bg-[var(--hm-surface)] p-6 text-center transition-colors hover:border-[var(--hm-primary)]/35"
            onClick={() => document.getElementById("logo-input")?.click()}
          >
            <Upload size={20} className="mx-auto mb-3 text-[var(--hm-primary)]" />
            <p className="text-sm font-semibold text-[var(--hm-text)]">
              Glissez votre fichier ici ou cliquez pour parcourir
            </p>
            <p className="mt-2 text-[11px] text-[var(--hm-text-soft)]">
              Formats : {ALLOWED_FILE_EXTENSIONS.join(", ")} — Max 50 Mo
            </p>
            <p className="mt-2 text-[11px] text-[var(--hm-text-muted)]">
              Vous pouvez envoyer un logo, un visuel à imprimer ou un fichier déjà préparé.
              Les formats vectoriels comme SVG, PDF ou AI restent les plus confortables pour la production.
            </p>
            <input
              id="logo-input"
              type="file"
              className="sr-only"
              accept=".pdf,.png,.svg,.ai"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-[1.25rem] border border-[#86efac] bg-[#ecfdf5] p-4">
            <CheckCircle size={16} className="shrink-0 text-[#166534]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--hm-text)]">{logoFile.name}</p>
              <p className="text-[11px] text-[var(--hm-text-soft)]">{formatFileSize(logoFile.size)}</p>
            </div>
            <button
              onClick={() => setLogoFile(null)}
              className="text-[var(--hm-text-muted)] transition-colors hover:text-[#b91c1c]"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {fileError && (
          <div className="mt-2 flex items-center gap-2 text-xs text-[#b91c1c]">
            <AlertCircle size={12} />
            {fileError}
          </div>
        )}

        <p className="mt-2 text-[11px] text-[var(--hm-text-muted)]">
          Si votre fichier n&apos;est pas finalisé, nous le vérifierons avec vous avant production.
        </p>
      </div>

      {/* ── Aperçu marquage ───────────────────────────────────── */}
      {logoPreviewUrl && (
        <div>
          <label className="label">Aperçu du marquage</label>
          <div className="overflow-hidden rounded-2xl border border-[var(--hm-line)] bg-gray-50">
            <div className="relative aspect-[3/4]">
              {/* Photo produit */}
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-contain p-8"
              />
              {/* Logo en overlay */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoPreviewUrl}
                alt="Votre logo"
                className="absolute max-h-[18%] max-w-[24%] object-contain"
                style={LOGO_POSITION[placement]}
              />
              {/* Étiquette emplacement */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <span className="rounded-full border border-[var(--hm-line)] bg-white/90 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)] backdrop-blur-sm">
                  {placement === "coeur" ? "Cœur" : placement === "dos" ? "Dos" : "Cœur + Dos"} · aperçu indicatif
                </span>
              </div>
            </div>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-[var(--hm-text-muted)]">
            Position et taille non contractuelles — le placement final sera validé avec vous avant production.
          </p>
        </div>
      )}

      {/* ── Prix récapitulatif ────────────────────────────────── */}
        <div className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-5 shadow-[0_14px_34px_rgba(63,45,88,0.05)]">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--hm-text-soft)]">Prix unitaire TTC</span>
          <span className="text-base font-semibold text-[var(--hm-text)]">{formatPrice(unitPrice)}</span>
        </div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--hm-text-soft)]">Quantité</span>
          <span className="text-sm font-medium text-[var(--hm-text)]">× {quantity}</span>
        </div>
        <div className="divider-gold my-3" />
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-base font-semibold text-[var(--hm-text)]">Total TTC</span>
            <p className="mt-1 text-[11px] text-[var(--hm-text-soft)]">
              {size ? `Taille ${size} · ${technique.toUpperCase()}` : "Configurez votre produit pour commander"}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-[var(--hm-primary)]">{formatPrice(totalPrice)}</span>
            <p className="text-[11px] text-[var(--hm-text-soft)]">
              soit {formatPrice(totalPrice / 1.2)} HT
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-[1rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-3">
          <p className="text-[11px] leading-6 text-[var(--hm-text-soft)]">
            {freeShipping
              ? "La livraison est offerte pour cette configuration."
              : `Livraison offerte dès ${PRICING_CONFIG.freeShippingThreshold} pièces. Il vous manque ${shippingPiecesLeft} pièce${shippingPiecesLeft > 1 ? "s" : ""}.`}
          </p>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <button
        onClick={handleAddToCart}
        disabled={!canAdd}
        className={`btn-primary w-full gap-3 py-4 text-sm
          ${!canAdd ? "cursor-not-allowed opacity-50" : ""}`}
      >
        {addedToCart ? (
          <>
            <CheckCircle size={16} />
            Ajouté au panier !
          </>
        ) : (
          <>
            <ShoppingBag size={16} />
            {!size
              ? "Sélectionnez une taille"
              : "Ajouter au panier"}
          </>
        )}
      </button>

      <p className="text-center text-[10px] text-[var(--hm-text-muted)]">
        Vous pouvez configurer et ajouter au panier librement. La connexion sera demandée au moment du checkout.
      </p>
    </div>
  );
}
