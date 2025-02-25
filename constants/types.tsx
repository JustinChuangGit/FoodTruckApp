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
  truckImage: string;
  coupons: Coupon[];
  moneySavedFromCoupons?: number;
  vendorName: string;
}

export interface VendorAccountInfo {
  price: string; // The price range, e.g., "$", "$$", "$$$"
  vendorType: string; // The type of vendor, e.g., "Food Truck/Trailer", "Produce", "Other"
  vendorName: string; // The name of the vendor
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

export interface User {
  uid: string;
  email: string;
  name: string;
  isVendor: boolean;
  image?: string;
  truckImage?: string;
  price?: string;
  vendorType?: string;
  description?: string;
  menu?: MenuItem[];
  acceptedTerms?: string;
  latitude?: number; // Add latitude
  longitude?: number; // Add longitude
  rewardPoints?: number; // Add reward points
  coupons?: Coupon[]; // Add coupons
  addedCoupons?: string[]; // Add user-added coupons
  moneySavedFromCoupons?: number; // Add money saved from coupons
  vendorName?: string; // Add vendor name
  vendorPaid?: boolean; // Add vendor paid status
  accountCreated?: Date; // Add account created date
  referralCode?: string; // Add referral code
  trackingPermissions?: boolean; // Add tracking permissions
}

export interface Section {
  id: string;
  title: string;
  vendors: Vendor[];
}

export interface ActiveVendor {
  uid: string; // Unique identifier for the vendor
  timestamp: string; // ISO timestamp for when the vendor was set
  location: {
    latitude: number; // Latitude of the vendor's location
    longitude: number; // Longitude of the vendor's location
  };
  menu: MenuItem[]; // Array of menu items
  vendorName: string; // Vendor's name
  vendorType: string; // Type of the vendor
  price: string; // Price range or pricing information
  description: string; // Vendor's description
  image: string | null; // Vendor's image URL or null if not provided
  coupons: string[]; // Array of coupons
}

export type Coupon = {
  id: string;
  headline: string;
  description: string;
  uses: number | null;
  validUntil: string;
  value: number | null;
  createdOn?: number; // Timestamp of when the coupon was created
  createdOnReadable?: string; // Readable date of when the coupon was created
};

export type Event = {
  id?: string;
  eventTitle: string;
  date: Date;
  startTime?: Date | null;
  endTime?: Date | null;
  locationText?: string;
  description?: string;
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  createdBy: string; // User UID
  createdAt?: Date;
  image?: string;
  distance?: number;
};

export interface EventMarkerProps {
  event: Event;
  onPress: (event: Event) => void;
}
