export default function CardEstatistica({ titulo, valor }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-sm text-muted">{titulo}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-fg">{valor}</div>
    </div>
  );
}
