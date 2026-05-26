/**
 * lib/suppliers/printify/printify-v1-map.ts
 *
 * Mapping V1 : colorId HM ↔ variant_id Printify.
 *
 * Périmètre V1 :
 *   - 4 produits compatibles EU : Bella 3001, Gildan 5000, Gildan 18000, Gildan 18500
 *   - 6 couleurs principales : noir, blanc, gris, marine, rouge, royal
 *   - Tailles S, M, L, XL, 2XL (XS et 3XL exclus de V1)
 *   - Provider principal : Textildruck Europa 🇩🇪 (id 26)
 *   - Provider secondaire : Atelier Katanga 🇫🇷 (id 402)
 *   - Provider fallback : Print Clever 🇬🇧 (id 72)
 *
 * Exclus V1 :
 *   - Cotton Heritage M2480 / M2580 (US-only, pas de provider EU)
 *   - Toutes couleurs hors 6 principales (à étendre post-V1)
 *
 * Note technique :
 *   Le `variant_id` Printify est GLOBAL au blueprint — il ne change pas selon
 *   le provider. La différence entre providers tient uniquement à la
 *   `disponibilité` du variant chez ce provider.
 *
 * Maintenance :
 *   - Tous les variant_id ont été audités via /catalog/blueprints/{id}/print_providers/{pid}/variants.json
 *   - Audit horodaté : 2026-05-17
 *   - À ré-auditer si Printify modifie son catalogue (changement de variant_id rare mais possible)
 */

// ─── Providers EU disponibles ────────────────────────────────────────────────

export const PRINTIFY_PROVIDERS = {
  TEXTILDRUCK_EUROPA_DE: 26,
  ATELIER_KATANGA_FR:    402,
  PRINT_CLEVER_GB:       72,
  OPT_ONDEMAND_CZ:       30,
} as const;

export type PrintifyProviderId = typeof PRINTIFY_PROVIDERS[keyof typeof PRINTIFY_PROVIDERS];

export const PROVIDER_LABELS: Record<number, { name: string; country: string; flag: string }> = {
  26:  { name: "Textildruck Europa", country: "DE", flag: "🇩🇪" },
  402: { name: "Atelier Katanga",    country: "FR", flag: "🇫🇷" },
  72:  { name: "Print Clever",       country: "GB", flag: "🇬🇧" },
  30:  { name: "OPT OnDemand",       country: "CZ", flag: "🇨🇿" },
};

// ─── Type d'une variante mappée ──────────────────────────────────────────────

export interface PrintifyVariantMapping {
  /** ID Printify globalement unique pour cette combinaison couleur+taille du blueprint */
  variantId: number;
  /**
   * Providers chez qui cette variante est dispo, par ordre de préférence
   * (Textildruck DE → Atelier Katanga FR → Print Clever GB).
   * Sera consommé par le sélecteur de fulfillment.
   */
  availableProviders: number[];
}

export type SizeMap = Record<string, PrintifyVariantMapping>;
export type ColorMap = Record<string, { printifyColorName: string; sizes: SizeMap }>;

export interface ProductMapping {
  /** Slug HM (même clé que dans data/products.ts) */
  hmSlug: string;
  /** ID blueprint Printify */
  blueprintId: number;
  /** Label humain pour debug/logs */
  label: string;
  /** Provider préféré pour ce produit */
  preferredProvider: number;
  /** Liste complète des providers connus dispos pour ce blueprint */
  knownProviders: number[];
  /** Mapping HM colorId → Printify color name + tailles → variant_id */
  colors: ColorMap;
}

// ─── Mapping V1 (audit 2026-05-17) ───────────────────────────────────────────

