"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsInteger } from "nuqs";
import dynamic from "next/dynamic";

// Dynamic import for Leaflet (CSR only)
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

import "leaflet/dist/leaflet.css";

export function StoreWizard() {
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        router.push("/seller/dashboard");
      } else {
        const error = await res.json();
        alert("Error: " + (error.error || "Failed to create store"));
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const updateField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" && !prev.slug ? { slug: value.toLowerCase().replace(/ /g, "-") } : {}),
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-8 flex justify-between">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`p-2 border-b-2 ${step === s ? "border-blue-500 font-bold" : "border-transparent text-gray-500"}`}>
            Step {s}: {s === 1 ? "Basic Info" : s === 2 ? "Location" : "Contact & Hours"}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div><label className="block">Store Name</label><input className="w-full border p-2 rounded" name="name" value={formData.name} onChange={updateField} /></div>
          <div><label className="block">Slug (URL handle)</label><input className="w-full border p-2 rounded" name="slug" value={formData.slug} onChange={updateField} /></div>
          <div><label className="block">Description</label><textarea className="w-full border p-2 rounded" name="description" value={formData.description} onChange={updateField} /></div>
          <button onClick={nextStep} className="bg-blue-500 text-white px-4 py-2 rounded">Next</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block">Street</label><input className="w-full border p-2 rounded" name="street" value={formData.street} onChange={updateField} /></div>
            <div><label className="block">Number</label><input className="w-full border p-2 rounded" name="number" value={formData.number} onChange={updateField} /></div>
            <div><label className="block">District</label><input className="w-full border p-2 rounded" name="district" value={formData.district} onChange={updateField} /></div>
            <div><label className="block">City</label><input className="w-full border p-2 rounded" name="city" value={formData.city} onChange={updateField} /></div>
            <div><label className="block">State</label><input className="w-full border p-2 rounded" name="state" value={formData.state} onChange={updateField} /></div>
            <div><label className="block">ZIP</label><input className="w-full border p-2 rounded" name="zip" value={formData.zip} onChange={updateField} /></div>
          </div>
          
          <div className="h-64 bg-gray-100">
            {/* Mock map for now or simple Leaflet setup */}
            <p className="text-center py-20 text-gray-500">Map Placeholder (Leaflet components loaded dynamically)</p>
          </div>

          <div className="flex justify-between">
            <button onClick={prevStep} className="bg-gray-500 text-white px-4 py-2 rounded">Previous</button>
            <button onClick={nextStep} className="bg-blue-500 text-white px-4 py-2 rounded">Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div><label className="block">Contact Phone</label><input className="w-full border p-2 rounded" name="phone" value={formData.phone} onChange={updateField} /></div>
          <div><label className="block">Contact Email</label><input className="w-full border p-2 rounded" name="email" value={formData.email} onChange={updateField} /></div>
          <div><p className="text-gray-500 italic">Operating Hours Editor (Coming soon - simplified JSON storage for now)</p></div>
          
          <div className="flex justify-between">
            <button onClick={prevStep} className="bg-gray-500 text-white px-4 py-2 rounded">Previous</button>
            <button onClick={handleSubmit} disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded">
              {loading ? "Creating..." : "Create Store"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
