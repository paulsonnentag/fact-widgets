import { Entity, EntityId, getEntityId, getId } from "./store";
import { getWidgetViewOptions } from "./views";
import { createElement, useEffect, useState } from "react";
import { FactEditor } from "./FactEditor";
import ReactJson from "react-json-view";
import { useIsDebugMode } from "./App";
import { PlusIcon } from "@radix-ui/react-icons";
import { v4 } from "uuid";
import { LOCATION_OPTIONS, POI_CATEGORY_OPTIONS } from "./constants";
import { AddFactButton } from "./AddFactButton";

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
