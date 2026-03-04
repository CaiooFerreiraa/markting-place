import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface CouponValidationResult {
  isValid: boolean;
  discountAmount?: number;
  discountPercent?: number;
  discountFixed?: number;
  error?: string;
  couponId?: string;
  code?: string;
}

export class CouponService {
  /**
   * Validates a coupon code for a specific store and order amount.
   * 
   * @param code The coupon code to validate
   * @param storeId The store the order belongs to
   * @param orderAmount The current subtotal of the order
   * @returns CouponValidationResult
   */
  async validateCoupon(
    code: string,
    storeId: string,
    orderAmount: number
  ): Promise<CouponValidationResult> {
    try {
      const coupon = await db.coupon.findUnique({
        where: { code },
        include: { store: true },
      });

      if (!coupon) {
        return { isValid: false, error: "Cupom inválido ou não encontrado." };
      }

      if (!coupon.isActive) {
        return { isValid: false, error: "Este cupom não está mais ativo." };
      }

      if (coupon.storeId !== storeId) {
        return { isValid: false, error: "Este cupom não pertence a esta loja." };
      }

      if (coupon.expiryDate && new Date() > coupon.expiryDate) {
        return { isValid: false, error: "Este cupom expirou." };
      }

      if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
        return { isValid: false, error: "O limite de uso deste cupom foi atingido." };
      }

      if (coupon.minOrderAmount !== null && orderAmount < Number(coupon.minOrderAmount)) {
        return {
          isValid: false,
          error: `O valor mínimo para usar este cupom é R$ ${Number(coupon.minOrderAmount).toFixed(2)}.`,
        };
      }

      let discountAmount = 0;
      if (coupon.discountPercent) {
        discountAmount = (orderAmount * coupon.discountPercent) / 100;
      } else if (coupon.discountFixed) {
        discountAmount = Number(coupon.discountFixed);
      }

      return {
        isValid: true,
        discountAmount,
        discountPercent: coupon.discountPercent || undefined,
        discountFixed: coupon.discountFixed ? Number(coupon.discountFixed) : undefined,
        couponId: coupon.id,
        code: coupon.code,
      };
    } catch (error) {
      console.error("Error validating coupon:", error);
      return { isValid: false, error: "Ocorreu um erro ao validar o cupom." };
    }
  }
}

export const couponService = new CouponService();
