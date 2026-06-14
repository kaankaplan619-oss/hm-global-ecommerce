"use client";

import { useRef, useState } from "react";
import { Upload, Type, Sparkles, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { EFFECT_OPTIONS } from "@/lib/color-utils";
import { useT } from "@/components/i18n/I18nProvider";
import type { StudioObject } from "./StudioCanvas";

const FONT_OPTIONS = [
  { value: "Arial",           label: "Arial" },
  { value: "Georgia",         label: "Georgia" },
  { value: "Courier New",     label: "Courier New" },
  { value: "Impact",          label: "Impact" },
  { value: "Trebuchet MS",    label: "Trebuchet MS" },
  { value: "Times New Roman", label: "Times New Roman" },
];

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 60, 72];

const COLOR_PRESETS = [
  "#000000", "#FFFFFF", "#b13f74", "#2563EB", "#DC2626", "#166534",
];

const DESIGNS = [
  "star", "football", "crown", "arrow-right",
  "heart", "lightning", "diamond", "shield",
  "circle", "triangle", "cross", "infinity",
] as const;

const DESIGN_LABEL_KEYS: Record<string, string> = {
  "star": "studioTools.design.star", "football": "studioTools.design.football", "crown": "studioTools.design.crown",
  "arrow-right": "studioTools.design.arrow", "heart": "studioTools.design.heart", "lightning": "studioTools.design.lightning",
  "diamond": "studioTools.design.diamond", "shield": "studioTools.design.shield", "circle": "studioTools.design.circle",
  "triangle": "studioTools.design.triangle", "cross": "studioTools.design.cross", "infinity": "studioTools.design.infinity",
};

type Face = "front" | "back";

interface Props {
  face: Face;
  onAddObject: (obj: StudioObject) => void;
  /** True quand un logo existe déjà sur cette face → change le label du bouton */
  hasLogo?: boolean;
}

