import { LngLat, LngLatBounds } from "maplibre-gl";
import { createContext, useCallback } from "react";

export interface Fact {
  id: number;
  e: EntityId;
  key: string;
  value: any;
}

export interface Entity {
  id: EntityId;
  data: { [key: string]: any };
  facts: Fact[];
}

export interface EntityMap {
  [id: string]: Entity;
}

let nextId = 0;

export function getId() {
  return nextId++;
}

const ID_MAP: { [name: string]: EntityId } = {};

export class EntityId {
  constructor(private name: string) {}

  toString() {
    return this.name;
  }
}

export function getEntityId(name: string) {
  let id = ID_MAP[name];

  if (!id) {
    id = ID_MAP[name] = new EntityId(name);
  }

  return id;
}

export function isId(value: any) {
  // this doesn't work because javascript is garbage and somehow there are 2 different Id classes
  // return value instanceof Id;
  return value?.constructor?.name === "EntityId";
}

export function isEntity(value: any) {
  return value && isId(value.id);
}

export function getEntities(facts: Fact[]): EntityMap {
  const entities: EntityMap = {};

  for (const fact of facts) {
    let { e, key, value } = fact;

    const entity = getEntity(entities, e);
    // if value is an id resolve it to the entity
    if (isId(value)) {
      value = getEntity(entities, value);
      entity.facts.push({ ...fact, value });
    } else {
      entity.facts.push(fact);
    }

    switch (key) {
      case "items":
        if (!entity.data.items) {
          entity.data.items = [];
        }
        entity.data.items.push(value);
        break;

      default:
        entity.data[key] = value;
    }
  }

  applyCustomComputations(entities);

  return entities;
}

export interface EntityValue<T> {
  value: T;
  entity: Entity;
}

export interface GeoMarker {
  point: LngLat;
  label?: string;
  color?: string;
}

function applyCustomComputations(entities: EntityMap) {
  for (const { data, facts } of Object.values(entities)) {
    // accumulate geo positions in list

    const geoMarkers: EntityValue<GeoMarker>[] = (data.geoMarkers = []);

    const addedEntityIds: { [id: string]: boolean } = {};

    for (const fact of facts) {
      if (isEntity(fact.value)) {
        const entity = fact.value as Entity;

        const e = entity.id.toString();

        if (entity.data.geoPosition && !addedEntityIds[e]) {
          addedEntityIds[e] = true;

          geoMarkers.push({
            value: {
              point: fact.value.data.geoPosition,
              label: fact.value.data.name as string,
            },
            entity: fact.value,
          });
        }

        if (entity.data.items) {
          for (const item of fact.value.data.items) {
            const value: GeoMarker = {
              point: item.data.geoPoint,
              label: item.data.place.name,
            };

            if (entity.data.accessibilityInfo) {
              value.color = item.data.place.categories.includes(
                "wheelchair.yes"
              )
                ? undefined
                : "gray";
            }

            geoMarkers.push({
              value,
              entity: fact.value,
            });
          }
        }
      }
    }

    // compute bounds if entity has geo positions

    if (geoMarkers.length !== 0 && !data.bounds) {
      const geoMarkers: EntityValue<GeoMarker>[] = data.geoMarkers;

      let bounds: LngLatBounds = geoMarkers[0].value.point.toBounds(500);

      for (const geoMarker of geoMarkers) {
        bounds = bounds.extend(geoMarker.value.point.toBounds(500));
      }

      data.bounds = bounds;
    }
  }
}

function getEntity(entities: EntityMap, e: EntityId) {
  let entity = entities[e.toString()];

  if (!entity) {
    entity = entities[e.toString()] = {
      id: e,
      data: {},
      facts: [],
    };
  }

  return entity;
}
