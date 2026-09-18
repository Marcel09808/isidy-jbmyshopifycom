import { useEffect, useRef, useState } from "react";
import { ArrowDown, Check, ChevronRight, Droplets, Feather, Loader2, LockKeyhole, PackageCheck, RotateCcw, ShieldCheck, Sparkles, Truck, Utensils, WashingMachine } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BervonaLogo, BervonaMark } from "@/components/bervona-logo";
import { CartDrawer } from "@/components/cart-drawer";
import { useCartSync } from "@/hooks/use-cart-sync";
import { useCartStore } from "@/stores/cart-store";
import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify";
import heroImage from "@/assets/bervona-hero.jpg";
import lifestyleImage from "@/assets/bervona-lifestyle.jpg";
import pink1 from "@/assets/drop-pink-1.jpg";
import pink2 from "@/assets/drop-pink-2.jpg";
import pink3 from "@/assets/drop-pink-3.jpg";
import pink4 from "@/assets/drop-pink-4.jpg";
import blue1 from "@/assets/drop-blue-1.jpg";

import blue3 from "@/assets/drop-blue-3.jpg";
import blue4 from "@/assets/drop-blue-4.jpg";

const features = [
  { icon: Droplets, title: "Cuenco instantáneo", text: "Despliega la silicona integrada y sirve al momento." },
  { icon: Utensils, title: "Agua o comida", text: "Un solo accesorio para hidratar o dar un snack." },
  { icon: LockKeyhole, title: "Cierre antigoteo", text: "Tapa segura para llevarla sin sustos en la mochila." },
  { icon: Feather, title: "Solo 186 g", text: "Ligera para ti, capacidad suficiente para su paseo." },
  { icon: WashingMachine, title: "Lavavajillas", text: "Limpieza sencilla después de cada aventura." },
  { icon: PackageCheck, title: "Siempre a mano", text: "Cordón y mosquetón para correa, mochila o cinturón." },
];

const colors = [
  { label: "Rosa", match: /pink|rosa/i, gallery: [pink1, pink3, pink4], dot: "#f2a3bd", note: "Silicona rosa" },
  { label: "Azul", match: /blue|azul|turq/i, gallery: [blue1, blue2, blue3, blue4], dot: "#37c6cd", note: "Silicona turquesa" },
];

const tickerItems = ["285 ml", "186 g", "Acero inoxidable", "Sin BPA", "Cuenco integrado", "Antigoteo", "Apta lavavajillas", "Envío gratis"];

const stats = [
  { value: "285 ml", label: "Capacidad" },
  { value: "186 g", label: "Peso total" },
  { value: "2 en 1", label: "Agua y comida" },
  { value: "0 €", label: "Envío a España" },
];

function scrollToElement(el: HTMLElement | null, offset = 80) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

function useReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-in")),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
}

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

const packs = [
  { qty: 1, units: "1 unidad", price: 23.57, compareAt: 34.99, note: "Para tu compañero" },
  { qty: 2, units: "2 unidades", price: 42.99, compareAt: 69.98, note: "Una para cada paseo" },
  { qty: 3, units: "3 unidades", price: 57.99, compareAt: 104.97, note: "Mejor precio por unidad", popular: true },
];

