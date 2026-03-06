"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { StoreWizard } from "@/components/store/store-wizard";
import { Suspense } from "react";

export function NewStoreContent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="p-8 text-center">Carregando sessão...</div>;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (session?.user && session.user.role !== "SELLER") {
    redirect("/");
  }

  return <StoreWizard />;
}

export default function NewStorePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Criar Nova Loja</h1>
      <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
        <NewStoreContent />
      </Suspense>
    </div>
  );
}

