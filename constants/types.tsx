export interface Vendor {
  uid: string;
  latitude: number;
  longitude: number;
  price: string;
  name: string;
  rating: number;
  description: string;
  image: string;
  distance?: number;
  menu: MenuItem[];
  vendorType: string;
}

export interface VendorAccountInfo {
  price: string; // The price range, e.g., "$", "$$", "$$$"
  vendorType: string; // The type of vendor, e.g., "Food Truck/Trailer", "Produce", "Other"
  name: string; // The name of the vendor
  description: string; // A description of the vendor's services/products
  image: string | null; // The URL of the vendor's image/logo (nullable if no image is set)
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

export interface Section {
  id: string;
  title: string;
  vendors: Vendor[];
}
