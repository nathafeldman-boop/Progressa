"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

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

export function ProfilePhotoUpload({ currentPhotoUrl }: { currentPhotoUrl: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const img = await readFileAsImage(file);
      const dataUrl = toSquareJpegDataUrl(img);
      const res = await fetch("/api/profile/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoDataUrl: dataUrl }),
      });
      if (!res.ok) throw new Error("upload_failed");
      setPreview(dataUrl);
      router.refresh();
    } catch {
      setError("La photo n'a pas pu être envoyée. Réessaie avec une autre image.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    setError(null);
    try {
      await fetch("/api/profile/photo", { method: "DELETE" });
      setPreview(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL, pas un asset optimisable par next/image
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl">👤</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "…" : preview ? "Changer la photo" : "Ajouter une photo"}
          </Button>
          {preview && (
            <Button variant="ghost" disabled={busy} onClick={handleRemove}>
              Retirer
            </Button>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>}
      </div>
    </div>
  );
}
