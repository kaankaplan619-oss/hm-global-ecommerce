"use client";

export type StudioAssetKind =
  | "logo"
  | "print"
  | "preview-face"
  | "preview-back";

export interface StudioAssetUploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
}

export async function uploadStudioAsset(
  blob: Blob,
  sessionId: string,
  kind: StudioAssetKind,
  filename: string,
): Promise<StudioAssetUploadResult> {
  const file = blob instanceof File
    ? blob
    : new File([blob], filename, { type: blob.type || "image/png" });
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sessionId", sessionId);
  formData.append("kind", kind);

  const response = await fetch("/api/studio/upload-asset", {
    method: "POST",
    body: formData,
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error ?? "Le fichier n'a pas pu être enregistré.");
  }

  return body as StudioAssetUploadResult;
}
