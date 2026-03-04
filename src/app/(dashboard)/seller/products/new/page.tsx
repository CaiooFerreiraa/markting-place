import { ProductWizard } from "@/components/product/product-wizard";
import { db as prisma } from "@/lib/db";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Adicionar Novo Produto</h1>
        <p className="text-muted-foreground mt-2">
          Preencha as informações para catalogar seu produto no marketplace.
        </p>
      </div>

      <ProductWizard categories={categories} />
    </div>
  );
}