export const PRINTIFY_V1_MAP: Record<string, ProductMapping> = {
  // ── Gildan 5000 — Unisex Heavy Cotton Tee ───────────────────────────────
  "gildan-5000": {
    hmSlug: "gildan-5000",
    blueprintId: 6,
    label: "Gildan 5000 Heavy Cotton Tee",
    preferredProvider: PRINTIFY_PROVIDERS.TEXTILDRUCK_EUROPA_DE,
    knownProviders: [26, 402, 72],
    colors: {
      noir: {
        printifyColorName: "Black",
        sizes: {
          S:   { variantId: 12126, availableProviders: [26, 402, 72] },
          M:   { variantId: 12125, availableProviders: [26, 402, 72] },
          L:   { variantId: 12124, availableProviders: [26, 402, 72] },
          XL:  { variantId: 12127, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 12128, availableProviders: [26, 402, 72] },
        },
      },
      blanc: {
        printifyColorName: "White",
        sizes: {
          S:   { variantId: 12102, availableProviders: [26, 402, 72] },
          M:   { variantId: 12101, availableProviders: [26, 72] }, // Atelier Katanga FR : pas dispo
          L:   { variantId: 12100, availableProviders: [26, 402, 72] },
          XL:  { variantId: 12103, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 12104, availableProviders: [26, 402, 72] },
        },
      },
      gris: {
        printifyColorName: "Sport Grey",
        sizes: {
          S:   { variantId: 12072, availableProviders: [26, 402, 72] },
          M:   { variantId: 12071, availableProviders: [26, 402, 72] },
          L:   { variantId: 12070, availableProviders: [26, 402, 72] },
          XL:  { variantId: 12073, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 12074, availableProviders: [26, 402, 72] },
        },
      },
      marine: {
        printifyColorName: "Navy",
        sizes: {
          S:   { variantId: 11988, availableProviders: [26, 402, 72] },
          M:   { variantId: 11987, availableProviders: [26, 402, 72] },
          L:   { variantId: 11986, availableProviders: [26, 402, 72] },
          XL:  { variantId: 11989, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 11990, availableProviders: [26, 402, 72] },
        },
      },
      rouge: {
        printifyColorName: "Red",
        sizes: {
          S:   { variantId: 12024, availableProviders: [26, 402, 72] },
          M:   { variantId: 12023, availableProviders: [26, 402, 72] },
          L:   { variantId: 12022, availableProviders: [26, 402, 72] },
          XL:  { variantId: 12025, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 12026, availableProviders: [26, 402, 72] },
        },
      },
      royal: {
        printifyColorName: "Royal",
        sizes: {
          S:   { variantId: 12030, availableProviders: [26, 402, 72] },
          M:   { variantId: 12029, availableProviders: [26, 402, 72] },
          L:   { variantId: 12028, availableProviders: [26, 402, 72] },
          XL:  { variantId: 12031, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 12032, availableProviders: [26, 72] }, // Atelier Katanga FR : pas dispo
        },
      },
    },
  },

  // ── Bella+Canvas 3001 — Unisex Jersey Tee ───────────────────────────────
  "bella-3001": {
    hmSlug: "bella-3001",
    blueprintId: 12,
    label: "Bella+Canvas 3001 Unisex Tee",
    preferredProvider: PRINTIFY_PROVIDERS.TEXTILDRUCK_EUROPA_DE,
    knownProviders: [26, 402, 72],
    colors: {
      noir: {
        printifyColorName: "Black",
        sizes: {
          S:   { variantId: 18100, availableProviders: [26, 402, 72] },
          M:   { variantId: 18101, availableProviders: [26, 72] }, // Atelier Katanga FR : pas dispo
          L:   { variantId: 18102, availableProviders: [26, 72] },
          XL:  { variantId: 18103, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 18104, availableProviders: [26, 402, 72] },
        },
      },
      blanc: {
        printifyColorName: "White",
        sizes: {
          S:   { variantId: 18540, availableProviders: [26, 402, 72] },
          M:   { variantId: 18541, availableProviders: [26, 72] },
          L:   { variantId: 18542, availableProviders: [26, 402, 72] },
          XL:  { variantId: 18543, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 18544, availableProviders: [26, 402, 72] },
        },
      },
      // gris : Bella+Canvas n'a pas de "Sport Grey" simple — utilise "Athletic Heather" (gris chiné le plus standard)
      gris: {
        printifyColorName: "Athletic Heather",
        sizes: {
          S:   { variantId: 18076, availableProviders: [26, 402, 72] },
          M:   { variantId: 18077, availableProviders: [26, 402, 72] },
          L:   { variantId: 18078, availableProviders: [26, 402, 72] },
          XL:  { variantId: 18079, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 18080, availableProviders: [26, 402, 72] },
        },
      },
      marine: {
        printifyColorName: "Navy",
        sizes: {
          S:   { variantId: 18396, availableProviders: [26, 402, 72] },
          M:   { variantId: 18397, availableProviders: [26, 402, 72] },
          L:   { variantId: 18398, availableProviders: [26, 402, 72] },
          XL:  { variantId: 18399, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 18400, availableProviders: [26, 402, 72] },
        },
      },
      rouge: {
        printifyColorName: "Red",
        sizes: {
          S:   { variantId: 18444, availableProviders: [26, 402, 72] },
          M:   { variantId: 18445, availableProviders: [26, 402, 72] },
          L:   { variantId: 18446, availableProviders: [26, 402, 72] },
          XL:  { variantId: 18447, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 18448, availableProviders: [26, 402, 72] },
        },
      },
      royal: {
        printifyColorName: "True Royal",
        sizes: {
          S:   { variantId: 18516, availableProviders: [26, 402, 72] },
          M:   { variantId: 18517, availableProviders: [26, 402, 72] },
          L:   { variantId: 18518, availableProviders: [26, 402, 72] },
          XL:  { variantId: 18519, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 18520, availableProviders: [26, 402, 72] },
        },
      },
    },
  },

  // ── Gildan 18000 — Heavy Blend Crewneck Sweatshirt ──────────────────────
  "gildan-18000": {
    hmSlug: "gildan-18000",
    blueprintId: 49,
    label: "Gildan 18000 Heavy Blend Crewneck",
    preferredProvider: PRINTIFY_PROVIDERS.TEXTILDRUCK_EUROPA_DE,
    knownProviders: [26, 402, 72],
    colors: {
      noir: {
        printifyColorName: "Black",
        sizes: {
          S:   { variantId: 25397, availableProviders: [26, 72] }, // FR partiel
          M:   { variantId: 25428, availableProviders: [26, 72] },
          L:   { variantId: 25459, availableProviders: [26, 402, 72] },
          XL:  { variantId: 25490, availableProviders: [26, 72] },
          "2XL": { variantId: 25521, availableProviders: [26, 72] },
        },
      },
      blanc: {
        printifyColorName: "White",
        sizes: {
          S:   { variantId: 25396, availableProviders: [26, 72] },
          M:   { variantId: 25427, availableProviders: [26, 72] },
          L:   { variantId: 25458, availableProviders: [26, 72] },
          XL:  { variantId: 25489, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 25520, availableProviders: [26, 402, 72] },
        },
      },
      gris: {
        printifyColorName: "Sport Grey",
        sizes: {
          S:   { variantId: 25395, availableProviders: [26, 402, 72] },
          M:   { variantId: 25426, availableProviders: [26, 402, 72] },
          L:   { variantId: 25457, availableProviders: [26, 402, 72] },
          XL:  { variantId: 25488, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 25519, availableProviders: [26, 402, 72] },
        },
      },
      marine: {
        printifyColorName: "Navy",
        sizes: {
          S:   { variantId: 25388, availableProviders: [26, 402, 72] },
          M:   { variantId: 25419, availableProviders: [26, 402, 72] },
          L:   { variantId: 25450, availableProviders: [26, 402, 72] },
          XL:  { variantId: 25481, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 25512, availableProviders: [26, 402, 72] },
        },
      },
      rouge: {
        printifyColorName: "Red",
        sizes: {
          S:   { variantId: 25391, availableProviders: [26, 402, 72] },
          M:   { variantId: 25422, availableProviders: [26, 402, 72] },
          L:   { variantId: 25453, availableProviders: [26, 402, 72] },
          XL:  { variantId: 25484, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 25515, availableProviders: [26, 402, 72] },
        },
      },
      // ⚠️ Royal V1 RETIRÉ (mai 2026) : indispo chez Textildruck DE → forçait un
      // bascule sur Print Clever GB avec shipping GB cher (×2). Décision business :
      // garder le produit chez DE avec 5 couleurs uniquement. À réintroduire V2 si
      // Textildruck DE étend sa gamme couleur ou si un autre provider DE prend Royal.
      // Variants Royal Print Clever GB (pour mémoire): S 25625, M 25624, L 25623, XL 25626, 2XL 25627
    },
  },

  // ── Gildan 18500 — Heavy Blend Hooded Sweatshirt ────────────────────────
  "gildan-18500": {
    hmSlug: "gildan-18500",
    blueprintId: 77,
    label: "Gildan 18500 Heavy Blend Hoodie",
    preferredProvider: PRINTIFY_PROVIDERS.TEXTILDRUCK_EUROPA_DE,
    knownProviders: [26, 402, 72],
    colors: {
      noir: {
        printifyColorName: "Black",
        sizes: {
          S:   { variantId: 32918, availableProviders: [26, 402, 72] },
          M:   { variantId: 32919, availableProviders: [26, 72] },
          L:   { variantId: 32920, availableProviders: [26, 72] },
          XL:  { variantId: 32921, availableProviders: [26, 72] },
          "2XL": { variantId: 32922, availableProviders: [26, 402, 72] },
        },
      },
      blanc: {
        printifyColorName: "White",
        sizes: {
          S:   { variantId: 32910, availableProviders: [26, 72] },
          M:   { variantId: 32911, availableProviders: [26, 72] },
          L:   { variantId: 32912, availableProviders: [26, 72] },
          XL:  { variantId: 32913, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 32914, availableProviders: [26, 402, 72] },
        },
      },
      gris: {
        printifyColorName: "Sport Grey",
        sizes: {
          S:   { variantId: 32902, availableProviders: [26, 72] },
          M:   { variantId: 32903, availableProviders: [26, 72] },
          L:   { variantId: 32904, availableProviders: [26, 72] },
          XL:  { variantId: 32905, availableProviders: [26, 72] },
          "2XL": { variantId: 32906, availableProviders: [26, 402, 72] },
        },
      },
      marine: {
        printifyColorName: "Navy",
        sizes: {
          S:   { variantId: 32894, availableProviders: [26, 72] },
          M:   { variantId: 32895, availableProviders: [26, 72] },
          L:   { variantId: 32896, availableProviders: [26, 72] },
          XL:  { variantId: 32897, availableProviders: [26, 72] },
          "2XL": { variantId: 32898, availableProviders: [26, 402, 72] },
        },
      },
      rouge: {
        printifyColorName: "Red",
        sizes: {
          S:   { variantId: 33385, availableProviders: [26, 402, 72] },
          M:   { variantId: 33386, availableProviders: [26, 402, 72] },
          L:   { variantId: 33387, availableProviders: [26, 402, 72] },
          XL:  { variantId: 33388, availableProviders: [26, 402, 72] },
          "2XL": { variantId: 33389, availableProviders: [26, 402, 72] },
        },
      },
      royal: {
        printifyColorName: "Royal",
        sizes: {
          S:   { variantId: 33393, availableProviders: [26, 402, 72] },
          M:   { variantId: 33394, availableProviders: [26, 72] },
          L:   { variantId: 33395, availableProviders: [26, 72] },
          XL:  { variantId: 33396, availableProviders: [26, 72] },
          "2XL": { variantId: 33397, availableProviders: [26, 402, 72] },
        },
      },
    },
  },

  // ── Comfort Colors 1717 — Heavyweight Garment-Dyed Tee (NOUVEAU V1) ─────
  // T-shirt premium teint en pièce 195 g/m². Coût Printify Textildruck DE : 9,09 €.
  // 6 couleurs core (la dernière "naturel" = Natural, couleur signature de la marque).
  "comfort-colors-1717": {
    hmSlug: "comfort-colors-1717",
    blueprintId: 145,
    label: "Comfort Colors 1717 Heavyweight Tee",
    preferredProvider: PRINTIFY_PROVIDERS.TEXTILDRUCK_EUROPA_DE,
    knownProviders: [26],
    colors: {
      noir: {
        printifyColorName: "Black",
        sizes: {
          S:   { variantId: 38164, availableProviders: [26] },
          M:   { variantId: 38178, availableProviders: [26] },
          L:   { variantId: 38192, availableProviders: [26] },
          XL:  { variantId: 38206, availableProviders: [26] },
          "2XL": { variantId: 38220, availableProviders: [26] },
        },
      },
      blanc: {
        printifyColorName: "White",
        sizes: {
          S:   { variantId: 38163, availableProviders: [26] },
          M:   { variantId: 38177, availableProviders: [26] },
          L:   { variantId: 38191, availableProviders: [26] },
          XL:  { variantId: 38205, availableProviders: [26] },
          "2XL": { variantId: 38219, availableProviders: [26] },
        },
      },
      gris: {
        printifyColorName: "Sport Grey",
        sizes: {
          S:   { variantId: 38162, availableProviders: [26] },
          M:   { variantId: 38176, availableProviders: [26] },
          L:   { variantId: 38190, availableProviders: [26] },
          XL:  { variantId: 38204, availableProviders: [26] },
          "2XL": { variantId: 38218, availableProviders: [26] },
        },
      },
      marine: {
        printifyColorName: "Navy",
        sizes: {
          S:   { variantId: 38158, availableProviders: [26] },
          M:   { variantId: 38172, availableProviders: [26] },
          L:   { variantId: 38186, availableProviders: [26] },
          XL:  { variantId: 38200, availableProviders: [26] },
          "2XL": { variantId: 38214, availableProviders: [26] },
        },
      },
      rouge: {
        printifyColorName: "Red",
        sizes: {
          S:   { variantId: 38160, availableProviders: [26] },
          M:   { variantId: 38174, availableProviders: [26] },
          L:   { variantId: 38188, availableProviders: [26] },
          XL:  { variantId: 38202, availableProviders: [26] },
          "2XL": { variantId: 38216, availableProviders: [26] },
        },
      },
      naturel: {
        printifyColorName: "Natural",
        sizes: {
          S:   { variantId: 63293, availableProviders: [26] },
          M:   { variantId: 63298, availableProviders: [26] },
          L:   { variantId: 63303, availableProviders: [26] },
          XL:  { variantId: 63308, availableProviders: [26] },
          "2XL": { variantId: 63313, availableProviders: [26] },
        },
      },
    },
  },

  // ── Gildan 2400 — Ultra Cotton Long Sleeve Tee (NOUVEAU V1) ─────────────
  // T-shirt manches longues, 230 g/m². Coût Printify Textildruck DE : 11,72 €.
  // 6 couleurs core (la dernière "naturel" = Sand, beige doux).
  "gildan-2400-ls": {
    hmSlug: "gildan-2400-ls",
    blueprintId: 36,
    label: "Gildan 2400 Ultra Cotton Long Sleeve Tee",
    preferredProvider: PRINTIFY_PROVIDERS.TEXTILDRUCK_EUROPA_DE,
    knownProviders: [26],
    colors: {
      noir: {
        printifyColorName: "Black",
        sizes: {
          S:   { variantId: 22087, availableProviders: [26] },
          M:   { variantId: 22088, availableProviders: [26] },
          L:   { variantId: 22089, availableProviders: [26] },
          XL:  { variantId: 22090, availableProviders: [26] },
          "2XL": { variantId: 22091, availableProviders: [26] },
        },
      },
      blanc: {
        printifyColorName: "White",
        sizes: {
          S:   { variantId: 22071, availableProviders: [26] },
          M:   { variantId: 22072, availableProviders: [26] },
          L:   { variantId: 22073, availableProviders: [26] },
          XL:  { variantId: 22074, availableProviders: [26] },
          "2XL": { variantId: 22075, availableProviders: [26] },
        },
      },
      gris: {
        printifyColorName: "Sport Grey",
        sizes: {
          S:   { variantId: 22031, availableProviders: [26] },
          M:   { variantId: 22032, availableProviders: [26] },
          L:   { variantId: 22033, availableProviders: [26] },
          XL:  { variantId: 22034, availableProviders: [26] },
          "2XL": { variantId: 22035, availableProviders: [26] },
        },
      },
      marine: {
        printifyColorName: "Navy",
        sizes: {
          S:   { variantId: 21927, availableProviders: [26] },
          M:   { variantId: 21928, availableProviders: [26] },
          L:   { variantId: 21929, availableProviders: [26] },
          XL:  { variantId: 21930, availableProviders: [26] },
          "2XL": { variantId: 21931, availableProviders: [26] },
        },
      },
      rouge: {
        printifyColorName: "Red",
        sizes: {
          S:   { variantId: 21975, availableProviders: [26] },
          M:   { variantId: 21976, availableProviders: [26] },
          L:   { variantId: 21977, availableProviders: [26] },
          XL:  { variantId: 21978, availableProviders: [26] },
          "2XL": { variantId: 21979, availableProviders: [26] },
        },
      },
      naturel: {
        printifyColorName: "Sand",
        sizes: {
          S:   { variantId: 22007, availableProviders: [26] },
          M:   { variantId: 22008, availableProviders: [26] },
          L:   { variantId: 22009, availableProviders: [26] },
          XL:  { variantId: 22010, availableProviders: [26] },
          "2XL": { variantId: 22011, availableProviders: [26] },
        },
      },
    },
  },

  // ── Mug céramique EU 11oz (NOUVEAU V1 — goodies) ────────────────────────
  // Blueprint 441 "Ceramic Mug (EU)" chez OPT OnDemand CZ (single provider EU).
  // Variant 62327 uniquement (11oz). Le 15oz (62328) n'est PAS activé V1.
  // Cost audité 2026-05-26 : 5.73 USD ≈ 5.37 € HT.
  // Sublimation pleine couleur sur céramique blanche.
  // Pas de "taille" au sens textile : Printify n'a qu'un seul variant utilisé,
  // on map sur une "taille" symbolique "11oz" pour rester cohérent avec le
  // schéma SizeMap (key = label affichable côté HM).
  "mug-ceramique-eu": {
    hmSlug: "mug-ceramique-eu",
    blueprintId: 441,
    label: "Ceramic Mug (EU) 11oz",
    preferredProvider: PRINTIFY_PROVIDERS.OPT_ONDEMAND_CZ,
    knownProviders: [PRINTIFY_PROVIDERS.OPT_ONDEMAND_CZ],
    colors: {
      blanc: {
        printifyColorName: "White",
        sizes: {
          "11oz": { variantId: 62327, availableProviders: [30] },
        },
      },
    },
  },
};

