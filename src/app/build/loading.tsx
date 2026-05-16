function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-brown/10 rounded-xl animate-pulse ${className}`} />;
}

function OptionCard() {
  return (
    <div className="bg-white rounded-2xl p-4 border-2 border-transparent flex flex-col gap-2">
      <SkeletonBlock className="w-full h-24 rounded-xl" />
      <SkeletonBlock className="h-4 w-3/4 mx-auto" />
    </div>
  );
}

export default function BuildLoading() {
  return (
    <main className="min-h-screen bg-cream px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <SkeletonBlock className="h-10 w-52 mx-auto" />
          <SkeletonBlock className="h-4 w-72 mx-auto" />
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 animate-pulse" />
              {i < 4 && <div className="w-8 h-0.5 bg-primary/10" />}
            </div>
          ))}
        </div>

        {/* Step label */}
        <SkeletonBlock className="h-6 w-40" />

        {/* Options grid */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <OptionCard key={i} />)}
        </div>

        {/* Running total skeleton */}
        <div className="bg-white rounded-2xl p-4 flex justify-between items-center shadow-soft">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-6 w-16" />
        </div>

        {/* Nav buttons skeleton */}
        <div className="flex gap-3">
          <SkeletonBlock className="h-12 flex-1 rounded-xl" />
          <SkeletonBlock className="h-12 flex-1 rounded-xl" />
        </div>
      </div>
    </main>
  );
}
