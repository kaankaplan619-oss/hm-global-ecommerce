"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, Minus, Plus, ShoppingBag, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { computeUnitPrice, formatPrice, PRICING_CONFIG } from "@/data/pricing";
import { TECHNIQUES, PLACEMENTS } from "@/data/techniques";
import { validateLogoFile, formatFileSize, ALLOWED_FILE_EXTENSIONS } from "@/lib/utils";
import { uploadLogoToSupabase, getUploadErrorMessage, type LogoUploadResult } from "@/lib/uploadLogo";
import { useAuthStore } from "@/store/auth";
import { colorHasImages, colorHasSpecificImage } from "@/components/product/ProductGallery";
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
  /**
   * Quand true (produits Printful), le bouton "Ajouter au panier" est désactivé
   * tant qu'aucun logo n'est fourni (studioLogoPreset absent).
   * Force le passage par "Personnaliser mon article" → studio.
   */
  requirePersonalization?: boolean;
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
}: Props) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Config state — états internes (utilisés quand le parent ne passe pas de valeur contrôlée)
  const [internalTechnique, setInternalTechnique] = useState<Technique>(product.techniques[0]);
  const [internalPlacement, setInternalPlacement] = useState<Placement>(product.placements[0]);
  const [internalSize,      setInternalSize]      = useState<string>("");
  const [internalColor,     setInternalColor]      = useState<ProductColor | null>(
    product.colors.find((c) => c.available) ?? null
  );
  const [internalQuantity,  setInternalQuantity]  = useState(1);

  // Valeurs effectives : prop contrôlée prioritaire, état interne en fallback
  const technique = controlledTechnique ?? internalTechnique;
  const placement = controlledPlacement ?? internalPlacement;
  const size      = controlledSize      ?? internalSize;
  const quantity  = controlledQuantity  ?? internalQuantity;
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [addedToCart, setAddedToCart] = useState(false);
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
  const basePrice = product.pricing[technique] as number;
  const unitPrice = computeUnitPrice({ basePrice, technique, placement });
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
  const freeShipping = quantity >= PRICING_CONFIG.freeShippingThreshold;

  const availableTechniques = TECHNIQUES.filter((t) => product.techniques.includes(t.id));
  const availablePlacements = PLACEMENTS.filter((p) => product.placements.includes(p.id));

  // Placement change — met à jour l'état interne ET notifie le parent
  const handlePlacementChange = useCallback((p: Placement) => {
    setInternalPlacement(p);
    onPlacementChange?.(p);
  }, [onPlacementChange]);

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

    // Flux invité : si non connecté selon le store HM, rester en local uniquement —
    // preview mockup + BAT via blob URL, upload différé au checkout.
    if (!isAuthenticated) {
      setUploadNotice("Logo chargé pour la prévisualisation. Il sera enregistré au moment de la commande.");
      return;
    }

    // Marquer la génération courante pour ignorer les résultats périmés
    const generation = ++uploadGenerationRef.current;

    // Tenter l'upload immédiatement (utilisateur authentifié uniquement)
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
    } else if (error === "NOT_AUTHENTICATED") {
      // Message informatif non-bloquant — le logo sera demandé à l'envoi de la commande
      setUploadNotice(getUploadErrorMessage(error));
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
      } else if (!isAuthenticated) {
        // Flux invité : pas d'upload — le logo sera finalisé à la demande de devis
        logoCartFile = { name: logoFile.name, size: logoFile.size, type: logoFile.type };
      } else {
        // Authentifié mais upload initial raté — on retente une fois avant d'ajouter au panier
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
          Couleur
          {color && (
            <span className="ml-2 font-medium normal-case text-[var(--hm-text)]">{color.label}</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((c) => {
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
                title={unavailable ? `${c.label} — rupture de stock` : c.label}
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
        {color && !colorHasImages(product.images, color, colorImages) && (
          <p className="mt-1.5 text-[11px] text-[var(--hm-text-muted)]">
            Visuel non disponible pour cette couleur — vous pouvez tout de même la commander.
          </p>
        )}
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
                    ? {
                        backgroundColor: "var(--hm-primary)",
                        borderColor: "var(--hm-primary)",
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
                onClick={() => { const nq = Math.max(1, quantity - 1); setInternalQuantity(nq); onQuantityChange?.(nq); }}
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
      {/* Masqué quand hideLogoUpload=true → l'upload se fait dans le studio */}
      {!hideLogoUpload && <div>
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
              Formats : {ALLOWED_FILE_EXTENSIONS.join(", ")} — Max 10 Mo
            </p>
            <p className="mt-2 text-[11px] text-[var(--hm-text-muted)]">
              Vous pouvez envoyer un logo, un visuel à imprimer ou un fichier déjà préparé.
              Les formats SVG et PDF restent les plus confortables pour la production.
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
                  ? "Envoi en cours…"
                  : logoUploadResult
                  ? `${formatFileSize(logoFile.size)} · Enregistré ✓`
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
          Si votre fichier n&apos;est pas finalisé, nous le vérifierons avec vous avant production.
        </p>
      </div>}

      {/* ── Aperçu marquage par zones ─────────────────────────── */}
      {!hideLogoUpload && !hidePreview && logoPreviewUrl && (
        <div>
          <label className="label">Aperçu du marquage</label>
          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">

            {/* Zone cœur */}
            {(placement === "coeur" || placement === "coeur-dos") && (
              <div>
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                  Zone cœur — poitrine gauche
                </p>
                <div className="flex min-h-[72px] items-center justify-center rounded-xl border-2 border-dashed border-[var(--hm-primary)]/25 bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreviewUrl}
                    alt="Votre logo — zone cœur"
                    className="max-h-14 max-w-[45%] object-contain"
                  />
                </div>
              </div>
            )}

            {/* Zone dos */}
            {(placement === "dos" || placement === "coeur-dos") && (
              <div>
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                  Zone dos — plein dos
                </p>
                <div className="flex min-h-[96px] items-center justify-center rounded-xl border-2 border-dashed border-[var(--hm-primary)]/25 bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreviewUrl}
                    alt="Votre logo — zone dos"
                    className="max-h-20 max-w-[62%] object-contain"
                  />
                </div>
              </div>
            )}

          </div>
          <p className="mt-1.5 text-center text-[10px] text-[var(--hm-text-muted)]">
            Aperçu indicatif · taille et rendu finaux validés avec vous avant lancement.
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
        disabled={!canAdd || isUploading || isUploadingOnSelect}
        className={`btn-primary w-full gap-3 py-4 text-sm
          ${!canAdd || isUploading || isUploadingOnSelect ? "cursor-not-allowed" : ""}`}
      >
        {addedToCart ? (
          <>
            <CheckCircle size={16} />
            Ajouté au panier !
          </>
        ) : isUploadingOnSelect ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Envoi du logo…
          </>
        ) : isUploading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Envoi du logo…
          </>
        ) : (
          <>
            <ShoppingBag size={16} />
            {!size
              ? "Sélectionnez une taille"
              : requirePersonalization && !hasLogo
              ? "Personnalisez d'abord votre article"
              : "Ajouter au panier"}
          </>
        )}
      </button>

      {/* Message contextuel selon le flux */}
      {requirePersonalization && !hasLogo ? (
        <p className="text-center text-[10px] text-[var(--hm-primary)]">
          Utilisez le bouton <strong>🎨 Personnaliser mon article</strong> pour ajouter votre logo.
        </p>
      ) : (
        <p className="text-center text-[10px] text-[var(--hm-text-muted)]">
          Vous pouvez configurer et ajouter au panier librement. La connexion sera demandée au moment du checkout.
        </p>
      )}
    </div>
  );
}
