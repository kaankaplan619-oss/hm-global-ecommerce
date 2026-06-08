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

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check, AlertCircle, ShoppingCart, Loader2, ChevronRight, Info, Sparkles } from "lucide-react";

// Swatch visuel par finition (rend la différence mat / brillant / premium
// visible, au lieu d'un simple libellé texte). Mat = surface douce diffuse,
// Brillant = reflets lustrés, Premium = satiné velours profond.
const FINISH_SWATCH: Record<string, string> = {
  mat:      "linear-gradient(135deg,#ececf1 0%,#dadae1 100%)",
  brillant: "linear-gradient(115deg,#d2d2da 0%,#ffffff 26%,#c4c4ce 50%,#ffffff 74%,#d2d2da 100%)",
  premium:  "linear-gradient(135deg,#2d2340 0%,#4a3b63 55%,#6b577f 100%)",
};
import { useCartStore } from "@/store/cart";
import BusinessCardVisualizer from "@/components/print/BusinessCardVisualizer";
import PrintEditor from "@/components/print/PrintEditor";
import SignaturePad from "@/components/print/SignaturePad";
import Card3DViewer from "@/components/print/Card3DViewer";
import { renderPdfPageToPng, isPdfUrl } from "@/lib/pdf-preview";
import PrintMockupViewer from "@/components/print/PrintMockupViewer";
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

