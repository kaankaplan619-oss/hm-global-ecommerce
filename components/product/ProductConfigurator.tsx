"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, Minus, Plus, ShoppingBag, Loader2, Truck } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

// ── Calcul date d'expédition estimée ──────────────────────────────────────────
// Production + livraison : 5 à 7 jours ouvrés selon le volume
function getEstimatedShipDate(businessDays = 6): string {
  const now = new Date();
  // Commandes passées après 14h → +1 jour
  if (now.getHours() >= 14) businessDays += 1;
  let count = 0;
  const d = new Date(now);
  while (count < businessDays) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++; // skip weekend
  }
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}
import { useCartStore } from "@/store/cart";
import { formatPrice, PRICING_CONFIG, getVolumePricedRate } from "@/data/pricing";
import { isSimpleFlowProduct } from "@/data/products";
import { TECHNIQUES, PLACEMENTS } from "@/data/techniques";
import { validateLogoFile, formatFileSize, ALLOWED_FILE_EXTENSIONS } from "@/lib/utils";
import { uploadLogoToSupabase, getUploadErrorMessage, type LogoUploadResult } from "@/lib/uploadLogo";
import { colorHasImages, colorHasSpecificImage } from "@/components/product/ProductGallery";
import {
  getDisplayedColors,
  isPrintifyV1Product,
} from "@/lib/suppliers/printify/printify-colors";
import type { Product, Technique, Placement, ProductColor, LogoEffect, LogoPlacementTransform } from "@/types";

interface Props {
  product: Product;
  selectedColor?: ProductColor | null;
  onColorChange?: (color: ProductColor | null) => void;
  onLogoChange?: (f: File | null) => void;
  /** Remonte le résultat d'upload Supabase vers le parent (BAT, panier) dès que disponible */
  onLogoUploadResult?: (result: LogoUploadResult | null) => void;
  onPlacementChange?: (p: Placement) => void;
  /** Callbacks pour remonter l'état vers ProductDetailClient (BAT, etc.) */
  onTechniqueChange?: (t: Technique) => void;
  onSizeChange?: (s: string) => void;
  onQuantityChange?: (q: number) => void;
  /**
   * Valeurs contrôlées depuis ProductDetailClient (restaurées depuis sessionStorage).
   * Quand fournies, elles pilotent l'UI ; sinon l'état interne prend le relais
   * (compatibilité ascendante pour tout usage non-contrôlé).
   */
  technique?: Technique;
  placement?: Placement;
  size?: string;
  quantity?: number;
  hidePreview?: boolean;
  /** Map colorId → imageUrls chargée depuis l'API TopTex — pour indiquer quelle couleur a des photos */
  colorImages?: Record<string, string[]>;
  /** Données BAT remontées depuis ProductDetailClient pour être persistées dans le panier */
  logoEffect?: LogoEffect;
  logoPlacementTransform?: LogoPlacementTransform | null;
  batRef?: string;
  /** Logo pré-uploadé depuis le Studio — remplace le fichier local dans le panier */
  studioLogoPreset?: {
    url: string; path: string; name: string; size: number; type: string;
    logoPlacementTransform?: LogoPlacementTransform | null;
  };
  /**
   * Masque le bloc upload logo + l'aperçu de zones sur la fiche produit.
   * L'upload se fait dans le studio (/studio/[slug]), pas ici.
   * Par défaut : false (ancien comportement conservé).
   */
  hideLogoUpload?: boolean;
  /** Image composée face (shirt+logo) exportée depuis le Studio — transmise au panier */
  studioComposedFront?: string | null;
  /** Image composée dos (shirt+logo) exportée depuis le Studio — transmise au panier */
  studioComposedBack?: string | null;
  /**
   * Quand true (produits Printful), le bouton "Ajouter au panier" est désactivé
   * tant qu'aucun logo n'est fourni (studioLogoPreset absent).
   * Force le passage par "Personnaliser mon article" → studio.
   */
  requirePersonalization?: boolean;
  /**
   * Slot optionnel — rendu juste avant le prix récapitulatif.
   * Utilisé pour injecter le bouton "Personnaliser mon article" depuis le parent.
   */
  studioCTA?: React.ReactNode;
}

