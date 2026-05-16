import type { CSSProperties } from "react";

function SkeletonBlock({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <div className={`bg-brown/10 rounded-xl animate-pulse ${className}`} style={style} />;
}

function StatCard() {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-5 flex flex-col gap-3">
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="h-8 w-20" />
      <SkeletonBlock className="h-3 w-16" />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-cream px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <SkeletonBlock className="h-9 w-56" />

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCard key={i} />)}
        </div>

        {/* Orders table skeleton */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <SkeletonBlock className="h-6 w-32 mb-6" />
          <div className="space-y-3">
            {/* Table header */}
            <div className="flex gap-4 pb-3 border-b border-cream">
              {[80, 100, 60, 60, 70].map((w, i) => (
                <SkeletonBlock key={i} className="h-3" style={{ width: w }} />
              ))}
            </div>
            {/* Table rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 py-2">
                {[80, 100, 60, 60, 70].map((w, j) => (
                  <SkeletonBlock key={j} className="h-4" style={{ width: w }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
