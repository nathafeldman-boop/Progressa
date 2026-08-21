const TARGET_SIZE = 256;
const JPEG_QUALITY = 0.72;

function readFileAsImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read_failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode_failed"));
      img.onload = () => resolve(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Recadre en carré centré et compresse en JPEG ~256px, pour rester loin de la limite de taille en base de données. */
function toSquareJpegDataUrl(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = TARGET_SIZE;
  canvas.height = TARGET_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");

  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, TARGET_SIZE, TARGET_SIZE);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

/** Recadre/compresse un fichier choisi puis l'envoie à /api/profile/photo. Lève en cas d'échec. */
export async function uploadProfilePhoto(file: File): Promise<string> {
  const img = await readFileAsImage(file);
  const dataUrl = toSquareJpegDataUrl(img);
  const res = await fetch("/api/profile/photo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ photoDataUrl: dataUrl }),
  });
  if (!res.ok) throw new Error("upload_failed");
  return dataUrl;
}
