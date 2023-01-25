import { Entity, Fact, isEntity } from "./store";
import { getWidgetViewOptions } from "./views";
import { createElement } from "react";

interface WidgetViewProps {
  entity: Entity;
}

export function WidgetView({ entity }: WidgetViewProps) {
  const { x, y, width, height } = entity.data;
  const facts = entity.facts;

  const viewOptions = getWidgetViewOptions(entity);
  const selectedViewOption = viewOptions[0];

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
      >
        {selectedViewOption &&
          createElement(selectedViewOption.value, {
            entity,
          })}
      </div>

      <div>Facts</div>

      {facts.map((fact, index) => (
        <FactView fact={fact} key={index} />
      ))}

      <div>Data</div>

      {Object.entries(entity.data).map(([key, value]) => (
        <AggregateView key={key} name={key} value={value} />
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
        {entity.facts.map((fact: Fact, index) => (
          <FactView fact={fact} key={index} />
        ))}
      </div>
    </>
  );
}

interface DataEntryViewProps {
  name: string;
  value: any;
}

function AggregateView({ name, value }: DataEntryViewProps) {
  return (
    <div className="p-1 bg-gray-200 rounded shadow border border-gray-300 flex gap-1">
      {name}: {JSON.stringify(value)}
    </div>
  );
}
