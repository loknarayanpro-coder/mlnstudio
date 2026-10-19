export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
  sizeBytes?: number;
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateClothingImage(file: { type: string; size: number }): ImageValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Unsupported file format. Please upload JPG, PNG, or WebP images."
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File is too large. Maximum supported image size is 10 MB."
    };
  }

  return {
    valid: true,
    mimeType: file.type,
    sizeBytes: file.size
  };
}

export interface StudioCompositeParams {
  dataUrlOrImg: string | HTMLImageElement;
  polygon?: [number, number][]; // normalized 0-1000 [y, x]
  box_2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  preferredBackground?: "warm white" | "light gray" | "pure white";
}

/**
 * Composites the garment onto a clean studio catalog presentation.
 * Clips away hands, hangers, hooks, and background clutter using contour polygon or bounding box.
 */
export async function composeStudioGarment(params: StudioCompositeParams): Promise<{
  processedUrl: string;
  thumbnailUrl: string;
}> {
  if (typeof window === "undefined") {
    const raw = typeof params.dataUrlOrImg === "string" ? params.dataUrlOrImg : "";
    return { processedUrl: raw, thumbnailUrl: raw };
  }

  let img: HTMLImageElement;
  if (typeof params.dataUrlOrImg === "string") {
    img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = params.dataUrlOrImg as string;
    });
  } else {
    img = params.dataUrlOrImg;
  }

  const bgMap: Record<string, string> = {
    "warm white": "#F9F8F5",
    "light gray": "#F0EFEA",
    "pure white": "#FFFFFF"
  };
  const bgColor = bgMap[params.preferredBackground || "warm white"] || "#F9F8F5";

  // Target 900x1200 (3:4 portrait catalog ratio)
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const raw = typeof params.dataUrlOrImg === "string" ? params.dataUrlOrImg : img.src;
    return { processedUrl: raw, thumbnailUrl: raw };
  }

  // 1. Fill clean studio background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 900, 1200);

  // 2. Studio soft radial lighting highlight
  const radialGlow = ctx.createRadialGradient(450, 480, 50, 450, 480, 600);
  radialGlow.addColorStop(0, "rgba(255, 255, 255, 0.9)");
  radialGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, 900, 1200);

  // 3. Compute garment bounds in original image pixels
  const imgW = img.naturalWidth || img.width || 1000;
  const imgH = img.naturalHeight || img.height || 1000;

  const yminNorm = params.box_2d?.[0] ?? (params.polygon ? Math.min(...params.polygon.map(p => p[0])) : 50);
  const xminNorm = params.box_2d?.[1] ?? (params.polygon ? Math.min(...params.polygon.map(p => p[1])) : 50);
  const ymaxNorm = params.box_2d?.[2] ?? (params.polygon ? Math.max(...params.polygon.map(p => p[0])) : 950);
  const xmaxNorm = params.box_2d?.[3] ?? (params.polygon ? Math.max(...params.polygon.map(p => p[1])) : 950);

  const cropX = (xminNorm / 1000) * imgW;
  const cropY = (yminNorm / 1000) * imgH;
  const cropW = Math.max(20, ((xmaxNorm - xminNorm) / 1000) * imgW);
  const cropH = Math.max(20, ((ymaxNorm - yminNorm) / 1000) * imgH);

  // Scale and center the garment in 900x1200 canvas
  const targetMaxW = 680;
  const targetMaxH = 880;
  const scale = Math.min(targetMaxW / cropW, targetMaxH / cropH);
  const drawW = cropW * scale;
  const drawH = cropH * scale;
  const destX = (900 - drawW) / 2;
  const destY = (1200 - drawH) / 2;

  // 4. Studio soft contact ground shadow
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(450, destY + drawH - 12, drawW * 0.36, 16, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(25, 28, 24, 0.12)";
  ctx.filter = "blur(14px)";
  ctx.fill();
  ctx.restore();

  // 5. Draw garment (clipped to polygon contour or bounding box)
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (params.polygon && params.polygon.length >= 3) {
    ctx.beginPath();
    for (let i = 0; i < params.polygon.length; i++) {
      const [py, px] = params.polygon[i];
      const ptImgX = (px / 1000) * imgW;
      const ptImgY = (py / 1000) * imgH;
      const ptCanvasX = destX + (ptImgX - cropX) * scale;
      const ptCanvasY = destY + (ptImgY - cropY) * scale;
      if (i === 0) ctx.moveTo(ptCanvasX, ptCanvasY);
      else ctx.lineTo(ptCanvasX, ptCanvasY);
    }
    ctx.closePath();
    ctx.clip();
  } else {
    // Rounded bounding box clip
    ctx.beginPath();
    ctx.roundRect(destX, destY, drawW, drawH, 16);
    ctx.clip();
  }

  // Draw garment portion
  ctx.drawImage(img, cropX, cropY, cropW, cropH, destX, destY, drawW, drawH);
  ctx.restore();

  const processedUrl = canvas.toDataURL("image/png");

  // Thumbnail (200x266)
  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = 200;
  thumbCanvas.height = 266;
  const thumbCtx = thumbCanvas.getContext("2d");
  if (thumbCtx) {
    thumbCtx.drawImage(canvas, 0, 0, 200, 266);
    const thumbnailUrl = thumbCanvas.toDataURL("image/webp", 0.88);
    return { processedUrl, thumbnailUrl };
  }

  return { processedUrl, thumbnailUrl: processedUrl };
}

/**
 * Client/Server Image processing helper
 * Generates clean studio presentation on a neutral #F6F5F0 background,
 * maintaining silhouette, seams, and true colors.
 */
export async function processCatalogImage(
  dataUrlOrBlob: string
): Promise<{ processedUrl: string; thumbnailUrl: string; status: "processed" | "original" }> {
  if (typeof window !== "undefined") {
    try {
      const res = await composeStudioGarment({ dataUrlOrImg: dataUrlOrBlob });
      return { processedUrl: res.processedUrl, thumbnailUrl: res.thumbnailUrl, status: "processed" };
    } catch (err) {
      console.warn("Catalog image canvas processing failed, keeping original:", err);
    }
  }

  // Fallback to original
  return {
    processedUrl: dataUrlOrBlob,
    thumbnailUrl: dataUrlOrBlob,
    status: "original"
  };
}
