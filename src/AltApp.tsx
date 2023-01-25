import { useState } from "react";
import { Cross1Icon } from "@radix-ui/react-icons";
import { LngLat } from "maplibre-gl";
import { Option } from "./Select";

interface Fact {
  e: Id;
  key: string;
  value: any;
}

interface Entity {
  id: Id;
  data: { [key: string]: any };
  facts: Fact[];
}

interface EntityMap {
  [id: string]: Entity;
}

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

const ID_MAP: { [name: string]: Id } = {};

class Id {
  constructor(private name: string) {}

  toString() {
    return this.name;
  }
}

function id(name: string) {
  let id = ID_MAP[name];

  if (!id) {
    id = ID_MAP[name] = new Id(name);
  }

  return id;
}

function isId(value: any) {
  // this doesn't work because javascript is garbage and somehow there are 2 different Id classes
  // return value instanceof Id;
  return value?.constructor?.name === "Id";
}

function isEntity(value: any) {
  return value && isId(value.id);
}

function getEntities(facts: Fact[]): EntityMap {
  const entities: EntityMap = {};

  for (const fact of facts) {
    const { e, key, value } = fact;

    const entity = getEntity(entities, e);

    // if value is an id resolve it to the entity
    if (isId(value)) {
      const relatedEntity = getEntity(entities, value);
      entity.data[key] = relatedEntity;
      entity.facts.push({ ...fact, value: relatedEntity });
    } else {
      entity.data[key] = value;
      entity.facts.push(fact);
    }
  }

  return entities;
}

function getEntity(entities: EntityMap, e: Id) {
  let entity = entities[e.toString()];

  if (!entity) {
    entity = entities[e.toString()] = { id: e, data: {}, facts: [] };
  }

  return entity;
}

const LOCATION_OPTIONS: Option<LngLat>[] = [
  { name: "Aachen", value: new LngLat(6.083611, 50.775555) },
  { name: "Boston", value: new LngLat(-71.057083, 42.361145) },
  { name: "San Francisco", value: new LngLat(-122.431297, 37.773972) },
];

const INITIAL_FACTS: Fact[] = [
  { e: id("w1"), key: "width", value: 300 },
  { e: id("w1"), key: "height", value: 300 },
  { e: id("w1"), key: "x", value: 100 },
  { e: id("w1"), key: "y", value: 100 },
  { e: id("w2"), key: "width", value: 300 },
  { e: id("w2"), key: "height", value: 300 },
  { e: id("w2"), key: "x", value: 500 },
  { e: id("w2"), key: "y", value: 100 },
  { e: id("w1"), key: "location", value: id("location") },
  { e: id("location"), key: "name", value: LOCATION_OPTIONS[0].name },
  { e: id("location"), key: "position", value: LOCATION_OPTIONS[0].value },
];

export function AltApp() {
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

interface WidgetViewProps {
  entity: Entity;
}

function WidgetView({ entity }: WidgetViewProps) {
  const { x, y, width, height } = entity.data;
  const facts = entity.facts;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
      }}
      className="flex flex-col gap-2 items-start"
    >
      <div
        className="rounded shadow border border-gray-300 bg-white overflow-auto border"
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      ></div>

      {facts.map((fact, index) => (
        <FactView fact={fact} key={index} />
      ))}
    </div>
  );
}

interface FactViewProps {
  fact: Fact;
}

function FactView({ fact }: FactViewProps) {
  const { key, value } = fact;

  if (isEntity(value)) {
    return <EntityFactView fact={fact} />;
  }

  return <PrimitiveFactView fact={fact} />;
}

function PrimitiveFactView({ fact }: FactViewProps) {
  const { key, value } = fact;

  return (
    <div className="p-1 bg-white rounded shadow border border-gray-300 flex gap-1">
      {key}: {JSON.stringify(value)}
    </div>
  );
}

function EntityFactView({ fact }: FactViewProps) {
  const { key } = fact;
  const entity = fact.value as Entity;

  return (
    <>
      <div className="p-1 bg-white rounded shadow border border-gray-300 flex gap-1">
        {key}:
        <span className="color-grey-200">{`{${entity.id.toString()}}`}</span>
      </div>
      <div className="pl-2 flex flex-col items-start gap-2">
        {entity.facts.map((fact: Fact) => (
          <FactView fact={fact} />
        ))}
      </div>
    </>
  );
}
