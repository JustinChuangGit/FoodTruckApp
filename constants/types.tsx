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
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}
