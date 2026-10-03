export default function CardEstatistica({ titulo, valor }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="text-sm text-gray-500">{titulo}</div>
      <div className="mt-1 text-2xl font-bold">{valor}</div>
    </div>
  );
}
