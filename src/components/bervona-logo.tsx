import markAsset from "@/assets/bervona-mark.png.asset.json";
import logoAsset from "@/assets/bervona-logo.png.asset.json";

export function BervonaMark({ className = "" }: { className?: string }) {
  return <img src={markAsset.url} alt="Bervona" className={`h-10 w-auto ${className}`} width={40} height={40} />;
}

export function BervonaLogo({ className = "" }: { className?: string }) {
  return <img src={logoAsset.url} alt="Bervona" className={`h-10 w-auto ${className}`} width={160} height={48} />;
}
