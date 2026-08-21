import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_TTL_MS, createAdminToken, verifyAdminSecret } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const secret = process.env.ADMIN_DASHBOARD_SECRET;

  if (!secret || typeof body.secret !== "string" || !verifyAdminSecret(body.secret, secret)) {
    return NextResponse.json({ error: "invalid_secret" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_MS / 1000,
  });
  return response;
}
