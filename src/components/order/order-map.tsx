"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Store } from "@prisma/client";

// Fix Leaflet marker icons
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface OrderMapProps {
  stores: Store[];
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 15);
  return null;
}

export default function OrderMap({ stores }: OrderMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg" />;

  // Filter stores with coordinates and get center
  const validStores = stores.filter(s => s.lat && s.lng);
  
  if (validStores.length === 0) return null;

  const center: [number, number] = [Number(validStores[0].lat), Number(validStores[0].lng)];

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border z-0">
      <MapContainer 
        center={center} 
        zoom={15} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validStores.map((store) => (
          <Marker 
            key={store.id} 
            position={[Number(store.lat), Number(store.lng)]}
            icon={icon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{store.name}</p>
                <p className="text-muted-foreground">{store.street}, {store.number}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        <ChangeView center={center} />
      </MapContainer>
    </div>
  );
}