import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { OrderDetails } from "@/components/order/order-details";

interface OrderPageProps {
  params: {
    id: string;
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const order = await db.order.findUnique({
    where: {
      id: params.id,
      userId: session.user.id, // Security: Ensure buyer only sees their own orders
    },
    include: {
      shippingAddress: true,
      storeOrders: {
        include: {
          store: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <OrderDetails order={order as any} />
    </div>
  );
}