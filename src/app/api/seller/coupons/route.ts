import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      code, 
      storeId, 
      discountType, 
      discountValue, 
      minOrderAmount, 
      usageLimit, 
      expiryDate 
    } = body;

    if (!code || !storeId || !discountValue) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify store ownership
    const store = await db.store.findUnique({
      where: { id: storeId, userId: session.user.id }
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found or unauthorized" }, { status: 403 });
    }

    // Check for duplicate code
    const existingCoupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingCoupon) {
      return NextResponse.json({ error: "Código de cupom já existe" }, { status: 400 });
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        storeId,
        discountPercent: discountType === "PERCENT" ? parseInt(discountValue) : null,
        discountFixed: discountType === "FIXED" ? parseFloat(discountValue) : null,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      }
    });

    return NextResponse.json(coupon, { status: 201 });

  } catch (error: any) {
    console.error("[COUPON_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