// ─── Helper public ───────────────────────────────────────────────────────────

export type VariantLookupArgs = {
  productSlug: string;
  colorId:     string;
  size:        string;
};

export type VariantLookupSuccess = {
  ok:                  true;
  productSlug:         string;
  blueprintId:         number;
  printifyColorName:   string;
  size:                string;
  variantId:           number;
  /** Provider à utiliser en priorité (1er dispo selon l'ordre 26 → 402 → 72) */
  preferredProvider:   number;
  /** Liste complète des providers chez qui ce variant est dispo */
  availableProviders:  number[];
  /** Providers EU à essayer en ordre si le préféré rate */
  fallbackProviders:   number[];
};

export type VariantLookupError = {
  ok:    false;
  error: "unknown_product" | "unknown_color" | "unknown_size" | "no_provider_available";
  message: string;
  productSlug: string;
  colorId:     string;
  size:        string;
};

export type VariantLookupResult = VariantLookupSuccess | VariantLookupError;

/**
 * Retourne le variant_id Printify pour une combinaison HM (slug, color, size).
 *
 * Ordre de préférence des providers (cf preferredProvider de chaque produit) :
 *   1. Textildruck Europa 🇩🇪 (26) — par défaut
 *   2. Atelier Katanga 🇫🇷 (402)
 *   3. Print Clever 🇬🇧 (72)
 *
 * Le `preferredProvider` retourné est le 1er provider dispo dans cet ordre.
 *
 * Ne fait AUCUN appel réseau — c'est un lookup local sur PRINTIFY_V1_MAP.
 */
