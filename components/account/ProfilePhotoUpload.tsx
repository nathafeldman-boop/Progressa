"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { uploadProfilePhoto } from "@/lib/client/profile-photo";

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
      const dataUrl = await uploadProfilePhoto(file);
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
