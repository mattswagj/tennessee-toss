function SkeletonPill() {
  return <div className="h-9 w-20 bg-primary/10 rounded-full animate-pulse" />;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col">
      <div className="w-full h-40 bg-cream animate-pulse" />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between gap-2">
          <div className="h-4 bg-brown/10 rounded-lg flex-1 animate-pulse" />
          <div className="h-4 w-14 bg-primary/10 rounded-lg animate-pulse" />
        </div>
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-3 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
        <div className="h-9 bg-primary/10 rounded-xl mt-auto animate-pulse" />
      </div>
    </div>
  );
}

export default function MenuLoading() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-primary/5 py-10 px-4 text-center">
        <div className="h-10 w-48 bg-primary/20 rounded-xl mx-auto mb-3 animate-pulse" />
        <div className="h-4 w-64 bg-primary/10 rounded-lg mx-auto animate-pulse" />
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filter pills skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonPill key={i} />
          ))}
        </div>
        {/* Category heading skeleton */}
        <div className="h-6 w-36 bg-brown/15 rounded-lg mb-4 animate-pulse" />
        {/* Card grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
