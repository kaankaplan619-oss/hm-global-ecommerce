"use client";

/**
 * StudioCanvas — Éditeur visuel drag & drop sans Fabric.js.
 *
 * Drag   : onPointerDown + setPointerCapture sur le logo → fiable Mac/touch
 * Resize : drag des coins (distance au centre) + boutons +/- + input cm
 * CM     : référence Gildan 5000 adult M (~52 cm de large), shirt ≈ 58% du container
 * Export : canvas 2D offscreen (shirt + logo composité)
 *
 * fabricState:
 *   cx, cy   : centre logo en fraction du container (0..1)
 *   scale    : facteur d'échelle px→affichage
 *   angle    : rotation en degrés
 *   nw, nh   : dimensions naturelles de l'image source (px)
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  RotateCcw, Shirt, ZoomIn, ZoomOut, RotateCw, Trash2, Copy, Crosshair,
} from "lucide-react";
import type { Placement } from "@/types";
import { proxyCdnUrl } from "@/lib/proxy-cdn-url";
import {
  MOCKUP_FILES,
  COLOR_TO_MOCKUP,
  getZoneCenter as zonesGetCenter,
  getZoneSize as zonesGetSize,
} from "@/lib/textile-zones";

// ── Constante pixel → cm ──────────────────────────────────────────────────────
// Gildan 5000 adulte taille M : corps ≈ 52 cm de large
// Le shirt occupe ≈ 58 % de la largeur du container dans le mockup Printful
const SHIRT_BODY_CM      = 52;
const SHIRT_BODY_FILL    = 0.58;

const pxPerCm = (containerSize: number) =>
  (SHIRT_BODY_FILL * containerSize) / SHIRT_BODY_CM;

// ── Types publics ─────────────────────────────────────────────────────────────

export interface StudioObject {
  id: string;
  type: "logo" | "text" | "design";
  src?: string;
  file?: File;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  // ── Mise en forme texte ───────────────────────────────────────
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  textAlign?: "left" | "center" | "right";
  letterSpacing?: number;   // en px (0 = normal)
  label: string;
  face: "front" | "back";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fabricState?: any;
}

export interface StudioCanvasHandle {
  /** Export la vue courante (shirt + logos) en data URL PNG */
  exportPNG: () => string;
  /**
   * Export les deux faces (front + back) indépendamment.
   * Charge les images de shirt sans dépendre du DOM — fiable pour le BAT.
   * Retourne "" pour une face si aucun logo n'est présent dessus.
   */
  exportComposed: () => Promise<{ front: string; back: string }>;
  /**
   * Taille réelle du container canvas (px), mesurée via ResizeObserver.
   * Permet aux consommateurs (BAT serveur, StudioSummaryPanel) de rapporter
   * la bonne échelle au lieu d'une valeur hardcodée.
   * Retourne 0 si le canvas n'est pas encore monté.
   */
  getContainerSize: () => number;
}

interface Props {
  colorId: string;
  placement: Placement;
  productCategory?: string;
  /** ID du produit HM — utilisé pour les overrides ciblés (ex. WG004 stock agence
   *  qui a un cadrage TopTex spécifique nécessitant une zone cœur ajustée). */
  productId?: string;
  /** Liste des placements autorisés pour ce produit (depuis data/products.ts).
   *  Pilote l'affichage des boutons CŒUR / DOS du sélecteur de vue : si le
   *  produit n'a que "coeur" dans ses placements, le bouton DOS est masqué
   *  (évite d'afficher un fallback dos cassé pour les produits sans image dos
   *  dédiée, ex. WG004). Si non fourni : les 2 boutons restent affichés
   *  (comportement legacy pour rétrocompatibilité). */
  placements?: Placement[];
  packshot?: string | null;
  packshotBack?: string | null;
  objects: StudioObject[];
  onObjectsChange: (objects: StudioObject[]) => void;
  /** Appelé quand l'utilisateur bascule entre face et dos */
  onViewChange?: (view: "front" | "back") => void;
}

