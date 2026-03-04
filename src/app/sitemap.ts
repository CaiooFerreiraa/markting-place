import { db } from "@/lib/db";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({
    select: {
      id: true, // we use id as slug for now as per page.tsx
      updatedAt: true,
    },
  });

  const productSitemap: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://marketplace-vdc.com"}/product/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const staticSitemap: MetadataRoute.Sitemap = [
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://marketplace-vdc.com"}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    // We can add other static pages like search, etc.
  ];

  return [...staticSitemap, ...productSitemap];
}
