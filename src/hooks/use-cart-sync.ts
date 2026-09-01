import { useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";

export function useCartSync() {
  const syncCart = useCartStore((state) => state.syncCart);
  useEffect(() => {
    void syncCart();
    const onVisibility = () => document.visibilityState === "visible" && void syncCart();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [syncCart]);
}