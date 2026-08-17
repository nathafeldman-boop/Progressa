"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DailyCheckin, GrowthEntry, MatchLog, PainLog, PersonalGoal } from "@prisma/client";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

type Tab = "checkin" | "douleurs" | "croissance" | "matchs" | "objectifs";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "checkin", label: "Forme du jour", emoji: "🌡️" },
  { id: "douleurs", label: "Douleurs", emoji: "🩹" },
  { id: "croissance", label: "Croissance", emoji: "📏" },
  { id: "matchs", label: "Matchs", emoji: "⚽" },
  { id: "objectifs", label: "Objectifs", emoji: "🎯" },
];

export function JournalTabs({
  todayCheckin,
  painLogs,
  growthEntries,
  matchLogs,
  goals,
}: {
  todayCheckin: DailyCheckin | null;
  painLogs: PainLog[];
  growthEntries: GrowthEntry[];
  matchLogs: MatchLog[];
  goals: PersonalGoal[];
}) {
  const [tab, setTab] = useState<Tab>("checkin");

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-3">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}>
            <Chip className={tab === t.id ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]" : ""}>
              {t.emoji} {t.label}
            </Chip>
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "checkin" && <CheckinSection initial={todayCheckin} />}
        {tab === "douleurs" && <PainSection logs={painLogs} />}
        {tab === "croissance" && <GrowthSection entries={growthEntries} />}
        {tab === "matchs" && <MatchSection logs={matchLogs} />}
        {tab === "objectifs" && <GoalsSection goals={goals} />}
      </div>
    </div>
  );
}

function ScaleInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[var(--color-text-muted)]">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 rounded-[var(--radius-control)] border py-2 text-sm font-bold ${
              value === n ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]" : "border-[var(--color-border)]"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckinSection({ initial }: { initial: DailyCheckin | null }) {
  const router = useRouter();
  const [sleepHours, setSleepHours] = useState(initial?.sleepHours?.toString() ?? "");
  const [sleepQuality, setSleepQuality] = useState(initial?.sleepQuality ?? 3);
  const [energy, setEnergy] = useState(initial?.energy ?? 3);
  const [soreness, setSoreness] = useState(initial?.soreness ?? 3);
  const [mood, setMood] = useState(initial?.mood ?? 3);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sleepHours: sleepHours ? Number(sleepHours) : null,
          sleepQuality,
          energy,
          soreness,
          mood,
        }),
      });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="space-y-4">
      <CardTitle className="text-base">Comment tu te sens aujourd&apos;hui ?</CardTitle>
      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--color-text-muted)]">Heures de sommeil</label>
        <input
          type="number"
          className="w-24 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
          value={sleepHours}
          onChange={(e) => setSleepHours(e.target.value)}
        />
      </div>
      <ScaleInput label="Qualité du sommeil" value={sleepQuality} onChange={setSleepQuality} />
      <ScaleInput label="Énergie" value={energy} onChange={setEnergy} />
      <ScaleInput label="Courbatures" value={soreness} onChange={setSoreness} />
      <ScaleInput label="Humeur" value={mood} onChange={setMood} />
      <Button className="w-full" onClick={submit} disabled={submitting}>
        {initial ? "Mettre à jour" : "Enregistrer"}
      </Button>
    </Card>
  );
}

