import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * POST /api/orders/upload-logo
 * Uploads a logo file to Supabase Storage under:
 *   logos/orders/{orderId}/{userId}/{timestamp}-{filename}
 *
 * Then updates the order_item with the file URL and resets logo_file_status to "en_attente".
 * The status of the parent order is set to "fichier_a_verifier".
 *
 * Body: multipart/form-data with fields:
 *   - file: File
 *   - orderId: string
 *   - itemId: string (optional — defaults to first item of the order)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const formData = await req.formData();
    const file    = formData.get("file") as File | null;
    const orderId = formData.get("orderId") as string | null;
    const itemId  = formData.get("itemId") as string | null;

    if (!file || !orderId) {
      return NextResponse.json({ error: "file et orderId requis" }, { status: 400 });
    }

    // Validate file type
    const ALLOWED_TYPES = ["application/pdf", "image/png", "image/svg+xml", "application/postscript"];
    const ALLOWED_EXTENSIONS = [".pdf", ".png", ".svg", ".ai"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez PDF, PNG, SVG ou AI." },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 50 Mo)" }, { status: 400 });
    }

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, status, order_items(id)")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // Determine which item to update
    const targetItemId = itemId ?? (order.order_items?.[0] as { id: string } | undefined)?.id;
    if (!targetItemId) {
      return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    }

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const safeName  = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const storagePath = `orders/${orderId}/${user.id}/${timestamp}-${safeName}`;

    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(storagePath, fileBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert:      false,
      });

    if (uploadError) {
      console.error("[Upload Logo] Storage error:", uploadError);
      return NextResponse.json({ error: "Erreur upload fichier" }, { status: 500 });
    }

    // Get public URL (or signed URL if bucket is private)
    const { data: urlData } = supabase.storage
      .from("logos")
      .getPublicUrl(storagePath);

    const fileUrl = urlData.publicUrl;

    // Update order_item with file info
    const { error: itemUpdateError } = await supabase
      .from("order_items")
      .update({
        logo_file_name:   file.name,
        logo_file_url:    fileUrl,
        logo_file_type:   file.type,
        logo_file_size:   file.size,
        logo_file_status: "en_attente",
        logo_uploaded_at: new Date().toISOString(),
        logo_rejection_reason: null,
      })
      .eq("id", targetItemId)
      .eq("order_id", orderId);

    if (itemUpdateError) {
      console.error("[Upload Logo] Item update error:", itemUpdateError);
      return NextResponse.json({ error: "Mise à jour article échouée" }, { status: 500 });
    }

    // Move order status back to "fichier_a_verifier"
    if (order.status === "en_attente_client") {
      await supabase
        .from("orders")
        .update({ status: "fichier_a_verifier" })
        .eq("id", orderId);
    }

    return NextResponse.json({ success: true, fileUrl });
  } catch (err) {
    console.error("[Upload Logo]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
