/**
 * PriceDisclaimer — TEMPORARY placeholder-price banner.
 *
 * All menu prices are currently market-research-based ESTIMATES (see
 * update-prices.sql). This banner makes that clear to customers wherever
 * prices are shown. Remove it (and the "*" markers on prices) once Jordi
 * confirms real pricing.
 */
export function PriceDisclaimer({ note }: { note: string }) {
  return (
    <div
      role="note"
      className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      <span aria-hidden="true" className="mt-0.5 flex-shrink-0">⚠️</span>
      <p>{note}</p>
    </div>
  );
}
