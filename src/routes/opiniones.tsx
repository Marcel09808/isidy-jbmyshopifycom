import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { BervonaMark } from "@/components/bervona-logo";
import { Button } from "@/components/ui/button";
import { reviews } from "@/lib/reviews";

export const Route = createFileRoute("/opiniones")({
  head: () => ({ meta: [
    { title: "Opiniones sobre este tipo de botella | Bervona" },
    { name: "description", content: "Lee opiniones compartidas por compradores del mismo tipo de botella para perros en otra plataforma. No son compras verificadas de Bervona." },
    { property: "og:title", content: "Opiniones sobre este tipo de botella | Bervona" },
    { property: "og:description", content: "Experiencias de compradores del mismo tipo de botella en otra plataforma, con puntos a favor y límites reales." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  return <main className="reviews-page">
    <header className="site-nav"><Link to="/" aria-label="Volver a Bervona"><BervonaMark /></Link><Link to="/" className="nav-back"><ArrowLeft size={16} /> Volver a la tienda</Link></header>
    <div className="reviews-heading"><p className="eyebrow">Experiencias reales</p><h1>Lo que cuentan<br /><em>quienes la han probado.</em></h1><p>Opiniones compartidas por compradores del mismo tipo de botella en otra plataforma. No son reseñas de compras realizadas en Bervona ni verificadas por nosotros. Hemos abreviado ligeramente algunos textos sin cambiar su sentido.</p></div>
    <div className="reviews-list">{reviews.map((review, index) => <article className="review-entry" key={`${review.author}-${review.date}`}><span className="review-number">{String(index + 1).padStart(2, "0")}</span><div><blockquote>“{review.quote}”</blockquote><p className="review-meta">{review.author} <span aria-hidden="true">·</span> {review.date} <span aria-hidden="true">·</span> Color indicado: {review.color}</p></div></article>)}</div>
    <div className="reviews-bottom"><p>Una botella compacta para el paseo de cada día. Para perros grandes o rutas largas, conviene llevar agua adicional.</p><Button variant="hero" asChild><Link to="/" hash="packs">Ver Bervona Drop <ArrowUpRight /></Link></Button></div>
  </main>;
}
