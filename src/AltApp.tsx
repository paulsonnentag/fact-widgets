import { useState } from "react";
import { Cross1Icon } from "@radix-ui/react-icons";

interface Fact {
  e: Id;
  key: string;
  value: any;
}

interface Entity {
  id: Id;
  [key: string]: any;
}

interface EntityMap {
  [id: string]: Entity;
}

function getWidgetEntities(entities: EntityMap) {
  return Object.values(entities).filter((entity) => {
    return (
      entity.width !== undefined &&
      entity.height !== undefined &&
      entity.x !== undefined &&
      entity.y !== undefined
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

function isId(id: any) {
  return id instanceof Id;
}

function getEntities(facts: Fact[]): EntityMap {
  const entities: EntityMap = {};

  for (const { e, key, value } of facts) {
    let entity = entities[e.toString()];

    if (!entity) {
      entity = entities[e.toString()] = { id: e };
    }

    entity[key] = value;
  }

  return entities;
}

const INITIAL_FACTS: Fact[] = [
  { e: id("w1"), key: "width", value: 300 },
  { e: id("w1"), key: "height", value: 300 },
  { e: id("w1"), key: "x", value: 100 },
  { e: id("w1"), key: "y", value: 100 },
  { e: id("w2"), key: "width", value: 300 },
  { e: id("w2"), key: "height", value: 300 },
  { e: id("w2"), key: "x", value: 500 },
  { e: id("w2"), key: "y", value: 100 },
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
  const { x, y, width, height } = entity;

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
    </div>
  );
}
