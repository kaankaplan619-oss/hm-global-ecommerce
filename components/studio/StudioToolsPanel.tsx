"use client";

import { useRef, useState } from "react";
import { Upload, Type, Sparkles } from "lucide-react";
import { EFFECT_OPTIONS } from "@/lib/color-utils";
import type { StudioObject } from "./StudioCanvas";

const FONT_OPTIONS = [
  { value: "Arial",           label: "Arial (Sans-serif)"     },
  { value: "Georgia",         label: "Georgia (Serif)"        },
  { value: "Courier New",     label: "Courier New (Mono)"     },
];

const COLOR_PRESETS = [
  "#000000", "#FFFFFF", "#b13f74", "#2563EB", "#DC2626", "#166534",
];

const DESIGNS = [
  "star", "football", "crown", "arrow-right",
  "heart", "lightning", "diamond", "shield",
  "circle", "triangle", "cross", "infinity",
] as const;

const DESIGN_LABELS: Record<string, string> = {
  "star": "Étoile", "football": "Football", "crown": "Couronne",
  "arrow-right": "Flèche", "heart": "Cœur", "lightning": "Éclair",
  "diamond": "Diamant", "shield": "Bouclier", "circle": "Cercle",
  "triangle": "Triangle", "cross": "Croix", "infinity": "Infini",
};

type Face = "front" | "back";

interface Props {
  face: Face;
  onAddObject: (obj: StudioObject) => void;
}

export default function StudioToolsPanel({ face, onAddObject }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"logo" | "text" | "design" | "effects">("logo");

  // ── Text state ────────────────────────────────────────────────────────────
  const [textValue,   setTextValue]   = useState("");
  const [fontFamily,  setFontFamily]  = useState("Arial");
  const [fontSize,    setFontSize]    = useState(24);
  const [textColor,   setTextColor]   = useState("#000000");
  const [hexInput,    setHexInput]    = useState("#000000");
  // ── Logo state ────────────────────────────────────────────────────────────
  const [logoWarning, setLogoWarning] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoWarning(null);

    // Check PNG dimensions
    if (file.type === "image/png") {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        if (img.naturalWidth < 300 || img.naturalHeight < 300) {
          setLogoWarning(
            `Résolution faible (${img.naturalWidth}×${img.naturalHeight}px). Pour un rendu optimal, utilisez une image d'au moins 300×300px.`
          );
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
      color: textColor,
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
      label: DESIGN_LABELS[name] ?? name,
      face,
    });
  };

  const tabs = [
    { id: "logo"    as const, label: "Logo",    icon: <Upload size={14} /> },
    { id: "text"    as const, label: "Texte",   icon: <Type size={14} /> },
    { id: "design"  as const, label: "Designs", icon: <Sparkles size={14} /> },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl border border-[var(--hm-line)] bg-[var(--hm-bg)] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all
              ${activeTab === tab.id
                ? "bg-white text-[var(--hm-primary)] shadow-sm"
                : "text-[var(--hm-text-soft)] hover:text-[var(--hm-text)]"
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/svg+xml"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[var(--hm-line)] bg-[var(--hm-bg)] px-4 py-8 text-center transition hover:border-[var(--hm-primary)] hover:bg-[var(--hm-accent-soft-rose)]"
          >
            <Upload size={24} className="text-[var(--hm-primary)]" />
            <span className="text-sm font-semibold text-[var(--hm-text)]">
              Importer votre logo
            </span>
            <span className="text-xs text-[var(--hm-text-soft)]">
              PNG, SVG ou JPEG · Recommandé : 300px minimum
            </span>
          </button>

          {logoWarning && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              ⚠ {logoWarning}
            </div>
          )}

          <p className="text-[10px] text-[var(--hm-text-muted)]">
            Formats acceptés : PNG (fond transparent recommandé), SVG, JPEG.
            Pour la broderie, privilégiez les logos simples avec peu de couleurs.
          </p>

          {/* Logo effects section */}
          <div className="border-t border-[var(--hm-line)] pt-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
              Lisibilité sur textile
            </p>
            <div className="flex flex-col gap-2">
              {EFFECT_OPTIONS.map(({ value, label }) => (
                <div key={value} className="flex items-center gap-2 rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2 text-xs text-[var(--hm-text-soft)]">
                  <span className="font-medium">{label}</span>
                  <span className="ml-auto text-[10px] text-[var(--hm-text-muted)]">
                    {value === "none" && "Aucun traitement"}
                    {value === "white-outline" && "Halo blanc léger"}
                    {value === "white-bg" && "Halo blanc fort"}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-[var(--hm-text-muted)]">
              Les effets de lisibilité sont disponibles dans le MockupViewer classique.
            </p>
          </div>
        </div>
      )}

      {/* ── Text panel ───────────────────────────────────────────────────────── */}
      {activeTab === "text" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
              Votre texte
            </label>
            <textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Ex: Mon Club, Mon Équipe..."
              rows={2}
              className="w-full resize-none rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2 text-sm text-[var(--hm-text)] placeholder:text-[var(--hm-text-muted)] focus:border-[var(--hm-primary)] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
              Police
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2 text-sm text-[var(--hm-text)] focus:border-[var(--hm-primary)] focus:outline-none"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
              Taille ({fontSize}px)
            </label>
            <input
              type="range"
              min={10}
              max={72}
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-[var(--hm-primary)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
              Couleur
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => { setTextColor(color); setHexInput(color); }}
                  className={`h-8 w-8 rounded-full border-2 transition ${
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
                className="flex-1 rounded-xl border border-[var(--hm-line)] bg-white px-3 py-1.5 text-xs text-[var(--hm-text)] focus:border-[var(--hm-primary)] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!textValue.trim()}
            onClick={handleAddText}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ajouter le texte au canvas
          </button>
        </div>
      )}

      {/* ── Designs panel ────────────────────────────────────────────────────── */}
      {activeTab === "design" && (
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
            Designs prédéfinis
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DESIGNS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleAddDesign(name)}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--hm-line)] bg-white p-3 text-[var(--hm-primary)] transition hover:border-[var(--hm-primary)] hover:bg-[var(--hm-accent-soft-rose)] hover:shadow-sm"
                title={DESIGN_LABELS[name]}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/designs/${name}.svg`}
                  alt={DESIGN_LABELS[name] ?? name}
                  className="h-8 w-8 object-contain"
                  style={{ filter: "invert(26%) sepia(43%) saturate(889%) hue-rotate(287deg) brightness(94%) contrast(96%)" }}
                />
                <span className="text-[9px] font-semibold text-[var(--hm-text-soft)]">
                  {DESIGN_LABELS[name]}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[var(--hm-text-muted)]">
            Cliquez sur un design pour l&apos;ajouter au canvas. Vous pouvez le déplacer et redimensionner après.
          </p>
        </div>
      )}
    </div>
  );
}
