"use client";

/**
 * BusinessCardConfigurator.tsx
 *
 * Configurateur de cartes de visite — parcours complet :
 *   Étape 1 : Choix des options (orientation, faces, finition, coins, quantité)
 *   Étape 2 : Upload fichier(s) recto / verso
 *   Étape 3 : Visualiseur BAT avec zones
 *   Étape 4 : Validation → ajout au panier → /panier
 *
 * Architecture :
 *   - Aucune dépendance Fabric.js ni MockupViewer.
 *   - Tarification : prix du LOT TTC depuis getBusinessCardLotPrice().
 *     250 cartes mat = 34,90 € → total panier = 34,90 € (pas × 250).
 *   - Upload via POST /api/orders/upload-print-file.
 *   - printConfig stocké dans le panier Zustand, non persisté en localStorage.
 */

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check, AlertCircle, ShoppingCart, Loader2, ChevronRight, Info } from "lucide-react";
import { useCartStore } from "@/store/cart";
import BusinessCardVisualizer from "@/components/print/BusinessCardVisualizer";
import {
  BUSINESS_CARD_OPTIONS,
  BUSINESS_CARD_PRODUCT,
  PRINT_FINISH_LABELS,
  PRINT_FACES_LABELS,
  PRINT_CORNERS_LABELS,
  PRINT_ORIENTATION_LABELS,
  getBusinessCardLotPrice,
  type PrintFinish,
  type PrintFaces,
  type PrintOrientation,
  type PrintCorners,
  type BusinessCardQty,
} from "@/data/print-products";
import type { PrintConfig } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(n);
}

// ─── Types upload ─────────────────────────────────────────────────────────────

interface UploadedFile {
  url:      string;    // URL Supabase Storage publique
  name:     string;
  size:     number;
  type:     string;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function BusinessCardConfigurator() {
  const router   = useRouter();
  const { addItem } = useCartStore();

  // ── Options ────────────────────────────────────────────────────────────────
  const [orientation, setOrientation] = useState<PrintOrientation>("landscape");
  const [faces,       setFaces]       = useState<PrintFaces>("recto");
  const [finish,      setFinish]      = useState<PrintFinish>("mat");
  const [corners,     setCorners]     = useState<PrintCorners>("standard");
  const [quantity,    setQuantity]    = useState<BusinessCardQty>(250);

  // ── Fichiers uploadés ──────────────────────────────────────────────────────
  const [frontFile,   setFrontFile]   = useState<UploadedFile | null>(null);
  const [backFile,    setBackFile]    = useState<UploadedFile | null>(null);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack,  setUploadingBack]  = useState(false);
  const [uploadError,    setUploadError]    = useState<string | null>(null);

  // ── Étape UI ───────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [adding, setAdding] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef  = useRef<HTMLInputElement>(null);

  // ── Prix en temps réel ─────────────────────────────────────────────────────
  const lotPrice = getBusinessCardLotPrice({ finish, quantity, faces, corners });

  // ── Upload fichier ─────────────────────────────────────────────────────────
  const uploadFile = useCallback(async (
    file: File,
    face: "front" | "back",
  ): Promise<UploadedFile | null> => {
    const setUploading = face === "front" ? setUploadingFront : setUploadingBack;
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("face", face);
      formData.append("productType", "business_card");

      const res = await fetch("/api/orders/upload-print-file", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erreur lors de l'upload du fichier.");
      }

      const { url, name, size, type } = await res.json();
      return { url, name, size, type };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur upload.";
      setUploadError(msg);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFrontFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadFile(file, "front");
    if (result) setFrontFile(result);
    e.target.value = "";
  }, [uploadFile]);

