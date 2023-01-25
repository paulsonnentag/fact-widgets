import { useCallback, useState } from "react";
import { LngLat } from "maplibre-gl";
import { Option } from "./Select";
import {
  EntityMap,
  Fact,
  getEntities,
  getEntityId,
  EntityId,
  getId,
} from "./store";
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
  { id: getId(), e: getEntityId("w1"), key: "width", value: 100 },
  { id: getId(), e: getEntityId("w1"), key: "width", value: 300 },
  { id: getId(), e: getEntityId("w1"), key: "height", value: 300 },
  { id: getId(), e: getEntityId("w1"), key: "x", value: 100 },
  { id: getId(), e: getEntityId("w1"), key: "y", value: 100 },
  { id: getId(), e: getEntityId("w2"), key: "width", value: 300 },
  { id: getId(), e: getEntityId("w2"), key: "height", value: 300 },
  { id: getId(), e: getEntityId("w2"), key: "x", value: 500 },
  { id: getId(), e: getEntityId("w2"), key: "y", value: 100 },
  {
    id: getId(),
    e: getEntityId("w1"),
    key: "location",
    value: getEntityId("location"),
  },
  {
    id: getId(),
    e: getEntityId("location"),
    key: "name",
    value: LOCATION_OPTIONS[0].name,
  },
  {
    id: getId(),
    e: getEntityId("location"),
    key: "geoPosition",
    value: LOCATION_OPTIONS[0].value,
  },
];

export function App() {
  const [facts, setFacts] = useState<Fact[]>(INITIAL_FACTS);
  const entities = getEntities(facts);
  const widgetEntities = getWidgetEntities(entities);

  console.log(entities);

  const onAddFact = useCallback(
    (e: EntityId, key: string, value: any) => {
      setFacts((facts) => facts.concat([{ id: getId(), e, key, value }]));
    },
    [setFacts]
  );

  const onReplaceFact = useCallback(
    (e: EntityId, key: string, value: any) => {
      setFacts((facts) =>
        facts
          .filter(
            (fact) => fact.e.toString() !== e.toString() || fact.key !== key
          )
          .concat([{ id: getId(), e, key, value }])
      );
    },
    [setFacts]
  );

  const onRetractFact = useCallback(
    (e: EntityId, key: string) => {
      setFacts((facts) =>
        facts.filter(
          (fact) => fact.e.toString() !== e.toString() || fact.key !== key
        )
      );
    },
    [setFacts]
  );

  const onRetractFactById = useCallback(
    (id: number) => {
      setFacts((facts) => facts.filter((fact) => fact.id !== id));
    },
    [setFacts]
  );

  return (
    <div>
      {widgetEntities.map((entity) => (
        <WidgetView
          key={entity.id.toString()}
          entity={entity}
          onAddFact={onAddFact}
          onReplaceFact={onReplaceFact}
          onRetractFact={onRetractFact}
          onRetractFactById={onRetractFactById}
        />
      ))}
    </div>
  );
}
