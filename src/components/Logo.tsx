export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 font-display text-lg font-bold ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-highlight text-highlight-foreground">R</span>
      Findme
    </span>
  );
}
