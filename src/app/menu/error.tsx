"use client";

import Link from "next/link";

export default function MenuError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-3xl shadow-soft p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl" role="img" aria-label="salad bowl">🥗</span>
        </div>
        <h1 className="font-script text-4xl text-primary mb-1">Something went wrong</h1>
        <p className="font-script text-2xl text-primary/60 mb-6">Error al cargar el menú</p>
        {process.env.NODE_ENV !== "production" && error.message && (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-6 text-left font-mono break-all">
            {error.message}
          </p>
        )}
        <p className="text-gray-500 text-sm mb-6">
          We couldn&apos;t load the menu right now. Please try again.
          <br />
          <span className="text-gray-400">No pudimos cargar el menú.</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            Try again / Intentar
          </button>
          <Link
            href="/"
            className="border border-primary text-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary/5 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            Go home / Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
