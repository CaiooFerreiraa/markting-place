export interface TimeInterval {
  open: string; // HH:mm
  close: string; // HH:mm
}

export interface OperatingHours {
  monday?: TimeInterval[];
  tuesday?: TimeInterval[];
  wednesday?: TimeInterval[];
  thursday?: TimeInterval[];
  friday?: TimeInterval[];
  saturday?: TimeInterval[];
  sunday?: TimeInterval[];
}

export interface Store {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  slug: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  operatingHours: OperatingHours | null;
  exceptions: Record<string, TimeInterval[] | null> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreWithProductCount extends Store {
  _count: {
    products: number;
  };
}
