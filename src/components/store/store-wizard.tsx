"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsInteger } from "nuqs";
import dynamic from "next/dynamic";
import { Loader2, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Dynamic import for Leaflet (CSR only)
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });

import "leaflet/dist/leaflet.css";

export function StoreWizard() {
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    zip: "",
    lat: -23.5505,
    lng: -46.6333,
    phone: "",
    email: "",
    operatingHours: {},
    exceptions: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (s: number) => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!formData.name) newErrors.name = "Nome da loja é obrigatório";
      if (!formData.slug) newErrors.slug = "Slug da loja é obrigatório";
    } else if (s === 2) {
      if (!formData.street) newErrors.street = "Rua é obrigatória";
      if (!formData.number) newErrors.number = "Número é obrigatório";
      if (!formData.city) newErrors.city = "Cidade é obrigatória";
      if (!formData.state) newErrors.state = "Estado é obrigatório";
      if (!formData.zip) newErrors.zip = "CEP é obrigatório";
    } else if (s === 3) {
      if (!formData.phone) newErrors.phone = "Telefone é obrigatório";
      if (!formData.email) newErrors.email = "E-mail é obrigatório";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "E-mail inválido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGeocode = async () => {
    if (!formData.street || !formData.city || !formData.state) return;
    
    setGeocoding(true);
    try {
      const address = `${formData.street}, ${formData.number}, ${formData.district}, ${formData.city}, ${formData.state}, Brasil`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData(prev => ({ ...prev, lat: parseFloat(lat), lng: parseFloat(lon) }));
        toast({ title: "Localização encontrada!", description: "O mapa foi atualizado." });
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    } finally {
      setGeocoding(false);
    }
  };

  // Trigger geocode when address fields change and lose focus
  const handleAddressBlur = () => {
    if (formData.street && formData.number && formData.city) {
      handleGeocode();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setSuccess(true);
        toast({ title: "Loja criada com sucesso!", description: "Bem-vindo ao time de vendedores!" });
        setTimeout(() => {
          router.push("/seller/dashboard");
        }, 3000);
      } else {
        const error = await res.json();
        toast({ 
          title: "Erro ao criar loja", 
          description: error.error || "Tente novamente mais tarde.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error(err);
      toast({ 
        title: "Erro inesperado", 
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const updateField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" && !prev.slug ? { slug: value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") } : {}),
    }));
    // Clear error for field when typing
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto mt-10">
        <CardContent className="pt-10 pb-10 text-center">
          <div className="flex justify-center mb-6 text-green-500">
            <CheckCircle2 className="h-20 w-20" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Loja Criada!</h2>
          <p className="text-muted-foreground mb-8">
            Parabéns! Sua loja <strong>{formData.name}</strong> foi criada com sucesso. 
            Estamos redirecionando você para o painel do vendedor...
          </p>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto mt-10">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle>Criar Nova Loja</CardTitle>
          <span className="text-sm font-medium text-muted-foreground">Passo {step} de 3</span>
        </div>
        <Progress value={(step / 3) * 100} className="h-2" />
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="mb-8 flex justify-between px-2 overflow-x-auto pb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex items-center gap-2 pb-2 border-b-2 transition-colors min-w-fit px-4 ${step === s ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground"}`}>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${step === s ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{s}</span>
              <span className="text-sm">{s === 1 ? "Informações Básicas" : s === 2 ? "Localização" : "Contato e Horários"}</span>
            </div>
          ))}
        </div>

        <div className="min-h-[400px]">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Loja *</Label>
                <Input id="name" name="name" placeholder="Ex: Padaria do João" value={formData.name} onChange={updateField} className={errors.name ? "border-destructive" : ""} />
                {errors.name && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Link da Loja (Slug) *</Label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground hidden sm:inline">marketplacevdc.com.br/store/</span>
                  <Input id="slug" name="slug" placeholder="padaria-do-joao" value={formData.slug} onChange={updateField} className={errors.slug ? "border-destructive" : ""} />
                </div>
                {errors.slug && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.slug}</p>}
                <p className="text-[11px] text-muted-foreground">Este será o endereço da sua loja no marketplace.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" name="description" placeholder="Conte um pouco sobre sua loja..." value={formData.description} onChange={updateField} rows={4} />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={nextStep} size="lg">Próximo Passo</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">CEP *</Label>
                  <Input id="zip" name="zip" placeholder="00000-000" value={formData.zip} onChange={updateField} onBlur={handleAddressBlur} className={errors.zip ? "border-destructive" : ""} />
                  {errors.zip && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.zip}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Rua / Logradouro *</Label>
                  <Input id="street" name="street" placeholder="Rua das Flores" value={formData.street} onChange={updateField} onBlur={handleAddressBlur} className={errors.street ? "border-destructive" : ""} />
                  {errors.street && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.street}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número *</Label>
                  <Input id="number" name="number" placeholder="123" value={formData.number} onChange={updateField} onBlur={handleAddressBlur} className={errors.number ? "border-destructive" : ""} />
                  {errors.number && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.number}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">Bairro</Label>
                  <Input id="district" name="district" placeholder="Centro" value={formData.district} onChange={updateField} onBlur={handleAddressBlur} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input id="city" name="city" placeholder="Vitória da Conquista" value={formData.city} onChange={updateField} onBlur={handleAddressBlur} className={errors.city ? "border-destructive" : ""} />
                  {errors.city && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.city}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado (UF) *</Label>
                  <Input id="state" name="state" placeholder="BA" value={formData.state} onChange={updateField} onBlur={handleAddressBlur} maxLength={2} className={errors.state ? "border-destructive" : ""} />
                  {errors.state && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.state}</p>}
                </div>
              </div>
              
              <div className="relative h-64 md:h-80 bg-muted rounded-lg overflow-hidden border">
                {geocoding && (
                  <div className="absolute inset-0 z-10 bg-background/50 flex flex-col items-center justify-center backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm font-medium">Buscando endereço...</p>
                  </div>
                )}
                
                {typeof window !== "undefined" ? (
                  <MapContainer center={[formData.lat, formData.lng]} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[formData.lat, formData.lng]} icon={L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png", iconSize: [25, 41], iconAnchor: [12, 41] })}>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <MapPin className="h-10 w-10 mb-2 opacity-20" />
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>Voltar</Button>
                <Button onClick={nextStep} size="lg">Próximo Passo</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone de Contato *</Label>
                  <Input id="phone" name="phone" placeholder="(77) 99999-9999" value={formData.phone} onChange={updateField} className={errors.phone ? "border-destructive" : ""} />
                  {errors.phone && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail de Contato *</Label>
                  <Input id="email" name="email" type="email" placeholder="contato@sualoja.com.br" value={formData.email} onChange={updateField} className={errors.email ? "border-destructive" : ""} />
                  {errors.email && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.email}</p>}
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg border border-dashed text-center">
                <p className="text-sm font-medium mb-1">Configuração de Horários</p>
                <p className="text-xs text-muted-foreground">Você poderá configurar seus horários de funcionamento detalhadamente após criar a loja.</p>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>Voltar</Button>
                <Button onClick={handleSubmit} disabled={loading} size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                  {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Criando...</>
                  ) : (
                    "Finalizar e Criar Loja"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
