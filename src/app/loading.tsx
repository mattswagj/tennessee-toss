export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" aria-label="Loading" />
        <p className="font-script text-2xl text-primary animate-pulse-soft">Tennessee Toss</p>
      </div>
    </div>
  );
}