export function BervonaStore({ product, unavailable = false }: { product: ShopifyProduct; unavailable?: boolean }) {
  useCartSync();
  useReveal();
  const variants = product.node.variants.edges.map((edge) => edge.node);
  const findVariant = (match: RegExp) => variants.find((v) => match.test(v.title));
  const [colorIndex, setColorIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [selected, setSelected] = useState<ShopifyVariant | undefined>(
    findVariant(colors[0]!.match) ?? variants[0],
  );
  const [quantity, setQuantity] = useState(3);
  const [cartOpen, setCartOpen] = useState(false);
  const { addItem, isLoading, error } = useCartStore();
  const packsRef = useRef<HTMLElement>(null);

  const selectColor = (index: number) => {
    setColorIndex(index);
    setPhotoIndex(0);
    setSelected(findVariant(colors[index]!.match) ?? variants[index] ?? variants[0]);
  };

  const activeColor = colors[colorIndex] ?? colors[0]!;
  const activePhoto = activeColor.gallery[photoIndex] ?? activeColor.gallery[0]!;

  const scrollToPacks = () => {
    setQuantity(3);
    scrollToElement(packsRef.current, 90);
  };

  const addSelected = async () => {
    if (!selected) return;
    const added = await addItem({ product, variantId: selected.id, variantTitle: selected.title, price: selected.price, quantity, selectedOptions: selected.selectedOptions });
    if (added) setCartOpen(true);
  };

  return (
    <main className="overflow-hidden">
      <header className="site-nav">
        <a href="#top" aria-label="Bervona, inicio"><BervonaMark /></a>
        <nav aria-label="Navegación principal" className="hidden items-center gap-8 md:flex">
          <a href="#beneficios">Por qué Drop</a><a href="#como-funciona">Cómo funciona</a><a href="#packs">Comprar</a><a href="#faq">FAQ</a>
        </nav>
        <CartDrawer />
      </header>

      <section id="top" className="hero-section">
        <div className="hero-copy">
          <span className="hero-badge"><Sparkles /> Bervona Drop · 285 ml · acero inoxidable</span>
          <h1>Todo lo que necesita.<br /><em>Nada que te pese.</em></h1>
          <p>Agua y comida para tu perro en cualquier paseo, dentro de una botella compacta que se convierte en cuenco.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="hero" size="xl" onClick={scrollToPacks}>Elegir mi pack <ChevronRight /></Button>
            <a href="#beneficios" className="text-sm font-medium underline underline-offset-8">Descubrir el diseño</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="product-halo" />
          <img src={heroImage} alt="Botella Bervona Drop esférica de acero con cuenco rosa plegable" width={1408} height={1408} fetchPriority="high" />
          <span className="hero-note note-one"><strong>186 g</strong> ultraligera</span>
          <span className="hero-note note-two"><strong>2 en 1</strong> agua + comida</span>
        </div>
        <button className="scroll-cue" onClick={() => document.querySelector("#problema")?.scrollIntoView({ behavior: "smooth" })} aria-label="Ver más"><ArrowDown /></button>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((k) => <span key={k}>{tickerItems.map((t) => <em key={t} className="not-italic">{t}</em>)}</span>)}
        </div>
      </div>

      <section id="problema" className="problem-band">
        <p className="eyebrow reveal">Un paseo debería sentirse ligero</p>
        <h2 className="reveal d1">Menos cosas. Más camino.</h2>
        <div className="problem-grid">
          {[{ n: "01", t: "Sin agua a mano", d: "El calor y los paseos largos no siempre avisan." }, { n: "02", t: "Cuencos que estorban", d: "Ocupan espacio y acaban olvidados en casa." }, { n: "03", t: "Botellas que gotean", d: "Mochilas mojadas y agua desperdiciada." }].map((item, i) => <article key={item.n} className={`reveal d${i + 2}`}><span>{item.n}</span><h3>{item.t}</h3><p>{item.d}</p></article>)}
        </div>
      </section>

      <section id="beneficios" className="feature-section section-shell">
        <div className="section-heading"><div className="reveal"><p className="eyebrow">Diseñada para salir</p><h2>Una esfera.<br />Seis soluciones.</h2></div><p className="reveal d2">Acero resistente por fuera. Silicona suave y funcional por dentro. Todo unido, todo listo.</p></div>
        <div className="feature-grid">{features.map(({ icon: Icon, title, text }, i) => <article key={title} className={`reveal d${(i % 6) + 1}`}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="stat-strip">
        {stats.map((s, i) => <div key={s.label} className={`reveal d${i + 1}`}><strong>{s.value}</strong><span>{s.label}</span></div>)}
      </section>

      <section id="como-funciona" className="how-section">
        <div className="how-photo reveal"><img src={lifestyleImage} loading="lazy" width={1600} height={1104} alt="Perro junto a la botella Bervona Drop y su cuenco rosa" /></div>
        <div className="how-copy reveal d2"><p className="eyebrow">Lista en segundos</p><h2>Del paseo al cuenco,<br />en cuatro gestos.</h2>
          <ol>{["Despliega la silicona integrada", "Vierte el agua en el cuenco", "Recupera el agua sobrante", "Pliega, cierra y sigue"].map((step, i) => <li key={step}><span>{String(i + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
        </div>
      </section>

      <section id="packs" ref={packsRef} className="pack-section section-shell">
        <div className="pack-intro reveal"><p className="eyebrow">Elige tu Drop</p><h2>Color y pack.</h2><p>Elige el color de tu Bervona Drop y cuántas quieres llevarte.</p></div>

        <div className="buy-layout">
          <div className="buy-gallery reveal">
            <div className="gallery-main">
              <img key={activePhoto} src={activePhoto} alt={`Bervona Drop en color ${activeColor.label.toLowerCase()}`} width={1024} height={1024} loading="lazy" />
            </div>
            <div className="gallery-thumbs">
              {activeColor.gallery.map((src, i) => (
                <button key={src} type="button" className={i === photoIndex ? "is-active" : ""} aria-label={`Foto ${i + 1} de ${activeColor.label}`} aria-pressed={i === photoIndex} onClick={() => setPhotoIndex(i)}>
                  <img src={src} alt="" width={512} height={512} loading="lazy" />
                </button>
              ))}
            </div>
            <div className="color-tiles">
              {colors.map((color, i) => (
                <button key={color.label} type="button" className={`color-tile ${i === colorIndex ? "is-active" : ""}`} aria-pressed={i === colorIndex} onClick={() => selectColor(i)}>
                  <img src={color.gallery[0]} alt="" width={256} height={256} loading="lazy" />
                  <span><b style={{ color: color.dot }}>{color.label}</b><small>{color.note}</small></span>
                </button>
              ))}
            </div>
          </div>

          <div className="buy-panel reveal d2">
            <div className="pack-grid">
              {packs.map((pack) => {
                const active = quantity === pack.qty;
                return <button key={pack.units} type="button" className={`pack-card ${active ? "is-selected" : ""} ${pack.popular ? "is-popular" : ""}`} onClick={() => setQuantity(pack.qty)} aria-pressed={active}>
                  {pack.popular && <span className="popular-label">Mejor precio</span>}
                  <span className="radio-dot">{active && <Check />}</span>
                  <h3>{pack.units}</h3>
                  <strong>{euros.format(pack.price)} <s>{euros.format(pack.compareAt)}</s></strong>
                  <p>{pack.note}</p>
                  <small>{euros.format(pack.price / pack.qty)} / unidad</small>
                </button>;
              })}
            </div>

            <div className="pack-action">
              <Button variant="hero" size="xl" disabled={isLoading || !selected?.availableForSale} onClick={() => void addSelected()}>{isLoading ? <Loader2 className="animate-spin" /> : <PackageCheck />} {selected?.availableForSale ? "Añadir al carrito" : unavailable ? "No disponible ahora" : "Agotado"}</Button>
              {unavailable && <p className="text-destructive">La compra está desactivada temporalmente: el producto no está publicado en la tienda.</p>}
              {error && <p className="text-destructive">{error}</p>}
            </div>

            <ul className="buy-perks">
              {[{ icon: Truck, t: "Envío gratis", d: "En todos los pedidos a España." }, { icon: ShieldCheck, t: "Pago seguro", d: "Checkout protegido con Shopify." }, { icon: RotateCcw, t: "30 días", d: "Devolución sencilla si no encaja." }, { icon: Sparkles, t: "285 ml · 186 g", d: "Acero inoxidable, sin BPA." }].map(({ icon: Icon, t, d }) => (
                <li key={t}><Icon /><div><strong>{t}</strong><span>{d}</span></div></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="faq" className="faq-section section-shell">
        <div className="reveal"><p className="eyebrow">Preguntas frecuentes</p><h2>Todo claro antes de salir.</h2></div>
        <Accordion type="single" collapsible className="faq-list reveal d2">
          {[{ q: "¿Qué capacidad tiene?", a: "Cada botella tiene 285 ml (10 oz), una medida compacta pensada para paseos con perros pequeños y medianos." }, { q: "¿Para qué tamaño de perro está pensada?", a: "Funciona especialmente bien para perros pequeños y medianos. Para perros grandes o rutas largas, recomendamos llevar más de una unidad." }, { q: "¿Se puede lavar en lavavajillas?", a: "Sí. La botella y el cuenco están pensados para una limpieza cómoda en lavavajillas." }, { q: "¿Realmente no gotea?", a: "Cuenta con una tapa de cierre seguro y sistema antigoteo. Asegúrate de cerrarla por completo antes de guardarla." }, { q: "¿Cuánto tarda el envío a España?", a: "El plazo exacto se muestra en el checkout según tu dirección. Envío gratis." }].map(({ q, a }) => <AccordionItem value={q} key={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>)}
        </Accordion>
      </section>

      <section className="final-cta"><BervonaMark /><p className="eyebrow">Próximo paseo</p><h2>Hidratación a mano, donde vayas.</h2><Button variant="light" size="xl" onClick={scrollToPacks}>Elegir mi Drop <ChevronRight /></Button></section>
      <footer><BervonaLogo /><p>Hidratación sencilla para perros felices.</p><div><Link to="/" hash="packs">Packs</Link><a href="#faq">Preguntas frecuentes</a></div><small>© 2026 Bervona · España</small></footer>
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </main>
  );
}
