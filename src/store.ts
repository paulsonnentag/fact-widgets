import { LngLat, LngLatBounds } from "maplibre-gl";

export interface Fact {
  e: Id;
  key: string;
  value: any;
}

export interface Entity {
  id: Id;
  data: { [key: string]: any };
  facts: Fact[];
}

export interface EntityMap {
  [id: string]: Entity;
}

const ID_MAP: { [name: string]: Id } = {};

class Id {
  constructor(private name: string) {}

  toString() {
    return this.name;
  }
}

export function getId(name: string) {
  let id = ID_MAP[name];

  if (!id) {
    id = ID_MAP[name] = new Id(name);
  }

  return id;
}

export function isId(value: any) {
  // this doesn't work because javascript is garbage and somehow there are 2 different Id classes
  // return value instanceof Id;
  return value?.constructor?.name === "Id";
}

export function isEntity(value: any) {
  return value && isId(value.id);
}

export function getEntities(facts: Fact[]): EntityMap {
  const entities: EntityMap = {};

  for (const fact of facts) {
    const { e, key, value } = fact;

    const entity = getEntity(entities, e);

    // if value is an id resolve it to the entity
    if (isId(value)) {
      const relatedEntity = getEntity(entities, value);
      entity.data[key] = relatedEntity;
      entity.facts.push({ ...fact, value: relatedEntity });
    } else {
      entity.data[key] = value;
      entity.facts.push(fact);
    }
  }

  applyCustomComputations(entities);

  return entities;
}

function applyCustomComputations(entities: EntityMap) {
  for (const { data, facts } of Object.values(entities)) {
    // accumulate geo positions in list

    const geoPositions = (data.geoPoints = []);
    for (const fact of facts) {
      if (isEntity(fact.value)) {
        if (fact.value.data.geoPosition) {
          // @ts-ignore
          geoPositions.push(fact.value.data.geoPosition);
        }
      }
    }

    // compute bounds if entity has geo positions

    if (data.geoPoints.length !== 0) {
      const lngLats: LngLat[] = data.geoPoints;

      let bounds: LngLatBounds = lngLats[0].toBounds(500);

      for (const lngLat of lngLats) {
        bounds = bounds.extend(lngLat.toBounds(500));
      }

      data.bounds = bounds;
    }
  }
}

function getEntity(entities: EntityMap, e: Id) {
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
