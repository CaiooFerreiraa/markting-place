import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductJsonLd } from "@/components/seo/json-ld";

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
    <div className="container mx-auto py-8">
      <ProductJsonLd product={product} />
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="mt-4 text-gray-600">{product.description}</p>
      <div className="mt-8">
        <p className="text-2xl font-semibold">
          R$ {product.priceRetail.toString()}
        </p>
      </div>
      {/* Product content will be expanded in later phases */}
    </div>
  );
}
