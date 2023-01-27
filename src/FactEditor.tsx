import { Entity, EntityId, Fact, isEntity } from "./store";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Option, Select } from "./Select";
import { LngLat, LngLatBounds } from "maplibre-gl";
import { useCallback, useEffect } from "react";
import { useEntity, useIsDebugMode } from "./App";
import { GEOAPIFY_KEY } from "./tokens";
import { LOCATION_OPTIONS, POI_CATEGORY_OPTIONS } from "./constants";

interface FactEditorProps {
  fact: Fact;
  onAddFact: (e: EntityId, key: string, value: any) => void;
  onReplaceFact: (e: EntityId, key: string, value: any) => void;
  onRetractFact: (e: EntityId, key: string) => void;
  onRetractFactById: (id: number) => void;
}

export function FactEditor({
  fact,
  onAddFact,
  onReplaceFact,
  onRetractFact,
  onRetractFactById,
}: FactEditorProps) {
  const { key, value } = fact;
  const isDebugMode = useIsDebugMode();

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

  return (
    <div className="p-1 bg-white rounded shadow border border-gray-300 flex gap-1">
      {key}: {JSON.stringify(value)}
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
        {key}:<span className="text-gray-500">{"{...}"}</span>
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
    <div className="p-1 bg-gray-100 rounded shadow border border-gray-300 flex gap-1">
      location{" "}
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
  const placeSearch = fact.value;

  const selectedOption = POI_CATEGORY_OPTIONS.find(
    ({ value }) => fact.value.data.category
  );

  const onChange = useCallback((option: Option<string> | undefined) => {
    if (!option) {
      onRetractFact(fact.value.id, "category");
    } else {
      onReplaceFact(fact.value.id, "category", option.value);
    }
  }, []);

  const category = placeSearch.data.category;
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
        onRetractFact(placeSearch.id, "items");
        for (const feature of result.features) {
          onAddFact(placeSearch.id, "items", {
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
        onRetractFact(placeSearch, "items");
      });
  }, [bounds, category, placeSearch]);

  return (
    <>
      <div className="p-1 bg-gray-100 rounded shadow border border-gray-300 flex gap-1">
        find{" "}
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
    </>
  );
}
