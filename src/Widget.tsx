import { Entity, Fact, EntityId, isEntity } from "./store";
import { getWidgetViewOptions } from "./views";
import { createElement } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";

export interface WidgetViewProps {
  entity: Entity;
  onAddFact: (e: EntityId, key: string, value: any) => void;
  onReplaceFact: (e: EntityId, key: string, value: any) => void;
  onRetractFact: (e: EntityId, key: string) => void;
  onRetractFactById: (id: number) => void;
}

export function WidgetView({
  entity,
  onAddFact,
  onReplaceFact,
  onRetractFact,
  onRetractFactById,
}: WidgetViewProps) {
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
            onAddFact,
            onReplaceFact,
            onRetractFact,
            onRetractFactById,
          })}
      </div>

      <div>Facts</div>

      {facts.map((fact, index) => (
        <FactView
          fact={fact}
          key={index}
          onRetractFactById={onRetractFactById}
        />
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
  onRetractFactById: (id: number) => void;
}

function FactView({ fact, onRetractFactById }: FactViewProps) {
  const { key, value } = fact;

  if (isEntity(value)) {
    return <EntityFactView fact={fact} onRetractFactById={onRetractFactById} />;
  }

  return (
    <PrimitiveFactView fact={fact} onRetractFactById={onRetractFactById} />
  );
}

function PrimitiveFactView({ fact, onRetractFactById }: FactViewProps) {
  const { key, value } = fact;

  return (
    <div className="p-1 bg-white rounded shadow border border-gray-300 flex gap-1">
      {key}: {JSON.stringify(value)}
      <button onClick={() => onRetractFactById(fact.id)}>
        <Cross2Icon />
      </button>
    </div>
  );
}

function EntityFactView({ fact, onRetractFactById }: FactViewProps) {
  const { key } = fact;
  const entity = fact.value as Entity;

  return (
    <>
      <div className="p-1 bg-white rounded shadow border border-gray-300 flex gap-1">
        {key}:
        <span className="color-grey-200">{`{${entity.id.toString()}}`}</span>
        <button onClick={() => onRetractFactById(fact.id)}>
          <Cross2Icon />
        </button>
      </div>
      <div className="pl-2 flex flex-col items-start gap-2">
        {entity.facts.map((fact: Fact, index) => (
          <FactView
            fact={fact}
            key={index}
            onRetractFactById={onRetractFactById}
          />
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
