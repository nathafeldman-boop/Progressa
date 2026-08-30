import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { APP_NAME, APP_TAGLINE } from "@/lib/app-config";

export const alt = `${APP_NAME} — ${APP_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const logoData = await readFile(join(process.cwd(), "public/logo-mark.png"), "base64");
const logoSrc = `data:image/png;base64,${logoData}`;

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "linear-gradient(165deg, #123a24, #081d13)",
        }}
      >
        <img src={logoSrc} width={140} height={140} alt="" />
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -2,
            color: "#ffffff",
            textTransform: "uppercase",
          }}
        >
          {APP_NAME}
        </div>
        <div style={{ fontSize: 34, color: "#9fd6b4", maxWidth: 900, textAlign: "center" }}>{APP_TAGLINE}</div>
      </div>
    ),
    { ...size }
  );
}
