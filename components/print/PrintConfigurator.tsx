"use client";

/**
 * PrintConfigurator.tsx
 *
 * Configurateur générique de personnalisation print (flyers, affiches, toiles,
 * invitations, cartes carrées/pliées…). Même esprit que le configurateur cartes
 * mais piloté par les données catalogue (data/print-catalogue.ts) :
 *   - orientation paysage/portrait (si spec.orientationToggle)
 *   - recto / recto-verso (si spec.faces)
 *   - upload du/des visuel(s) (réutilise /api/orders/upload-print-file)
 *   - APERÇU LIVE au bon format (PrintSupportVisualizer) — comme les t-shirts
 *
 * Fin de parcours : ces familles n'ont pas (encore) de grille tarifaire → on
 * finalise par une demande de devis PRÉ-REMPLIE avec le visuel joint (BAT).
 * Le jour où un prix existe, on bascule la fin vers l'ajout au panier.
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, X, ArrowRight, CheckCircle2, ShoppingCart, Sparkles } from "lucide-react";
import type { CuratedPrintProduct, PrintSpec } from "@/data/print-catalogue";
import type { PrintOrientation } from "@/data/print-products";
import { PRINT_ORIENTATION_LABELS } from "@/data/print-products";
import PrintSupportVisualizer from "@/components/print/PrintSupportVisualizer";
import PrintEditor from "@/components/print/PrintEditor";
import SignaturePad from "@/components/print/SignaturePad";
import { isPdfUrl } from "@/lib/pdf-preview";
import { useCartStore } from "@/store/cart";
import { isPrintDirect, getPrintQtyOptions, getPrintDirectPrice, getPrintGelatoUid, getPrintFacesAvailable } from "@/data/print-pricing";
import type { PrintFace } from "@/data/print-pricing";
import type { PrintConfig } from "@/types";

interface UploadedFile { url: string; name: string; size: number; type: string; }

/** Convertit un data:URL (export éditeur / signature) en File uploadable. */
function dataUrlToFile(dataUrl: string, name: string): File {
  const [meta, b64] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(meta)?.[1] ?? "image/png";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], name, { type: mime });
}