export function getPrintifyVariantId(args: VariantLookupArgs): VariantLookupResult {
  const { productSlug, colorId, size } = args;

  const product = PRINTIFY_V1_MAP[productSlug];
  if (!product) {
    return {
      ok: false,
      error: "unknown_product",
      message: `Produit "${productSlug}" non mappé pour Printify V1. Produits disponibles : ${Object.keys(PRINTIFY_V1_MAP).join(", ")}`,
      productSlug, colorId, size,
    };
  }

  const color = product.colors[colorId];
  if (!color) {
    return {
      ok: false,
      error: "unknown_color",
      message: `Couleur "${colorId}" non mappée pour ${productSlug}. Couleurs disponibles : ${Object.keys(product.colors).join(", ")}`,
      productSlug, colorId, size,
    };
  }

  const sizeMapping = color.sizes[size];
  if (!sizeMapping) {
    return {
      ok: false,
      error: "unknown_size",
      message: `Taille "${size}" non mappée pour ${productSlug} ${colorId}. Tailles disponibles : ${Object.keys(color.sizes).join(", ")}`,
      productSlug, colorId, size,
    };
  }

  if (sizeMapping.availableProviders.length === 0) {
    return {
      ok: false,
      error: "no_provider_available",
      message: `Aucun provider EU disponible pour ${productSlug} ${colorId} ${size}`,
      productSlug, colorId, size,
    };
  }

  // Ordre de préférence : preferredProvider (26 normalement) → autres dans availableProviders
  const ORDER = [product.preferredProvider, 26, 402, 72];
  const unique = ORDER.filter((p, i) => ORDER.indexOf(p) === i);
  const preferred = unique.find((p) => sizeMapping.availableProviders.includes(p));

  if (!preferred) {
    return {
      ok: false,
      error: "no_provider_available",
      message: `Aucun provider compatible trouvé pour ${productSlug} ${colorId} ${size} (dispos: ${sizeMapping.availableProviders.join(", ")})`,
      productSlug, colorId, size,
    };
  }

  const fallbacks = sizeMapping.availableProviders.filter((p) => p !== preferred);

  return {
    ok:                 true,
    productSlug,
    blueprintId:        product.blueprintId,
    printifyColorName:  color.printifyColorName,
    size,
    variantId:          sizeMapping.variantId,
    preferredProvider:  preferred,
    availableProviders: sizeMapping.availableProviders,
    fallbackProviders:  fallbacks,
  };
}

// ─── Helpers introspection ──────────────────────────────────────────────────

/** Liste des slugs HM mappés en V1 */
export function getMappedProductSlugs(): string[] {
  return Object.keys(PRINTIFY_V1_MAP);
}

/** Couleurs disponibles pour un produit V1 (renvoie [] si produit non mappé) */
export function getMappedColors(productSlug: string): string[] {
  return Object.keys(PRINTIFY_V1_MAP[productSlug]?.colors ?? {});
}

/** Tailles disponibles pour produit+couleur (renvoie [] si non mappé) */
export function getMappedSizes(productSlug: string, colorId: string): string[] {
  return Object.keys(PRINTIFY_V1_MAP[productSlug]?.colors?.[colorId]?.sizes ?? {});
}
