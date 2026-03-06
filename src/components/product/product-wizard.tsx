"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/types/order";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-hooks";
import { Loader2, Plus, X, ArrowLeft, ArrowRight, Save } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  priceRetail: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido"),
  priceWholesale: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido").optional().or(z.literal("")),
  minWholesaleQty: z.string().regex(/^\d+$/, "Quantidade inválida").optional().or(z.literal("")),
  stock: z.string().regex(/^\d+$/, "Estoque inválido"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductWizardProps {
  categories: Category[];
}

export function ProductWizard({ categories }: ProductWizardProps) {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      priceRetail: "",
      priceWholesale: "",
      minWholesaleQty: "",
      stock: "0",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 8) {
      toast({
        title: "Limite de imagens excedido",
        description: "Você pode carregar no máximo 8 imagens.",
        variant: "destructive",
      });
      return;
    }

    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file: any) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_: any, i: any) => i !== index));
    setPreviewUrls((prev) => {
      const url = prev[index];
      URL.revokeObjectURL(url);
      return prev.filter((_: any, i: any) => i !== index);
    });
  };

  const onSubmit = async (values: ProductFormValues) => {
    if (images.length === 0) {
      toast({
        title: "Imagens obrigatórias",
        description: "Adicione pelo menos uma imagem do produto.",
        variant: "destructive",
      });
      setStep(3);
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload Images
      const formData = new FormData();
      images.forEach((file: any) => formData.append("files", file));

      const uploadRes = await fetch("/api/products/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Erro no upload de imagens");
      const { filePaths } = await uploadRes.json();

      // 2. Create Product
      const productData = {
        ...values,
        priceRetail: parseFloat(values.priceRetail),
        priceWholesale: values.priceWholesale ? parseFloat(values.priceWholesale) : null,
        minWholesaleQty: values.minWholesaleQty ? parseInt(values.minWholesaleQty) : null,
        stock: parseInt(values.stock),
        images: filePaths,
      };

      const productRes = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!productRes.ok) throw new Error("Erro ao criar produto");

      toast({
        title: "Produto criado com sucesso!",
        description: "Seu produto já está disponível no catálogo.",
      });

      router.push("/seller/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao criar produto",
        description: "Ocorreu um problema ao salvar as informações.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = step === 1
      ? ["name", "description", "categoryId"]
      : ["priceRetail", "priceWholesale", "minWholesaleQty", "stock"];

    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      <div className="flex justify-between mb-8 items-center">
        {[1, 2, 3].map((i: any) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
            >
              {i}
            </div>
            {i < 3 && <div className={`w-12 h-1 mx-2 ${step > i ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
        <div className="text-sm font-medium ml-4">
          Passo {step} de 3: {step === 1 ? "Informações" : step === 2 ? "Preço e Estoque" : "Imagens"}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Camiseta Algodão Egípcio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detalhes sobre o produto, materiais, tamanhos, etc."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priceRetail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Varejo (R$)</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>Preço para venda única.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque Disponível</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-4">Lógica de Atacado (Opcional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priceWholesale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço de Atacado (R$)</FormLabel>
                        <FormControl>
                          <Input placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minWholesaleQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade Mínima</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ex: 10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                <Plus className="w-10 h-10 text-muted-foreground mb-4" />
                <p className="text-center">Clique para adicionar imagens</p>
                <p className="text-sm text-muted-foreground mt-2">Máximo de 8 imagens (PNG, JPG, WebP)</p>
              </div>

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-6">
                  {previewUrls.map((url: any, index: any) => (
                    <div key={url} className="relative aspect-square border rounded-md overflow-hidden group">
                      <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-[10px] text-center py-0.5">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-6 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1 || isUploading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>

            {step < 3 ? (
              <Button type="button" onClick={nextStep}>
                Continuar <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Salvar Produto
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
