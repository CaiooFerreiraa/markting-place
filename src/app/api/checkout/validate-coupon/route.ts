import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { couponService } from "@/lib/services/coupon-service";

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

    const validationResult = await couponService.validateCoupon(
      code,
      storeId,
      Number(subtotal)
    );

    if (!validationResult.isValid) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    return NextResponse.json({
      id: validationResult.couponId,
      code: validationResult.code,
      discountPercent: validationResult.discountPercent,
      discountFixed: validationResult.discountFixed,
      discountAmount: validationResult.discountAmount,
    }, { status: 200 });

  } catch (error: any) {
    console.error("[COUPON_VALIDATE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
