import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(500).nullable().optional(),
});

/**
 * Avis rapide laissé juste après un exercice précis — jamais bloquant,
 * jamais modéré (signal interne pour repérer les exercices mal reçus), à
 * ne pas confondre avec Testimonial (avis global sur l'app, publié sur la LP).
 */
export async function POST(request: Request, { params }: { params: Promise<{ exerciseId: string }> }) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { exerciseId } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId }, select: { id: true } });
  if (!exercise) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.exerciseRating.create({
    data: {
      userId: user.id,
      exerciseId,
      rating: parsed.data.rating,
      feedback: parsed.data.feedback?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true });
}