// ── Override zone produit-spécifique (WG004 stock agence V1+) ───────────────
// WG004 utilise un packshot TopTex où le sweat occupe seulement ~33% de la
// surface centrale (vs ~83% pour les Printify cropped Gildan/Bella). Du coup
// la zone cœur calibrée pour les hoodies Printify (centre 0.46, 0.40) tombe
// au-dessus du sweat WG004 visible (sur le col/épaule). Override produit
// pour repositionner la zone cœur sur la poitrine gauche du sweat WG004.
//
// Format identique à ZONES_BY_CATEGORY (lib/textile-zones.ts) :
// [left, top, width, height] en fractions du canvas 0..1.
//
// Ne touche PAS aux zones globales — uniquement appliqué quand productId
// correspond. Pour ajouter un autre produit override, étendre cet objet.
const ZONE_OVERRIDES_BY_PRODUCT_ID: Record<string, {
  coeur?: [number, number, number, number];
  dos?:   [number, number, number, number];
}> = {
  // Bonnet à revers : la broderie se fait sur le REVERS (bande basse du
  // bonnet), pas au milieu du crâne — zone descendue vs casquettes (2026-06-12).
  "bonnet-yupoong-1501kc": {
    coeur: [0.42, 0.62, 0.16, 0.10],
  },
  // Sacoche bandoulière : logo sur le panneau bas (zone plate), petite.
  "sacoche-bagbase-qs309": {
    coeur: [0.42, 0.58, 0.16, 0.13],
  },
  wg004: {
    // Iter 8 (2026-05-26) : taille réduite à 0.12 × 0.12 pour matcher visuellement
    // un logo 10 cm réel. Le calcul `pxPerCm` (lib/textile-zones.ts SHIRT_BODY_FILL
    // 0.58 + SHIRT_BODY_CM 52) snape un logo 10 cm à 11.15 % de canvas. La zone
    // visuelle doit donc être proche de cette taille (avec une petite marge de
    // sécurité) pour éviter que la zone pointillée paraisse plus grande que le
    // logo qu'elle est censée représenter. 12 % = ~10.75 cm avec calibration
    // global — vraie représentation du 10 cm sur le client.
    //
    // Note : les zones globales hoodies/tshirts dans textile-zones.ts utilisent
    // 0.14-0.16 (= 14 % canvas) ce qui sur-représente le 10 cm. Override WG004
    // ici corrige uniquement pour WG004 sans toucher aux autres produits.
    //
    // Itérations :
    //   v1: [0.42, 0.42, 0.14, 0.14] → centre (0.49, 0.49) — packshot CDN, centré
    //   v2: [0.42, 0.46, 0.14, 0.14] → centre (0.49, 0.53) — packshot CDN, milieu torse
    //   v3: [0.52, 0.34, 0.14, 0.14] → centre (0.59, 0.41) — packshot CDN, convention OK
    //   v4: [0.58, 0.25, 0.14, 0.14] → centre (0.65, 0.32) — cropped 62%, trop droite
    //   v5: [0.45, 0.28, 0.14, 0.14] → centre (0.52, 0.35) — cropped 62%, centré
    //   v6: [0.48, 0.28, 0.14, 0.14] → centre (0.55, 0.35) — cropped 72%, +3% droite
    //   v7: [0.47, 0.27, 0.16, 0.16] → centre (0.55, 0.35) — cropped 72%, taille "spec" mais visuellement +14cm
    //   v8: [0.49, 0.29, 0.12, 0.12] → centre (0.55, 0.35) — cropped 72%, taille 10cm visuelle réelle
    //   v9: [0.52, 0.29, 0.12, 0.12] → centre (0.58, 0.35) — +3% droite pour bien marquer côté gauche porteur
    //   v10: [0.54, 0.26, 0.12, 0.12] → centre (0.60, 0.32) — packshot fill 80% (sweat top à 15.5% au lieu de 21.2%),
    //        zone remontée pour rester sur le cœur anatomique du sweat agrandi
    //   v11: [0.56, 0.23, 0.12, 0.12] → centre (0.62, 0.29) — packshot 97% W × 80% H (match Gildan height),
    //        sweat top à 10%, zone repositionnée pour rester sur le cœur anatomique
    coeur: [0.56, 0.23, 0.12, 0.12],
    // Zone dos WG004 : ajoutée iter 10 (2026-05-26) suite au sourcing de la
    // vraie photo back via designpartner.fr.
    //
    // Iter 11 (2026-05-26) : taille réduite pour matcher le vrai 27×32 cm
    // visuel via la calibration globale SHIRT_BODY_FILL=0.58 / SHIRT_BODY_CM=52
    // (1cm = 1.115% canvas). 27 cm = 0.30 canvas, 32 cm = 0.36 canvas. Centre
    // conservé à (0.50, 0.45) — haut de dos centré sous le col. Cohérent avec
    // l'approche coeur (iter 8 v9) qui représente fidèlement le 10×10 cm.
    //
    // Itérations :
    //   v10: [0.27, 0.25, 0.46, 0.42] → centre (0.50, 0.46), zone visuelle ~41×38 cm (trop grande)
    //   v11: [0.35, 0.27, 0.30, 0.36] → centre (0.50, 0.45), zone visuelle 27×32 cm pile (encore trop)
    //   v12: [0.37, 0.29, 0.26, 0.32] → centre (0.50, 0.45), zone visuelle ~23×29 cm (placement réaliste
    //        en-dessous du max 27×32, plus représentatif du print habituel)
    //   v13: [0.37, 0.28, 0.26, 0.32] → centre (0.50, 0.44), aligné sur packshot fill 80%
    //   v14: [0.37, 0.27, 0.26, 0.32] → centre (0.50, 0.43), aligné sur packshot 97%×80% (sweat top à 10%)
    dos: [0.37, 0.27, 0.26, 0.32],
  },
};

// ── Zones de placement ─────────────────────────────────────────────────────────
// Les centres (cx, cy) sont dérivés du rectangle [l, t, w, h] source de vérité
// (lib/textile-zones.ts) — alignés sur les packshots TopTex.
// "coeur" = poitrine du porteur → centre du rectangle de marquage.
// Voir docs/hermes/missions/2026-05-18_configurateur-unification-zones-rapport.md.

// ── Métadonnées zones (cm Printful + labels) ─────────────────────────────────
// Les DIMENSIONS visuelles (wFrac, hFrac) viennent maintenant du rectangle
// source de vérité (lib/textile-zones.ts) via zonesGetSize().
// Ici on conserve uniquement les méta-données spécifiques à la production :
//   - defaultCm : taille cm pré-sélectionnée lors du snap (specs Printful DTG/DTF)
//   - label : texte affiché dans la zone de guidage
// Cœur (left chest) max 10×10 cm ; Dos standard 28×35 cm (T-shirt) / 27×32 cm (Hoodie, Softshell).
const GUIDE_META: Record<string, {
  coeur: { defaultCm: number; label: string };
  dos:   { defaultCm: number; label: string };
}> = {
  tshirts:    {
    coeur: { defaultCm: 10, label: "♥ Cœur · max 10×10 cm" },
    dos:   { defaultCm: 21, label: "Dos · max 28×35 cm" },
  },
  hoodies:    {
    coeur: { defaultCm: 10, label: "♥ Cœur · max 10×10 cm" },
    dos:   { defaultCm: 21, label: "Dos · max 27×32 cm" },
  },
  softshells: {
    coeur: { defaultCm: 10, label: "♥ Cœur · max 10×10 cm" },
    dos:   { defaultCm: 21, label: "Dos · max 27×32 cm" },
  },
  // Polos : broderie Printify — cœur 10×10 cm, dos large_back_embroidery 25×15 cm.
  polos: {
    coeur: { defaultCm: 10, label: "♥ Cœur · max 10×10 cm" },
    dos:   { defaultCm: 18, label: "Dos · max 25×15 cm" },
  },
  // Casquettes/bonnets : broderie panneau avant — zone réelle ≈ 12×6 cm.
  casquettes: {
    coeur: { defaultCm: 6, label: "Avant · broderie max 12×6 cm" },
    dos:   { defaultCm: 6, label: "Arrière" },
  },
  // Sacs : impression/broderie sur le corps du sac.
  sacs: {
    coeur: { defaultCm: 10, label: "Face · max 10×10 cm" },
    dos:   { defaultCm: 10, label: "Dos" },
  },
};
const GUIDE_META_DEFAULT = {
  coeur: { defaultCm: 10, label: "♥ Cœur · max 10×10 cm" },
  dos:   { defaultCm: 21, label: "Dos · max 28×35 cm" },
};

// MOCKUP_FILES + COLOR_TO_MOCKUP : voir @/lib/textile-zones (import en haut).

// ── Composant ─────────────────────────────────────────────────────────────────

