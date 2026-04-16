"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, CheckCircle, AlertCircle, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { computeUnitPrice, formatPrice, PRICING_CONFIG } from "@/data/pricing";
import { TECHNIQUES, PLACEMENTS } from "@/data/techniques";
import { validateLogoFile, formatFileSize, ALLOWED_FILE_EXTENSIONS } from "@/lib/utils";
import type { Product, Technique, Placement, ProductColor } from "@/types";

interface Props {
  product: Product;
}

export default function ProductConfigurator({ product }: Props) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Config state
  const [technique, setTechnique] = useState<Technique>(product.techniques[0]);
  const [placement, setPlacement] = useState<Placement>(product.placements[0]);
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<ProductColor | null>(product.colors.find((c) => c.available) ?? null);
  const [quantity, setQuantity] = useState(1);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [addedToCart, setAddedToCart] = useState(false);

  // Price computation
  const basePrice = product.pricing[technique] as number;
  const unitPrice = computeUnitPrice({ basePrice, technique, placement });
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
  const freeShipping = quantity >= PRICING_CONFIG.freeShippingThreshold;

  const availableTechniques = TECHNIQUES.filter((t) => product.techniques.includes(t.id));
  const availablePlacements = PLACEMENTS.filter((p) => product.placements.includes(p.id));

  // File handling
  const handleFileChange = useCallback((file: File | null) => {
    setFileError("");
    if (!file) {
      setLogoFile(null);
      return;
    }
    const validation = validateLogoFile(file);
    if (!validation.valid) {
      setFileError(validation.error!);
      return;
    }
    setLogoFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  }, [handleFileChange]);

  // Add to cart
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push("/connexion?redirect=/produits/" + product.slug);
      return;
    }
    if (!size) return;
    if (!color) return;

    addItem({
      product,
      quantity,
      size,
      color,
      technique,
      placement,
      logoFile: logoFile
        ? { name: logoFile.name, size: logoFile.size, type: logoFile.type }
        : undefined,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const canAdd = !!size && !!color && color.available;

  return (
    <div className="flex flex-col gap-6">
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
                onClick={() => setTechnique(tech.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all
                  ${active
                    ? "border-[#c9a96e] bg-[#c9a96e0a]"
                    : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                        ${active ? "border-[#c9a96e]" : "border-[#2a2a2a]"}`}
                    >
                      {active && <div className="w-2 h-2 rounded-full bg-[#c9a96e]" />}
                    </div>
                    <div>
                      <span className={`text-sm font-semibold ${active ? "text-[#f5f5f5]" : "text-[#8a8a8a]"}`}>
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
                  <span className={`text-sm font-bold ${active ? "text-[#c9a96e]" : "text-[#555555]"}`}>
                    {formatPrice(techPrice)}
                  </span>
                </div>
                {active && (
                  <p className="text-xs text-[#555555] mt-2 ml-7">{tech.description}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Avertissement softshell DTF/Flex ─────────────────── */}
      {product.category === "softshells" && (technique === "dtf" || technique === "flex") && (
        <div className="flex items-start gap-2 p-3 bg-[#facc1511] border border-[#facc1533] rounded-lg -mt-2">
          <AlertCircle size={14} className="text-[#facc15] mt-0.5 shrink-0" />
          <p className="text-xs text-[#facc15]">
            La broderie est recommandée pour les softshells — le tissu technique supporte moins bien l&rsquo;impression DTF/Flex sur le long terme.
          </p>
        </div>
      )}

      {/* ── Emplacement ───────────────────────────────────────── */}
      <div>
        <label className="label">Emplacement du marquage</label>
        <div className="grid grid-cols-3 gap-2">
          {availablePlacements.map((plc) => {
            const placementSurcharge =
              technique === "broderie"
                ? product.pricing.broDeriePlacementSurcharge[plc.id]
                : product.pricing.placements[plc.id];

            const active = placement === plc.id;
            return (
              <button
                key={plc.id}
                onClick={() => setPlacement(plc.id)}
                className={`p-3 rounded-lg border text-center transition-all
                  ${active
                    ? "border-[#c9a96e] bg-[#c9a96e0a]"
                    : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]"
                  }`}
              >
                <span className={`text-xs font-semibold block ${active ? "text-[#f5f5f5]" : "text-[#8a8a8a]"}`}>
                  {plc.label}
                </span>
                {placementSurcharge > 0 && (
                  <span className="text-[10px] text-[#c9a96e]">+{formatPrice(placementSurcharge)}</span>
                )}
                {placementSurcharge === 0 && (
                  <span className="text-[10px] text-[#555555]">Inclus</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Couleur ───────────────────────────────────────────── */}
      <div>
        <label className="label">
          Couleur
          {color && <span className="normal-case text-[#f5f5f5] ml-2 font-normal">{color.label}</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((c) => (
            <button
              key={c.id}
              onClick={() => c.available && setColor(c)}
              disabled={!c.available}
              title={c.label}
              className={`w-8 h-8 rounded-full border-2 transition-all
                ${!c.available ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:scale-110"}
                ${color?.id === c.id ? "border-[#c9a96e] scale-110 shadow-lg" : "border-transparent"}`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* ── Taille ────────────────────────────────────────────── */}
      <div>
        <label className="label">Taille</label>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => {
            const active = size === s.label;
            return (
              <button
                key={s.label}
                onClick={() => s.available && !s.soldOut && setSize(s.label)}
                disabled={!s.available || s.soldOut}
                className={`relative min-w-[44px] h-10 px-3 rounded-lg border text-sm font-semibold transition-all
                  ${active
                    ? "border-[#c9a96e] bg-[#c9a96e] text-[#0a0a0a]"
                    : s.soldOut || !s.available
                    ? "border-[#1a1a1a] text-[#2a2a2a] cursor-not-allowed bg-[#111111]"
                    : "border-[#2a2a2a] text-[#8a8a8a] hover:border-[#c9a96e] hover:text-[#f5f5f5] bg-[#1a1a1a]"
                  }`}
              >
                {s.label}
                {s.soldOut && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#2a2a2a] rotate-12" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {!size && (
          <p className="text-[11px] text-[#555555] mt-2">Sélectionnez une taille pour continuer</p>
        )}
      </div>

      {/* ── Quantité ──────────────────────────────────────────── */}
      <div>
        <label className="label">Quantité</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 rounded-lg border border-[#2a2a2a] flex items-center justify-center text-[#8a8a8a] hover:text-[#f5f5f5] hover:border-[#3a3a3a] transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="text-lg font-bold text-[#f5f5f5] w-12 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-10 rounded-lg border border-[#2a2a2a] flex items-center justify-center text-[#8a8a8a] hover:text-[#f5f5f5] hover:border-[#3a3a3a] transition-colors"
          >
            <Plus size={14} />
          </button>
          {freeShipping && (
            <span className="badge badge-success text-[10px]">Livraison offerte</span>
          )}
          {!freeShipping && (
            <span className="text-[10px] text-[#555555]">
              +{PRICING_CONFIG.freeShippingThreshold - quantity} pcs pour livraison offerte
            </span>
          )}
        </div>
      </div>

      {/* ── Logo upload ───────────────────────────────────────── */}
      <div>
        <label className="label">Votre logo / fichier</label>
        {!logoFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative border-2 border-dashed border-[#2a2a2a] rounded-lg p-6 text-center cursor-pointer hover:border-[#c9a96e33] transition-colors"
            onClick={() => document.getElementById("logo-input")?.click()}
          >
            <Upload size={20} className="text-[#555555] mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#8a8a8a]">
              Glissez votre fichier ici ou cliquez pour parcourir
            </p>
            <p className="text-[10px] text-[#555555] mt-1">
              Formats : {ALLOWED_FILE_EXTENSIONS.join(", ")} — Max 50 Mo
            </p>
            <p className="text-[10px] text-[#3a3a3a] mt-1">
              Préférez un fichier vectoriel (AI, PDF, SVG) pour un meilleur rendu.
            </p>
            <input
              id="logo-input"
              type="file"
              className="sr-only"
              accept=".pdf,.png,.svg,.ai"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] border border-[#4ade8033] rounded-lg">
            <CheckCircle size={16} className="text-[#4ade80] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#f5f5f5] truncate">{logoFile.name}</p>
              <p className="text-[10px] text-[#555555]">{formatFileSize(logoFile.size)}</p>
            </div>
            <button
              onClick={() => setLogoFile(null)}
              className="text-[#555555] hover:text-[#f87171] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {fileError && (
          <div className="flex items-center gap-2 mt-2 text-xs text-[#f87171]">
            <AlertCircle size={12} />
            {fileError}
          </div>
        )}

        <p className="text-[10px] text-[#3a3a3a] mt-2">
          Vous pourrez aussi déposer votre fichier depuis votre espace client après commande.
        </p>
      </div>

      {/* ── Prix récapitulatif ────────────────────────────────── */}
      <div className="p-4 bg-[#111111] border border-[#1e1e1e] rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#555555]">Prix unitaire TTC</span>
          <span className="text-sm font-bold text-[#f5f5f5]">{formatPrice(unitPrice)}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#555555]">Quantité</span>
          <span className="text-sm text-[#8a8a8a]">× {quantity}</span>
        </div>
        <div className="divider-gold my-3" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#f5f5f5]">Total TTC</span>
          <div className="text-right">
            <span className="text-xl font-black text-[#c9a96e]">{formatPrice(totalPrice)}</span>
            <p className="text-[10px] text-[#555555]">
              soit {formatPrice(totalPrice / 1.2)} HT
            </p>
          </div>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <button
        onClick={handleAddToCart}
        disabled={!canAdd}
        className={`btn-primary w-full gap-3 py-4 text-sm
          ${!canAdd ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {addedToCart ? (
          <>
            <CheckCircle size={16} />
            Ajouté au panier !
          </>
        ) : (
          <>
            <ShoppingBag size={16} />
            {!isAuthenticated
              ? "Se connecter pour commander"
              : !size
              ? "Sélectionnez une taille"
              : "Ajouter au panier"}
          </>
        )}
      </button>

      {!isAuthenticated && (
        <p className="text-center text-[10px] text-[#555555]">
          Un compte est requis pour commander.{" "}
          <a href="/inscription" className="text-[#c9a96e] hover:underline">
            Créer un compte gratuit
          </a>
        </p>
      )}
    </div>
  );
}
