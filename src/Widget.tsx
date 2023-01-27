import { Entity, EntityId, getEntityId, getId } from "./store";
import { getWidgetViewOptions } from "./views";
import { createElement, useEffect, useState } from "react";
import { FactEditor } from "./FactEditor";
import ReactJson from "react-json-view";
import { useIsDebugMode } from "./App";
import { PlusIcon } from "@radix-ui/react-icons";
import { v4 } from "uuid";
import { LOCATION_OPTIONS, POI_CATEGORY_OPTIONS } from "./constants";

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
  const isDebugMode = useIsDebugMode();
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

      {facts.map((fact, index) => (
        <FactEditor
          key={index}
          fact={fact}
          onAddFact={onAddFact}
          onReplaceFact={onReplaceFact}
          onRetractFact={onRetractFact}
          onRetractFactById={onRetractFactById}
        />
      ))}

      <AddFactButton entity={entity} onAddFact={onAddFact} />

      {isDebugMode && (
        <div className="pt-3">
          <ReactJson
            displayDataTypes={false}
            src={entity.data}
            collapsed={true}
            enableClipboard={false}
            name={"widget"}
          />
        </div>
      )}
    </div>
  );
}

interface AddFactButtonProps {
  entity: Entity;
  onAddFact: (e: EntityId, key: string, value: any) => void;
}

function AddFactButton({ entity, onAddFact }: AddFactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onClickHandler = () => {
      setIsOpen(false);
    };

    document.addEventListener("click", onClickHandler);

    return () => {
      document.removeEventListener("click", onClickHandler);
    };
  }, [setIsOpen]);

  return (
    <div className="relative">
      <button
        onClick={(evt) => {
          evt.stopPropagation();
          setIsOpen((isOpen) => !isOpen);
        }}
      >
        <PlusIcon />
      </button>

      {isOpen && (
        <div className="relative border border-gray-100 flex flex-col justify-start rounded shadow overflow-hidden">
          <button
            className="hover:bg-gray-100 text-left p-1"
            onClick={() => {
              const locationId = getEntityId(v4());

              onAddFact(entity.id, "location", locationId);
              onAddFact(locationId, "name", LOCATION_OPTIONS[0].name);
              onAddFact(locationId, "geoPosition", LOCATION_OPTIONS[0].value);
            }}
          >
            Location
          </button>
          {entity.data.bounds && (
            <button
              className="hover:bg-gray-100 text-left p-1"
              onClick={() => {
                const searchId = getEntityId(v4());

                onAddFact(entity.id, "poiSearch", searchId);
                onAddFact(searchId, "category", POI_CATEGORY_OPTIONS[0].name);
              }}
            >
              POI search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