export default function StudioToolsPanel({ face, onAddObject, hasLogo }: Props) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"logo" | "text" | "design" | "qr">("logo");

  // ── QR Code state ─────────────────────────────────────────────────────────
  const [qrUrl,          setQrUrl]          = useState("https://");
  const [qrFgColor,      setQrFgColor]      = useState("#000000");
  const [qrBgColor,      setQrBgColor]      = useState("#FFFFFF");
  const [qrTransparent,  setQrTransparent]  = useState(false);
  const [qrSize,         setQrSize]         = useState(200);
  const [qrGenerating,   setQrGenerating]   = useState(false);
  const [qrPreview,      setQrPreview]      = useState<string | null>(null);
  const [qrError,        setQrError]        = useState<string | null>(null);

  // ── Text state ────────────────────────────────────────────────────────────
  const [textValue,      setTextValue]      = useState("");
  const [fontFamily,     setFontFamily]     = useState("Arial");
  const [fontSize,       setFontSize]       = useState(24);
  const [textColor,      setTextColor]      = useState("#FFFFFF");
  const [fontWeight,     setFontWeight]     = useState<"normal" | "bold">("bold");
  const [fontStyle,      setFontStyle]      = useState<"normal" | "italic">("normal");
  const [textDecoration, setTextDecoration] = useState<"none" | "underline">("none");
  const [textAlign,      setTextAlign]      = useState<"left" | "center" | "right">("center");
  const [letterSpacing,  setLetterSpacing]  = useState(0);
  const [hexInput,    setHexInput]    = useState("#FFFFFF");
  // ── Logo state ────────────────────────────────────────────────────────────
  const [logoWarning, setLogoWarning] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoWarning(null);

    const isJpeg = file.type === "image/jpeg" || file.type === "image/jpg";

    // JPEG → toujours un fond opaque, avertissement immédiat
    if (isJpeg) {
      setLogoWarning(t("studioTools.logo.jpegWarning"));
    }

    // Check dimensions (PNG + JPEG)
    if (file.type === "image/png" || isJpeg) {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        if (img.naturalWidth < 300 || img.naturalHeight < 300) {
          const dimWarning = `${t("studioTools.logo.lowResPrefix")} (${img.naturalWidth}×${img.naturalHeight}px). ${t("studioTools.logo.lowResSuffix")}`;
          setLogoWarning((prev) => prev ? `${prev}\n${dimWarning}` : dimWarning);
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }

    onAddObject({
      id: `logo-${Date.now()}`,
      type: "logo",
      file,
      label: file.name,
      face,
    });
    // Reset input so same file can be re-uploaded
    e.target.value = "";
  };

  const handleAddText = () => {
    if (!textValue.trim()) return;
    onAddObject({
      id: `text-${Date.now()}`,
      type: "text",
      text: textValue.trim(),
      fontFamily,
      fontSize,
      color:         textColor,
      fontWeight,
      fontStyle,
      textDecoration,
      textAlign,
      letterSpacing,
      label: textValue.trim().slice(0, 20),
      face,
    });
    setTextValue("");
  };

  const handleAddDesign = (name: string) => {
    onAddObject({
      id: `design-${name}-${Date.now()}`,
      type: "design",
      src: `/designs/${name}.svg`,
      label: DESIGN_LABEL_KEYS[name] ? t(DESIGN_LABEL_KEYS[name]) : name,
      face,
    });
  };

  // ── QR Code helpers ───────────────────────────────────────────────────────
  const generateQR = async () => {
    const trimmed = qrUrl.trim();
    if (!trimmed || trimmed === "https://") {
      setQrError(t("studioTools.qr.errorEmpty"));
      return;
    }
    setQrError(null);
    setQrGenerating(true);
    try {
      const dataUrl = await QRCode.toDataURL(trimmed, {
        width: qrSize,
        margin: 1,
        color: {
          dark:  qrFgColor,
          light: qrTransparent ? "#00000000" : qrBgColor,
        },
        errorCorrectionLevel: "H",
      });
      setQrPreview(dataUrl);
    } catch {
      setQrError(t("studioTools.qr.errorGenerate"));
    } finally {
      setQrGenerating(false);
    }
  };

  const handleAddQR = () => {
    if (!qrPreview) return;
    onAddObject({
      id: `qr-${Date.now()}`,
      type: "logo",          // réutilise le rendu image existant
      src: qrPreview,        // data URL PNG
      label: "QR Code",
      face,
    });
    setQrPreview(null);
  };

  const tabs = [
    { id: "logo"    as const, label: t("studioTools.tab.logo"),   icon: <Upload size={16} /> },
    { id: "text"    as const, label: t("studioTools.tab.text"),   icon: <Type size={16} /> },
    { id: "design"  as const, label: t("studioTools.tab.designs"), icon: <Sparkles size={16} /> },
    { id: "qr"      as const, label: t("studioTools.tab.qr"),     icon: <QrCode size={16} /> },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* ── Input fichier — toujours dans le DOM (sr-only) pour iOS Safari ────── */}
      <input
        id="studio-logo-input"
        ref={fileInputRef}
        type="file"
        accept="image/png,image/svg+xml,image/jpeg,image/jpg"
        className="sr-only"
        onChange={handleFileChange}
      />

      {/* ── Tab bar 2×2 ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-[var(--hm-line)] bg-[var(--hm-bg)] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2.5 text-[11px] font-semibold transition-all
              ${activeTab === tab.id
                ? "bg-white text-[var(--hm-primary)] shadow-sm"
                : "text-[var(--hm-text-soft)] hover:bg-white/60 hover:text-[var(--hm-text)]"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Logo panel ───────────────────────────────────────────────────────── */}
      {activeTab === "logo" && (
        <div className="flex flex-col gap-4">
          {/* Label native file-input trigger — le plus fiable sur iOS/Android/desktop */}
          <label
            htmlFor="studio-logo-input"
            className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[var(--hm-line)] bg-[var(--hm-bg)] px-4 py-6 text-center transition hover:border-[var(--hm-primary)] hover:bg-[var(--hm-accent-soft-rose)]"
          >
            <Upload size={24} className="text-[var(--hm-primary)]" />
            <span className="text-sm font-semibold text-[var(--hm-text)]">
              {hasLogo ? t("studioTools.logo.replace") : t("studioTools.logo.import")}
            </span>
            <span className="text-xs text-[var(--hm-text-soft)]">
              {t("studioTools.logo.formats")}
            </span>
          </label>

          {/* Alerte dynamique (JPEG, résolution faible, etc.) */}
          {logoWarning && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-[11px] leading-snug text-amber-800">
              {logoWarning.split("\n").map((line, i) => (
                <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p>
              ))}
            </div>
          )}

          {/* Guide format */}
          <div className="rounded-xl border border-[var(--hm-line)] bg-[var(--hm-bg)] p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">{t("studioTools.logo.recommendedFormat")}</p>
            <div className="flex flex-col gap-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-8 items-center justify-center rounded bg-green-100 text-[9px] font-bold text-green-700">SVG</span>
                <span className="text-[var(--hm-text)]">{t("studioTools.logo.svgDesc")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-8 items-center justify-center rounded bg-blue-100 text-[9px] font-bold text-blue-700">PNG</span>
                <span className="text-[var(--hm-text)]">{t("studioTools.logo.pngDesc")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-8 items-center justify-center rounded bg-red-100 text-[9px] font-bold text-red-600">JPG</span>
                <span className="text-[var(--hm-text-soft)]">{t("studioTools.logo.jpgDesc")}</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-[var(--hm-text-muted)]">
            {t("studioTools.logo.embroideryTip")}
          </p>

          {/* Logo effects section */}
          <div className="border-t border-[var(--hm-line)] pt-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
              {t("studioTools.logo.readabilityTitle")}
            </p>
            <div className="flex flex-col gap-2">
              {EFFECT_OPTIONS.map(({ value, label }) => (
                <div key={value} className="flex items-center gap-2 rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2 text-xs text-[var(--hm-text-soft)]">
                  <span className="font-medium">{label}</span>
                  <span className="ml-auto text-[10px] text-[var(--hm-text-muted)]">
                    {value === "none" && t("studioTools.logo.effectNone")}
                    {value === "white-outline" && t("studioTools.logo.effectOutline")}
                    {value === "white-bg" && t("studioTools.logo.effectBg")}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-[var(--hm-text-muted)]">
              {t("studioTools.logo.effectsAvailability")}
            </p>
          </div>
        </div>
      )}

      {/* ── Text panel ───────────────────────────────────────────────────────── */}
      {activeTab === "text" && (
        <div className="flex flex-col gap-3">

          {/* ── Texte ─────────────────────────────────────────────────── */}
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder={t("studioTools.text.placeholder")}
            rows={2}
            className="w-full resize-none rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2 text-sm text-[var(--hm-text)] placeholder:text-[var(--hm-text-muted)] focus:border-[var(--hm-primary)] focus:outline-none"
          />

          {/* ── Police + Taille ───────────────────────────────────────── */}
          <div className="flex gap-2">
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="flex-1 min-w-0 rounded-xl border border-[var(--hm-line)] bg-white px-2 py-2 text-xs text-[var(--hm-text)] focus:border-[var(--hm-primary)] focus:outline-none"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-20 shrink-0 rounded-xl border border-[var(--hm-line)] bg-white px-2 py-2 text-xs text-[var(--hm-text)] focus:border-[var(--hm-primary)] focus:outline-none"
            >
              {FONT_SIZES.map((s) => (
                <option key={s} value={s}>{s} px</option>
              ))}
            </select>
          </div>

          {/* ── Gras / Italique / Souligné + Alignement ───────────────── */}
          <div className="flex gap-1.5">
            {/* Gras */}
            <button
              type="button"
              onClick={() => setFontWeight(w => w === "bold" ? "normal" : "bold")}
              title={t("studioTools.text.bold")}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold transition ${
                fontWeight === "bold"
                  ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
                  : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
              }`}
            >
              <Bold size={14} />
            </button>
            {/* Italique */}
            <button
              type="button"
              onClick={() => setFontStyle(s => s === "italic" ? "normal" : "italic")}
              title={t("studioTools.text.italic")}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                fontStyle === "italic"
                  ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
                  : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
              }`}
            >
              <Italic size={14} />
            </button>
            {/* Souligné */}
            <button
              type="button"
              onClick={() => setTextDecoration(d => d === "underline" ? "none" : "underline")}
              title={t("studioTools.text.underline")}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                textDecoration === "underline"
                  ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
                  : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
              }`}
            >
              <Underline size={14} />
            </button>
            {/* Séparateur */}
            <div className="mx-0.5 w-px self-stretch bg-[var(--hm-line)]" />
            {/* Alignement */}
            {([
              { align: "left"   as const, Icon: AlignLeft   },
              { align: "center" as const, Icon: AlignCenter },
              { align: "right"  as const, Icon: AlignRight  },
            ]).map(({ align, Icon }) => (
              <button
                key={align}
                type="button"
                onClick={() => setTextAlign(align)}
                title={align === "left" ? t("studioTools.text.alignLeft") : align === "center" ? t("studioTools.text.alignCenter") : t("studioTools.text.alignRight")}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                  textAlign === align
                    ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
                    : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
                }`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>

          {/* ── Espacement lettres ────────────────────────────────────── */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
                {t("studioTools.text.letterSpacing")}
              </span>
              <span className="text-[10px] font-mono text-[var(--hm-text-soft)]">{letterSpacing} px</span>
            </div>
            <input
              type="range"
              min={-3}
              max={20}
              step={0.5}
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
              className="w-full accent-[var(--hm-primary)]"
            />
          </div>

          {/* ── Couleur ───────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
              {t("studioTools.text.color")}
            </span>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => { setTextColor(color); setHexInput(color); }}
                  className={`h-7 w-7 rounded-full border-2 transition ${
                    textColor === color
                      ? "border-[var(--hm-primary)] scale-110 shadow-md"
                      : "border-[var(--hm-line)]"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => { setTextColor(e.target.value); setHexInput(e.target.value); }}
                className="h-8 w-8 cursor-pointer rounded border border-[var(--hm-line)] bg-white p-0.5"
              />
              <input
                type="text"
                value={hexInput}
                onChange={(e) => {
                  setHexInput(e.target.value);
                  if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    setTextColor(e.target.value);
                  }
                }}
                placeholder="#000000"
                className="flex-1 rounded-xl border border-[var(--hm-line)] bg-white px-3 py-1.5 text-xs font-mono text-[var(--hm-text)] focus:border-[var(--hm-primary)] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!textValue.trim()}
            onClick={handleAddText}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("studioTools.text.addButton")}
          </button>
        </div>
      )}

      {/* ── Designs panel ────────────────────────────────────────────────────── */}
      {activeTab === "design" && (
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
            {t("studioTools.design.heading")}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DESIGNS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleAddDesign(name)}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--hm-line)] bg-white p-3 text-[var(--hm-primary)] transition hover:border-[var(--hm-primary)] hover:bg-[var(--hm-accent-soft-rose)] hover:shadow-sm"
                title={t(DESIGN_LABEL_KEYS[name])}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/designs/${name}.svg`}
                  alt={DESIGN_LABEL_KEYS[name] ? t(DESIGN_LABEL_KEYS[name]) : name}
                  className="h-8 w-8 object-contain"
                  style={{ filter: "invert(26%) sepia(43%) saturate(889%) hue-rotate(287deg) brightness(94%) contrast(96%)" }}
                />
                <span className="text-[9px] font-semibold text-[var(--hm-text-soft)]">
                  {t(DESIGN_LABEL_KEYS[name])}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[var(--hm-text-muted)]">
            {t("studioTools.design.help")}
          </p>
        </div>
      )}

      {/* ── QR Code panel ────────────────────────────────────────────────────── */}
      {activeTab === "qr" && (
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
            {t("studioTools.qr.heading")}
          </p>

          {/* URL / texte */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-[var(--hm-text-soft)]">{t("studioTools.qr.urlLabel")}</label>
            <input
              type="text"
              value={qrUrl}
              onChange={(e) => { setQrUrl(e.target.value); setQrPreview(null); setQrError(null); }}
              placeholder={t("studioTools.qr.urlPlaceholder")}
              className="w-full rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2 text-xs text-[var(--hm-text)] placeholder:text-[var(--hm-text-muted)] focus:border-[var(--hm-primary)] focus:outline-none"
            />
          </div>

          {/* Couleurs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-[var(--hm-text-soft)]">{t("studioTools.qr.fgLabel")}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={qrFgColor}
                  onChange={(e) => { setQrFgColor(e.target.value); setQrPreview(null); }}
                  className="h-8 w-8 cursor-pointer rounded border border-[var(--hm-line)] bg-white p-0.5"
                />
                <input
                  type="text"
                  value={qrFgColor}
                  onChange={(e) => { if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) { setQrFgColor(e.target.value); setQrPreview(null); } }}
                  className="flex-1 rounded-lg border border-[var(--hm-line)] bg-white px-2 py-1.5 text-[10px] font-mono text-[var(--hm-text)] focus:border-[var(--hm-primary)] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-[var(--hm-text-soft)]">{t("studioTools.qr.bgLabel")}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={qrBgColor}
                  disabled={qrTransparent}
                  onChange={(e) => { setQrBgColor(e.target.value); setQrPreview(null); }}
                  className="h-8 w-8 cursor-pointer rounded border border-[var(--hm-line)] bg-white p-0.5 disabled:opacity-40"
                />
                <input
                  type="text"
                  value={qrTransparent ? t("studioTools.qr.transparentValue") : qrBgColor}
                  readOnly
                  className="flex-1 rounded-lg border border-[var(--hm-line)] bg-white px-2 py-1.5 text-[10px] font-mono text-[var(--hm-text-muted)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Fond transparent */}
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={qrTransparent}
              onChange={(e) => { setQrTransparent(e.target.checked); setQrPreview(null); }}
              className="h-4 w-4 accent-[var(--hm-primary)]"
            />
            <span className="text-xs text-[var(--hm-text)]">{t("studioTools.qr.transparentToggle")}</span>
          </label>

          {/* Taille */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-[var(--hm-text-soft)]">{t("studioTools.qr.sizeLabel")}</label>
              <span className="text-[10px] font-mono text-[var(--hm-text-soft)]">{qrSize} px</span>
            </div>
            <input
              type="range"
              min={100}
              max={600}
              step={50}
              value={qrSize}
              onChange={(e) => { setQrSize(parseInt(e.target.value)); setQrPreview(null); }}
              className="w-full accent-[var(--hm-primary)]"
            />
            <p className="text-[9px] text-[var(--hm-text-muted)]">
              {t("studioTools.qr.sizeHint")}
            </p>
          </div>

          {/* Erreur */}
          {qrError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
              {qrError}
            </p>
          )}

          {/* Prévisualisation */}
          {qrPreview && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--hm-line)] bg-[var(--hm-bg)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">{t("studioTools.qr.previewHeading")}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrPreview}
                alt={t("studioTools.qr.previewAlt")}
                className="h-32 w-32 rounded-lg"
                style={{ imageRendering: "pixelated", background: qrTransparent ? "repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 0 0 / 10px 10px" : "transparent" }}
              />
              <p className="max-w-full truncate text-center text-[9px] text-[var(--hm-text-muted)]">{qrUrl}</p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={generateQR}
              disabled={qrGenerating}
              className="flex-1 rounded-xl border border-[var(--hm-primary)] bg-white px-3 py-2.5 text-xs font-semibold text-[var(--hm-primary)] transition hover:bg-[var(--hm-accent-soft-rose)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {qrGenerating ? t("studioTools.qr.generating") : qrPreview ? t("studioTools.qr.regenerate") : t("studioTools.qr.generate")}
            </button>
            {qrPreview && (
              <button
                type="button"
                onClick={handleAddQR}
                className="btn-primary flex-1"
              >
                {t("studioTools.qr.addToCanvas")}
              </button>
            )}
          </div>

          <div className="rounded-xl border border-[var(--hm-line)] bg-[var(--hm-bg)] p-3 text-[10px] text-[var(--hm-text-soft)]">
            <p className="font-semibold mb-1">{t("studioTools.qr.tipsTitle")}</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>{t("studioTools.qr.tip1")}</li>
              <li>{t("studioTools.qr.tip2")}</li>
              <li>{t("studioTools.qr.tip3")}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
