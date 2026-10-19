import { getSupabaseClient } from "./client";

export const WARDROBE_STORAGE_BUCKET = "wardrobe-images";

/**
 * Uploads a garment image (original or processed studio photo) to Supabase Storage
 * and returns the public URL.
 */
export async function uploadWardrobeImage(
  fileOrBlob: File | Blob,
  fileName: string,
  userId?: string
): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  try {
    const cleanUserId = userId || "atelier-creations";
    const extension = fileOrBlob.type === "image/png" ? "png" : fileOrBlob.type === "image/webp" ? "webp" : "jpg";
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    const storagePath = `${cleanUserId}/${Date.now()}-${sanitizedFileName}.${extension}`;

    const { data, error } = await supabase.storage
      .from(WARDROBE_STORAGE_BUCKET)
      .upload(storagePath, fileOrBlob, {
        cacheControl: "3600",
        upsert: true,
        contentType: fileOrBlob.type || "image/jpeg"
      });

    if (error) {
      console.warn("Supabase Storage upload warning:", error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(WARDROBE_STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    return urlData.publicUrl || null;
  } catch (err) {
    console.warn("Failed to upload image to Supabase Storage:", err);
    return null;
  }
}