const StudioCanvas = forwardRef<StudioCanvasHandle, Props>(function StudioCanvas(
  { colorId, placement, productCategory, productId, placements, packshot, packshotBack, objects, onObjectsChange, onViewChange },
  ref,
) {
  const containerRef     = useRef<HTMLDivElement>(null);
  const [containerSize,  setContainerSize]  = useState(0);
  const [view,           setView]           = useState<"front" | "back">("front");
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [cmInput,        setCmInput]        = useState("");   // input contrôlé taille cm
  const [showGuide,      setShowGuide]      = useState(true); // guide de zone visible
  const [snapFeedback,   setSnapFeedback]   = useState(false); // flash confirmation snap

  const onObjectsChangeRef = useRef(onObjectsChange);
  useEffect(() => { onObjectsChangeRef.current = onObjectsChange; });
  const objectsRef = useRef(objects);
  useEffect(() => { objectsRef.current = objects; });
  const containerSizeRef = useRef(0);

  // ── Mesure container ────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0].contentRect.width);
      if (w > 0) { setContainerSize(w); containerSizeRef.current = w; }
    });
    ro.observe(containerRef.current);
    const w = Math.floor(containerRef.current.getBoundingClientRect().width);
    if (w > 0) { setContainerSize(w); containerSizeRef.current = w; }
    return () => ro.disconnect();
  }, []);

  // ── Auto-switch view ────────────────────────────────────────────────────
  useEffect(() => {
    if (placement === "dos")   { setView("back");  onViewChange?.("back");  }
    if (placement === "coeur") { setView("front"); onViewChange?.("front"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placement]);

  // ── Sources shirt ───────────────────────────────────────────────────────
  const slug    = COLOR_TO_MOCKUP[colorId] ?? null;
  const mockups = slug ? MOCKUP_FILES[slug] : null;
  const shirtSrc = view === "front"
    ? (packshot     ?? mockups?.front ?? "/mockups/tshirt/blanc-front.jpg")
    : (packshotBack ?? mockups?.back  ?? packshot ?? "/mockups/tshirt/blanc-back.png");

  // ── Helpers zone avec override produit (WG004 stock agence V1+) ─────────
  // Si productId a un override dans ZONE_OVERRIDES_BY_PRODUCT_ID, on utilise
  // le rectangle override. Sinon fallback sur ZONES_BY_CATEGORY via les helpers
  // zonesGetCenter / zonesGetSize (lib/textile-zones.ts). Aucun produit autre
  // que WG004 n'est impacté actuellement.
  const getProductZoneCenter = useCallback(
    (place: "coeur" | "dos"): [number, number] => {
      const override = productId ? ZONE_OVERRIDES_BY_PRODUCT_ID[productId]?.[place] : undefined;
      if (override) {
        const [l, t, w, h] = override;
        return [l + w / 2, t + h / 2];
      }
      return zonesGetCenter(productCategory, place);
    },
    [productId, productCategory],
  );
  const getProductZoneSize = useCallback(
    (place: "coeur" | "dos"): { wFrac: number; hFrac: number } => {
      const override = productId ? ZONE_OVERRIDES_BY_PRODUCT_ID[productId]?.[place] : undefined;
      if (override) {
        return { wFrac: override[2], hFrac: override[3] };
      }
      return zonesGetSize(productCategory, place);
    },
    [productId, productCategory],
  );

  // ── Zone centre (dérivé du rectangle source de vérité — textile-zones) ──
  const getZoneCenter = useCallback((): [number, number] => {
    return getProductZoneCenter(view === "back" ? "dos" : "coeur");
  }, [view, getProductZoneCenter]);

  // ── Guide zone actif (dimensions: rectangle SoV ; méta: cm Printful) ────
  const guidePlacement = view === "back" ? "dos" : "coeur";
  const guideSize = getProductZoneSize(guidePlacement);
  const guideMeta = (productCategory ? GUIDE_META[productCategory] : null)?.[guidePlacement]
    ?? GUIDE_META_DEFAULT[guidePlacement];
  const guideZone = { ...guideSize, ...guideMeta };
  const [guideCx, guideCy] = getZoneCenter();

  // ── Verrouillage du logo dans la zone (broderie Printify : emplacements fixes) ──
  // Pour les polos, la broderie Printify ne se fait que dans les emplacements
  // standard (cœur / dos) → on contraint le centre du logo à rester dans le
  // rectangle de zone et on plafonne sa taille à la zone. Les autres catégories
  // (t-shirts/hoodies/softshells DTF) gardent le placement libre (zone = guide).
  const zoneClampRef = useRef({ lock: false, cx: 0.5, cy: 0.5, w: 1, h: 1 });
  useEffect(() => {
    zoneClampRef.current = {
      lock: productCategory === "polos",
      cx: guideCx, cy: guideCy, w: guideSize.wFrac, h: guideSize.hFrac,
    };
  });

  // ── Snap au centre de la zone avec taille standard ───────────────────────
  const handleSnapToZone = useCallback(() => {
    const cSize     = containerSizeRef.current || 480;
    const placement = view === "back" ? "dos" : "coeur";
    const [cx, cy]  = getProductZoneCenter(placement);
    const meta      = (productCategory ? GUIDE_META[productCategory] : null)?.[placement]
      ?? GUIDE_META_DEFAULT[placement];
    const defaultCm = meta.defaultCm;

    if (!selectedId) {
      // Aucun logo sélectionné → flash de feedback pour indiquer qu'il faut en choisir un
      setSnapFeedback(true);
      setTimeout(() => setSnapFeedback(false), 700);
      return;
    }

    const obj = objectsRef.current.find(o => o.id === selectedId);
    if (!obj) return;
    const nw       = obj.fabricState?.nw ?? 200;
    const newScale = (defaultCm * pxPerCm(cSize)) / Math.max(nw, 1);

    onObjectsChangeRef.current(
      objectsRef.current.map(o =>
        o.id !== selectedId ? o : {
          ...o,
          fabricState: { ...(o.fabricState ?? {}), cx, cy, scale: newScale, angle: 0 },
        }
      )
    );
    setCmInput(defaultCm.toFixed(1));
    setSnapFeedback(true);
    setTimeout(() => setSnapFeedback(false), 700);
  }, [selectedId, getProductZoneCenter, view, productCategory]);

  // ── exportPNG / exportComposed ───────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    exportPNG: () => {
      const SIZE = 1200;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE; canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";
      const cSize = containerSizeRef.current || 480;
      const ratio = SIZE / cSize;

      const shirtEl = containerRef.current?.querySelector<HTMLImageElement>(".studio-shirt-img");
      if (shirtEl?.complete && shirtEl.naturalWidth > 0) {
        const iw = shirtEl.naturalWidth, ih = shirtEl.naturalHeight;
        const s  = Math.min(cSize / iw, cSize / ih);
        const dw = iw * s, dh = ih * s;
        ctx.drawImage(shirtEl, (cSize - dw) / 2 * ratio, (cSize - dh) / 2 * ratio, dw * ratio, dh * ratio);
      }

      objectsRef.current.filter((o) => o.face === view).forEach((obj) => {
        const fs = obj.fabricState;
        if (!fs) return;
        const cx    = (fs.cx  ?? 0.5) * cSize * ratio;
        const cy    = (fs.cy  ?? 0.5) * cSize * ratio;
        const scale = (fs.scale ?? 1) * ratio;
        const angle = ((fs.angle ?? 0) * Math.PI) / 180;

        // ── Texte ──────────────────────────────────────────────────────────
        if (obj.type === "text") {
          const scaledSize = (obj.fontSize ?? 24) * scale;
          const weight  = obj.fontWeight  ?? "bold";
          const fStyle  = obj.fontStyle   ?? "normal";
          const lSpacing = (obj.letterSpacing ?? 0) * scale * ratio;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.font          = `${fStyle} ${weight} ${scaledSize}px "${obj.fontFamily ?? "Arial"}"`;
          ctx.fillStyle     = obj.color ?? "#000000";
          ctx.textAlign     = (obj.textAlign as CanvasTextAlign) ?? "center";
          ctx.textBaseline  = "middle";
          // Letter spacing : on dessine caractère par caractère
          if (lSpacing !== 0 && obj.text) {
            const chars = obj.text.split("");
            const widths = chars.map((c) => ctx.measureText(c).width);
            const total  = widths.reduce((a, b) => a + b, 0) + lSpacing * (chars.length - 1);
            let xOff = -total / 2;
            for (let i = 0; i < chars.length; i++) {
              ctx.fillText(chars[i], xOff + widths[i] / 2, 0);
              xOff += widths[i] + lSpacing;
            }
          } else {
            ctx.fillText(obj.text ?? "", 0, 0);
          }
          // Underline
          if (obj.textDecoration === "underline" && obj.text) {
            const tw = ctx.measureText(obj.text).width;
            ctx.fillRect(-tw / 2, scaledSize * 0.6, tw, Math.max(1, scaledSize * 0.07));
          }
          ctx.restore();
          return;
        }

        // ── Logo / Design ──────────────────────────────────────────────────
        if (obj.type !== "logo" && obj.type !== "design") return;
        const nw    = fs.nw   ?? 200;
        const nh    = fs.nh   ?? 200;
        const logoEl = containerRef.current?.querySelector<HTMLImageElement>(`[data-logo-id="${obj.id}"]`);
        if (!logoEl?.complete || !logoEl.naturalWidth) return;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.drawImage(logoEl, -(nw * scale) / 2, -(nh * scale) / 2, nw * scale, nh * scale);
        ctx.restore();
      });

      return canvas.toDataURL("image/png");
    },

    exportComposed: async () => {
      const SIZE = 600;

      const loadImg = (src: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload  = () => resolve(img);
          img.onerror = () => reject(new Error(`load failed: ${src}`));
          img.src = src;
        });

      const composeFace = async (face: "front" | "back"): Promise<string> => {
        const faceObjs = objectsRef.current.filter(
          (o) => o.face === face && (o.type === "logo" || o.type === "design" || o.type === "text")
        );
        if (faceObjs.length === 0) return "";

        const cSize = containerSizeRef.current || 480;
        const ratio = SIZE / cSize;

        const canvas2 = document.createElement("canvas");
        canvas2.width  = SIZE;
        canvas2.height = SIZE;
        const ctx2 = canvas2.getContext("2d");
        if (!ctx2) return "";

        // ── Shirt ──
        const slugKey = COLOR_TO_MOCKUP[colorId] ?? null;
        const mocks   = slugKey ? MOCKUP_FILES[slugKey] : null;
        const shirtUrl = face === "front"
          ? (packshot     ?? mocks?.front ?? "/mockups/tshirt/blanc-front.jpg")
          : (packshotBack ?? mocks?.back  ?? packshot ?? "/mockups/tshirt/blanc-back.png");

        try {
          const shirtImg = await loadImg(shirtUrl);
          const iw = shirtImg.naturalWidth, ih = shirtImg.naturalHeight;
          const s  = Math.min(cSize / iw, cSize / ih);
          const dw = iw * s, dh = ih * s;
          ctx2.drawImage(
            shirtImg,
            (cSize - dw) / 2 * ratio, (cSize - dh) / 2 * ratio,
            dw * ratio, dh * ratio
          );
        } catch { /* shirt not available — draw logos on transparent bg */ }

        // ── Logos, designs & textes ──
        for (const obj of faceObjs) {
          const fs = obj.fabricState;
          if (!fs) continue;

          const cx    = (fs.cx    ?? 0.5) * cSize * ratio;
          const cy    = (fs.cy    ?? 0.5) * cSize * ratio;
          const scale = (fs.scale ?? 1) * ratio;
          const angle = ((fs.angle ?? 0) * Math.PI) / 180;

          // ── Texte ──────────────────────────────────────────────────────
          if (obj.type === "text") {
            const scaledSize  = (obj.fontSize ?? 24) * scale;
            const weight2     = obj.fontWeight  ?? "bold";
            const fStyle2     = obj.fontStyle   ?? "normal";
            const lSpacing2   = (obj.letterSpacing ?? 0) * scale * ratio;
            ctx2.save();
            ctx2.translate(cx, cy);
            ctx2.rotate(angle);
            ctx2.font         = `${fStyle2} ${weight2} ${scaledSize}px "${obj.fontFamily ?? "Arial"}"`;
            ctx2.fillStyle    = obj.color ?? "#000000";
            ctx2.textAlign    = (obj.textAlign as CanvasTextAlign) ?? "center";
            ctx2.textBaseline = "middle";
            if (lSpacing2 !== 0 && obj.text) {
              const chars2  = obj.text.split("");
              const widths2 = chars2.map((c) => ctx2.measureText(c).width);
              const total2  = widths2.reduce((a, b) => a + b, 0) + lSpacing2 * (chars2.length - 1);
              let xOff2 = -total2 / 2;
              for (let i = 0; i < chars2.length; i++) {
                ctx2.fillText(chars2[i], xOff2 + widths2[i] / 2, 0);
                xOff2 += widths2[i] + lSpacing2;
              }
            } else {
              ctx2.fillText(obj.text ?? "", 0, 0);
            }
            if (obj.textDecoration === "underline" && obj.text) {
              const tw2 = ctx2.measureText(obj.text).width;
              ctx2.fillRect(-tw2 / 2, scaledSize * 0.6, tw2, Math.max(1, scaledSize * 0.07));
            }
            ctx2.restore();
            continue;
          }

          // ── Logo / Design ──────────────────────────────────────────────
          let blobUrl: string | null = null;
          let logoSrc: string;
          if (obj.file) {
            blobUrl  = URL.createObjectURL(obj.file);
            logoSrc  = blobUrl;
          } else if (obj.src) {
            logoSrc  = obj.src;
          } else continue;

          try {
            const logoImg = await loadImg(logoSrc);
            const nw    = fs.nw     ?? logoImg.naturalWidth;
            const nh    = fs.nh     ?? logoImg.naturalHeight;

            ctx2.save();
            ctx2.translate(cx, cy);
            ctx2.rotate(angle);
            ctx2.drawImage(logoImg, -(nw * scale) / 2, -(nh * scale) / 2, nw * scale, nh * scale);
            ctx2.restore();
          } catch { /* logo load failed — skip */ }
          finally { if (blobUrl) URL.revokeObjectURL(blobUrl); }
        }

        return canvas2.toDataURL("image/png");
      };

      const [front, back] = await Promise.all([
        composeFace("front"),
        composeFace("back"),
      ]);
      return { front, back };
    },

    getContainerSize: () => containerSizeRef.current || 0,
  }), [colorId, packshot, packshotBack]);

  // ── Drag state ───────────────────────────────────────────────────────────
  const dragRef = useRef({
    active: false, objId: "",
    startClientX: 0, startClientY: 0,
    startCx: 0, startCy: 0,
  });

  const handleLogoPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, obj: StudioObject) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      setSelectedId(obj.id);
      dragRef.current = {
        active: true, objId: obj.id,
        startClientX: e.clientX, startClientY: e.clientY,
        startCx: obj.fabricState?.cx ?? 0.5,
        startCy: obj.fabricState?.cy ?? 0.5,
      };
    }, [],
  );

  const handleLogoPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, obj: StudioObject) => {
      if (!dragRef.current.active || dragRef.current.objId !== obj.id) return;
      const cSize = containerSizeRef.current || 480;
      let newCx = dragRef.current.startCx + (e.clientX - dragRef.current.startClientX) / cSize;
      let newCy = dragRef.current.startCy + (e.clientY - dragRef.current.startClientY) / cSize;
      // Verrouillage zone (broderie polos) : le centre du logo reste dans la zone.
      const z = zoneClampRef.current;
      if (z.lock) {
        newCx = Math.min(Math.max(newCx, z.cx - z.w / 2), z.cx + z.w / 2);
        newCy = Math.min(Math.max(newCy, z.cy - z.h / 2), z.cy + z.h / 2);
      }
      onObjectsChangeRef.current(
        objectsRef.current.map((o) =>
          o.id !== obj.id ? o : { ...o, fabricState: { ...(o.fabricState ?? {}), cx: newCx, cy: newCy } }
        )
      );
    }, [],
  );

  const handleLogoDragEnd = useCallback(() => { dragRef.current.active = false; }, []);

  // ── Resize state (coin → distance au centre) ────────────────────────────
  const resizeRef = useRef({
    active: false, objId: "",
    centerViewX: 0, centerViewY: 0,
    startDist: 1, startScale: 1,
  });

  const handleCornerPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, obj: StudioObject) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      const rect  = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cSize = containerSizeRef.current || 480;
      const cx    = rect.left + (obj.fabricState?.cx ?? 0.5) * cSize;
      const cy    = rect.top  + (obj.fabricState?.cy ?? 0.5) * cSize;
      const dx    = e.clientX - cx;
      const dy    = e.clientY - cy;
      resizeRef.current = {
        active: true, objId: obj.id,
        centerViewX: cx, centerViewY: cy,
        startDist: Math.max(Math.sqrt(dx * dx + dy * dy), 1),
        startScale: obj.fabricState?.scale ?? 1,
      };
    }, [],
  );

  const handleCornerPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, obj: StudioObject) => {
      const r = resizeRef.current;
      if (!r.active || r.objId !== obj.id) return;
      const dx   = e.clientX - r.centerViewX;
      const dy   = e.clientY - r.centerViewY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let newScale = Math.max(0.04, r.startScale * (dist / r.startDist));
      // Verrouillage zone (broderie polos) : la taille du logo ne dépasse pas la zone.
      const z = zoneClampRef.current;
      if (z.lock) {
        const cSize = containerSizeRef.current || 480;
        const nw = obj.fabricState?.nw ?? 200;
        const maxScale = (z.w * cSize) / Math.max(nw, 1);
        newScale = Math.min(newScale, maxScale);
      }
      onObjectsChangeRef.current(
        objectsRef.current.map((o) =>
          o.id !== obj.id ? o : { ...o, fabricState: { ...(o.fabricState ?? {}), scale: newScale } }
        )
      );
    }, [],
  );

  const handleCornerEnd = useCallback(() => { resizeRef.current.active = false; }, []);

  // ── Initialisation fabricState au onLoad de l'image ─────────────────────
  // Taille par défaut : 11 cm pour le cœur (face), 21 cm pour le dos.
  // On utilise obj.face (pas view) pour éviter le bug de placement si
  // l'utilisateur bascule face/dos pendant le chargement de l'image.
  const initFabricState = useCallback(
    (obj: StudioObject, nw: number, nh: number) => {
      if (obj.fabricState?.cx !== undefined) return;
      const cSize = containerSizeRef.current || 480;

      // Résoudre la zone cible en fonction de la FACE de l'objet, pas de la vue courante
      const [cx, cy] = getProductZoneCenter(obj.face === "back" ? "dos" : "coeur");

      // Tailles par défaut calées sur les specs Printful DTG/DTF
      const defaultCm = obj.face === "back" ? 21 : 10;
      const scale     = (defaultCm * pxPerCm(cSize)) / Math.max(nw, 1);
      onObjectsChangeRef.current(
        objectsRef.current.map((o) =>
          o.id !== obj.id ? o : {
            ...o,
            fabricState: { cx, cy, scale, angle: 0, nw, nh,
              left: cx * cSize - (nw * scale) / 2, top: cy * cSize - (nh * scale) / 2,
              scaleX: scale, scaleY: scale, width: nw, height: nh },
          }
        )
      );
    },
    [getProductZoneCenter],
  );

  // ── Helpers toolbar ───────────────────────────────────────────────────────
  const applyToSelected = useCallback(
    (fn: (fs: Record<string, number>) => Record<string, number>) => {
      if (!selectedId) return;
      onObjectsChangeRef.current(
        objectsRef.current.map((o) =>
          o.id !== selectedId ? o : { ...o, fabricState: fn({ ...(o.fabricState ?? {}) }) }
        )
      );
    }, [selectedId],
  );

  const handleScaleUp    = () => applyToSelected((fs) => ({ ...fs, scale: (fs.scale ?? 1) * 1.12 }));
  const handleScaleDown  = () => applyToSelected((fs) => ({ ...fs, scale: (fs.scale ?? 1) * 0.88 }));
  const handleRotLeft    = () => applyToSelected((fs) => ({ ...fs, angle: (fs.angle ?? 0) - 15 }));
  const handleRotRight   = () => applyToSelected((fs) => ({ ...fs, angle: (fs.angle ?? 0) + 15 }));

  const handleCenter = useCallback(() => {
    if (!selectedId) return;
    const [cx, cy] = getZoneCenter();
    applyToSelected((fs) => ({ ...fs, cx, cy }));
  }, [selectedId, getZoneCenter, applyToSelected]);

  const handleDelete = () => {
    if (!selectedId) return;
    onObjectsChangeRef.current(objectsRef.current.filter((o) => o.id !== selectedId));
    setSelectedId(null);
  };

  const handleDuplicate = () => {
    if (!selectedId) return;
    const orig = objectsRef.current.find((o) => o.id === selectedId);
    if (!orig) return;
    onObjectsChangeRef.current([
      ...objectsRef.current,
      { ...orig, id: `${orig.id}-copy-${Date.now()}`, label: `${orig.label} (copie)`,
        fabricState: orig.fabricState
          ? { ...orig.fabricState, cx: (orig.fabricState.cx ?? 0.5) + 0.04, cy: (orig.fabricState.cy ?? 0.5) + 0.04 }
          : undefined },
    ]);
  };

  // ── Set taille précise en cm ──────────────────────────────────────────────
  const applyWidthCm = useCallback(
    (cm: number) => {
      if (!selectedId || cm <= 0) return;
      const cSize = containerSizeRef.current || 480;
      const pcm   = pxPerCm(cSize);
      const obj   = objectsRef.current.find((o) => o.id === selectedId);
      if (!obj) return;
      const nw    = obj.fabricState?.nw ?? 200;
      const newScale = (cm * pcm) / Math.max(nw, 1);
      applyToSelected((fs) => ({ ...fs, scale: newScale }));
    },
    [selectedId, applyToSelected],
  );

  // Calcul cm affiché pour l'objet sélectionné
  const selectedObj  = objects.find((o) => o.id === selectedId);
  const logoWidthCm  = (() => {
    if (!selectedObj || !containerSize) return null;
    const fs  = selectedObj.fabricState;
    if (!fs)  return null;
    const nw  = fs.nw   ?? 0;
    const sc  = fs.scale ?? 1;
    if (!nw)  return null;
    return (nw * sc) / pxPerCm(containerSize);
  })();

  // Sync cmInput quand sélection change
  useEffect(() => {
    if (logoWidthCm !== null) setCmInput(logoWidthCm.toFixed(1));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // ── Init automatique des objets texte (pas d'onLoad image) ──────────────
  useEffect(() => {
    const textUninit = objects.filter(
      (o) => o.type === "text" && o.fabricState?.cx === undefined
    );
    if (textUninit.length === 0) return;
    onObjectsChangeRef.current(
      objects.map((o) => {
        if (o.type !== "text" || o.fabricState?.cx !== undefined) return o;
        const [cx, cy] = getProductZoneCenter(o.face === "back" ? "dos" : "coeur");
        return { ...o, fabricState: { cx, cy, scale: 1, angle: 0, nw: 0, nh: 0 } };
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objects.length, productCategory]);

  // ── Objets de la face courante ───────────────────────────────────────────
  const faceObjects = objects.filter((o) => o.face === view);

  // ── Coins de resize : configs ─────────────────────────────────────────────
  const CORNERS = [
    { pos: "top-[-7px] left-[-7px]",   cursor: "nwse-resize" },
    { pos: "top-[-7px] right-[-7px]",  cursor: "nesw-resize" },
    { pos: "bottom-[-7px] left-[-7px]",  cursor: "nesw-resize" },
    { pos: "bottom-[-7px] right-[-7px]", cursor: "nwse-resize" },
  ] as const;

  // ── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">

      {/* ── Canvas visuel ────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-[28px] border border-[var(--hm-line)] bg-white shadow-[0_20px_48px_rgba(63,45,88,0.08)] select-none"
        style={{ aspectRatio: "1 / 1" }}
        onClick={() => setSelectedId(null)}
      >
        {/* Shirt */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={proxyCdnUrl(shirtSrc) ?? shirtSrc}
          alt="Mockup vêtement"
          className="studio-shirt-img pointer-events-none absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />

        {/* ── Zone de guidage visuelle (pointillés cliquables) ──────────── */}
        {showGuide && (
          <div
            className="absolute z-[5] flex flex-col items-center justify-start overflow-hidden"
            style={{
              left:      `${(guideCx - guideZone.wFrac / 2) * 100}%`,
              top:       `${(guideCy - guideZone.hFrac / 2) * 100}%`,
              width:     `${guideZone.wFrac * 100}%`,
              height:    `${guideZone.hFrac * 100}%`,
              border:    snapFeedback
                ? "2px solid rgba(34,197,94,0.9)"
                : "2px dashed rgba(177,63,116,0.45)",
              borderRadius: "6px",
              cursor:    selectedId ? "crosshair" : "default",
              transition: "border-color 0.15s",
              background: snapFeedback ? "rgba(34,197,94,0.07)" : "transparent",
            }}
            onClick={(e) => { e.stopPropagation(); handleSnapToZone(); }}
          >
            {/* Label en haut de la zone */}
            <div
              className="mt-1 flex items-center gap-1 rounded-full px-2 py-0.5"
              style={{
                background:  "rgba(177,63,116,0.12)",
                backdropFilter: "blur(4px)",
                border:      "1px solid rgba(177,63,116,0.25)",
                pointerEvents: "none",
              }}
            >
              <span className="text-[8px] font-bold tracking-wider" style={{ color: "#b13f74" }}>
                {snapFeedback ? "✓ Placé !" : guideZone.label}
              </span>
            </div>

            {/* Crosshair central */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
              <div className="absolute h-px w-4 bg-[#b13f74]" />
              <div className="absolute h-4 w-px bg-[#b13f74]" />
            </div>

            {/* Bouton snap (coin bas droit) — visible si logo sélectionné */}
            {selectedId && !snapFeedback && (
              <div
                className="absolute bottom-1 right-1 rounded-full px-1.5 py-0.5"
                style={{
                  background: "rgba(177,63,116,0.85)",
                  pointerEvents: "none",
                }}
              >
                <span className="text-[7px] font-bold text-white">Cliquer pour centrer</span>
              </div>
            )}
          </div>
        )}

        {/* Logos, designs et textes */}
        {faceObjects.map((obj) => {
          const fs    = obj.fabricState;
          const cx    = fs?.cx    ?? 0.5;
          const cy    = fs?.cy    ?? 0.5;
          const scale = fs?.scale ?? 1;
          const angle = fs?.angle ?? 0;
          const isSel = selectedId === obj.id;

          // React 19 / Next 16 : `key` ne peut PAS être passé via spread.
          // On le sépare des autres props et on le passe directement sur <div key={obj.id} ...>.
          const sharedWrapperProps = {
            onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => handleLogoPointerDown(e, obj),
            onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => handleLogoPointerMove(e, obj),
            onPointerUp: handleLogoDragEnd,
            onPointerCancel: handleLogoDragEnd,
            onClick: (e: React.MouseEvent) => { e.stopPropagation(); setSelectedId(obj.id); },
          };

          // ── Texte ──────────────────────────────────────────────────
          if (obj.type === "text") {
            const scaledSize = (obj.fontSize ?? 24) * scale;
            return (
              <div
                key={obj.id}
                {...sharedWrapperProps}
                className="absolute"
                style={{
                  left:         `${cx * 100}%`,
                  top:          `${cy * 100}%`,
                  transform:    `translate(-50%, -50%) rotate(${angle}deg)`,
                  cursor:       "grab",
                  touchAction:  "none",
                  zIndex:       isSel ? 20 : 10,
                  padding:      "3px 7px",
                  borderRadius: "5px",
                  // Toujours visible : contour pointillé rose quand non-sélectionné,
                  // plein quand sélectionné
                  border: isSel
                    ? "2px solid #b13f74"
                    : "1.5px dashed rgba(177,63,116,0.55)",
                  boxShadow: isSel
                    ? "0 0 0 3px rgba(177,63,116,0.15)"
                    : "none",
                  // Fond semi-transparent de prévisualisation (PAS dans l'export canvas)
                  background: isSel
                    ? "rgba(177,63,116,0.08)"
                    : "rgba(0,0,0,0.10)",
                }}
              >
                {/* Rendu texte */}
                <span
                  data-text-id={obj.id}
                  className="pointer-events-none block whitespace-nowrap leading-tight select-none"
                  style={{
                    fontFamily:      obj.fontFamily ?? "Arial",
                    fontSize:        `${scaledSize}px`,
                    color:           obj.color ?? "#FFFFFF",
                    fontWeight:      obj.fontWeight ?? "bold",
                    fontStyle:       obj.fontStyle ?? "normal",
                    textDecoration:  obj.textDecoration === "underline" ? "underline" : "none",
                    textAlign:       obj.textAlign ?? "center",
                    letterSpacing:   obj.letterSpacing ? `${obj.letterSpacing * scale}px` : undefined,
                    lineHeight: 1.2,
                    textShadow: "0 1px 3px rgba(0,0,0,0.45)",
                  }}
                >
                  {obj.text}
                </span>
                {/* Coins de resize — visibles uniquement quand sélectionné */}
                {isSel && CORNERS.map(({ pos, cursor }, i) => (
                  <div
                    key={i}
                    className={`absolute ${pos} z-30 h-4 w-4 rounded-full border-2 border-white bg-[#b13f74] shadow-md`}
                    style={{ cursor, touchAction: "none" }}
                    onPointerDown={(e) => handleCornerPointerDown(e, obj)}
                    onPointerMove={(e) => handleCornerPointerMove(e, obj)}
                    onPointerUp={handleCornerEnd}
                    onPointerCancel={handleCornerEnd}
                  />
                ))}
              </div>
            );
          }

          // ── Logo / Design ──────────────────────────────────────────
          if (obj.type !== "logo" && obj.type !== "design") return null;
          const imgSrc = obj.file ? URL.createObjectURL(obj.file) : (obj.src ?? "");
          const nw     = fs?.nw ?? 0;
          const nh     = fs?.nh ?? 0;
          const visW   = nw > 0 ? nw * scale : undefined;
          const visH   = nh > 0 ? nh * scale : undefined;

          return (
            <div
              key={obj.id}
              {...sharedWrapperProps}
              className="absolute"
              style={{
                left:        `${cx * 100}%`,
                top:         `${cy * 100}%`,
                width:       visW !== undefined ? `${visW}px` : "22%",
                height:      visH !== undefined ? `${visH}px` : undefined,
                transform:   `translate(-50%, -50%) rotate(${angle}deg)`,
                cursor:      "grab",
                touchAction: "none",
                zIndex:      isSel ? 20 : 10,
              }}
            >
              {/* Bordure sélection */}
              {isSel && (
                <div className="pointer-events-none absolute inset-0 border-2 border-[#b13f74] shadow-[0_0_0_2px_rgba(177,63,116,0.15)]" />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt={obj.label}
                data-logo-id={obj.id}
                draggable={false}
                className="pointer-events-none block h-auto max-h-full max-w-full"
                style={{ width: visW !== undefined ? "100%" : undefined, objectFit: "contain" }}
                onLoad={(e) => initFabricState(obj, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
              />
              {/* Coins de resize */}
              {isSel && CORNERS.map(({ pos, cursor }, i) => (
                <div
                  key={i}
                  className={`absolute ${pos} z-30 h-4 w-4 rounded-full border-2 border-white bg-[#b13f74] shadow-md`}
                  style={{ cursor, touchAction: "none" }}
                  onPointerDown={(e) => handleCornerPointerDown(e, obj)}
                  onPointerMove={(e) => handleCornerPointerMove(e, obj)}
                  onPointerUp={handleCornerEnd}
                  onPointerCancel={handleCornerEnd}
                />
              ))}
            </div>
          );
        })}

        {/* Hints */}
        {faceObjects.length > 0 && !selectedId && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--hm-line)] bg-white/90 px-3 py-1 text-[10px] font-semibold text-[var(--hm-text-soft)]">
            Cliquez l&apos;élément · glissez · coins pour redimensionner
          </div>
        )}
        {faceObjects.length === 0 && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--hm-line)] bg-white/90 px-3 py-1 text-[10px] font-semibold text-[var(--hm-text-soft)]">
            Aperçu indicatif · rendu final validé avant lancement
          </div>
        )}
      </div>

      {/* ── Panneau contrôles ─────────────────────────────────────────── */}
      {selectedId ? (
        <div className="rounded-2xl border border-[var(--hm-primary)]/30 bg-[var(--hm-accent-soft-rose)] p-3">
          <p className="mb-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--hm-primary)]">
            Contrôles du logo
          </p>

          <div className="flex flex-col gap-2">
            {/* ── Taille précise en cm ── */}
            <div className="rounded-xl border border-[var(--hm-primary)]/20 bg-white px-3 py-2">
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
                Taille réelle (largeur)
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1" max="40" step="0.5"
                  value={cmInput}
                  onChange={(e) => setCmInput(e.target.value)}
                  onBlur={() => {
                    const v = parseFloat(cmInput);
                    if (!isNaN(v) && v > 0) applyWidthCm(v);
                    else if (logoWidthCm !== null) setCmInput(logoWidthCm.toFixed(1));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const v = parseFloat(cmInput);
                      if (!isNaN(v) && v > 0) applyWidthCm(v);
                    }
                  }}
                  className="w-20 rounded-lg border border-[var(--hm-line)] bg-white px-2 py-1.5 text-center text-sm font-bold text-[var(--hm-text)] focus:border-[var(--hm-primary)] focus:outline-none"
                />
                <span className="text-sm font-semibold text-[var(--hm-text-soft)]">cm</span>
                <div className="ml-auto flex gap-1.5">
                  {/* Presets adaptatifs face/dos basés sur les specs Printful */}
                  {(view === "back"
                    ? [{ label: "15cm", cm: 15 }, { label: "21cm", cm: 21 }, { label: "28cm ↔", cm: 28 }]
                    : [{ label: "8cm",  cm: 8  }, { label: "10cm ♥", cm: 10 }, { label: "11cm",  cm: 11 }]
                  ).map(({ label, cm }) => (
                    <button
                      key={cm}
                      type="button"
                      onClick={() => { applyWidthCm(cm); setCmInput(cm.toFixed(1)); }}
                      className={`rounded-lg border px-2 py-1 text-[9px] font-bold transition active:scale-95 ${
                        Math.abs((logoWidthCm ?? 0) - cm) < 0.3
                          ? "border-[var(--hm-primary)] bg-[var(--hm-primary)] text-white"
                          : "border-[var(--hm-line)] bg-[var(--hm-surface)] text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {logoWidthCm !== null && (
                <p className="mt-1 text-[9px] text-[var(--hm-text-soft)]">
                  Taille actuelle ≈ <strong>{logoWidthCm.toFixed(1)} cm</strong>
                  {view === "back"
                    ? " · max 28 cm de large"
                    : " · max 10 cm · standard = 10–11 cm"}
                </p>
              )}
            </div>

            {/* ── Taille rapide + Rotation ── */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-center text-[9px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">Taille rapide</span>
                <div className="flex gap-1">
                  <button type="button" onClick={handleScaleDown}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-[var(--hm-line)] bg-white py-2.5 text-[11px] font-bold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)] hover:bg-[var(--hm-primary)] hover:text-white active:scale-95">
                    <ZoomOut size={14} /> −
                  </button>
                  <button type="button" onClick={handleScaleUp}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-[var(--hm-line)] bg-white py-2.5 text-[11px] font-bold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)] hover:bg-[var(--hm-primary)] hover:text-white active:scale-95">
                    <ZoomIn size={14} /> +
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-center text-[9px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">Rotation</span>
                <div className="flex gap-1">
                  <button type="button" onClick={handleRotLeft}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-[var(--hm-line)] bg-white py-2.5 font-bold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)] hover:bg-[var(--hm-primary)] hover:text-white active:scale-95">
                    <RotateCcw size={14} />
                  </button>
                  <button type="button" onClick={handleRotRight}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-[var(--hm-line)] bg-white py-2.5 font-bold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)] hover:bg-[var(--hm-primary)] hover:text-white active:scale-95">
                    <RotateCw size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Snap zone + Centrer ── */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSnapToZone}
                className={`flex items-center justify-center gap-1 rounded-xl border py-2 text-[10px] font-bold transition active:scale-95 ${
                  snapFeedback
                    ? "border-green-400 bg-green-50 text-green-700"
                    : "border-[var(--hm-primary)]/40 bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)] hover:bg-[var(--hm-primary)] hover:text-white"
                }`}
              >
                {snapFeedback ? "✓ Placé !" : <><Crosshair size={12} /> {view === "back" ? "Centrer dos" : "♥ Centrer cœur"}</>}
              </button>
              <button type="button" onClick={handleCenter}
                className="flex items-center justify-center gap-1 rounded-xl border border-[var(--hm-line)] bg-white py-2 text-[10px] font-semibold text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)] active:scale-95">
                <Crosshair size={12} /> Centrer libre
              </button>
            </div>

            {/* ── Dupliquer, Supprimer ── */}
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={handleDuplicate}
                className="flex items-center justify-center gap-1 rounded-xl border border-[var(--hm-line)] bg-white py-2 text-[10px] font-semibold text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)] active:scale-95">
                <Copy size={12} /> Dupliquer
              </button>
              <button type="button" onClick={handleDelete}
                className="flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-white py-2 text-[10px] font-semibold text-red-500 transition hover:bg-red-500 hover:text-white active:scale-95">
                <Trash2 size={12} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      ) : (
        faceObjects.length > 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--hm-line)] bg-[var(--hm-surface)] p-3 text-center">
            <p className="text-[11px] text-[var(--hm-text-soft)]">
              👆 Cliquez le logo pour afficher les contrôles
            </p>
          </div>
        )
      )}

      {/* ── Vue selector style PrintOclock (miniatures) + toggle guide ──
            Boutons CŒUR (front) / DOS (back) filtrés selon product.placements :
              - placements contient "coeur" ou "coeur-dos" → bouton front affiché
              - placements contient "dos" ou "coeur-dos" → bouton back affiché
              - placements absent (rétrocompat) → les 2 boutons affichés
            Évite d'afficher un bouton dos cassé pour les produits sans image dos
            dédiée (ex. WG004 stock agence avec placements=["coeur"] uniquement
            → fallback Studio renverrait un t-shirt noir générique trompeur). */}
      <div className="flex items-end gap-2">
        {([
          {
            v:     "front" as const,
            label: "FACE",
            img:   packshot ?? mockups?.front ?? "/mockups/tshirt/blanc-front.jpg",
            show:  !placements || placements.some((p) => p === "coeur" || p === "coeur-dos"),
          },
          {
            v:     "back" as const,
            label: "DOS",
            img:   packshotBack ?? mockups?.back ?? packshot ?? "/mockups/tshirt/blanc-back.png",
            show:  !placements || placements.some((p) => p === "dos" || p === "coeur-dos"),
          },
        ]).filter(({ show }) => show).map(({ v, label, img }) => (
          <button
            key={v}
            type="button"
            onClick={() => { setView(v); onViewChange?.(v); }}
            className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 px-2 pb-2 pt-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
              view === v
                ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)] shadow-[0_4px_12px_rgba(177,63,116,0.14)]"
                : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40 hover:bg-[var(--hm-surface)]"
            }`}
          >
            {/* Miniature t-shirt */}
            <div className="h-14 w-14 overflow-hidden rounded-lg bg-[#f4f3f1]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={label}
                className="h-full w-full object-contain"
              />
            </div>
            {label}
          </button>
        ))}

        {/* Toggle guide zone */}
        <button
          type="button"
          title={showGuide ? "Masquer la zone de guidage" : "Afficher la zone de guidage"}
          onClick={() => setShowGuide(s => !s)}
          className={`flex h-[78px] w-[42px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border text-[9px] font-semibold transition ${
            showGuide
              ? "border-[var(--hm-primary)]/40 bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
              : "border-[var(--hm-line)] bg-white text-[var(--hm-text-muted)]"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.5 1.5">
            <rect x="2" y="2" width="12" height="12" rx="1.5" />
          </svg>
          Zone
        </button>
      </div>
    </div>
  );
});

export default StudioCanvas;
