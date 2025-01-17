import { Vendor, LocationCoordinates, Section } from "@/constants/types";
import haversine from "haversine";

export function getNearbyVendors(
  vendors: Vendor[],
  location: LocationCoordinates | null
): { id: string; title: string; vendors: Vendor[] } {
  if (!location) {
    return {
      id: "nearby",
      title: "Nearby Vendors",
      vendors: [],
    };
  }

  const sortedVendors = vendors
    .map((vendor) => ({
      ...vendor,
      distance: haversine(location, {
        latitude: vendor.latitude,
        longitude: vendor.longitude,
      }),
    }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

  return {
    id: "nearby",
    title: "Nearby Vendors",
    vendors: sortedVendors,
  };
}

export function formatSections(
  sections: { id: string; title: string; vendors: Vendor[] }[]
): Section[] {
  return sections.map((section, index) => ({
    id: (index + 1).toString(),
    title: section.title,
    vendors: section.vendors,
  }));
}
