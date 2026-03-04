import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductJsonLd } from "@/components/seo/json-ld";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Store } from "@prisma/client";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getProduct(slug: string) {
  const product = await db.product.findFirst({
    where: {
      name: {
        // Since we don't have a slug field in Product model yet, 
        // we'll try to find by name for now as a fallback or 
        // assume the slug is the ID or name.
        // Rule 1/2: In a real app we'd need a slug field.
        // For this task, I will use 'id' as the slug or find by name.
        // I'll check if there's any other field.
        equals: slug.replace(/-/g, " "),
        mode: 'insensitive'
      }
    },
    include: {
      store: true,
      category: true,
    }
  });

  if (!product) {
    // Try finding by ID if name fails
    return await db.product.findUnique({
      where: { id: slug },
      include: {
        store: true,
        category: true,
      }
    });
  }

  return product;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Produto não encontrado | Marketplace VDC",
    };
  }

  return {
    title: `${product.name} | Marketplace VDC`,
    description: product.description || `Confira ${product.name} no Marketplace VDC.`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.images,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ProductJsonLd product={product} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Sem foto
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <Link
            href={`/stores/${product.store.slug}`}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            {product.store.name}
          </Link>
          <h1 className="text-4xl font-bold mt-2">{product.name}</h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            {product.description}
          </p>
          
          <div className="mt-auto pt-8 border-t">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(Number(product.priceRetail))}
              </span>
              <span className="text-sm text-muted-foreground">no varejo</span>
            </div>

            <AddToCartButton
              product={product}
              store={{
                id: product.store.id,
                name: product.store.name,
                slug: product.store.slug,
              }}
              className="w-full sm:w-auto px-12 py-6 text-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
