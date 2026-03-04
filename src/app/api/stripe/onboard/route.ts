import { auth } from "@/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        stripeAccountId: true,
        role: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.role !== "SELLER" && user.role !== "ADMIN") {
      return new NextResponse("Only sellers can onboard for payments", { status: 403 });
    }

    let stripeAccountId = user.stripeAccountId;

    if (!stripeAccountId) {
      // Create a new Stripe Express account
      const account = await stripe.accounts.create({
        type: "express",
        country: "BR",
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        settings: {
          payouts: {
            schedule: {
              interval: "manual",
            },
          },
        },
      });

      stripeAccountId = account.id;

      // Update user with the new Stripe account ID
      await db.user.update({
        where: { id: user.id },
        data: { stripeAccountId },
      });
    }

    // Create an account link for onboarding
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/dashboard/seller/settings`,
      return_url: `${baseUrl}/dashboard/seller/settings`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("[STRIPE_ONBOARD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
