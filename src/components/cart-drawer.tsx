import { useEffect, useState } from "react";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cart-store";

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function CartDrawer({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const { items, isLoading, isSyncing, checkoutUrl, updateQuantity, removeItem, syncCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + Number(item.price.amount) * item.quantity, 0);

  useEffect(() => { if (isOpen) void syncCart(); }, [isOpen, syncCart]);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      {open === undefined && (
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Carrito, ${totalItems} artículos`} className="relative">
            <ShoppingBag />
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="flex w-full flex-col border-l border-border sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-3xl">Tu carrito</SheetTitle>
          <SheetDescription>{totalItems ? `${totalItems} ${totalItems === 1 ? "artículo" : "artículos"}` : "Tu próximo paseo empieza aquí."}</SheetDescription>
        </SheetHeader>
        {!items.length ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center text-muted-foreground"><ShoppingBag className="size-10" /><p>El carrito está vacío.</p></div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col pt-8">
            <div className="flex-1 space-y-5 overflow-y-auto">
              {items.map((item) => (
                <article key={item.variantId} className="flex gap-4 border-b border-border pb-5">
                  {item.product.node.images.edges[0]?.node.url ? <img className="size-20 rounded-sm object-cover" src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} /> : <div className="size-20 rounded-sm bg-secondary" />}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium">Bervona</h3>
                    <p className="text-sm text-muted-foreground">{item.variantTitle}</p>
                    <p className="mt-1 font-semibold">{euros.format(Number(item.price.amount))}</p>
                    <div className="mt-3 flex items-center gap-1">
                      <Button variant="outline" size="icon" className="size-7" aria-label="Restar uno" onClick={() => void updateQuantity(item.variantId, item.quantity - 1)}><Minus /></Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="size-7" aria-label="Sumar uno" onClick={() => void updateQuantity(item.variantId, item.quantity + 1)}><Plus /></Button>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="size-8" aria-label="Eliminar" onClick={() => void removeItem(item.variantId)}><Trash2 /></Button>
                </article>
              ))}
            </div>
            <div className="space-y-4 border-t border-border pt-5">
              <div className="flex justify-between text-lg font-semibold"><span>Total</span><span>{euros.format(total)}</span></div>
              <p className="text-xs text-muted-foreground">El envío se calcula en el checkout.</p>
              <Button variant="hero" size="xl" className="w-full" disabled={!checkoutUrl || isLoading || isSyncing} onClick={() => checkoutUrl && window.open(checkoutUrl, "_blank")}>
                {isLoading || isSyncing ? <Loader2 className="animate-spin" /> : <ShoppingBag />} Ir al checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}