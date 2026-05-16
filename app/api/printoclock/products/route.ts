import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  listProducts,
  getProduct,
  getProductVariants,
  listTaxons,
  isPrintoclockConfigured,
} from "@/lib/printoclock";

/**
 * GET /api/printoclock/products
 * Admin-only. Browse le catalogue PrintoClock.
 *
 * Query params :
 *   ?code=xxx        → filtre par code produit
 *   ?name=xxx        → filtre par nom
 *   ?variants=CODE   → retourne les variantes d'un produit (avec prix)
 *   ?taxons=1        → retourne les catégories disponibles
 */
export async function GET(req: NextRequest) {
  try {
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

    if (!isPrintoclockConfigured()) {
      return NextResponse.json(
        {
          error:        "PrintoClock non configuré.",
          instructions: "Ajoutez PRINTOCLOCK_USERNAME et PRINTOCLOCK_PASSWORD dans les variables d'environnement Vercel. Appelez le 01 83 35 30 45 pour obtenir vos credentials.",
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const variantsCode = searchParams.get("variants");
    const taxons       = searchParams.get("taxons");
    const code         = searchParams.get("code");
    const name         = searchParams.get("name");

    // Cas 1 — Variantes d'un produit spécifique
    if (variantsCode) {
      const [product, variants] = await Promise.all([
        getProduct(variantsCode).catch(() => null),
        getProductVariants(variantsCode),
      ]);

      return NextResponse.json({
        product,
        variants: variants.map((v) => ({
          code:          v.code,
          name:          v.name,
          finalPrice:    v.finalPrice,        // TTC PrintoClock
          shippingPrice: v.professionalShippingPrice,
          delivery:      v.estimatedDeliveryDate,
          options:       v.optionValues?.map((o) => ({
            option: o.option.name,
            value:  o.value,
            code:   o.code,
          })),
        })),
      });
    }

    // Cas 2 — Catégories
    if (taxons) {
      const taxa = await listTaxons();
      return NextResponse.json({ taxons: taxa });
    }

    // Cas 3 — Liste produits (avec filtres optionnels)
    const products = await listProducts({
      code:  code ?? undefined,
      name:  name ?? undefined,
    });

    return NextResponse.json({
      count:    products.length,
      products: products.map((p) => ({
        id:          p.id,
        code:        p.code,
        name:        p.name,
        slug:        p.slug,
        description: p.apiDescription,
        images:      p.images?.slice(0, 2).map((i) => i.path),
        options:     p.stepsOptions?.map((o) => ({
          code:  o.option.code,
          name:  o.option.name,
          title: o.title,
        })),
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
