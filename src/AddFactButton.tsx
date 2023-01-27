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
                onAddFact(searchId, "category", POI_CATEGORY_OPTIONS[0].value);
              }}
            >
              POI search
            </button>
          )}
          {entity.data.categories && (
            <button
              className="hover:bg-gray-100 text-left p-1"
              onClick={() => {
                const searchId = getEntityId(v4());

                onAddFact(entity.id, "wheelChairAccessible", searchId);
                onAddFact(searchId, "category", POI_CATEGORY_OPTIONS[0].value);
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
