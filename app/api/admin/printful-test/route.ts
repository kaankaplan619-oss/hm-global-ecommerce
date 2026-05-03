import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/printful-test
 *
 * ROUTE TEMPORAIRE — À SUPPRIMER APRÈS TEST.
 * Admin-only. Vérifie la connexion Printful et remonte les données de store.
 * Ne crée aucune commande. Ne confirme rien.
 */
export async function GET() {
  // ── Auth admin ──────────────────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "PRINTFUL_API_KEY manquante côté serveur" }, { status: 500 });
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const results: Record<string, unknown> = {
    api_key_present: true,
    api_key_length: apiKey.length,
  };

  // ── 1. Vérifier l'auth + récupérer les stores ────────────────────────────────
  try {
    const storesRes = await fetch("https://api.printful.com/stores", { headers });
    const storesData = await storesRes.json();
    if (storesRes.ok) {
      results.stores = (storesData.result ?? []).map((s: Record<string, unknown>) => ({
        id:       s.id,
        name:     s.name,
        type:     s.type,
        currency: s.currency,
        created:  s.created,
      }));
    } else {
      results.stores_error = storesData;
    }
  } catch (e) {
    results.stores_error = String(e);
  }

  // ── 2. Store courant (contexte par défaut de la clé API) ─────────────────────
  try {
    const storeRes = await fetch("https://api.printful.com/store", { headers });
    const storeData = await storeRes.json();
    if (storeRes.ok) {
      const s = storeData.result ?? {};
      results.current_store = {
        id:       s.id,
        name:     s.name,
        type:     s.type,
        currency: s.currency,
        country:  s.country_code,
      };
    } else {
      results.current_store_error = storeData;
    }
  } catch (e) {
    results.current_store_error = String(e);
  }

  // ── 3. Gildan 5000 (product_id 438) — variantes ciblées ─────────────────────
  try {
    const prodRes = await fetch("https://api.printful.com/products/438", { headers });
    const prodData = await prodRes.json();

    if (prodRes.ok) {
      const allVariants: Record<string, unknown>[] = prodData.result?.variants ?? [];
      const TARGET_COLORS = ["white", "black", "sport grey", "navy", "dark heather"];
      const TARGET_SIZES  = ["S", "M", "L", "XL", "2XL", "3XL"];

      const filtered = allVariants
        .filter((v) => {
          const name = String(v.name ?? "");
          const match = name.match(/\((.+?)\s*\/\s*(.+?)\)/);
          if (!match) return false;
          const color = match[1].toLowerCase();
          const size  = match[2].trim();
          return TARGET_COLORS.some((c) => color === c) && TARGET_SIZES.includes(size);
        })
        .map((v) => {
          const match = String(v.name).match(/\((.+?)\s*\/\s*(.+?)\)/);
          return {
            variant_id: v.id,
            color:      match?.[1] ?? "",
            size:       match?.[2] ?? "",
            price_usd:  v.price,
            in_stock:   v.in_stock,
            availability_regions: Object.keys((v.availability_regions as Record<string,unknown>) ?? {}),
          };
        });

      results.gildan_5000 = {
        product_id:   438,
        title:        prodData.result?.product?.title,
        techniques:   prodData.result?.product?.techniques?.map((t: Record<string,unknown>) => t.key),
        print_areas: (prodData.result?.product?.files ?? [])
          .filter((f: Record<string,unknown>) => f.type !== "mockup" && !String(f.id).includes("embroidery"))
          .map((f: Record<string,unknown>) => ({
            id:            f.id,
            title:         f.title,
            additional_usd: f.additional_price ?? 0,
          })),
        variants_targeted: filtered,
        variants_count_total: allVariants.length,
      };
    } else {
      results.gildan_5000_error = prodData;
    }
  } catch (e) {
    results.gildan_5000_error = String(e);
  }

  // ── 4. Produits du store (sync products) ─────────────────────────────────────
  try {
    const syncRes = await fetch("https://api.printful.com/store/products?limit=10", { headers });
    const syncData = await syncRes.json();
    if (syncRes.ok) {
      results.store_sync_products = {
        total: syncData.paging?.total ?? 0,
        items: (syncData.result ?? []).map((p: Record<string, unknown>) => ({
          id:   p.id,
          name: p.name,
          thumbnail: p.thumbnail_url,
        })),
      };
    } else {
      results.store_sync_products_error = syncData;
    }
  } catch (e) {
    results.store_sync_products_error = String(e);
  }

  return NextResponse.json(results, { status: 200 });
}
