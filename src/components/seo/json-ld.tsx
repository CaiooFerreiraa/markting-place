import type { Product, Store, Category } from "@prisma/client";

interface JsonLdProps {
  product: Product & { store: Store; category: Category };
}

export function ProductJsonLd({ product }: JsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images[0] || undefined,
    brand: {
      "@type": "Brand",
      name: product.store.name,
    },
    offers: {
      "@type": "Offer",
      price: product.priceRetail.toString(),
      priceCurrency: "BRL",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://marketplace-vdc.com"}/product/${product.id}`,
    },
    category: product.category.name,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
