import { Entity, EntityId, getEntityId } from "./store";
import { useEffect, useState } from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import { v4 } from "uuid";
import { LOCATION_OPTIONS, POI_CATEGORY_OPTIONS } from "./constants";

interface AddFactButtonProps {
  entity: Entity;
  onAddFact: (e: EntityId, key: string, value: any) => void;
}

export function AddFactButton({ entity, onAddFact }: AddFactButtonProps) {
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

  const options = [];

  if (entity.data.width) {
    // this kind of a hack to hide the option for non top level widgets
    options.push(
      <button
        key="location"
        className="hover:bg-gray-200 text-left p-1 whitespace-nowrap"
        onClick={() => {
          const locationId = getEntityId(v4());

          onAddFact(entity.id, "location", locationId);
          onAddFact(locationId, "name", LOCATION_OPTIONS[0].name);
          onAddFact(locationId, "geoPosition", LOCATION_OPTIONS[0].value);
        }}
      >
        Location
      </button>
    );
  }

  if (entity.data.bounds) {
    options.push(
      <button
        key="poiSearch"
        className="hover:bg-gray-200 text-left p-1 whitespace-nowrap"
        onClick={() => {
          const searchId = getEntityId(v4());

          onAddFact(entity.id, "poiSearch", searchId);
          onAddFact(searchId, "category", POI_CATEGORY_OPTIONS[0].value);
        }}
      >
        POI search
      </button>
    );
  }

  if (entity.data.items) {
    options.push(
      <button
        key="wheelChairAccessible"
        className="hover:bg-gray-200 text-left p-1 whitespace-nowrap"
        onClick={() => {
          const searchId = getEntityId(v4());
          onAddFact(entity.id, "accessibilityInfo", true);
        }}
      >
        is wheelchair-accessible
      </button>
    );
  }

  if (options.length === 0) {
    return null;
  }

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
        <div className="absolute border border-gray-100 flex flex-col justify-start rounded shadow overflow-hidden bg-white z-50">
          {options.map((option) => option)}
        </div>
      )}
    </div>
  );
}
