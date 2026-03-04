"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { StoreWizard } from "@/components/store/store-wizard";

export default function NewStorePage() {
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (session?.user && session.user.role !== "SELLER") {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Create New Store</h1>
      <StoreWizard />
    </div>
  );
}
