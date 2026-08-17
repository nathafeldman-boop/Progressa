"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

export function MicroSurveyPrompt({
  surveyKey,
  question,
  options,
  onDone,
}: {
  surveyKey: string;
  question: string;
  options: string[];
  onDone: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function respond(answer: string | null, skipped: boolean) {
    setSubmitting(true);
    try {
      await fetch("/api/micro-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyKey, question, answer, skipped }),
      });
    } catch {
      // best-effort
    } finally {
      onDone();
    }
  }

  return (
    <Card>
      <CardTitle className="text-base">{question}</CardTitle>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button key={option} type="button" disabled={submitting} onClick={() => respond(option, false)}>
            <Chip>{option}</Chip>
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={submitting}
        onClick={() => respond(null, true)}
        className="mt-3 text-xs font-semibold text-[var(--color-text-muted)] underline"
      >
        Passer cette question
      </button>
    </Card>
  );
}
