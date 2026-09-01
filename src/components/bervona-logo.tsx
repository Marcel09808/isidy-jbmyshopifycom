import markAsset from "@/assets/bervona-mark.png.asset.json";
import logoAsset from "@/assets/bervona-logo.png.asset.json";

export function BervonaMark({ className = "" }: { className?: string }) {
  return <img src={markAsset.url} alt="Bervona" className={`h-11 w-auto ${className}`} width={44} height={44} />;
}

export function BervonaLogo({ className = "" }: { className?: string }) {
  return <img src={logoAsset.url} alt="Bervona" className={`h-14 w-auto ${className}`} width={220} height={66} />;
}