  const handleBackFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadFile(file, "back");
    if (result) setBackFile(result);
    e.target.value = "";
  }, [uploadFile]);

  // ── Ajout au panier ────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(() => {
    if (!frontFile) return;
    setAdding(true);

    try {
      const config: PrintConfig = {
        productType:    "business_card",
        supplier:       "gelato",
        format:         "85x55mm",
        orientation,
        faces,
        finish,
        corners,
        quantity,
        lotPriceTTC:    lotPrice,
        frontFileUrl:   frontFile.url,
        backFileUrl:    faces === "recto-verso" ? (backFile?.url ?? null) : null,
        frontPreviewUrl: null,  // pas de preview générée côté client pour les PDFs
        backPreviewUrl:  null,
        batStatus:      "a_verifier",
      };

      // Le produit print utilise des valeurs neutres pour les champs textile.
      // technique="print", placement="coeur" (placeholder interne — jamais affiché
      // pour les commandes print). size="unique", color=neutre.
      addItem({
        product:          BUSINESS_CARD_PRODUCT as unknown as Parameters<typeof addItem>[0]["product"],
        quantity:         1,           // 1 lot — printConfig.quantity = nb d'exemplaires
        size:             "unique",
        color:            { id: "print", label: "—", hex: "#ffffff", available: true },
        technique:        "print",
        placement:        "coeur",     // placeholder interne — non affiché côté admin/client pour print
        overrideUnitPrice: lotPrice,   // prix du lot TTC
        printConfig:      config,
      });

      router.push("/panier");
    } catch {
      setAdding(false);
    }
  }, [addItem, frontFile, backFile, orientation, faces, finish, corners, quantity, lotPrice, router]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl">

      {/* ── Stepper ──────────────────────────────────────────────────────── */}
      <div className="mb-10 flex items-center gap-0">
        {(["Options", "Fichiers", "Aperçu BAT"] as const).map((label, i) => {
          const s = (i + 1) as 1 | 2 | 3;
          const active    = step === s;
          const completed = step > s;
          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                  completed ? "border-[var(--hm-primary)] bg-[var(--hm-primary)] text-white"
                  : active   ? "border-[var(--hm-primary)] text-[var(--hm-primary)]"
                  :            "border-[var(--hm-line)] text-[var(--hm-text-muted)]"
                }`}>
                  {completed ? <Check size={13} /> : s}
                </div>
                <span className={`text-[10px] font-semibold ${active ? "text-[var(--hm-text)]" : "text-[var(--hm-text-muted)]"}`}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div className={`mx-2 flex-1 h-px transition ${step > s ? "bg-[var(--hm-primary)]" : "bg-[var(--hm-line)]"}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">

        {/* ── Colonne gauche — contenu étape ────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* ════════════ ÉTAPE 1 — Options ════════════ */}
          {step === 1 && (
            <>
              {/* Orientation */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                  Orientation
                </p>
                <div className="flex flex-wrap gap-3">
                  {BUSINESS_CARD_OPTIONS.orientations.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setOrientation(o.value)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                        orientation === o.value
                          ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)] font-semibold"
                          : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
                      }`}
                    >
                      {/* Mini carte illustrant l'orientation */}
                      <span
                        className={`shrink-0 rounded border-2 border-current opacity-60 ${
                          o.value === "landscape" ? "h-5 w-8" : "h-8 w-5"
                        }`}
                      />
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Faces */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                  Faces
                </p>
                <div className="flex flex-wrap gap-3">
                  {BUSINESS_CARD_OPTIONS.faces.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFaces(f.value)}
                      className={`flex flex-col rounded-xl border px-4 py-3 text-sm transition ${
                        faces === f.value
                          ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)] font-semibold"
                          : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
                      }`}
                    >
                      {f.label}
                      {f.surcharge > 0 && (
                        <span className="mt-0.5 text-[10px] opacity-70">+{f.surcharge} €</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Finition */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                  Finition papier
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {BUSINESS_CARD_OPTIONS.finishes.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFinish(f.value)}
                      className={`flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition ${
                        finish === f.value
                          ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)]"
                          : "border-[var(--hm-line)] hover:border-[var(--hm-primary)]/40"
                      }`}
                    >
                      <span className={`text-sm font-semibold ${finish === f.value ? "text-[var(--hm-primary)]" : "text-[var(--hm-text)]"}`}>
                        {f.label}
                      </span>
                      <span className="text-[11px] text-[var(--hm-text-soft)]">{f.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Coins */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                  Coins
                </p>
                <div className="flex flex-wrap gap-3">
                  {BUSINESS_CARD_OPTIONS.corners.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCorners(c.value)}
                      className={`flex flex-col rounded-xl border px-4 py-3 text-sm transition ${
                        corners === c.value
                          ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)] font-semibold"
                          : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
                      }`}
                    >
                      {c.label}
                      {c.surcharge > 0 && (
                        <span className="mt-0.5 text-[10px] opacity-70">+{c.surcharge} €</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantité */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                  Quantité
                </p>
                <div className="flex flex-wrap gap-3">
                  {BUSINESS_CARD_OPTIONS.quantities.map((q) => (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => setQuantity(q.value)}
                      className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                        quantity === q.value
                          ? "border-[var(--hm-primary)] bg-[var(--hm-primary)] text-white"
                          : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary w-full gap-2"
              >
                Continuer — Déposer mes fichiers
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* ════════════ ÉTAPE 2 — Upload fichiers ════════════ */}
          {step === 2 && (
            <>
              <div className="rounded-2xl border border-[var(--hm-accent-soft-blue)] bg-blue-50 p-4">
                <div className="flex gap-2 text-xs text-blue-700">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Fichiers acceptés : PDF, PNG, JPG</p>
                    <p className="mt-0.5 text-blue-600">
                      Pour une qualité d&apos;impression optimale, fournissez un PDF vectoriel ou un PNG minimum 300 dpi.
                      Prévoir 3 mm de fond perdu de chaque côté (format final : 85×55 mm → fichier : 91×61 mm).
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload recto */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                  Fichier recto <span className="text-[var(--hm-rose)]">*</span>
                </p>
                {frontFile ? (
                  <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <Check size={14} className="shrink-0 text-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-green-700">{frontFile.name}</p>
                      <p className="text-[10px] text-green-600">{Math.round(frontFile.size / 1024)} Ko</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFrontFile(null)}
                      className="text-[10px] font-semibold text-green-600 hover:text-red-500 transition"
                    >
                      Changer
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => frontInputRef.current?.click()}
                    disabled={uploadingFront}
                    className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[var(--hm-line)] bg-[var(--hm-surface)] px-6 py-8 text-center transition hover:border-[var(--hm-primary)] hover:bg-[var(--hm-accent-soft-rose)] disabled:opacity-50"
                  >
                    {uploadingFront ? (
                      <Loader2 size={24} className="animate-spin text-[var(--hm-primary)]" />
                    ) : (
                      <Upload size={24} className="text-[var(--hm-primary)]" />
                    )}
                    <p className="text-sm font-semibold text-[var(--hm-text)]">
                      {uploadingFront ? "Upload en cours…" : "Déposer le fichier recto"}
                    </p>
                    <p className="text-[11px] text-[var(--hm-text-soft)]">PDF, PNG, JPG — max 20 Mo</p>
                  </button>
                )}
                <input
                  ref={frontInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleFrontFile}
                />
              </div>

              {/* Upload verso — uniquement si recto-verso */}
              {faces === "recto-verso" && (
                <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                    Fichier verso <span className="text-[var(--hm-rose)]">*</span>
                  </p>
                  {backFile ? (
                    <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                      <Check size={14} className="shrink-0 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-green-700">{backFile.name}</p>
                        <p className="text-[10px] text-green-600">{Math.round(backFile.size / 1024)} Ko</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBackFile(null)}
                        className="text-[10px] font-semibold text-green-600 hover:text-red-500 transition"
                      >
                        Changer
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => backInputRef.current?.click()}
                      disabled={uploadingBack}
                      className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[var(--hm-line)] bg-[var(--hm-surface)] px-6 py-8 text-center transition hover:border-[var(--hm-primary)] hover:bg-[var(--hm-accent-soft-rose)] disabled:opacity-50"
                    >
                      {uploadingBack ? (
                        <Loader2 size={24} className="animate-spin text-[var(--hm-primary)]" />
                      ) : (
                        <Upload size={24} className="text-[var(--hm-primary)]" />
                      )}
                      <p className="text-sm font-semibold text-[var(--hm-text)]">
                        {uploadingBack ? "Upload en cours…" : "Déposer le fichier verso"}
                      </p>
                      <p className="text-[11px] text-[var(--hm-text-soft)]">PDF, PNG, JPG — max 20 Mo</p>
                    </button>
                  )}
                  <input
                    ref={backInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleBackFile}
                  />
                </div>
              )}

              {/* Erreur upload */}
              {uploadError && (
                <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  {uploadError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-outline flex-1"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!frontFile || (faces === "recto-verso" && !backFile)}
                  className="btn-primary flex-1 gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Voir l&apos;aperçu BAT
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}

          {/* ════════════ ÉTAPE 3 — Aperçu BAT ════════════ */}
          {step === 3 && (
            <>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-2 text-xs text-amber-700">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Vérifiez votre fichier avant validation</p>
                    <p className="mt-0.5 text-amber-600">
                      Assurez-vous que le contenu est bien dans la zone de sécurité (tirets verts).
                      HM Global vérifiera vos fichiers avant de lancer l&apos;impression.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-8">
                <BusinessCardVisualizer
                  orientation={orientation}
                  frontFileUrl={frontFile?.url ?? null}
                  backFileUrl={backFile?.url ?? null}
                  showToggle={faces === "recto-verso"}
                  displayWidth={300}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-outline flex-1"
                >
                  Modifier les fichiers
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="btn-primary flex-1 gap-2 disabled:opacity-60"
                >
                  {adding ? (
                    <><Loader2 size={15} className="animate-spin" /> Ajout en cours…</>
                  ) : (
                    <><ShoppingCart size={15} /> Valider le BAT et ajouter au panier</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Colonne droite — récapitulatif ────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="sticky top-24 flex flex-col gap-4">

            {/* Config résumé */}
            <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                Récapitulatif
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <Row label="Format"       value="85×55 mm" />
                <Row label="Orientation"  value={PRINT_ORIENTATION_LABELS[orientation]} />
                <Row label="Faces"        value={PRINT_FACES_LABELS[faces]} />
                <Row label="Finition"     value={PRINT_FINISH_LABELS[finish]} />
                <Row label="Coins"        value={PRINT_CORNERS_LABELS[corners]} />
                <Row label="Quantité"     value={`${quantity} exemplaires`} />
                <Row label="Fournisseur"  value="Partenaire impression HM" />
                <Row label="Délai"        value="Confirmé après validation du BAT" />
              </div>
            </div>

            {/* Prix */}
            <div className="rounded-2xl border border-[var(--hm-primary)]/20 bg-[var(--hm-accent-soft-rose)] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-muted)]">
                Prix du lot TTC
              </p>
              <p className="mt-1 text-3xl font-black tracking-tight text-[var(--hm-primary)]">
                {formatPrice(lotPrice)}
              </p>
              <p className="mt-1 text-[11px] text-[var(--hm-text-soft)]">
                Production après validation · BAT vérifié avant impression
              </p>
              <p className="mt-2 text-[10px] font-semibold text-[var(--hm-text-muted)]">
                soit {(lotPrice / quantity).toFixed(3).replace(".", ",")} € / carte
              </p>
            </div>

            {/* Reassurance */}
            <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-4">
              <div className="flex flex-col gap-2">
                {[
                  "✅ BAT vérifié par HM Global",
                  "📦 Livraison France incluse",
                  "🎨 PDF vectoriel recommandé",
                  "⚡ Impression via Gelato",
                ].map((item) => (
                  <p key={item} className="text-[11px] text-[var(--hm-text-soft)]">{item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Row helper ───────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[var(--hm-text-soft)]">{label}</span>
      <span className="font-semibold text-[var(--hm-text)]">{value}</span>
    </div>
  );
}