function PainSection({ logs }: { logs: PainLog[] }) {
  const router = useRouter();
  const [bodyPart, setBodyPart] = useState("");
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!bodyPart.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/pain-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyPart, intensity, note: note || undefined }),
      });
      setBodyPart("");
      setNote("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function resolve(id: string) {
    await fetch("/api/pain-logs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <Card className="space-y-3">
        <CardTitle className="text-base">Signaler une douleur ou une gêne</CardTitle>
        <input
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
          placeholder="Partie du corps (ex: cheville droite)"
          value={bodyPart}
          onChange={(e) => setBodyPart(e.target.value)}
        />
        <ScaleInput label="Intensité" value={intensity} onChange={setIntensity} />
        <textarea
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
          placeholder="Note (facultatif)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button className="w-full" onClick={submit} disabled={submitting}>
          Enregistrer
        </Button>
      </Card>

      {logs.map((log) => (
        <Card key={log.id} className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">{log.bodyPart}</CardTitle>
            <CardSubtitle>
              Intensité {log.intensity}/5 · {log.status === "RESOLVED" ? "Résolu" : "Non résolu"}
            </CardSubtitle>
          </div>
          {log.status === "UNRESOLVED" && (
            <Button variant="secondary" onClick={() => resolve(log.id)}>
              Marquer résolu
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}

function GrowthSection({ entries }: { entries: GrowthEntry[] }) {
  const router = useRouter();
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      await fetch("/api/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heightCm: heightCm ? Number(heightCm) : null,
          weightKg: weightKg ? Number(weightKg) : null,
        }),
      });
      setHeightCm("");
      setWeightKg("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <Card className="space-y-3">
        <CardTitle className="text-base">Nouvelle mesure</CardTitle>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Taille (cm)"
            className="flex-1 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
          />
          <input
            type="number"
            placeholder="Poids (kg)"
            className="flex-1 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </div>
        <Button className="w-full" onClick={submit} disabled={submitting}>
          Enregistrer
        </Button>
      </Card>
      {entries.map((entry) => (
        <Card key={entry.id} className="flex justify-between text-sm">
          <span>{new Date(entry.date).toLocaleDateString("fr-FR")}</span>
          <span>
            {entry.heightCm ? `${entry.heightCm}cm` : ""} {entry.weightKg ? `${entry.weightKg}kg` : ""}
          </span>
        </Card>
      ))}
    </div>
  );
}

function MatchSection({ logs }: { logs: MatchLog[] }) {
  const router = useRouter();
  const [opponent, setOpponent] = useState("");
  const [feeling, setFeeling] = useState(7);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: new Date().toISOString(), opponent: opponent || undefined, feeling, note: note || undefined }),
      });
      setOpponent("");
      setNote("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <Card className="space-y-3">
        <CardTitle className="text-base">Nouveau match</CardTitle>
        <input
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
          placeholder="Adversaire"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
        />
        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--color-text-muted)]">Ressenti /10</label>
          <input
            type="range"
            min={1}
            max={10}
            value={feeling}
            onChange={(e) => setFeeling(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-center text-sm font-bold">{feeling}/10</p>
        </div>
        <textarea
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
          placeholder="Un truc à travailler la prochaine fois ?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button className="w-full" onClick={submit} disabled={submitting}>
          Enregistrer
        </Button>
      </Card>
      {logs.map((log) => (
        <Card key={log.id}>
          <CardTitle className="text-sm">
            {log.opponent ?? "Match"} · {new Date(log.date).toLocaleDateString("fr-FR")}
          </CardTitle>
          <CardSubtitle>Ressenti {log.feeling ?? "-"}/10</CardSubtitle>
        </Card>
      ))}
    </div>
  );
}

function GoalsSection({ goals }: { goals: PersonalGoal[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      setTitle("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function toggle(id: string) {
    await fetch("/api/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <Card className="flex gap-2">
        <input
          className="flex-1 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
          placeholder="Un nouvel objectif"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button onClick={submit} disabled={submitting}>
          Ajouter
        </Button>
      </Card>
      {goals.map((goal) => (
        <Card key={goal.id} className="flex items-center justify-between">
          <span className={goal.status === "DONE" ? "line-through text-[var(--color-text-muted)]" : ""}>{goal.title}</span>
          <button type="button" onClick={() => toggle(goal.id)} className="text-2xl">
            {goal.status === "DONE" ? "✅" : "⬜️"}
          </button>
        </Card>
      ))}
    </div>
  );
}
