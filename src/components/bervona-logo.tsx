import { Droplets } from "lucide-react";

export function BervonaMark({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-mark ${className}`} aria-hidden="true">
      <Droplets strokeWidth={1.8} />
      <span className="brand-paw">●</span>
    </span>
  );
}

export function BervonaLogo() {
  return <span className="inline-flex items-center gap-3"><BervonaMark /><span className="font-display text-2xl font-semibold tracking-normal">BERVONA</span></span>;
}