import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/Card";

export function ArticlePage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { heading: string; emoji: string; body: string[] }[];
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 py-10">
      <Link href="/ressources" className="text-sm text-[var(--color-text-muted)] underline">
        ← Ressources
      </Link>
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide">{title}</h1>
      <p className="text-[var(--color-text-muted)]">{intro}</p>
      {sections.map((section) => (
        <Card key={section.heading}>
          <CardTitle className="text-base">
            {section.emoji} {section.heading}
          </CardTitle>
          <div className="mt-2 space-y-2 text-sm text-[var(--color-text)]">
            {section.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
