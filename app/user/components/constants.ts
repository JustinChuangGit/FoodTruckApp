// constants.ts
import { Dimensions } from "react-native";

const { height } = Dimensions.get("window");

export const SNAP_POINTS = {
  TOP: 100,
  BOTTOM: height - 300,
};

export const SECTIONS = [
  { id: "1", title: "Recommended for You", data: Array(10).fill("Card") },
  { id: "2", title: "Trending Now", data: Array(8).fill("Card") },
  { id: "3", title: "New Releases", data: Array(12).fill("Card") },
  { id: "4", title: "Recommended for You", data: Array(10).fill("Card") },
  { id: "5", title: "Trending Now", data: Array(8).fill("Card") },
  { id: "6", title: "New Releases", data: Array(12).fill("Card") },
];
