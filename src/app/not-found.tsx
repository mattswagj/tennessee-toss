import Link from "next/link";
import { EmptyBowl } from "@/components/illustrations/EmptyBowl";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-sm">
        <EmptyBowl size={120} className="mx-auto mb-6 opacity-70" aria-hidden="true" />
        <h1 className="font-script text-5xl text-primary mb-2">
          Oops, this page got tossed
        </h1>
        <p className="font-script text-3xl text-primary/60 mb-4">
          Esta página se fue al tazón
        </p>
        <p className="text-gray-500 text-sm mb-8">
          We couldn&apos;t find what you were looking for. Head back home and we&apos;ll get you sorted.
          <br />
          <span className="text-gray-400">No encontramos lo que buscabas.</span>
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          Back home / Inicio
        </Link>
      </div>
    </main>
  );
}
