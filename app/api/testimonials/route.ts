import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().min(10).max(600),
});

export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  // Modération manuelle avant publication (section 6.8) — jamais publié
  // directement, et jamais le nom de famille (RGPD mineurs).
  const testimonial = await prisma.testimonial.create({
    data: {
      userId: user.id,
      rating: parsed.data.rating,
      text: parsed.data.text,
      firstNameSnapshot: user.firstName,
      status: "PENDING",
    },
  });

  return NextResponse.json({ ok: true, testimonial });
}
