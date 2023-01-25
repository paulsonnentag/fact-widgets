import { useState } from "react";
import { LngLat } from "maplibre-gl";
import { Option } from "./Select";
import { EntityMap, Fact, getEntities, getId } from "./store";
import { WidgetView } from "./Widget";
import "maplibre-gl/dist/maplibre-gl.css";

function getWidgetEntities(entities: EntityMap) {
  return Object.values(entities).filter((entity) => {
    const { width, height, x, y } = entity.data;

    return (
      width !== undefined &&
      height !== undefined &&
      x !== undefined &&
      y !== undefined
    );
  });
}

const LOCATION_OPTIONS: Option<LngLat>[] = [
  { name: "Aachen", value: new LngLat(6.083611, 50.775555) },
  { name: "Boston", value: new LngLat(-71.057083, 42.361145) },
  { name: "San Francisco", value: new LngLat(-122.431297, 37.773972) },
];

const INITIAL_FACTS: Fact[] = [
  { e: getId("w1"), key: "width", value: 100 },
  { e: getId("w1"), key: "width", value: 300 },
  { e: getId("w1"), key: "height", value: 300 },
  { e: getId("w1"), key: "x", value: 100 },
  { e: getId("w1"), key: "y", value: 100 },
  { e: getId("w2"), key: "width", value: 300 },
  { e: getId("w2"), key: "height", value: 300 },
  { e: getId("w2"), key: "x", value: 500 },
  { e: getId("w2"), key: "y", value: 100 },
  { e: getId("w1"), key: "location", value: getId("location") },
  { e: getId("location"), key: "name", value: LOCATION_OPTIONS[0].name },
  {
    e: getId("location"),
    key: "geoPosition",
    value: LOCATION_OPTIONS[0].value,
  },
];

export function App() {
  const [facts, setFacts] = useState<Fact[]>(INITIAL_FACTS);
  const entities = getEntities(facts);
  const widgetEntities = getWidgetEntities(entities);

  return (
    <div>
      {widgetEntities.map((entity) => (
        <WidgetView key={entity.id.toString()} entity={entity} />
      ))}
    </div>
  );
}
