import { useEffect, useRef, useState } from "react";
import { ArrowDown, Check, ChevronRight, CircleOff, Droplets, Feather, Loader2, LockKeyhole, PackageCheck, RotateCcw, Sparkles, Star, Utensils, WashingMachine } from "lucide-react";
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

const reviews = [
  {
    author: "Michaela",
    text: "Es pequeña y cómoda de manejar. A mi perro le encanta. Perfecta para los paseos cuando hace calor. Eso sí, no es para una excursión de todo el día porque el recipiente es pequeño.",
  },
  {
    author: "Patrizia",
    text: "Tal como se describe. Una botellita pequeña y cómoda para llevar durante los paseos por la ciudad.",
  },
  {
    author: "Roberto",
    text: "Agua siempre fresca y súper cómoda. Muy buen producto y muy práctico.",
  },
];

const features = [
  { icon: Droplets, title: "Cuenco instantáneo", text: "Despliega la silicona integrada y sirve al momento." },
  { icon: Utensils, title: "Agua o comida", text: "Un solo accesorio para hidratar o dar un snack." },
  { icon: LockKeyhole, title: "Cierre antigoteo", text: "Tapa segura para llevarla sin sustos en la mochila." },
  { icon: Feather, title: "Solo 186 g", text: "Ligera para ti, capacidad suficiente para su paseo." },
  { icon: WashingMachine, title: "Lavavajillas", text: "Limpieza sencilla después de cada aventura." },
  { icon: PackageCheck, title: "Siempre a mano", text: "Cordón y mosquetón para correa, mochila o cinturón." },
];

function scrollToElement(el: HTMLElement | null, offset = 80) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

