import { notFound } from "next/navigation";
import { TRAINING_THEMES, type TrainingTheme } from "@/lib/programs/build-targeted-session";
import { ExerciseCatalogPicker } from "@/components/dashboard/ExerciseCatalogPicker";

export default async function EntrainementCiblePage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme } = await params;
  if (!TRAINING_THEMES.includes(theme as TrainingTheme)) notFound();

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <ExerciseCatalogPicker theme={theme as TrainingTheme} />
    </div>
  );
}
