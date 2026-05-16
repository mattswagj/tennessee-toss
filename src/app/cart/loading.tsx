function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-brown/10 rounded-xl animate-pulse ${className}`} />;
}

function CartItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
      <SkeletonBlock className="w-20 h-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2 justify-center">
        <SkeletonBlock className="h-4 w-2/3" />
        <SkeletonBlock className="h-3 w-1/3" />
        <div className="flex items-center gap-3 mt-1">
          <SkeletonBlock className="w-7 h-7 rounded-full" />
          <SkeletonBlock className="w-6 h-4" />
          <SkeletonBlock className="w-7 h-7 rounded-full" />
        </div>
      </div>
      <SkeletonBlock className="w-14 h-5 self-center" />
    </div>
  );
}

export default function CartLoading() {
  return (
    <main className="min-h-screen bg-cream px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Title */}
        <SkeletonBlock className="h-10 w-36" />

        {/* Cart items */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <CartItemSkeleton key={i} />)}
        </div>

        {/* Order type */}
        <div className="bg-white rounded-2xl p-5 shadow-soft space-y-3">
          <SkeletonBlock className="h-5 w-28" />
          <div className="flex gap-3">
            <SkeletonBlock className="h-10 flex-1 rounded-xl" />
            <SkeletonBlock className="h-10 flex-1 rounded-xl" />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-soft space-y-3">
          {[["Subtotal", "w-20"], ["Tax (8%)", "w-16"], ["Total", "w-24"]].map(([, w], i) => (
            <div key={i} className="flex justify-between items-center">
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className={`h-4 ${w}`} />
            </div>
          ))}
        </div>

        {/* Checkout button */}
        <SkeletonBlock className="h-14 w-full rounded-2xl" />
      </div>
    </main>
  );
}
