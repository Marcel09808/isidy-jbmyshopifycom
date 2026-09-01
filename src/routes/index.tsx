import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { BervonaStore } from "@/components/bervona-store";
import { getBervonaProduct } from "@/lib/shopify";

const productQuery = queryOptions({
  queryKey: ["bervona-product"],
  queryFn: getBervonaProduct,
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bervona — Botella con cuenco plegable para tu perro" },
      {
        name: "description",
        content:
          "Botella esférica de acero inoxidable de 285 ml con cuenco de silicona plegable: agua y comida para tu perro en cualquier paseo.",
      },
      { property: "og:title", content: "Bervona — Botella con cuenco plegable para tu perro" },
      {
        property: "og:description",
        content: "285 ml, 162 g, antigoteo y apta para lavavajillas. Packs de 1, 2 y 3 unidades.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productQuery),
  component: Index,
});

function Index() {
  const { data: product } = useSuspenseQuery(productQuery);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-muted-foreground">
        No hemos podido cargar el producto ahora mismo. Vuelve a intentarlo en unos segundos.
      </div>
    );
  }

  return <BervonaStore product={product} />;
}
