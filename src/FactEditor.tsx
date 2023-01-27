import { Entity, EntityId, Fact, isEntity } from "./store";
import {
  AccessibilityIcon,
  Cross2Icon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { Option, Select } from "./Select";
import { LngLat, LngLatBounds } from "maplibre-gl";
import { useCallback, useEffect } from "react";
import { DebugModeContext, useEntity, useIsDebugMode } from "./App";
import { GEOAPIFY_KEY } from "./tokens";
import { LOCATION_OPTIONS, POI_CATEGORY_OPTIONS } from "./constants";
import ReactJson from "react-json-view";
import { AddFactButton } from "./AddFactButton";
import classNames from "classnames";

interface FactEditorProps {
  fact: Fact;
  onAddFact: (e: EntityId, key: string, value: any) => void;
  onReplaceFact: (e: EntityId, key: string, value: any) => void;
  onRetractFact: (e: EntityId, key: string) => void;
  onRetractFactById: (id: number) => void;
  isTopLevel?: boolean;
}

export function FactEditor({
  isTopLevel = false,
  fact,
  onAddFact,
  onReplaceFact,
  onRetractFact,
  onRetractFactById,
}: FactEditorProps) {
  const { key, value } = fact;
  const isDebugMode = useIsDebugMode();

  if (!isDebugMode || isTopLevel) {
    if (key === "location") {
      return (
        <>
          <LocationFactEditor
            fact={fact}
            onAddFact={onAddFact}
            onReplaceFact={onReplaceFact}
            onRetractFact={onRetractFact}
            onRetractFactById={onRetractFactById}
          />
          {isDebugMode && (
            <EntityFactEditor
              fact={fact}
              onAddFact={onAddFact}
              onReplaceFact={onReplaceFact}
              onRetractFact={onRetractFact}
              onRetractFactById={onRetractFactById}
            />
          )}
        </>
      );
    }

    if (key === "poiSearch") {
      return (
        <>
          <PoiSearchFactEditor
            fact={fact}
            onAddFact={onAddFact}
            onReplaceFact={onReplaceFact}
            onRetractFact={onRetractFact}
            onRetractFactById={onRetractFactById}
          />
          {isDebugMode && (
            <EntityFactEditor
              fact={fact}
              onAddFact={onAddFact}
              onReplaceFact={onReplaceFact}
              onRetractFact={onRetractFact}
              onRetractFactById={onRetractFactById}
            />
          )}
        </>
      );
    }

    if (key === "accessibilityInfo") {
      return (
        <AccessibilityInfoFactEditor
          fact={fact}
          onAddFact={onAddFact}
          onReplaceFact={onReplaceFact}
          onRetractFact={onRetractFact}
          onRetractFactById={onRetractFactById}
        />
      );
    }
  }

  if (!isDebugMode) {
    return null;
  }

  if (isEntity(value)) {
    return (
      <EntityFactEditor
        fact={fact}
        onAddFact={onAddFact}
        onReplaceFact={onReplaceFact}
        onRetractFact={onRetractFact}
        onRetractFactById={onRetractFactById}
      />
    );
  }

  return (
    <PrimitiveFactEditor
      fact={fact}
      onAddFact={onAddFact}
      onReplaceFact={onReplaceFact}
      onRetractFact={onRetractFact}
      onRetractFactById={onRetractFactById}
    />
  );
}

function PrimitiveFactEditor({ fact, onRetractFactById }: FactEditorProps) {
  const { key, value } = fact;
  const isObject = typeof value === "object";

  return (
    <div className="p-1 bg-white rounded shadow border border-gray-300 flex gap-1">
      <span className="text-gray-500">{key}</span>:{""}
      {isObject ? (
        <ReactJson
          displayDataTypes={false}
          src={value}
          collapsed={true}
          enableClipboard={false}
          name={false}
        />
      ) : (
        JSON.stringify(value)
      )}
      <button onClick={() => onRetractFactById(fact.id)}>
        <Cross2Icon />
      </button>
    </div>
  );
}

function EntityFactEditor({
  fact,
  onAddFact,
  onReplaceFact,
  onRetractFact,
  onRetractFactById,
}: FactEditorProps) {
  const { key } = fact;
  const entity = fact.value as Entity;

  return (
    <>
      <div className="p-1 bg-white rounded shadow border border-gray-300 flex gap-1">
        {key}:
        <ReactJson
          displayDataTypes={false}
          src={fact.value.id}
          collapsed={true}
          enableClipboard={false}
          name={false}
        />
        <button onClick={() => onRetractFactById(fact.id)}>
          <Cross2Icon />
        </button>
      </div>
      <div className="pl-2 flex flex-col items-start gap-2">
        {entity.facts.map((fact: Fact, index) => (
          <FactEditor
            key={index}
            fact={fact}
            onAddFact={onAddFact}
            onReplaceFact={onReplaceFact}
            onRetractFact={onRetractFact}
            onRetractFactById={onRetractFactById}
          />
        ))}
      </div>
    </>
  );
}

function LocationFactEditor({
  fact,
  onRetractFactById,
  onReplaceFact,
}: FactEditorProps) {
  const location = fact.value;

  const selectedOption = {
    name: fact.value.data.name,
    value: fact.value.data.geoPosition,
  };

  const onChange = useCallback((option: Option<LngLat> | undefined) => {
    if (!option) {
      return;
    }

    onReplaceFact(fact.value.id, "name", option.name);
    onReplaceFact(fact.value.id, "geoPosition", option.value);
  }, []);

  return (
    <div
      className={classNames(
        "p-1 bg-gray-100 rounded shadow border border-gray-300 flex gap-1",
        location.data.highlighted ? "border-blue-400" : "border-gray-300"
      )}
    >
      Location{" "}
      <Select
        selectedOption={selectedOption}
        options={LOCATION_OPTIONS}
        onChange={onChange}
      />
      <button onClick={() => onRetractFactById(fact.id)}>
        <Cross2Icon />
      </button>
    </div>
  );
}

function PoiSearchFactEditor({
  fact,
  onAddFact,
  onRetractFactById,
  onRetractFact,
  onReplaceFact,
}: FactEditorProps) {
  const widget = useEntity(fact.e);
  const poiSearch = fact.value as Entity;

  const selectedOption = POI_CATEGORY_OPTIONS.find(
    ({ value }) => value === fact.value.data.category
  );

  const onChange = useCallback((option: Option<string> | undefined) => {
    if (!option) {
      onRetractFact(fact.value.id, "category");
    } else {
      onReplaceFact(fact.value.id, "category", option.value);
    }
  }, []);

  const category = poiSearch.data.category;
  const bounds: LngLatBounds = widget.data.bounds;

  const onSearch = useCallback(() => {
    if (!category || !bounds) {
      return;
    }

    const p1 = bounds.getNorthWest();
    const p2 = bounds.getSouthEast();

    fetch(
      [
        `https://api.geoapify.com/v2/places`,
        `?categories=${category}`,
        `&filter=${encodeURIComponent(
          `rect:${p1.lng},${p1.lat},${p2.lng},${p2.lat}`
        )}`,
        `&limit=20`,
        `&apiKey=${GEOAPIFY_KEY}`,
      ].join(""),
      {
        method: "GET",
      }
    )
      .then((response) => response.json())
      .then((result) => {
        onRetractFact(poiSearch.id, "items");
        for (const feature of result.features) {
          onAddFact(poiSearch.id, "items", {
            data: {
              geoPoint: new LngLat(
                feature.geometry.coordinates[0],
                feature.geometry.coordinates[1]
              ),
              place: feature.properties,
            },
          });
        }
      })
      .catch((error) => {
        onRetractFact(poiSearch.id, "items");
      });
  }, [bounds, category, poiSearch]);

  return (
    <>
      <div className="flex gap-2 items-center">
        <div
          className={classNames(
            "p-1 bg-gray-100 rounded shadow border border-gray-300 flex gap-1",
            poiSearch.data.highlighted ? "border-blue-400" : "border-gray-300"
          )}
        >
          POI search{" "}
          <Select
            selectedOption={selectedOption}
            options={POI_CATEGORY_OPTIONS}
            onChange={onChange}
          />
          <button onClick={onSearch}>
            <MagnifyingGlassIcon />
          </button>
          <button onClick={() => onRetractFactById(fact.id)}>
            <Cross2Icon />
          </button>
        </div>
        <AddFactButton entity={poiSearch} onAddFact={onAddFact} />
      </div>

      <div className="pl-2 flex flex-col items-start gap-2">
        <DebugModeContext.Provider value={false}>
          {poiSearch.facts.map((fact: Fact, index) => (
            <FactEditor
              key={index}
              fact={fact}
              onAddFact={onAddFact}
              onReplaceFact={onReplaceFact}
              onRetractFact={onRetractFact}
              onRetractFactById={onRetractFactById}
            />
          ))}
        </DebugModeContext.Provider>
      </div>
    </>
  );
}

function AccessibilityInfoFactEditor({
  fact,
  onRetractFactById,
}: FactEditorProps) {
  return (
    <div className="p-1 bg-gray-100 rounded shadow border border-gray-300 flex gap-1">
      is wheelchair-accessible
      <button onClick={() => onRetractFactById(fact.id)}>
        <Cross2Icon />
      </button>
    </div>
  );
}
