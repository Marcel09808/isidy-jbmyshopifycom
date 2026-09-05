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
      { title: "Bervona Drop — Botella de agua para perro con cuenco integrado" },
      {
        name: "description",
        content:
          "Bervona Drop: botella esférica de acero inoxidable de 285 ml con cuenco de silicona plegable integrado. Agua y comida para tu perro en paseo y viaje.",
      },
      { property: "og:title", content: "Bervona Drop — Botella de agua para perro con cuenco integrado" },
      {
        property: "og:description",
        content: "285 ml, 186 g, antigoteo y apta para lavavajillas. Packs de 1, 2 y 3 unidades.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productQuery),
  component: Index,
});

function Index() {
  const { data: product } = useSuspenseQuery(productQuery);

  return <BervonaStore product={product ?? FALLBACK_PRODUCT} unavailable={!product} />;
}
