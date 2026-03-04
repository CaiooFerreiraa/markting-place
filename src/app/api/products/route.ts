import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized. Seller account required." },
        { status: 401 }
      );
    }

    const {
      name,
      description,
      categoryId,
      priceRetail,
      priceWholesale,
      minWholesaleQty,
      stock,
      images,
    } = await req.json();

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: { userId: session.user.id },
    });

    if (!store) {
      return NextResponse.json(
        { error: "No store found for this user." },
        { status: 404 }
      );
    }

    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        name,
        description,
        categoryId,
        priceRetail,
        priceWholesale,
        minWholesaleQty,
        stock,
        images,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: { userId: session.user.id },
    });

    if (!store) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
