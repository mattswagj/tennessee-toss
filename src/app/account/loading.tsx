function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-brown/10 rounded-xl animate-pulse ${className}`} />;
}

export default function AccountLoading() {
  return (
    <main className="min-h-screen bg-cream px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <SkeletonBlock className="h-10 w-48" />

        {/* Member card skeleton */}
        <div className="bg-white rounded-3xl shadow-soft p-6 flex flex-col gap-4">
          <SkeletonBlock className="h-5 w-32" />
          <div className="flex gap-4">
            <SkeletonBlock className="w-28 h-28 rounded-xl" />
            <div className="flex-1 flex flex-col gap-3 justify-center">
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-3 w-1/2" />
              <SkeletonBlock className="h-3 w-2/3" />
            </div>
          </div>
        </div>

        {/* Points balance skeleton */}
        <div className="bg-white rounded-3xl shadow-soft p-6">
          <SkeletonBlock className="h-5 w-36 mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 items-center">
                <SkeletonBlock className="h-7 w-16" />
                <SkeletonBlock className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Rewards skeleton */}
        <div className="bg-white rounded-3xl shadow-soft p-6 flex flex-col gap-3">
          <SkeletonBlock className="h-5 w-40 mb-2" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-cream rounded-xl">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Orders skeleton */}
        <div className="bg-white rounded-3xl shadow-soft p-6 flex flex-col gap-3">
          <SkeletonBlock className="h-5 w-32 mb-2" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-cream last:border-0">
              <div className="flex flex-col gap-2">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-3 w-20" />
              </div>
              <SkeletonBlock className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
