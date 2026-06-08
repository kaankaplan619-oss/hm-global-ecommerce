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
import { UploadCloud, Loader2, X, ArrowRight, CheckCircle2 } from "lucide-react";
import type { CuratedPrintProduct, PrintSpec } from "@/data/print-catalogue";
import type { PrintOrientation } from "@/data/print-products";
import { PRINT_ORIENTATION_LABELS } from "@/data/print-products";
import PrintSupportVisualizer from "@/components/print/PrintSupportVisualizer";

interface UploadedFile { url: string; name: string; size: number; type: string; }

export default function PrintConfigurator({
  product,
  spec,
}: {
  product: CuratedPrintProduct;
  spec:    PrintSpec;
}) {
  const router = useRouter();

  // Orientation initiale : paysage si format large, portrait sinon.
  const initialOrientation: PrintOrientation =
    spec.widthMm >= spec.heightMm ? "landscape" : "portrait";

  const [orientation, setOrientation] = useState<PrintOrientation>(initialOrientation);
  const [faces, setFaces] = useState<"recto" | "recto-verso">("recto");
  const [frontFile, setFrontFile] = useState<UploadedFile | null>(null);
  const [backFile,  setBackFile]  = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState<null | "front" | "back">(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File, face: "front" | "back") => {
    setUploading(face);
    setError(null);
    try {
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
      const uploaded = { url, name, size, type };
      if (face === "front") setFrontFile(uploaded); else setBackFile(uploaded);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur upload.");
    } finally {
      setUploading(null);
    }
  }, [product.id]);

  const onPick = (face: "front" | "back") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) upload(f, face);
  };

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
    router.push(`/contact?${params.toString()}`);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

      {/* ── Colonne gauche — options + upload ─────────────────────────────── */}
      <div className="flex flex-col gap-6">

        {/* Orientation */}
        {spec.orientationToggle && (
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

        {/* Faces */}
        {spec.faces && (
          <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Impression</p>
            <div className="flex flex-wrap gap-3">
              {([["recto", "Recto seul"], ["recto-verso", "Recto-verso"]] as const).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFaces(v)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    faces === v
                      ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
                      : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upload recto */}
        <FileDrop
          label={spec.faces ? "Visuel recto" : "Votre visuel"}
          required
          file={frontFile}
          uploading={uploading === "front"}
          onPick={onPick("front")}
          onClear={() => setFrontFile(null)}
        />

        {/* Upload verso */}
        {spec.faces && faces === "recto-verso" && (
          <FileDrop
            label="Visuel verso"
            file={backFile}
            uploading={uploading === "back"}
            onPick={onPick("back")}
            onClear={() => setBackFile(null)}
          />
        )}

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <button
          type="button"
          onClick={finalize}
          className="btn-primary gap-2"
        >
          Finaliser ma demande
          <ArrowRight size={15} />
        </button>
        <p className="-mt-2 text-center text-[11px] text-[var(--hm-text-muted)]">
          On valide le BAT avec vous, puis on confirme délai et tarif au devis.
        </p>
      </div>

      {/* ── Colonne droite — aperçu live + récap ──────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="sticky top-24 flex flex-col gap-4">
          <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Aperçu en direct</p>
            <div className="flex justify-center rounded-xl bg-[var(--hm-surface)] p-4">
              <PrintSupportVisualizer
                widthMm={spec.widthMm}
                heightMm={spec.heightMm}
                sizeLabel={product.sizeLabel}
                orientation={orientation}
                frontFileUrl={frontFile?.url ?? null}
                backFileUrl={spec.faces && faces === "recto-verso" ? (backFile?.url ?? null) : null}
                showToggle={spec.faces && faces === "recto-verso" && (!!frontFile || !!backFile)}
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
              {spec.orientationToggle && <Row label="Orientation" value={PRINT_ORIENTATION_LABELS[orientation]} />}
              {spec.faces && <Row label="Impression" value={faces === "recto-verso" ? "Recto-verso" : "Recto seul"} />}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4 text-[11px] text-[var(--hm-text-soft)]">
            <p className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[var(--hm-primary)]" /> BAT validé avant impression</p>
            <p className="mt-1.5 flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[var(--hm-primary)]" /> PDF / PNG / JPG haute résolution</p>
          </div>
        </div>
      </div>
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
