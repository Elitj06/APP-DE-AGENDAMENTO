export default function PainelLoading() {
  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar skeleton */}
      <div className="hidden lg:block w-64 bg-surface-950" />
      {/* Main skeleton */}
      <div className="flex-1 p-6 space-y-6 animate-pulse">
        <div className="h-16 bg-white border-b border-surface-200/60 -mx-6 -mt-6 mb-6" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-surface-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-surface-200 rounded-2xl" />
          <div className="h-64 bg-surface-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
