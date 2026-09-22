export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_DOMAIN = "1isidy-jb.myshopify.com";
export const SHOPIFY_STOREFRONT_TOKEN = "86a10861409851bafcf80e96bfb1ef55";

const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: { edges: Array<{ node: ShopifyVariant }> };
    options: Array<{ name: string; values: string[] }>;
  };
}

export interface ShopifyResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function storefrontApiRequest<T>(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Shopify respondió ${response.status}: ${body}`);
  }

  const payload = (await response.json()) as ShopifyResponse<T>;
  if (payload.errors?.length) throw new Error(payload.errors.map((error) => error.message).join(", "));
  return payload.data;
}

export const PRODUCT_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id title description handle
      priceRange { minVariantPrice { amount currencyCode } }
      images(first: 10) { edges { node { url altText } } }
      variants(first: 10) {
        edges { node { id title availableForSale price { amount currencyCode } compareAtPrice { amount currencyCode } selectedOptions { name value } } }
      }
      options { name values }
    }
  }
`;

export const STORE_PRODUCT_HANDLE =
  "2-in-1-portable-dog-water-bottle-for-small-dogs-leak-proof-compact-dog-travel-water-bottle-stainless-steel-bottle-silicon";

export const FIRST_PRODUCT_QUERY = `
  query FirstProduct {
    products(first: 1) {
      edges {
        node {
          id title description handle
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 10) { edges { node { url altText } } }
          variants(first: 10) {
            edges { node { id title availableForSale price { amount currencyCode } compareAtPrice { amount currencyCode } selectedOptions { name value } } }
          }
          options { name values }
        }
      }
    }
  }
`;

export async function getBervonaProduct() {
  const byHandle = await storefrontApiRequest<{ product: ShopifyProduct["node"] | null }>(PRODUCT_QUERY, {
    handle: STORE_PRODUCT_HANDLE,
  });
  if (byHandle?.product) return { node: byHandle.product } satisfies ShopifyProduct;

  const first = await storefrontApiRequest<{ products: { edges: Array<{ node: ShopifyProduct["node"] }> } }>(
    FIRST_PRODUCT_QUERY,
  );
  const node = first?.products.edges[0]?.node;
  return node ? ({ node } satisfies ShopifyProduct) : null;
}

export const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`;
export const CART_CREATE_MUTATION = `mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } } } userErrors { field message } } }`;
export const CART_LINES_ADD_MUTATION = `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { id lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } } } userErrors { field message } } }`;
export const CART_LINES_UPDATE_MUTATION = `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id } userErrors { field message } } }`;
export const CART_LINES_REMOVE_MUTATION = `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id } userErrors { field message } } }`;
export const CART_DISCOUNT_CODES_UPDATE_MUTATION = `mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) { cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) { cart { id checkoutUrl } userErrors { field message } } }`;

type UserError = { field: string[] | null; message: string };
type CartLine = { node: { id: string; merchandise: { id: string } } };

function cartMissing(errors: UserError[]) {
  return errors.some((error) => /cart not found|does not exist/i.test(error.message));
}

export function formatCheckoutUrl(url: string, discountCode?: string | null) {
  const parsed = new URL(url);
  parsed.searchParams.set("channel", "online_store");
  if (discountCode) {
    parsed.searchParams.set("discount", discountCode);
  }
  return parsed.toString();
}

export async function createShopifyCart(variantId: string, quantity: number, discountCode?: string | null) {
  const input: { lines: Array<{ quantity: number; merchandiseId: string }>; discountCodes?: string[] } = {
    lines: [{ quantity, merchandiseId: variantId }],
  };
  if (discountCode) {
    input.discountCodes = [discountCode];
  }
  const data = await storefrontApiRequest<{ cartCreate: { cart: { id: string; checkoutUrl: string; lines: { edges: CartLine[] } } | null; userErrors: UserError[] } }>(CART_CREATE_MUTATION, {
    input,
  });
  const result = data?.cartCreate;
  if (!result || result.userErrors.length || !result.cart) return null;
  const lineId = result.cart.lines.edges[0]?.node.id;
  if (!lineId) return null;
  return { cartId: result.cart.id, checkoutUrl: formatCheckoutUrl(result.cart.checkoutUrl, discountCode), lineId };
}

export async function updateShopifyCartDiscount(cartId: string, discountCode?: string | null) {
  try {
    const data = await storefrontApiRequest<{
      cartDiscountCodesUpdate: {
        cart: { id: string; checkoutUrl: string } | null;
        userErrors: UserError[];
      };
    }>(CART_DISCOUNT_CODES_UPDATE_MUTATION, {
      cartId,
      discountCodes: discountCode ? [discountCode] : [],
    });
    if (data?.cartDiscountCodesUpdate?.cart?.checkoutUrl) {
      return formatCheckoutUrl(data.cartDiscountCodesUpdate.cart.checkoutUrl, discountCode);
    }
  } catch {
    // If discount update fails, fallback gracefully
  }
  return null;
}

export async function addShopifyCartLine(cartId: string, variantId: string, quantity: number) {
  const data = await storefrontApiRequest<{ cartLinesAdd: { cart: { lines: { edges: CartLine[] } } | null; userErrors: UserError[] } }>(CART_LINES_ADD_MUTATION, { cartId, lines: [{ quantity, merchandiseId: variantId }] });
  const errors = data?.cartLinesAdd.userErrors ?? [];
  if (errors.length) return { success: false, cartNotFound: cartMissing(errors) };
  const line = data?.cartLinesAdd.cart?.lines.edges.find((edge) => edge.node.merchandise.id === variantId);
  return { success: true, lineId: line?.node.id };
}

export async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontApiRequest<{ cartLinesUpdate: { userErrors: UserError[] } }>(CART_LINES_UPDATE_MUTATION, { cartId, lines: [{ id: lineId, quantity }] });
  const errors = data?.cartLinesUpdate.userErrors ?? [];
  return { success: errors.length === 0, cartNotFound: cartMissing(errors) };
}

export async function removeShopifyCartLine(cartId: string, lineId: string) {
  const data = await storefrontApiRequest<{ cartLinesRemove: { userErrors: UserError[] } }>(CART_LINES_REMOVE_MUTATION, { cartId, lineIds: [lineId] });
  const errors = data?.cartLinesRemove.userErrors ?? [];
  return { success: errors.length === 0, cartNotFound: cartMissing(errors) };
}
const fallbackVariant = (id: string, title: string, amount: string): ShopifyVariant => ({
  id,
  title,
  availableForSale: false,
  price: { amount, currencyCode: "EUR" },
  compareAtPrice: null,
  selectedOptions: [{ name: "Color", value: title }],
});

export const FALLBACK_PRODUCT: ShopifyProduct = {
  node: {
    id: "fallback",
    title: "Bervona Drop — Botella de agua para perro con cuenco integrado, paseo y viaje",
    description:
      "Botella esférica de acero inoxidable de 285 ml con cuenco de silicona plegable integrado.",
    handle: STORE_PRODUCT_HANDLE,
    priceRange: { minVariantPrice: { amount: "17.99", currencyCode: "EUR" } },
    images: { edges: [] },
    variants: {
      edges: [
        { node: fallbackVariant("fallback-pink", "Pink", "17.99") },
        { node: fallbackVariant("fallback-blue", "Blue", "17.99") },
      ],
    },
    options: [{ name: "Color", values: ["Pink", "Blue"] }],
  },
};