// Convertit un data URL (PNG export éditeur / aperçu PDF) en File uploadable.
function dataUrlToFile(dataUrl: string, name: string): File {
  const [meta, b64] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(meta)?.[1] ?? "image/png";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], name, { type: mime });
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

  // V1.2 (2026-05-27) — Toggle pour basculer entre l'aperçu technique
  // (BusinessCardVisualizer flat avec safe zones) et l'aperçu en situation
  // (1 scène mockup réaliste avec overlay carte blanche pour masquer le
  // démo Pastel). Par défaut : aperçu technique (style Pixartprinting B2B).
  const [showInSituation, setShowInSituation] = useState(false);

  // ── Fichiers uploadés ──────────────────────────────────────────────────────
  const [frontFile,   setFrontFile]   = useState<UploadedFile | null>(null);
  const [backFile,    setBackFile]    = useState<UploadedFile | null>(null);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack,  setUploadingBack]  = useState(false);
  const [uploadError,    setUploadError]    = useState<string | null>(null);

  // Aperçu PNG affichable de la carte (recto/verso) — sert d'image dans le
  // panier, la commande et l'admin (un PDF ne s'affiche pas dans un <img>).
  // Image/PNG → l'URL elle-même ; PDF → rendu d'une page uploadé en PNG.
  const [frontPreviewUrl, setFrontPreviewUrl] = useState<string | null>(null);
  const [backPreviewUrl,  setBackPreviewUrl]  = useState<string | null>(null);

  // Nombre de pages du PDF recto → si ≥ 2, le verso = page 2 automatiquement
  // (un seul PDF recto-verso, le client n'a pas à uploader 2 fichiers).
  const [frontPdfPages, setFrontPdfPages] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    const url = frontFile?.url;
    if (!url || !/\.pdf($|\?)/i.test(url)) { setFrontPdfPages(null); return; }
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjs.getDocument({ url }).promise;
        if (!cancelled) setFrontPdfPages(doc.numPages);
      } catch { if (!cancelled) setFrontPdfPages(null); }
    })();
    return () => { cancelled = true; };
  }, [frontFile?.url]);

  // Verso fourni : fichier verso dédié OU page 2 d'un PDF recto-verso.
  const versoProvided = !!backFile || (frontPdfPages ?? 0) >= 2;

  // Un PDF de 2 pages = recto + verso → on passe automatiquement la commande
  // en recto-verso (affichage du verso dans l'aperçu BAT + tarif correct).
  useEffect(() => {
    if ((frontPdfPages ?? 0) >= 2) setFaces("recto-verso");
  }, [frontPdfPages]);
  // Par défaut : un SEUL fichier (PDF recto-verso). Le client peut, s'il le
  // veut, déposer un verso séparé (recto + verso en 2 images distinctes).
  const [separateVerso, setSeparateVerso] = useState(false);
  // Nom du projet (façon "Item name" Pixartprinting) — utile en admin.
  const [projectName, setProjectName] = useState("");

  // Atelier d'édition en ligne (Phase 1). Handler défini après uploadFile.
  const [editorOpen, setEditorOpen] = useState(false);
  // Aperçu 3D de l'étape BAT (fichiers uploadés).
  const [view3DOpen, setView3DOpen] = useState(false);

  // Signature du Bon à Tirer (BAT) — approbation du visuel avant production.
  const [batName, setBatName] = useState("");
  const [batApproved, setBatApproved] = useState(false);
  // Signature manuscrite tracée (uploadée → URL https persistée dans la commande).
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

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
      // V1.2 (2026-05-27) — Récupère le session ID navigateur stable, utilisé
      // comme fallback path si l'utilisateur n'est pas connecté (upload invité).
      // Permet au client de configurer + uploader son fichier sans inscription
      // préalable (comme sur Pixartprinting / Vistaprint). La connexion sera
      // demandée à l'étape paiement Stripe.
      let sessionId = "ssr";
      if (typeof window !== "undefined") {
        sessionId = sessionStorage.getItem("hm_session_id")
          ?? (() => {
            const id = crypto.randomUUID();
            sessionStorage.setItem("hm_session_id", id);
            return id;
          })();
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("face", face);
      formData.append("productType", "business_card");
      formData.append("sessionId", sessionId);

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

  // ── Aperçu PNG affichable (panier / commande / admin) ───────────────────────
  // Upload un PNG (data URL) comme aperçu et renvoie l'URL https Supabase.
  const uploadPreviewPng = useCallback(async (
    dataUrl: string, name: string, face: "front" | "back",
  ): Promise<string | null> => {
    const up = await uploadFile(dataUrlToFile(dataUrl, name), face);
    return up?.url ?? null;
  }, [uploadFile]);

  // Signature manuscrite : on upload le PNG dès qu'elle est tracée (→ URL https).
  const handleSignatureChange = useCallback(async (dataUrl: string | null) => {
    if (!dataUrl) { setSignatureUrl(null); return; }
    const url = await uploadPreviewPng(dataUrl, "signature-bat.png", "front");
    setSignatureUrl(url);
  }, [uploadPreviewPng]);

  // Dérive une URL d'aperçu affichable depuis un fichier :
  //   - image (PNG/JPG)  → l'URL elle-même (déjà affichable dans un <img>)
  //   - PDF              → rendu d'une page → PNG → upload → URL https
  const derivePreviewUrl = useCallback(async (
    file: UploadedFile, face: "front" | "back", pdfPage = 1,
  ): Promise<string | null> => {
    if (!isPdfUrl(file.url)) return file.url;
    const png = await renderPdfPageToPng(file.url, pdfPage, 600);
    if (!png) return null;
    return uploadPreviewPng(png, `apercu-${face}.png`, face);
  }, [uploadPreviewPng]);

  // Régénère les aperçus dès que le fichier recto/verso ou les faces changent.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!frontFile) { setFrontPreviewUrl(null); setBackPreviewUrl(null); return; }
      const fp = await derivePreviewUrl(frontFile, "front", 1);
      if (cancelled) return;
      setFrontPreviewUrl(fp);

      if (faces !== "recto-verso") { setBackPreviewUrl(null); return; }
      if (backFile) {
        const bp = await derivePreviewUrl(backFile, "back", 1);
        if (!cancelled) setBackPreviewUrl(bp);
      } else if (isPdfUrl(frontFile.url) && (frontPdfPages ?? 0) >= 2) {
        // PDF recto-verso unique → verso = page 2.
        const png = await renderPdfPageToPng(frontFile.url, 2, 600);
        const url = png ? await uploadPreviewPng(png, "apercu-verso.png", "back") : null;
        if (!cancelled) setBackPreviewUrl(url);
      } else if (!cancelled) {
        setBackPreviewUrl(null);
      }
    })();
    return () => { cancelled = true; };
  }, [frontFile, backFile, faces, frontPdfPages, derivePreviewUrl, uploadPreviewPng]);

  // ── Atelier d'édition en ligne — validation du rendu (Phase 1) ──────────────
  // Upload les PNG exportés par l'éditeur (recto/verso), puis passe au récap (3).
  // Les aperçus sont régénérés par l'effet ci-dessus (PNG = affichables direct).
  const handleEditorValidate = useCallback(async (recto: string, verso: string | null) => {
    setEditorOpen(false);
    const rf = await uploadFile(dataUrlToFile(recto, "carte-recto.png"), "front");
    if (rf) setFrontFile(rf);
    if (verso) {
      const bf = await uploadFile(dataUrlToFile(verso, "carte-verso.png"), "back");
      if (bf) setBackFile(bf);
      // L'éditeur a produit un verso (ex. PDF 2 pages) → passe en recto-verso.
      setFaces("recto-verso");
    }
    setStep(3);
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
        projectName:    projectName.trim() || undefined,
        lotPriceTTC:    lotPrice,
        frontFileUrl:   frontFile.url,
        backFileUrl:    faces === "recto-verso" ? (backFile?.url ?? null) : null,
        // Aperçu affichable : généré par l'effet (PNG éditeur / image directe /
        // rendu PDF). Fallback : si image directe pas encore reflétée dans l'état.
        frontPreviewUrl: frontPreviewUrl ?? (!isPdfUrl(frontFile.url) ? frontFile.url : null),
        backPreviewUrl:  faces === "recto-verso"
          ? (backPreviewUrl ?? (backFile && !isPdfUrl(backFile.url) ? backFile.url : null))
          : null,
        // BAT signé par le client → vaut bon à tirer (renonciation rétractation).
        batStatus:      "valide",
        batSignature:   { name: batName.trim(), date: new Date().toISOString(), signatureUrl: signatureUrl ?? undefined },
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
  }, [addItem, frontFile, backFile, frontPreviewUrl, backPreviewUrl, orientation, faces, finish, corners, quantity, projectName, batName, signatureUrl, lotPrice, router]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl">

      {/* ── Aperçu mobile en HAUT (sticky) — le client voit la carte + son
         visuel se mettre à jour en direct, sans scroller. Desktop = colonne
         droite. ── */}
      <div className="sticky top-[4.5rem] z-20 -mx-1 mb-6 lg:hidden">
        <div className="rounded-2xl border border-[var(--hm-line)] bg-white/95 p-3 backdrop-blur">
          <div className="flex items-center justify-center rounded-xl bg-[var(--hm-surface)] p-3">
            <BusinessCardVisualizer
              orientation={orientation}
              rounded={corners === "rounded"}
              finish={finish}
              frontFileUrl={frontFile?.url ?? null}
              backFileUrl={faces === "recto-verso" ? (backFile?.url ?? null) : null}
              showToggle={versoProvided}
              hasBack={versoProvided}
              displayWidth={248}
            />
          </div>
        </div>
      </div>

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

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

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
                      className={`flex flex-col gap-1 rounded-xl border p-2.5 text-left transition ${
                        finish === f.value
                          ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)]"
                          : "border-[var(--hm-line)] hover:border-[var(--hm-primary)]/40"
                      }`}
                    >
                      <span
                        aria-hidden
                        className="mb-1.5 h-11 w-full rounded-lg border border-black/5 shadow-inner"
                        style={{ background: FINISH_SWATCH[f.value] }}
                      />
                      <span className={`px-1 text-sm font-semibold ${finish === f.value ? "text-[var(--hm-primary)]" : "text-[var(--hm-text)]"}`}>
                        {f.label}
                      </span>
                      <span className="px-1 pb-1 text-[11px] leading-snug text-[var(--hm-text-soft)]">{f.description}</span>
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
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {BUSINESS_CARD_OPTIONS.quantities.map((q) => {
                    const p = getBusinessCardLotPrice({ finish, quantity: q.value, faces, corners });
                    const active = quantity === q.value;
                    return (
                      <button
                        key={q.value}
                        type="button"
                        onClick={() => setQuantity(q.value)}
                        className={`flex flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition ${
                          active
                            ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)]"
                            : "border-[var(--hm-line)] bg-white hover:border-[var(--hm-primary)]/40"
                        }`}
                      >
                        <span className={`text-sm font-bold ${active ? "text-[var(--hm-primary)]" : "text-[var(--hm-text)]"}`}>
                          {q.value.toLocaleString("fr-FR")} ex.
                        </span>
                        <span className={`text-[13px] font-semibold ${active ? "text-[var(--hm-primary)]" : "text-[var(--hm-text-soft)]"}`}>
                          {p.toFixed(2)} €
                        </span>
                        <span className="text-[10px] text-[var(--hm-text-muted)]">
                          soit {(p / q.value).toFixed(3).replace(".", ",")} €/carte
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nom du projet (façon "Item name" Pixartprinting) */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                  Nom du projet <span className="font-medium normal-case text-[var(--hm-text-muted)]">(optionnel)</span>
                </p>
                <p className="mb-3 text-[11px] text-[var(--hm-text-muted)]">Pour vous y retrouver dans vos commandes.</p>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  maxLength={80}
                  placeholder="Ex. Cartes équipe commerciale"
                  className="w-full rounded-xl border border-[var(--hm-line)] bg-white px-4 py-3 text-sm text-[var(--hm-text)] outline-none transition focus:border-[var(--hm-primary)]"
                />
              </div>

              <button
                type="button"
                onClick={() => { setStep(2); setEditorOpen(true); }}
                className="btn-primary w-full gap-2"
              >
                Continuer vers l&apos;atelier
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* ════════════ ÉTAPE 2 — Upload fichiers ════════════ */}
          {step === 2 && (
            <>
              {/* L'atelier s'ouvre automatiquement à l'arrivée sur cette étape.
                 Ce bouton permet de le ré-ouvrir si le client l'a fermé. */}
              <button
                type="button"
                onClick={() => setEditorOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--hm-primary)] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                <Sparkles size={16} /> Ouvrir l&apos;atelier de création
              </button>

              {/* Séparateur */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--hm-line)]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-muted)]">ou j&apos;ai déjà mon fichier prêt</span>
                <div className="h-px flex-1 bg-[var(--hm-line)]" />
              </div>

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
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                  Votre fichier d&apos;impression <span className="text-[var(--hm-rose)]">*</span>
                </p>
                <p className="mb-3 text-[11px] leading-snug text-[var(--hm-text-muted)]">
                  {faces === "recto-verso"
                    ? "Recto-verso : un seul PDF de 2 pages suffit (page 1 = recto, page 2 = verso)."
                    : "PDF, PNG ou JPG haute résolution."}
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
                    Fichier verso {versoProvided
                      ? <span className="text-[10px] font-medium normal-case text-green-600">✓ inclus</span>
                      : <span className="text-[var(--hm-rose)]">*</span>}
                  </p>
                  {backFile ? (
                    <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                      <Check size={14} className="shrink-0 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-green-700">{backFile.name}</p>
                        <p className="text-[10px] text-green-600">{Math.round(backFile.size / 1024)} Ko</p>
                      </div>
                      <button type="button" onClick={() => { setBackFile(null); setSeparateVerso(false); }} className="text-[10px] font-semibold text-green-600 hover:text-red-500 transition">Retirer</button>
                    </div>
                  ) : (frontPdfPages ?? 0) >= 2 ? (
                    <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                      <Check size={14} className="shrink-0 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-green-700">Verso = page 2 de votre PDF ✓</p>
                        <p className="text-[10px] text-green-600">Votre PDF contient recto + verso — rien d&apos;autre à faire.</p>
                      </div>
                    </div>
                  ) : separateVerso ? (
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
                        {uploadingBack ? "Upload en cours…" : "Déposer le verso (fichier séparé)"}
                      </p>
                      <p className="text-[11px] text-[var(--hm-text-soft)]">PDF, PNG, JPG — max 20 Mo</p>
                    </button>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-4 text-center">
                      <p className="text-[12px] leading-snug text-[var(--hm-text-soft)]">
                        Déposez un <strong>PDF de 2 pages</strong> ci-dessus — la page 2 servira de verso.
                      </p>
                      <button type="button" onClick={() => setSeparateVerso(true)} className="mt-1.5 text-[11px] font-semibold text-[var(--hm-primary)] hover:underline">
                        Mes recto / verso sont en 2 fichiers séparés →
                      </button>
                    </div>
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
                  disabled={!frontFile || (faces === "recto-verso" && !versoProvided)}
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

              {/* V1.2 (2026-05-27) — Refonte step 3 style Pixartprinting :
                 BLOC PRINCIPAL = BusinessCardVisualizer flat avec safe zones,
                 fond perdu, zone de sécurité — c'est ce qui sert au client à
                 valider techniquement son BAT (focus produit pur).
                 BLOC SECONDAIRE (optionnel via toggle) = 1 scène lifestyle
                 réaliste avec overlay carte blanche pour masquer le démo
                 "Pastel" du mockup Mockups Design. Sert juste à rassurer
                 visuellement, n'apparaît pas par défaut. */}

              {/* BLOC PRINCIPAL — Aperçu technique BAT */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                      Aperçu BAT — Vérification technique
                    </p>
                    <p className="mt-1 text-[10px] text-[var(--hm-text-muted)]">
                      Zone verte = sécurité (texte/logo). Zone rouge = fond perdu (couper).
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setView3DOpen(true)}
                      disabled={!frontPreviewUrl}
                      className="rounded-xl border border-[var(--hm-line)] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)] disabled:opacity-40"
                    >
                      Aperçu 3D
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInSituation((v) => !v)}
                      className="rounded-xl border border-[var(--hm-line)] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
                    >
                      {showInSituation ? "Vue technique" : "Voir en situation"}
                    </button>
                  </div>
                </div>
                <div className="flex justify-center bg-[var(--hm-surface)] rounded-xl p-6">
                  <BusinessCardVisualizer
                    orientation={orientation}
              rounded={corners === "rounded"}
              finish={finish}
                    frontFileUrl={frontFile?.url ?? null}
                    backFileUrl={backFile?.url ?? null}
                    showToggle={versoProvided}
                    hasBack={versoProvided}
                    displayWidth={340}
                  />
                </div>
              </div>

              {/* BLOC SECONDAIRE — Aperçu en situation (optionnel via toggle).
                 Affiche 1 scène mockup (pile sur table) avec OVERLAY CARTE
                 BLANCHE pour masquer le Pastel. Le design client se plaque
                 par-dessus la carte blanche → aucun design tiers visible. */}
              {showInSituation && (
                <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                      Aperçu en situation
                    </p>
                    <span className="text-[10px] text-[var(--hm-text-muted)]">
                      Cliquez les miniatures pour changer d&apos;angle
                    </span>
                  </div>
                  <PrintMockupViewer
                    family="business-cards"
                    frontDesignUrl={frontFile?.url ?? null}
                    backDesignUrl={faces === "recto-verso" ? (backFile?.url ?? null) : null}
                    whiteCardOverlay
                    alt="Aperçu carte de visite en situation"
                  />
                </div>
              )}

              {/* Signature du Bon à Tirer (BAT) */}
              <div className="rounded-2xl border border-[var(--hm-primary)]/25 bg-[var(--hm-accent-soft-rose)] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--hm-primary)]">
                  Bon à tirer — Signature
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--hm-text-soft)]">
                  En signant, vous approuvez ce visuel pour l&apos;impression. S&apos;agissant d&apos;un
                  produit personnalisé, cette approbation vaut renonciation à votre droit de
                  rétractation (art. L221-28 du Code de la consommation).
                </p>
                <input
                  type="text"
                  value={batName}
                  onChange={(e) => setBatName(e.target.value)}
                  placeholder="Votre nom et prénom"
                  className="mt-3 w-full rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--hm-primary)]"
                />
                {/* Signature manuscrite (souris ou doigt) */}
                <div className="mt-3">
                  <p className="mb-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)]">
                    Votre signature {signatureUrl
                      ? <span className="font-medium text-green-600">✓ signée</span>
                      : <span className="text-[var(--hm-text-muted)]">(souris ou doigt)</span>}
                  </p>
                  <SignaturePad onChange={handleSignatureChange} />
                </div>
                <label className="mt-3 flex cursor-pointer items-start gap-2 text-[12px] text-[var(--hm-text)]">
                  <input
                    type="checkbox"
                    checked={batApproved}
                    onChange={(e) => setBatApproved(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--hm-primary)]"
                  />
                  <span>
                    J&apos;ai vérifié l&apos;orthographe, les couleurs et la mise en page. J&apos;approuve
                    ce bon à tirer et autorise sa mise en production.
                  </span>
                </label>
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
                  disabled={adding || !batApproved || batName.trim().length < 2}
                  className="btn-primary flex-1 gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {adding ? (
                    <><Loader2 size={15} className="animate-spin" /> Ajout en cours…</>
                  ) : (
                    <><ShoppingCart size={15} /> Signer le BAT et ajouter au panier</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Colonne droite — récapitulatif ────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="sticky top-24 flex flex-col gap-4">

            {/* Aperçu live — visible dès les étapes Options / Fichiers (même
               logique que le Studio textile : on voit la carte paysage/portrait
               et le visuel s'y plaque au fur et à mesure). Au step 3, l'aperçu
               BAT technique détaillé prend le relais → on évite le doublon. */}
            {step !== 3 && (
              <div className="hidden rounded-2xl border border-[var(--hm-line)] bg-white p-4 lg:block">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                  Aperçu en direct
                </p>
                {faces === "recto-verso" && versoProvided ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--hm-primary)]">Recto</p>
                      <div className="flex justify-center rounded-xl bg-[var(--hm-surface)] p-4">
                        <BusinessCardVisualizer
                          orientation={orientation}
              rounded={corners === "rounded"}
              finish={finish}
                          frontFileUrl={frontFile?.url ?? null}
                          backFileUrl={backFile?.url ?? null}
                          forceFace="front"
                          hasBack={versoProvided}
                          showToggle={false}
                          displayWidth={300}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--hm-primary)]">Verso</p>
                      <div className="flex justify-center rounded-xl bg-[var(--hm-surface)] p-4">
                        <BusinessCardVisualizer
                          orientation={orientation}
              rounded={corners === "rounded"}
              finish={finish}
                          frontFileUrl={frontFile?.url ?? null}
                          backFileUrl={backFile?.url ?? null}
                          forceFace="back"
                          hasBack={versoProvided}
                          showToggle={false}
                          displayWidth={300}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center rounded-xl bg-[var(--hm-surface)] p-4">
                    <BusinessCardVisualizer
                      orientation={orientation}
              rounded={corners === "rounded"}
              finish={finish}
                      frontFileUrl={frontFile?.url ?? null}
                      backFileUrl={faces === "recto-verso" ? (backFile?.url ?? null) : null}
                      showToggle={versoProvided}
                      hasBack={versoProvided}
                      displayWidth={320}
                    />
                  </div>
                )}
                <p className="mt-2.5 text-center text-[10px] leading-snug text-[var(--hm-text-muted)]">
                  {PRINT_ORIENTATION_LABELS[orientation]}
                  {frontFile ? " · votre visuel" : " · déposez votre visuel à l'étape Fichiers"}
                </p>
              </div>
            )}

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
                  "⚡ Production par notre atelier d'impression",
                ].map((item) => (
                  <p key={item} className="text-[11px] text-[var(--hm-text-soft)]">{item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Atelier d'édition en ligne (plein écran) ──────────────────────── */}
      {editorOpen && (
        <PrintEditor
          widthMm={orientation === "landscape" ? 85 : 55}
          heightMm={orientation === "landscape" ? 55 : 85}
          bleedMm={3}
          faces={faces}
          onValidate={handleEditorValidate}
          onClose={() => setEditorOpen(false)}
        />
      )}

      {/* Aperçu 3D de l'étape BAT (fichiers uploadés) */}
      {view3DOpen && frontPreviewUrl && (
        <Card3DViewer
          rectoUrl={frontPreviewUrl}
          versoUrl={faces === "recto-verso" ? backPreviewUrl : null}
          widthMm={orientation === "landscape" ? 85 : 55}
          heightMm={orientation === "landscape" ? 55 : 85}
          onClose={() => setView3DOpen(false)}
        />
      )}
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