export default function PrintConfigurator({
  product,
  spec,
}: {
  product: CuratedPrintProduct;
  spec:    PrintSpec;
}) {
  const router = useRouter();

  // Produits pliés / dépliants : se conçoivent avec EXTÉRIEUR + INTÉRIEUR et une
  // ligne de pli, comme chez les concurrents (toujours recto-verso, pas d'orientation).
  //   - carte pliée  : fermée A6 → s'ouvre en planche (×2 largeur), pli vertical
  //   - dépliant A4  : feuille A4 à plat, pliée en deux → A5, pli horizontal
  const FOLDED_CONFIG: Record<string, { axis: "vertical" | "horizontal"; openMultiplier: 1 | 2 }> = {
    "card-folded": { axis: "vertical",   openMultiplier: 2 },
    "flyer-a4":    { axis: "horizontal", openMultiplier: 1 },
  };
  const folded = FOLDED_CONFIG[product.id] ?? null;
  const FOLDED = folded !== null;

  // Orientation initiale : paysage si format large, portrait sinon.
  const initialOrientation: PrintOrientation =
    spec.widthMm >= spec.heightMm ? "landscape" : "portrait";

  // Faces réellement commandables (ex. flyer A4 = recto-verso uniquement).
  const directFaces = getPrintFacesAvailable(product.id);
  const availableFaces: PrintFace[] = FOLDED
    ? ["recto-verso"]
    : directFaces.length
      ? directFaces
      : (spec.faces ? ["recto", "recto-verso"] : ["recto"]);

  const [orientation, setOrientation] = useState<PrintOrientation>(initialOrientation);
  const [faces, setFaces] = useState<PrintFace>(
    availableFaces.includes("recto") ? "recto" : availableFaces[0],
  );
  const [frontFile, setFrontFile] = useState<UploadedFile | null>(null);
  const [backFile,  setBackFile]  = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState<null | "front" | "back">(null);
  const [error, setError] = useState<string | null>(null);

  // Commande directe (posters / toiles / invitations) : sélecteur quantité →
  // prix baké Gelato × 2,2 (data/print-pricing). Sinon, fin = demande de devis.
  const { addItem } = useCartStore();
  const direct = isPrintDirect(product.id);
  const qtyOptions = getPrintQtyOptions(product.id, faces);
  const [quantity, setQuantity] = useState<number>(
    getPrintQtyOptions(product.id, faces)[0]?.quantity ?? 1,
  );
  const [adding, setAdding] = useState(false);
  const [projectName, setProjectName] = useState("");
  const price = direct ? getPrintDirectPrice(product.id, quantity, faces) : null;

  // Atelier d'édition en ligne : activé sur les petits formats (flyers,
  // invitations ≤ 320 mm). Les grands formats (affiches, toiles) restent en
  // upload de fichier prêt. BAT + signature requis pour les commandes directes.
  const atelierEnabled = Math.max(spec.widthMm, spec.heightMm) <= 320 && spec.faces;
  // BAT + signature requis sur TOUTE commande directe (petits ET grands formats).
  const batEnabled = direct;

  const [editorOpen, setEditorOpen] = useState(false);
  const [batName, setBatName] = useState("");
  const [batApproved, setBatApproved] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

  // Dimensions éditeur. Plié/dépliant = planche (×openMultiplier de la largeur).
  // Sinon, selon l'orientation choisie.
  const shortMm = Math.min(spec.widthMm, spec.heightMm);
  const longMm  = Math.max(spec.widthMm, spec.heightMm);
  const editorW = folded ? shortMm * folded.openMultiplier : (orientation === "landscape" ? longMm : shortMm);
  const editorH = folded ? longMm : (orientation === "landscape" ? shortMm : longMm);
  const editorOrientation: PrintOrientation = editorW >= editorH ? "landscape" : "portrait";

  // Changer de faces : garder une quantité valide pour la nouvelle grille.
  const pickFaces = (next: PrintFace) => {
    setFaces(next);
    const opts = getPrintQtyOptions(product.id, next);
    if (opts.length && !opts.some((o) => o.quantity === quantity)) {
      setQuantity(opts[0].quantity);
    }
  };
  const productType: PrintConfig["productType"] =
    product.id.startsWith("poster") ? "poster"
      : product.id.startsWith("canvas") ? "canvas"
      : "invitation";

  // Upload brut → renvoie le fichier uploadé (sans toucher l'état).
  const postFile = useCallback(async (file: File, face: "front" | "back"): Promise<UploadedFile | null> => {
    let sessionId = "ssr";
    if (typeof window !== "undefined") {
      sessionId = sessionStorage.getItem("hm_session_id")
        ?? (() => { const id = crypto.randomUUID(); sessionStorage.setItem("hm_session_id", id); return id; })();
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("face", face);
    fd.append("productType", product.id);
    fd.append("sessionId", sessionId);
    const res = await fetch("/api/orders/upload-print-file", { method: "POST", body: fd });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      throw new Error(b.error ?? "Erreur lors de l'upload.");
    }
    const { url, name, size, type } = await res.json();
    return { url, name, size, type };
  }, [product.id]);

  const upload = useCallback(async (file: File, face: "front" | "back") => {
    setUploading(face);
    setError(null);
    try {
      const uploaded = await postFile(file, face);
      if (uploaded) { if (face === "front") setFrontFile(uploaded); else setBackFile(uploaded); }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur upload.");
    } finally {
      setUploading(null);
    }
  }, [postFile]);

  const onPick = (face: "front" | "back") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) upload(f, face);
  };

  // Atelier d'édition : on upload les PNG exportés (recto/verso) comme visuels.
  const handleEditorValidate = useCallback(async (recto: string, verso: string | null) => {
    setEditorOpen(false);
    setUploading("front");
    setError(null);
    try {
      const rf = await postFile(dataUrlToFile(recto, "flyer-recto.png"), "front");
      if (rf) setFrontFile(rf);
      if (verso) {
        const bf = await postFile(dataUrlToFile(verso, "flyer-verso.png"), "back");
        if (bf) { setBackFile(bf); setFaces("recto-verso"); }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la validation de l'atelier.");
    } finally {
      setUploading(null);
    }
  }, [postFile]);

  // Signature manuscrite du BAT : upload du PNG dès qu'elle est tracée.
  const handleSignatureChange = useCallback(async (dataUrl: string | null) => {
    if (!dataUrl) { setSignatureUrl(null); return; }
    try {
      const up = await postFile(dataUrlToFile(dataUrl, "signature-bat.png"), "front");
      setSignatureUrl(up?.url ?? null);
    } catch { setSignatureUrl(null); }
  }, [postFile]);

  const finalize = () => {
    const params = new URLSearchParams({
      sujet:   "impression",
      produit: product.id,
      format:  product.sizeLabel,
      orientation: PRINT_ORIENTATION_LABELS[orientation],
    });
    if (faces === "recto-verso") params.set("faces", "Recto-verso");
    if (frontFile) params.set("visuel", frontFile.url);
    if (faces === "recto-verso" && backFile) params.set("visuelVerso", backFile.url);
    if (projectName.trim()) params.set("projet", projectName.trim());
    router.push(`/contact?${params.toString()}`);
  };

  const addToCart = () => {
    if (!frontFile || price == null) { setError("Déposez votre visuel pour commander."); return; }
    if (batEnabled && (!batApproved || batName.trim().length < 2)) {
      setError("Signez le bon à tirer pour commander."); return;
    }
    setAdding(true);
    try {
      // Aperçu panier : si le visuel est une image (PNG de l'atelier ou JPG/PNG
      // uploadé), on l'utilise comme vignette. Un PDF n'est pas affichable direct.
      const frontIsImage = !isPdfUrl(frontFile.url);
      const backIsImage = backFile ? !isPdfUrl(backFile.url) : false;
      const config: PrintConfig = {
        productType,
        supplier:        "gelato",
        format:          product.sizeLabel,
        orientation,
        faces:           spec.faces ? faces : "recto",
        quantity,
        gelatoUid:       getPrintGelatoUid(product.id, faces) ?? undefined,
        projectName:     projectName.trim() || undefined,
        lotPriceTTC:     price,
        frontFileUrl:    frontFile.url,
        backFileUrl:     spec.faces && faces === "recto-verso" ? (backFile?.url ?? null) : null,
        frontPreviewUrl: frontIsImage ? frontFile.url : null,
        backPreviewUrl:  spec.faces && faces === "recto-verso" && backIsImage ? (backFile?.url ?? null) : null,
        batStatus:       batEnabled ? "valide" : "a_verifier",
        batSignature:    batEnabled
          ? { name: batName.trim(), date: new Date().toISOString(), signatureUrl: signatureUrl ?? undefined }
          : undefined,
      };
      addItem({
        product: {
          id: product.id, name: product.name, shortName: product.name,
          format: product.sizeLabel, description: product.description,
        } as unknown as Parameters<typeof addItem>[0]["product"],
        quantity:          1,
        size:              "unique",
        color:             { id: "print", label: "—", hex: "#ffffff", available: true },
        technique:         "print",
        placement:         "coeur",
        overrideUnitPrice: price,
        printConfig:       config,
      });
      router.push("/panier");
    } catch {
      setAdding(false);
      setError("Erreur lors de l'ajout au panier.");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

      {/* ── Colonne gauche — options + upload ─────────────────────────────── */}
      <div className="flex flex-col gap-6">

        {/* Aperçu mobile en HAUT (sticky) — visible pendant toute la config,
           mis à jour dès le dépôt du visuel. Desktop = colonne droite. */}
        <div className="sticky top-[4.5rem] z-20 -mx-1 lg:hidden">
          <div className="rounded-2xl border border-[var(--hm-line)] bg-white/95 p-3 backdrop-blur">
            <div className="flex items-center justify-center rounded-xl bg-[var(--hm-surface)] p-3">
              <PrintSupportVisualizer
                widthMm={FOLDED ? editorW : spec.widthMm}
                heightMm={FOLDED ? editorH : spec.heightMm}
                sizeLabel={product.sizeLabel}
                orientation={FOLDED ? editorOrientation : orientation}
                frontFileUrl={frontFile?.url ?? null}
                backFileUrl={spec.faces && faces === "recto-verso" ? (backFile?.url ?? null) : null}
                showToggle={spec.faces && faces === "recto-verso"}
                hasBack={!!backFile}
                bleedMm={spec.bleedMm}
                displayWidth={196}
              />
            </div>
          </div>
        </div>

        {/* Orientation */}
        {spec.orientationToggle && !FOLDED && (
          <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Orientation</p>
            <div className="flex flex-wrap gap-3">
              {(["landscape", "portrait"] as PrintOrientation[]).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOrientation(o)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    orientation === o
                      ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
                      : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]"
                  }`}
                >
                  {PRINT_ORIENTATION_LABELS[o]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Faces — affiché seulement s'il y a un vrai choix (A4 = recto-verso seul) */}
        {spec.faces && availableFaces.length > 1 && (
          <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Impression</p>
            <div className="flex flex-wrap gap-3">
              {availableFaces.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => pickFaces(v)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    faces === v
                      ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
                      : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]"
                  }`}
                >
                  {v === "recto-verso" ? "Recto-verso" : "Recto seul"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Atelier : seule entrée pour les petits formats (comme les cartes) ─
           On importe un PDF/JPG OU on compose en ligne. La page 2 d'un PDF
           devient automatiquement le verso (géré par PrintEditor). */}
        {atelierEnabled ? (
          <div className="rounded-2xl border border-[var(--hm-primary)]/25 bg-[var(--hm-accent-soft-rose)] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--hm-primary)]">Votre visuel</p>
            <p className="mb-3 mt-1 text-[12px] leading-relaxed text-[var(--hm-text-soft)]">
              Importez votre fichier <strong>PDF ou JPG</strong> (la page 2 d&apos;un PDF devient le verso),
              ou composez votre {product.name.toLowerCase()} : textes, formes, images, QR code.
            </p>
            <button
              type="button"
              onClick={() => setEditorOpen(true)}
              className="btn-primary w-full gap-2"
            >
              <Sparkles size={15} /> {frontFile ? "Modifier mon visuel" : "Ouvrir l'atelier de création"}
            </button>
            {frontFile && (
              <p className="mt-2 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-green-600">
                <CheckCircle2 size={14} /> Visuel prêt{faces === "recto-verso" ? " (recto-verso)" : ""}
              </p>
            )}
          </div>
        ) : (
          /* Grands formats (affiches, toiles) : pas d'atelier → upload du fichier prêt. */
          <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Votre fichier</p>
            <p className="mb-4 mt-1 text-[12px] leading-relaxed text-[var(--hm-text-muted)]">
              Déposez votre visuel prêt à imprimer (PDF, PNG ou JPG haute résolution).
            </p>

            <FileDrop
              label="Votre visuel"
              required
              file={frontFile}
              uploading={uploading === "front"}
              onPick={onPick("front")}
              onClear={() => setFrontFile(null)}
            />
          </div>
        )}

        {/* Nom du projet (façon "Item name" Pixartprinting) */}
        <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
            Nom du projet <span className="font-medium normal-case text-[var(--hm-text-muted)]">(optionnel)</span>
          </p>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            maxLength={80}
            placeholder="Ex. Affiche soldes été"
            className="mt-2 w-full rounded-xl border border-[var(--hm-line)] bg-white px-4 py-3 text-sm text-[var(--hm-text)] outline-none transition focus:border-[var(--hm-primary)]"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        {direct ? (
          <>
            {/* Quantité → prix live (modèle Pixartprinting) */}
            <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Quantité</p>
              <div className="flex flex-wrap gap-2">
                {qtyOptions.map((o) => (
                  <button
                    key={o.quantity}
                    type="button"
                    onClick={() => setQuantity(o.quantity)}
                    className={`flex items-baseline gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      quantity === o.quantity
                        ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
                        : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]"
                    }`}
                  >
                    {o.quantity}{o.quantity >= 25 ? " ex." : o.quantity > 1 ? " unités" : " unité"}
                    <span className="text-[11px] font-bold text-[var(--hm-text-muted)]">{o.priceTTC.toFixed(2)} €</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prix TTC du choix courant */}
            <div className="rounded-2xl border border-[var(--hm-primary)]/25 bg-[var(--hm-accent-soft-rose)] px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Prix TTC</p>
              <p className="text-2xl font-black text-[var(--hm-primary)]">{price != null ? price.toFixed(2) : "—"} €</p>
              <p className="text-[10px] text-[var(--hm-text-muted)]">Port confirmé au paiement · BAT validé avant production</p>
            </div>

            {/* Bon à tirer — signature (commandes directes avec atelier) */}
            {batEnabled && frontFile && (
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
            )}

            <button
              type="button"
              onClick={addToCart}
              disabled={adding || !frontFile || (batEnabled && (!batApproved || batName.trim().length < 2))}
              className="btn-primary gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {adding ? (
                <><Loader2 size={15} className="animate-spin" /> Ajout…</>
              ) : batEnabled ? (
                <><ShoppingCart size={15} /> Signer le BAT et ajouter au panier — {price != null ? price.toFixed(2) : "—"} €</>
              ) : (
                <><ShoppingCart size={15} /> Ajouter au panier — {price != null ? price.toFixed(2) : "—"} €</>
              )}
            </button>
            {!frontFile && (
              <p className="-mt-2 text-center text-[11px] text-[var(--hm-text-muted)]">
                {atelierEnabled ? "Créez ou déposez votre visuel pour commander." : "Déposez votre visuel pour pouvoir commander."}
              </p>
            )}
          </>
        ) : (
          <>
            <button type="button" onClick={finalize} className="btn-primary gap-2">
              Finaliser ma demande
              <ArrowRight size={15} />
            </button>
            <p className="-mt-2 text-center text-[11px] text-[var(--hm-text-muted)]">
              On valide le BAT avec vous, puis on confirme délai et tarif au devis.
            </p>
          </>
        )}
      </div>

      {/* ── Colonne droite — aperçu live + récap ──────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="sticky top-24 flex flex-col gap-4">
          <div className="hidden rounded-2xl border border-[var(--hm-line)] bg-white p-4 lg:block">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Aperçu en direct</p>
            <div className="flex justify-center rounded-xl bg-[var(--hm-surface)] p-4">
              <PrintSupportVisualizer
                widthMm={FOLDED ? editorW : spec.widthMm}
                heightMm={FOLDED ? editorH : spec.heightMm}
                sizeLabel={product.sizeLabel}
                orientation={FOLDED ? editorOrientation : orientation}
                frontFileUrl={frontFile?.url ?? null}
                backFileUrl={spec.faces && faces === "recto-verso" ? (backFile?.url ?? null) : null}
                showToggle={spec.faces && faces === "recto-verso"}
                hasBack={!!backFile}
                bleedMm={spec.bleedMm}
                displayWidth={232}
              />
            </div>
            <p className="mt-2.5 text-center text-[10px] leading-snug text-[var(--hm-text-muted)]">
              {product.sizeLabel} · {PRINT_ORIENTATION_LABELS[orientation]}
              {frontFile ? " · votre visuel" : " · déposez votre visuel"}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5 text-sm">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Récapitulatif</p>
            <div className="flex flex-col gap-2">
              <Row label="Support" value={product.name} />
              <Row label="Format"  value={product.sizeLabel} />
              {spec.orientationToggle && !FOLDED && <Row label="Orientation" value={PRINT_ORIENTATION_LABELS[orientation]} />}
              {FOLDED
                ? <Row label="Impression" value="Extérieur + intérieur" />
                : spec.faces && <Row label="Impression" value={faces === "recto-verso" ? "Recto-verso" : "Recto seul"} />}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4 text-[11px] text-[var(--hm-text-soft)]">
            <p className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[var(--hm-primary)]" /> BAT validé avant impression</p>
            <p className="mt-1.5 flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[var(--hm-primary)]" /> PDF / PNG / JPG haute résolution</p>
          </div>
        </div>
      </div>

      {/* ── Atelier d'édition (petits formats) ────────────────────────────── */}
      {editorOpen && (
        <PrintEditor
          widthMm={editorW}
          heightMm={editorH}
          bleedMm={spec.bleedMm}
          faces={FOLDED ? "recto-verso" : (spec.faces ? faces : "recto")}
          faceLabels={FOLDED ? { front: "Extérieur", back: "Intérieur" } : { front: "Recto", back: "Verso" }}
          foldAxis={folded?.axis ?? null}
          onValidate={handleEditorValidate}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function FileDrop({
  label, required, file, uploading, onPick, onClear,
}: {
  label: string;
  required?: boolean;
  file: UploadedFile | null;
  uploading: boolean;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
        {label} {required && <span className="text-[var(--hm-rose)]">*</span>}
      </p>
      {file ? (
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-green-700">{file.name}</p>
            <p className="text-[10px] text-green-600">{Math.round(file.size / 1024)} Ko</p>
          </div>
          <button type="button" onClick={onClear} className="ml-3 shrink-0 text-green-700 hover:text-green-900"><X size={16} /></button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-6 text-center transition hover:border-[var(--hm-primary)]">
          {uploading ? <Loader2 size={20} className="animate-spin text-[var(--hm-primary)]" /> : <UploadCloud size={20} className="text-[var(--hm-text-muted)]" />}
          <span className="text-sm font-semibold text-[var(--hm-text-soft)]">{uploading ? "Upload en cours…" : "Déposer le fichier"}</span>
          <span className="text-[10px] text-[var(--hm-text-muted)]">PDF, PNG ou JPG · 20 Mo max</span>
          <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={onPick} disabled={uploading} />
        </label>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[var(--hm-text-muted)]">{label}</span>
      <span className="text-right font-semibold text-[var(--hm-text)]">{value}</span>
    </div>
  );
}
