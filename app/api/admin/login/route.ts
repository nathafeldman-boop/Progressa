import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const secret = process.env.ADMIN_DASHBOARD_SECRET;

  if (!secret || body.secret !== secret) {
    return NextResponse.json({ error: "invalid_secret" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12, // 12h
  });
  return response;
}
