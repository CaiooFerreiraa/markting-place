import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code, storeId, subtotal } = body;

    if (!code || !storeId || subtotal === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: { store: true }
    });

    if (!coupon) {
      return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "Este cupom não está mais ativo" }, { status: 400 });
    }

    if (coupon.storeId !== storeId) {
      return NextResponse.json({ error: "Este cupom não pertence a esta loja" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Este cupom atingiu o limite de uso" }, { status: 400 });
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return NextResponse.json({ error: "Este cupom está expirado" }, { status: 400 });
    }

    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      return NextResponse.json({ 
        error: `Valor mínimo para este cupom é R$ ${Number(coupon.minOrderAmount).toFixed(2)}` 
      }, { status: 400 });
    }

    return NextResponse.json({
      id: coupon.id,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountFixed: coupon.discountFixed,
    }, { status: 200 });

  } catch (error: any) {
    console.error("[COUPON_VALIDATE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
