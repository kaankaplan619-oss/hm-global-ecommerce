/**
 * lib/pdf-preview.ts
 *
 * Génère un aperçu PNG (data URL) d'une page d'un PDF, côté client, via pdf.js.
 * Sert à produire l'image affichable d'une carte/print pour le panier, la
 * commande et l'admin (un <img> ne peut pas afficher un PDF).
 *
 * Worker pdf.js servi depuis /public/pdf.worker.min.mjs (copié à l'install).
 * Retourne null en cas d'échec (CORS, PDF protégé, page absente…).
 */

export async function renderPdfPageToPng(
  url: string,
  page = 1,
  maxWidth = 600,
): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const doc = await pdfjs.getDocument({ url }).promise;
    const pageNum = Math.min(Math.max(1, page), doc.numPages);
    const pg = await doc.getPage(pageNum);

    const base = pg.getViewport({ scale: 1 });
    const scale = maxWidth / base.width;
    const viewport = pg.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    // Fond blanc (les PDF transparents apparaîtraient noirs sinon).
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await pg.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/**
 * Rend TOUTES les pages d'un PDF (fichier local) en PNG (data URLs).
 * Utilisé par l'atelier d'édition : le client importe son PDF et le voit
 * réellement sur le plan de travail (page 1 = recto, page 2 = verso).
 * Fond blanc (les PDF transparents apparaîtraient noirs sinon).
 */
export async function renderPdfFileToPngs(file: File, maxWidth = 1100): Promise<string[]> {
  if (typeof window === "undefined") return [];
  try {
    const data = await file.arrayBuffer();
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    const doc = await pdfjs.getDocument({ data }).promise;
    const out: string[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const pg = await doc.getPage(p);
      const base = pg.getViewport({ scale: 1 });
      const scale = maxWidth / base.width;
      const vp = pg.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(vp.width);
      canvas.height = Math.ceil(vp.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await pg.render({ canvasContext: ctx, viewport: vp }).promise;
      out.push(canvas.toDataURL("image/png"));
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * Détecte si une URL pointe vers un PDF (extension avant un éventuel ?query).
 */
export function isPdfUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return /\.pdf($|\?|&)/.test(lower) || lower.endsWith(".pdf");
}