function useRevealObserver() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function ReviewsSection() {
  const { ref, visible } = useRevealObserver();
  return (
    <section ref={ref} className={`reviews-section section-shell ${visible ? "is-visible" : ""}`}>
      <div className="reviews-intro">
        <p className="eyebrow">Opiniones</p>
        <h2>Lo que dicen quienes ya lo han probado</h2>
        <span className="reviews-tag">Opiniones sobre el producto</span>
      </div>
      <div className="reviews-track">
        {reviews.map((review) => (
          <article key={review.author} className="review-card">
            <div className="review-stars" aria-label="5 estrellas">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} fill="currentColor" />
              ))}
            </div>
            <p className="review-text">“{review.text}”</p>
            <p className="review-author">{review.author}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

const packs = [
  { qty: 1, units: "1 unidad", note: "Para tu compañero" },
  { qty: 2, units: "2 unidades", note: "Una para cada paseo" },
  { qty: 3, units: "3 unidades", note: "Mejor precio por unidad", popular: true },
];

export function BervonaStore({ product, unavailable = false }: { product: ShopifyProduct; unavailable?: boolean }) {
  useCartSync();
  const variants = product.node.variants.edges.map((edge) => edge.node);
  const [selected, setSelected] = useState<ShopifyVariant | undefined>(
    variants.find((v) => /pink|rosa/i.test(v.title)) ?? variants[0],
  );
  const [quantity, setQuantity] = useState(3);
  const [cartOpen, setCartOpen] = useState(false);
  const { addItem, isLoading, error } = useCartStore();
  const packsRef = useRef<HTMLElement>(null);
  const unitPrice = Number(selected?.price.amount ?? 0);

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
          <a href="#beneficios">Por qué Drop</a><a href="#como-funciona">Cómo funciona</a><a href="#faq">FAQ</a>
        </nav>
        <CartDrawer />
      </header>

      <section id="top" className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Bervona Drop · 285 ml · acero inoxidable · sin BPA</span>
          <h1>Todo lo que necesita.<br /><em>Nada que te pese.</em></h1>
          <p>Agua y comida para tu perro en cualquier paseo, dentro de una botella compacta que se convierte en cuenco.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="hero" size="xl" onClick={scrollToPacks}>Elegir mi pack <ChevronRight /></Button>
            
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

      <section id="problema" className="problem-band">
        <p className="eyebrow">Un paseo debería sentirse ligero</p>
        <h2>Menos cosas. Más camino.</h2>
        <div className="problem-grid">
          {[{ n: "01", t: "Sin agua a mano", d: "El calor y los paseos largos no siempre avisan." }, { n: "02", t: "Cuencos que estorban", d: "Ocupan espacio y acaban olvidados en casa." }, { n: "03", t: "Botellas que gotean", d: "Mochilas mojadas y agua desperdiciada." }].map((item) => <article key={item.n}><span>{item.n}</span><h3>{item.t}</h3><p>{item.d}</p></article>)}
        </div>
      </section>

      <section id="beneficios" className="feature-section section-shell">
        <div className="section-heading"><div><p className="eyebrow">Diseñada para salir</p><h2>Una esfera.<br />Seis soluciones.</h2></div><p>Acero resistente por fuera. Silicona suave y funcional por dentro. Todo unido, todo listo.</p></div>
        <div className="feature-grid">{features.map(({ icon: Icon, title, text }) => <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section id="como-funciona" className="how-section">
        <div className="how-photo"><img src={lifestyleImage} loading="lazy" width={1600} height={1104} alt="Perro junto a la botella Bervona Drop y su cuenco rosa" /></div>
        <div className="how-copy"><p className="eyebrow">Lista en segundos</p><h2>Del paseo al cuenco,<br />en cuatro gestos.</h2>
          <ol>{["Despliega la silicona integrada", "Vierte el agua en el cuenco", "Recupera el agua sobrante", "Pliega, cierra y sigue"].map((step, i) => <li key={step}><span>{String(i + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
        </div>
      </section>

      <section id="packs" ref={packsRef} className="pack-section section-shell">
        <div className="pack-intro"><p className="eyebrow">Elige tu pack</p><h2>Una para cada aventura.</h2><p>Precios reales de tu tienda: {euros.format(unitPrice)} por unidad.</p></div>
        {variants.length > 1 && (
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {variants.map((variant) => (
              <Button key={variant.id} variant={selected?.id === variant.id ? "hero" : "outline"} onClick={() => setSelected(variant)}>{variant.title}</Button>
            ))}
          </div>
        )}
        <div className="pack-grid">
          {packs.map((pack) => {
            const active = quantity === pack.qty;
            return <button key={pack.units} className={`pack-card ${active ? "is-selected" : ""} ${pack.popular ? "is-popular" : ""}`} onClick={() => setQuantity(pack.qty)} aria-pressed={active}>
              {pack.popular && <span className="popular-label">Mejor precio</span>}<span className="radio-dot">{active && <Check />}</span><h3>{pack.units}</h3><strong>{euros.format(unitPrice * pack.qty)}</strong><p>{pack.note}</p><small>{euros.format(unitPrice)} / unidad</small>
            </button>;
          })}
        </div>

        <div className="pack-action"><Button variant="hero" size="xl" disabled={isLoading || !selected?.availableForSale} onClick={() => void addSelected()}>{isLoading ? <Loader2 className="animate-spin" /> : <PackageCheck />} {selected?.availableForSale ? "Añadir al carrito" : unavailable ? "No disponible ahora" : "Agotado"}</Button><p>Envío gratis · Pago seguro con Shopify</p>{unavailable && <p className="text-destructive">La compra está desactivada temporalmente: el producto no está publicado en la tienda.</p>}{error && <p className="text-destructive">{error}</p>}</div>
      </section>

      <ReviewsSection />

      <section id="faq" className="faq-section section-shell">
        <div><p className="eyebrow">Preguntas frecuentes</p><h2>Todo claro antes de salir.</h2></div>
        <Accordion type="single" collapsible className="faq-list">
          {[{ q: "¿Qué capacidad tiene?", a: "Cada botella tiene 285 ml (10 oz), una medida compacta pensada para paseos con perros pequeños y medianos." }, { q: "¿Para qué tamaño de perro está pensada?", a: "Funciona especialmente bien para perros pequeños y medianos. Para perros grandes o rutas largas, recomendamos llevar más de una unidad." }, { q: "¿Se puede lavar en lavavajillas?", a: "Sí. La botella y el cuenco están pensados para una limpieza cómoda en lavavajillas." }, { q: "¿Realmente no gotea?", a: "Cuenta con una tapa de cierre seguro y sistema antigoteo. Asegúrate de cerrarla por completo antes de guardarla." }, { q: "¿Cuánto tarda el envío a España?", a: "El plazo exacto se muestra en el checkout según tu dirección. Envío gratis." }].map(({ q, a }) => <AccordionItem value={q} key={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>)}
        </Accordion>
      </section>

      <section className="final-cta"><BervonaMark /><p className="eyebrow">Próximo paseo</p><h2>Hidratación a mano, donde vayas.</h2><Button variant="light" size="xl" onClick={scrollToPacks}>Elegir mi Drop <ChevronRight /></Button></section>
      <footer><BervonaLogo /><p>Hidratación sencilla para perros felices.</p><div><Link to="/" hash="packs">Packs</Link><a href="#faq">Preguntas frecuentes</a></div><small>© 2026 Bervona · España</small></footer>
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </main>
  );
}