export default function AppLoading() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="text-center space-y-4 animate-pulse">
        <div className="w-20 h-20 rounded-2xl bg-brand-500/20 mx-auto" />
        <div className="h-4 w-32 bg-white/10 rounded-full mx-auto" />
        <div className="h-3 w-24 bg-white/5 rounded-full mx-auto" />
      </div>
    </div>
  );
}
