import { Option } from "./Select";
import { LngLat } from "maplibre-gl";

export const LOCATION_OPTIONS: Option<LngLat>[] = [
  { name: "Aachen", value: new LngLat(6.083611, 50.775555) },
  { name: "Boston", value: new LngLat(-71.057083, 42.361145) },
  { name: "San Francisco", value: new LngLat(-122.431297, 37.773972) },
];

export const POI_CATEGORY_OPTIONS: Option<string>[] = [
  { name: "Hotel", value: "accommodation.hotel" },
  { name: "Restaurant", value: "catering.restaurant" },
  { name: "Museum", value: "entertainment.museum" },
];
