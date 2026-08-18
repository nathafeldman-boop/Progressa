export function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div
        className="page-spinner h-8 w-8 rounded-full border-[3px] border-[var(--color-primary-soft)] border-t-[var(--color-primary)]"
        role="status"
        aria-label="Chargement"
      />
    </div>
  );
}
