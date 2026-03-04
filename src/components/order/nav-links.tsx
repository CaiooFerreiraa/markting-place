"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, Navigation } from "lucide-react";

interface NavLinksProps {
  lat: number;
  lng: number;
  label: string;
}

export function NavLinks({ lat, lng, label }: NavLinksProps) {
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${lat},${lng}`;

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2 border-primary/20 hover:bg-primary/5"
        onClick={() => openLink(googleMapsUrl)}
      >
        <Navigation className="h-4 w-4 text-blue-600" />
        Google Maps
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2 border-primary/20 hover:bg-primary/5"
        onClick={() => openLink(wazeUrl)}
      >
        <Navigation className="h-4 w-4 text-blue-400" />
        Waze
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2 border-primary/20 hover:bg-primary/5"
        onClick={() => openLink(appleMapsUrl)}
      >
        <ExternalLink className="h-4 w-4" />
        Apple Maps
      </Button>
    </div>
  );
}