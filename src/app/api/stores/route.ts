import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const storeSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  slug: z.string().min(3),
  street: z.string(),
  number: z.string(),
  complement: z.string().optional(),
  district: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  operatingHours: z.any().optional(),
  exceptions: z.any().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = storeSchema.parse(body);

    const existingStore = await db.store.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingStore) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 400 });
    }

    // Step 1: Create the store and check for Stripe Account in a transaction
    const result = await db.$transaction(async (tx: any) => {
      const store = await tx.store.create({
        data: {
          ...validatedData,
          userId: session.user.id,
        } as any, // Bypass Json type issues in development
      });

      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { stripeAccountId: true, email: true }
      });

      let stripeAccountId = (user as any)?.stripeAccountId;

      // Step 2: If no Stripe Account exists, create one AUTOMATICALLY
      if (!stripeAccountId && user?.email) {
        const account = await stripe.accounts.create({
          type: 'express',
          email: user.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_type: 'individual',
          settings: {
            payouts: {
              schedule: {
                interval: 'manual',
              },
            },
          },
        });

        stripeAccountId = account.id;

        await tx.user.update({
          where: { id: session.user.id },
          data: { stripeAccountId: stripeAccountId } as any
        });
      }

      return { store, stripeAccountId };
    });

    return NextResponse.json(result.store, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("Store creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