export default function ProductConfigurator({
  product,
  selectedColor,
  onColorChange,
  onLogoChange,
  onLogoUploadResult,
  onPlacementChange,
  onTechniqueChange,
  onSizeChange,
  onQuantityChange,
  technique:  controlledTechnique,
  placement:  controlledPlacement,
  size:       controlledSize,
  quantity:   controlledQuantity,
  hidePreview,
  colorImages,
  logoEffect,
  logoPlacementTransform,
  batRef,
  studioLogoPreset,
  hideLogoUpload = false,
  requirePersonalization = false,
  studioCTA,
  studioComposedFront,
  studioComposedBack,
}: Props) {
  const t = useT();
  const { addItem } = useCartStore();

  // Couleurs affichées : filtrées Printify V1 si applicable, sinon liste complète
  const displayedColors = useMemo(
    () => getDisplayedColors(product.id, product.colors),
    [product.id, product.colors]
  );
  const isPrintifyV1 = isPrintifyV1Product(product.id);

  // Config state — états internes (utilisés quand le parent ne passe pas de valeur contrôlée)
  const [internalTechnique, setInternalTechnique] = useState<Technique>(product.techniques[0]);
  const [internalPlacement, setInternalPlacement] = useState<Placement>(product.placements[0]);
  const [internalSize,      setInternalSize]      = useState<string>("");
  const [internalColor,     setInternalColor]      = useState<ProductColor | null>(
    displayedColors.find((c) => c.available) ?? displayedColors[0] ?? null
  );
  const [internalQuantity,  setInternalQuantity]  = useState(product.minOrderQty ?? 1);

  // Valeurs effectives : prop contrôlée prioritaire, état interne en fallback
  const technique = controlledTechnique ?? internalTechnique;
  const placement = controlledPlacement ?? internalPlacement;
  const size      = controlledSize      ?? internalSize;
  const quantity  = controlledQuantity  ?? internalQuantity;
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [addedToCart, setAddedToCart] = useState(false);
  // Checkbox de validation création (inspiré de PrintOclock)
  const [creationValidated, setCreationValidated] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Upload immédiat dès sélection fichier
  const [logoUploadResult, setLogoUploadResult] = useState<LogoUploadResult | null>(null);
  const [isUploadingOnSelect, setIsUploadingOnSelect] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  // Ref pour éviter les race conditions si l'utilisateur change de fichier rapidement
  const uploadGenerationRef = useRef(0);

  // Stable browser-session ID for storage path — generated once per session
  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "ssr";
    const stored = sessionStorage.getItem("hm_session_id");
    if (stored) return stored;
    const id = crypto.randomUUID();
    sessionStorage.setItem("hm_session_id", id);
    return id;
  }, []);
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
  // Barème volume par technique (volumePricingByTechnique) > barème global (volumePricing) > prix fixe.
  const activeVolumeTiers =
    product.volumePricingByTechnique?.[technique] ??
    product.volumePricing ??
    null;

  const isBroderieFamily = technique === "broderie" || technique === "broderie_illimitee";

  const basePrice = activeVolumeTiers
    ? getVolumePricedRate(activeVolumeTiers, quantity)
    : (product.pricing[technique as Exclude<typeof technique, "print">] as number) ?? 0;

  const placementSurcharge = isBroderieFamily
    ? product.pricing.broDeriePlacementSurcharge[placement]
    : product.pricing.placements[placement];
  const unitPrice = Math.round((basePrice + placementSurcharge) * 100) / 100;
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
  const freeShipping = quantity >= PRICING_CONFIG.freeShippingThreshold;
  // Contraintes de production de la technique sélectionnée (ex : textiles
  // Printful — broderie au cœur uniquement, DTFlex dès 10 pièces).
  const techConstraint = product.techniqueConstraints?.[technique];
  const minQty = Math.max(product.minOrderQty ?? 1, techConstraint?.minQty ?? 1);

  const availableTechniques = TECHNIQUES.filter((t) => product.techniques.includes(t.id));
  const availablePlacements = PLACEMENTS.filter(
    (p) =>
      product.placements.includes(p.id) &&
      (!techConstraint?.placements || techConstraint.placements.includes(p.id))
  );

  // Placement change — met à jour l'état interne ET notifie le parent
  const handlePlacementChange = useCallback((p: Placement) => {
    setInternalPlacement(p);
    onPlacementChange?.(p);
  }, [onPlacementChange]);

  // Réaligne placement et quantité sur les contraintes de la technique active
  // (couvre aussi les états restaurés du localStorage : ex broderie + dos).
  useEffect(() => {
    if (techConstraint?.placements && !techConstraint.placements.includes(placement)) {
      const fallback = techConstraint.placements[0];
      setInternalPlacement(fallback);
      onPlacementChange?.(fallback);
    }
    if (quantity < minQty) {
      setInternalQuantity(minQty);
      onQuantityChange?.(minQty);
    }
  }, [techConstraint, placement, quantity, minQty, onPlacementChange, onQuantityChange]);

  // File handling — upload immédiat dès la sélection (utilisateur authentifié)
  const handleFileChange = useCallback(async (file: File | null) => {
    // Réinitialiser tous les états upload avant tout
    setFileError("");
    setUploadError(null);
    setUploadNotice(null);
    setLogoUploadResult(null);
    onLogoUploadResult?.(null); // Notifier le parent que l'URL précédente est invalidée

    if (!file) {
      setLogoFile(null);
      onLogoChange?.(null);
      return;
    }

    const validation = validateLogoFile(file);
    if (!validation.valid) {
      setFileError(validation.error!);
      return;
    }

    // Mettre à jour le fichier immédiatement pour l'aperçu local
    setLogoFile(file);
    onLogoChange?.(file);

    // Marquer la génération courante pour ignorer les résultats périmés
    const generation = ++uploadGenerationRef.current;

    // Tenter l'upload immédiatement. La route serveur accepte aussi les invités.
    setIsUploadingOnSelect(true);
    let data: import("@/lib/uploadLogo").LogoUploadResult | null = null;
    let error: import("@/lib/uploadLogo").LogoUploadError | null = null;
    try {
      ({ data, error } = await uploadLogoToSupabase(file, sessionId));
    } catch (e) {
      // uploadLogoToSupabase a levé une exception (ex: Supabase client non configuré).
      // On traite ça comme une erreur technique non-bloquante.
      console.error("[handleFileChange] uploadLogoToSupabase threw:", e);
      error = "SUPABASE_UPLOAD_ERROR";
    } finally {
      // Toujours débloquer le CTA, quelle que soit l'issue de l'upload.
      setIsUploadingOnSelect(false);
    }

    // Ignorer si un autre fichier a été sélectionné entre-temps
    if (generation !== uploadGenerationRef.current) return;

    if (data) {
      setLogoUploadResult(data);
      onLogoUploadResult?.(data); // Remonter l'URL Supabase vers le parent (BAT, etc.)
    } else if (error) {
      // Erreur technique non-bloquante — tentative de renvoi au clic "Ajouter au panier"
      setUploadNotice(getUploadErrorMessage(error));
    }
  }, [onLogoChange, onLogoUploadResult, sessionId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  }, [handleFileChange]);

  // Add to cart — utilise logoUploadResult si déjà uploadé au moment de la sélection
  const handleAddToCart = async () => {
    if (!size || !color) return;
    setUploadError(null);

    let logoCartFile: { name: string; size: number; type: string; url?: string; path?: string } | undefined;

    // Logo exporté depuis le Studio (pré-uploadé sur Supabase)
    if (!logoFile && studioLogoPreset?.url) {
      logoCartFile = {
        name: studioLogoPreset.name,
        size: studioLogoPreset.size,
        type: studioLogoPreset.type,
        url:  studioLogoPreset.url,
        path: studioLogoPreset.path,
      };
    } else if (logoFile) {
      if (logoUploadResult) {
        // Chemin nominal : upload déjà effectué à la sélection du fichier ✅
        logoCartFile = {
          name: logoFile.name,
          size: logoFile.size,
          type: logoFile.type,
          url:  logoUploadResult.logoFileUrl,
          path: logoUploadResult.logoPath,
        };
      } else {
        // Upload initial raté — on retente une fois avant d'ajouter au panier.
        setIsUploading(true);
        let data: import("@/lib/uploadLogo").LogoUploadResult | null = null;
        let error: import("@/lib/uploadLogo").LogoUploadError | null = null;
        try {
          ({ data, error } = await uploadLogoToSupabase(logoFile, sessionId));
        } catch (e) {
          console.error("[handleAddToCart] uploadLogoToSupabase threw:", e);
          error = "SUPABASE_UPLOAD_ERROR";
        } finally {
          setIsUploading(false);
        }

        if (error) {
          setUploadError(getUploadErrorMessage(error));
          return;
        } else if (data) {
          setLogoUploadResult(data);
          logoCartFile = {
            name: logoFile.name,
            size: logoFile.size,
            type: logoFile.type,
            url:  data.logoFileUrl,
            path: data.logoPath,
          };
        }
      }
    }

    // Depuis le studio : utiliser la position Fabric.js enregistrée si pas de transform BAT
    const effectiveTransform = logoPlacementTransform ?? studioLogoPreset?.logoPlacementTransform ?? undefined;

    addItem({
      product,
      quantity,
      size,
      color,
      technique,
      placement,
      logoFile: logoCartFile,
      logoEffect,
      logoPlacementTransform: effectiveTransform,
      batRef,
      composedPreviewUrl:  studioComposedFront ?? undefined,
      composedPreviewBack: studioComposedBack  ?? undefined,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  // Quand requirePersonalization=true (Printful), un logo est obligatoire via le studio
  const hasLogo = !!logoFile || !!studioLogoPreset;
  const canAdd = !!size && !!color && color.available && !isUploadingOnSelect
    && (!requirePersonalization || hasLogo);
  const shippingPiecesLeft = Math.max(0, PRICING_CONFIG.freeShippingThreshold - quantity);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Couleur ───────────────────────────────────────────── */}
      <div>
        <label className="label">
          {t("configurator.color")}
          {color && (
            <span className="ml-2 font-medium normal-case text-[var(--hm-text)]">{color.label}</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {displayedColors.map((c) => {
            // Couleur barrée uniquement si vraiment indisponible dans notre catalogue
            const unavailable = !c.available;
            // Photo spécifique = packshot exact pour cette couleur (statique ou API)
            const hasSpecificPhoto = colorHasSpecificImage(c.id, colorImages);
            // Point gris = couleur commandable mais sans packshot dédié
            const photoMissing = !unavailable && !hasSpecificPhoto;

            return (
              <button
                key={c.id}
                onClick={() => !unavailable && handleColorChange(c)}
                disabled={unavailable}
                title={unavailable ? `${c.label} — ${t("configurator.outOfStock")}` : c.label}
                className={`relative h-9 min-w-9 rounded-full border-2 transition-all
                  ${unavailable
                    ? "cursor-not-allowed opacity-30"
                    : "cursor-pointer hover:scale-105"
                  }
                  ${color?.id === c.id
                    ? "scale-105 border-[var(--hm-primary)] shadow-[0_8px_20px_rgba(177,63,116,0.18)]"
                    : "border-white shadow-[inset_0_0_0_1px_var(--hm-line)]"
                  }
                `}
                style={{ backgroundColor: c.hex }}
              >
                {/* Croix = uniquement pour couleur vraiment indisponible */}
                {unavailable && (
                  <span
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="absolute h-[1px] w-4 rotate-45 bg-white/70" />
                    <span className="absolute h-[1px] w-4 -rotate-45 bg-white/70" />
                  </span>
                )}
                {/* Coche sur le coloris actif — visible sur toutes les couleurs */}
                {color?.id === c.id && (
                  <span
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <svg
                      width="10" height="8" viewBox="0 0 10 8" fill="none"
                      style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }}
                    >
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
                {/* Petit indicateur photo manquante (point) — commandable mais sans visuel */}
                {photoMissing && color?.id !== c.id && (
                  <span
                    className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white bg-[var(--hm-text-muted)]"
                    aria-hidden="true"
                  />
                )}
                <span className="sr-only">{c.label}</span>
              </button>
            );
          })}
        </div>
        {/* Message "Visuel non disponible" — masqué pour les produits Printify V1 puisque
            toutes les couleurs affichées ont obligatoirement un mockup local généré */}
        {!isPrintifyV1 && color && !colorHasImages(product.images, color, colorImages) && !product.hmMockupImages?.[color.id] && (
          <p className="mt-1.5 text-[11px] text-[var(--hm-text-muted)]">
            {t("configurator.noVisualForColor")}
          </p>
        )}
      </div>

      {/* ── Taille ────────────────────────────────────────────── */}
      <div>
        <label className="label">{t("configurator.size")}</label>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => {
            const active = size === s.label;
            return (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => { if (s.available && !s.soldOut) { setInternalSize(s.label); onSizeChange?.(s.label); } }}
                  disabled={!s.available || s.soldOut}
                  aria-pressed={active}
                  className={`relative flex h-10 min-w-[50px] items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-all
                    ${active
                      ? "ring-2 ring-[rgba(177,63,116,0.12)] shadow-[0_10px_24px_rgba(177,63,116,0.18)]"
                      : s.soldOut || !s.available
                      ? "cursor-not-allowed border-[var(--hm-line)] bg-[var(--hm-surface)] text-[var(--hm-text-muted)]"
                      : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)] hover:bg-[var(--hm-accent-soft-rose)]/40 hover:text-[var(--hm-text)]"
                    }`}
                  style={
                    active
                      ? { backgroundColor: "var(--hm-primary)", borderColor: "var(--hm-primary)", color: "#ffffff" }
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
                {/* Indicateur stock */}
                <span className={`flex items-center gap-0.5 text-[9px] font-medium ${
                  s.soldOut || !s.available ? "text-red-500" : "text-green-600"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${s.soldOut || !s.available ? "bg-red-500" : "bg-green-500"}`} />
                  {s.soldOut || !s.available ? t("configurator.soldOut") : t("configurator.inStock")}
                </span>
              </div>
            );
          })}
        </div>
        {!size && (
          <p className="mt-2 text-[11px] text-[var(--hm-text-muted)]">
            {t("configurator.selectSizeToContinue")}
          </p>
        )}
      </div>

      {/* ── Technique ─────────────────────────────────────────── */}
      <div>
        <label className="label">{t("configurator.techniqueLabel")}</label>
        <div className="flex flex-col gap-2">
          {availableTechniques.map((tech) => {
            // Utilise les surcharges spécifiques au produit — cohérent avec le récap prix
            const techPlacementSurcharge =
              tech.id === "broderie"
                ? product.pricing.broDeriePlacementSurcharge[placement]
                : product.pricing.placements[placement];
            const techPrice = Math.round(
              ((product.pricing[tech.id as Exclude<typeof tech.id, "print">] as number) + techPlacementSurcharge) * 100
            ) / 100;
            const active = technique === tech.id;

            return (
              <button
                key={tech.id}
                onClick={() => { setInternalTechnique(tech.id); onTechniqueChange?.(tech.id); }}
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
                        <span className="ml-2 badge badge-info text-[8px]">{t("configurator.badgePremium")}</span>
                      )}
                      {tech.id === "dtf" && (
                        <span className="ml-2 badge badge-gold text-[8px]">{t("configurator.badgePopular")}</span>
                      )}
                      {(product.techniqueConstraints?.[tech.id]?.minQty ?? 1) > 1 && (
                        <span className="ml-2 badge badge-info text-[8px]">
                          {t("configurator.fromQtyPrefix")} {product.techniqueConstraints?.[tech.id]?.minQty} {t("configurator.pcs")}
                        </span>
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
            {t("configurator.softshellWarning")}
          </p>
        </div>
      )}

      {/* ── Emplacement ───────────────────────────────────────────
           Affiché seulement s'il y a un vrai CHOIX (≥ 2 emplacements).
           Goodies/casquettes/sacs/coupe-vent : zone unique → masqué.
           Textiles & polo 64800 (cœur/dos/cœur+dos) : sélecteur intact. */}
      {availablePlacements.length > 1 && (
      <div>
        <label className="label">{t("configurator.placementLabel")}</label>
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
                onClick={() => handlePlacementChange(plc.id)}
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
                  <span className="text-[10px] text-[var(--hm-text-muted)]">{t("configurator.included")}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* ── Quantité ──────────────────────────────────────────── */}
      <div>
        <label className="label">{t("configurator.quantity")}</label>
        <div className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { const nq = Math.max(minQty, quantity - 1); setInternalQuantity(nq); onQuantityChange?.(nq); }}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] transition-colors hover:border-[var(--hm-primary)]/30 hover:text-[var(--hm-text)]"
              >
                <Minus size={14} />
              </button>
              <span className="w-12 text-center text-2xl font-semibold text-[var(--hm-text)]">
                {quantity}
              </span>
              <button
                onClick={() => { const nq = quantity + 1; setInternalQuantity(nq); onQuantityChange?.(nq); }}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] transition-colors hover:border-[var(--hm-primary)]/30 hover:text-[var(--hm-text)]"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              {freeShipping ? (
                <span className="inline-flex rounded-full bg-[#dcfce7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#166534]">
                  {t("configurator.freeShipping")}
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-soft)] ring-1 ring-[var(--hm-line)]">
                  {t("configurator.shippingFromPrefix")} {PRICING_CONFIG.freeShippingThreshold} {t("configurator.shippingFromSuffix")}
                </span>
              )}
              <p className="text-[11px] text-[var(--hm-text-soft)]">
                {freeShipping
                  ? t("configurator.thresholdReached")
                  : `${t("configurator.piecesLeftPrefix")} ${shippingPiecesLeft} ${shippingPiecesLeft > 1 ? t("configurator.piecesPlural") : t("configurator.pieceSingular")} ${t("configurator.piecesLeftSuffix")}`}
              </p>
            </div>
          </div>

          {/* Tableau dégressif — réactif à la technique sélectionnée */}
          {activeVolumeTiers && (
            <div className="mt-4 border-t border-[var(--hm-line)] pt-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-soft)]">
                {t("configurator.volumePriceLabel")}{" "}
                <span className="text-[var(--hm-primary)]">
                  {formatPrice(activeVolumeTiers[activeVolumeTiers.length - 1].unitPrice)}
                </span>{" "}
                {t("configurator.perPiece")}
              </p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {activeVolumeTiers.map((tier, tierIdx) => {
                  const isActive = quantity >= tier.from && (tier.to === undefined || quantity <= tier.to);
                  const saving = Math.round((activeVolumeTiers[0].unitPrice - tier.unitPrice) * 100) / 100;
                  const isPopular = activeVolumeTiers.length >= 3 && tierIdx === 1;
                  return (
                    <button
                      key={tier.from}
                      type="button"
                      onClick={() => {
                        const nq = Math.max(minQty, tier.from);
                        setInternalQuantity(nq);
                        onQuantityChange?.(nq);
                      }}
                      className={`relative flex flex-col rounded-xl border px-3 py-2.5 text-left transition-all ${
                        isActive
                          ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)]"
                          : "border-[var(--hm-line)] bg-white hover:border-[var(--hm-primary)]/40"
                      }`}
                    >
                      {isPopular && (
                        <span className="absolute -top-2 right-2 rounded-full bg-[var(--hm-primary)] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                          {t("configurator.mostChosen")}
                        </span>
                      )}
                      <span className={`text-[11px] font-semibold ${isActive ? "text-[var(--hm-primary)]" : "text-[var(--hm-text-soft)]"}`}>
                        {tier.to ? `${tier.from}–${tier.to}` : `${tier.from}+`} {t("configurator.pcs")}
                      </span>
                      <span className={`text-sm font-black ${isActive ? "text-[var(--hm-primary)]" : "text-[var(--hm-text)]"}`}>
                        {formatPrice(tier.unitPrice)}
                      </span>
                      {saving > 0 ? (
                        <span className="text-[9px] font-bold text-[#166534]">
                          −{formatPrice(saving)}{t("configurator.perPieceShort")}
                        </span>
                      ) : (
                        <span className="text-[9px] text-[var(--hm-text-muted)]">{t("configurator.basePrice")}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {minQty > 1 && (
                <p className="mt-2 text-[10px] text-[var(--hm-text-soft)]">
                  {t("configurator.minOrderPrefix")} {minQty} {t("configurator.piecesPlural")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Encart informatif goodies — workflow validation manuelle ──
           Affiché uniquement pour les goodies (mugs). Explique au client le
           workflow honnête : upload → vérification équipe HM Global → rendu
           préparé avant production. Pas de Studio textile, pas de BAT live. */}
      {!hideLogoUpload && isSimpleFlowProduct(product) && (
        <div className="rounded-2xl border border-[var(--hm-primary)]/20 bg-[var(--hm-accent-soft-rose)] px-4 py-3">
          <p className="text-[11px] leading-relaxed text-[var(--hm-text)]">
            <span className="font-semibold text-[var(--hm-primary)]">{t("configurator.addYourLogo")}</span>{" "}
            {product.techniques.includes("broderie")
              ? t("configurator.teamVerifyEmbroidery")
              : t("configurator.teamVerify")}
          </p>
        </div>
      )}

      {/* ── Logo upload ───────────────────────────────────────── */}
      {/* Masqué quand hideLogoUpload=true → l'upload se fait dans le studio */}
      {!hideLogoUpload && <div>
        <label className="label">{t("configurator.yourLogoFile")}</label>
        {!logoFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative cursor-pointer rounded-[1.25rem] border-2 border-dashed border-[var(--hm-line)] bg-[var(--hm-surface)] p-6 text-center transition-colors hover:border-[var(--hm-primary)]/35"
            onClick={() => document.getElementById("logo-input")?.click()}
          >
            <Upload size={20} className="mx-auto mb-3 text-[var(--hm-primary)]" />
            <p className="text-sm font-semibold text-[var(--hm-text)]">
              {t("configurator.dropFileHere")}
            </p>
            <p className="mt-2 text-[11px] text-[var(--hm-text-soft)]">
              {t("configurator.formatsPrefix")} {ALLOWED_FILE_EXTENSIONS.join(", ")} {t("configurator.formatsMaxSize")}
            </p>
            <p className="mt-2 text-[11px] text-[var(--hm-text-muted)]">
              {t("configurator.uploadHint")}
            </p>
            <input
              id="logo-input"
              type="file"
              className="sr-only"
              accept=".png,.svg"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </div>
        ) : (
          <div className={`flex items-center gap-3 rounded-[1.25rem] border p-4 ${
            logoUploadResult
              ? "border-[#86efac] bg-[#ecfdf5]"
              : "border-[var(--hm-line)] bg-[var(--hm-surface)]"
          }`}>
            {isUploadingOnSelect ? (
              <Loader2 size={16} className="animate-spin shrink-0 text-[var(--hm-primary)]" />
            ) : (
              <CheckCircle size={16} className={`shrink-0 ${logoUploadResult ? "text-[#166534]" : "text-[var(--hm-text-muted)]"}`} />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--hm-text)]">{logoFile.name}</p>
              <p className="text-[11px] text-[var(--hm-text-soft)]">
                {isUploadingOnSelect
                  ? t("configurator.uploading")
                  : logoUploadResult
                  ? `${formatFileSize(logoFile.size)} · ${t("configurator.saved")}`
                  : formatFileSize(logoFile.size)}
              </p>
            </div>
            <button
              onClick={() => {
                setLogoFile(null);
                setLogoUploadResult(null);
                setUploadNotice(null);
                setUploadError(null);
                onLogoChange?.(null);
                onLogoUploadResult?.(null); // Invalider l'URL Supabase dans le parent
              }}
              disabled={isUploadingOnSelect}
              className="text-[var(--hm-text-muted)] transition-colors hover:text-[#b91c1c] disabled:pointer-events-none disabled:opacity-40"
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

        {/* Notice non-bloquante : non authentifié ou erreur au moment de la sélection */}
        {uploadNotice && !uploadError && (
          <div className="mt-2 flex items-start gap-2 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-3 text-xs text-[#1e40af]">
            <AlertCircle size={12} className="mt-0.5 shrink-0" />
            <span>{uploadNotice}</span>
          </div>
        )}

        {/* Erreur bloquante : uniquement lors du fallback dans handleAddToCart */}
        {uploadError && (
          <div className="mt-2 flex items-start gap-2 rounded-xl border border-[#fde68a] bg-[#fffbeb] p-3 text-xs text-[#92400e]">
            <AlertCircle size={12} className="mt-0.5 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <p className="mt-2 text-[11px] text-[var(--hm-text-muted)]">
          {t("configurator.fileNotFinalizedNote")}
        </p>
      </div>}

      {/* ── Aperçu marquage par zones ─────────────────────────── */}
      {!hideLogoUpload && !hidePreview && logoPreviewUrl && (
        <div>
          <label className="label">{t("configurator.markingPreview")}</label>
          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">

            {/* Zone cœur */}
            {(placement === "coeur" || placement === "coeur-dos") && (
              <div>
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                  {t("configurator.zoneHeart")}
                </p>
                <div className="flex min-h-[72px] items-center justify-center rounded-xl border-2 border-dashed border-[var(--hm-primary)]/25 bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreviewUrl}
                    alt={t("configurator.altLogoHeart")}
                    className="max-h-14 max-w-[45%] object-contain"
                  />
                </div>
              </div>
            )}

            {/* Zone dos */}
            {(placement === "dos" || placement === "coeur-dos") && (
              <div>
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                  {t("configurator.zoneBack")}
                </p>
                <div className="flex min-h-[96px] items-center justify-center rounded-xl border-2 border-dashed border-[var(--hm-primary)]/25 bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreviewUrl}
                    alt={t("configurator.altLogoBack")}
                    className="max-h-20 max-w-[62%] object-contain"
                  />
                </div>
              </div>
            )}

          </div>
          <p className="mt-1.5 text-center text-[10px] text-[var(--hm-text-muted)]">
            {t("configurator.previewIndicativeNote")}
          </p>
        </div>
      )}

      {/* ── Slot studio CTA — injecté depuis ProductDetailClient ─ */}
      {studioCTA && <div>{studioCTA}</div>}

      {/* ── Prix récapitulatif ────────────────────────────────── */}
        <div className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-5 shadow-[0_14px_34px_rgba(63,45,88,0.05)]">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--hm-text-soft)]">{t("configurator.unitPriceTTC")}</span>
          <span className="text-base font-semibold text-[var(--hm-text)]">{formatPrice(unitPrice)}</span>
        </div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--hm-text-soft)]">{t("configurator.quantity")}</span>
          <span className="text-sm font-medium text-[var(--hm-text)]">× {quantity}</span>
        </div>
        <div className="divider-gold my-3" />
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-base font-semibold text-[var(--hm-text)]">{t("configurator.totalTTC")}</span>
            <p className="mt-1 text-[11px] text-[var(--hm-text-soft)]">
              {size ? `${t("configurator.sizePrefix")} ${size} · ${technique.toUpperCase()}` : t("configurator.configureToOrder")}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-[var(--hm-primary)]">{formatPrice(totalPrice)}</span>
            <p className="text-[11px] text-[var(--hm-text-soft)]">
              {t("configurator.netPricePrefix")} {formatPrice(totalPrice / 1.2)} {t("configurator.netPriceSuffix")}
            </p>
          </div>
        </div>
        {/* Livraison + Expédition estimée — fusionnés dans la carte récap */}
        <div className="mt-4 rounded-[1rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-3 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--hm-primary)]/25 bg-white">
            <Truck size={16} className="text-[var(--hm-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
              {t("configurator.estimatedShipping")} · {getEstimatedShipDate()}
            </p>
            <p className="text-[11px] leading-snug text-[var(--hm-text-soft)]">
              {freeShipping
                ? t("configurator.freeShippingForConfig")
                : `${t("configurator.freeShippingFromPrefix")} ${PRICING_CONFIG.freeShippingThreshold} ${t("configurator.piecesPlural")} — ${t("configurator.youNeedPrefix")} ${shippingPiecesLeft} ${shippingPiecesLeft > 1 ? t("configurator.piecesPlural") : t("configurator.pieceSingular")}.`}
            </p>
          </div>
          {freeShipping && (
            <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold text-green-700">
              {t("configurator.freeBadge")}
            </span>
          )}
        </div>
      </div>

      {/* ── Checkbox validation création ──────────────────────── */}
      {(hasLogo || studioComposedFront) && (
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--hm-line)] bg-white px-4 py-3 transition hover:border-[var(--hm-primary)]/40">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={creationValidated}
              onChange={(e) => setCreationValidated(e.target.checked)}
              className="sr-only"
            />
            <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition ${
              creationValidated
                ? "border-[var(--hm-primary)] bg-[var(--hm-primary)]"
                : "border-[var(--hm-line)] bg-white"
            }`}>
              {creationValidated && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--hm-text)]">
            {t("configurator.creationValidationLabel")}
          </p>
        </label>
      )}

      {/* ── CTA ───────────────────────────────────────────────── */}
      <button
        onClick={handleAddToCart}
        disabled={!canAdd || isUploading || isUploadingOnSelect || ((hasLogo || !!studioComposedFront) && !creationValidated)}
        className={`btn-primary w-full gap-3 py-4 text-sm
          ${!canAdd || isUploading || isUploadingOnSelect || ((hasLogo || !!studioComposedFront) && !creationValidated) ? "cursor-not-allowed" : ""}`}
      >
        {addedToCart ? (
          <>
            <CheckCircle size={16} />
            {t("configurator.addedToCart")}
          </>
        ) : isUploadingOnSelect ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {t("configurator.sendingLogo")}
          </>
        ) : isUploading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {t("configurator.sendingLogo")}
          </>
        ) : (
          <>
            <ShoppingBag size={16} />
            {!size
              ? t("configurator.selectSize")
              : requirePersonalization && !hasLogo
              ? (isSimpleFlowProduct(product)
                  ? t("configurator.addVisualToOrder")
                  : t("configurator.personalizeFirst"))
              : (product.id.includes("mug")
                  ? t("configurator.addMugToCart")
                  : product.category === "casquettes"
                  ? (product.id.startsWith("bonnet") ? t("configurator.addBeanieToCart") : product.id.startsWith("bob") ? t("configurator.addBucketHatToCart") : t("configurator.addCapToCart"))
                  : product.category === "polos"
                  ? t("configurator.addPoloToCart")
                  : product.category === "sacs"
                  ? t("configurator.addBagToCart")
                  : t("configurator.addToCart"))}
          </>
        )}
      </button>

      {/* Message contextuel selon le flux.
           Goodies (mugs) : upload direct sur la fiche, l'équipe HM Global vérifie
           le visuel et prépare le rendu avant production. Pas d'aperçu live
           trompeur (cf. LightMockupPreview gated dans ProductDetailClient).
           Textile : redirection vers le bouton "🎨 Personnaliser mon article" qui
           ouvre le Studio Fabric.js. */}
      {isSimpleFlowProduct(product) && product.techniques.includes("broderie") ? (
        <p className="text-center text-[10px] text-[var(--hm-text-soft)] leading-snug">
          {t("configurator.embroideryCheckNote")}
        </p>
      ) : isSimpleFlowProduct(product) ? (
        <p className="text-center text-[10px] text-[var(--hm-text-soft)] leading-snug">
          {t("configurator.visualCheckNote")}
        </p>
      ) : requirePersonalization && !hasLogo ? (
        <p className="text-center text-[10px] text-[var(--hm-primary)]">
          {t("configurator.personalizeButtonNotePrefix")} <strong>{t("configurator.personalizeButtonLabel")}</strong> {t("configurator.personalizeButtonNoteSuffix")}
        </p>
      ) : (
        <p className="text-center text-[10px] text-[var(--hm-text-muted)]">
          {t("configurator.noAccountNote")}
        </p>
      )}

      {/* ── Lien secondaire devis volume (discret, sous le CTA principal) ──
           La personnalisation/commande directe est mise en avant ; le devis
           reste disponible en bas pour les gros volumes ou besoins spécifiques.
           Présent sur tous les produits pour une infrastructure cohérente. */}
      {!product.quoteOnly && (
        <a
          href={`/devis-rapide?produit=${encodeURIComponent(product.slug)}`}
          className="block text-center text-[11px] text-[var(--hm-text-soft)] underline-offset-2 transition hover:text-[var(--hm-primary)] hover:underline"
        >
          {t("configurator.volumeQuoteLink")}
        </a>
      )}
    </div>
  );
}
