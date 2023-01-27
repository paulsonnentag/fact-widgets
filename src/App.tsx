import { createContext, useCallback, useContext, useState } from "react";
import {
  EntityId,
  EntityMap,
  Fact,
  getEntities,
  getEntityId,
  getId,
} from "./store";
import WidgetView from "./Widget";
import "maplibre-gl/dist/maplibre-gl.css";

function getWidgetEntities(entities: EntityMap) {
  return Object.values(entities).filter((entity) => {
    const { width, height, x, y } = entity.data;

    return (
      width !== undefined &&
      height !== undefined &&
      x !== undefined &&
      y !== undefined
    );
  });
}

const INITIAL_FACTS: Fact[] = [
  { id: getId(), e: getEntityId("w1"), key: "width", value: 100 },
  { id: getId(), e: getEntityId("w1"), key: "width", value: 300 },
  { id: getId(), e: getEntityId("w1"), key: "height", value: 300 },
  { id: getId(), e: getEntityId("w1"), key: "x", value: 100 },
  { id: getId(), e: getEntityId("w1"), key: "y", value: 100 },
];

export function App() {
  const [facts, setFacts] = useState<Fact[]>(INITIAL_FACTS);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const entities = getEntities(facts);
  const widgetEntities = getWidgetEntities(entities);

  const onAddFact = useCallback(
    (e: EntityId, key: string, value: any) => {
      setFacts((facts) => facts.concat([{ id: getId(), e, key, value }]));
    },
    [setFacts]
  );

  const onReplaceFact = useCallback(
    (e: EntityId, key: string, value: any) => {
      setFacts((facts) =>
        facts
          .filter(
            (fact) => fact.e.toString() !== e.toString() || fact.key !== key
          )
          .concat([{ id: getId(), e, key, value }])
      );
    },
    [setFacts]
  );

  const onRetractFact = useCallback(
    (e: EntityId, key: string) => {
      setFacts((facts) =>
        facts.filter(
          (fact) => fact.e.toString() !== e.toString() || fact.key !== key
        )
      );
    },
    [setFacts]
  );

  const onRetractFactById = useCallback(
    (id: number) => {
      setFacts((facts) => facts.filter((fact) => fact.id !== id));
    },
    [setFacts]
  );

  return (
    <DebugModeContext.Provider value={isDebugMode}>
      <EntitiesContext.Provider value={entities}>
        <div className="w-screen h-screen bg-gray-100 overflow-auto relative">
          {widgetEntities.map((entity) => (
            <WidgetView
              key={entity.id.toString()}
              entity={entity}
              onAddFact={onAddFact}
              onReplaceFact={onReplaceFact}
              onRetractFact={onRetractFact}
              onRetractFactById={onRetractFactById}
            />
          ))}

          <label className="fixed right-2 top-2">
            <input
              type="checkbox"
              checked={isDebugMode}
              onChange={() => setIsDebugMode((isDebugMode) => !isDebugMode)}
            />{" "}
            debug mode
          </label>
        </div>
      </EntitiesContext.Provider>
    </DebugModeContext.Provider>
  );
}

export const EntitiesContext = createContext<EntityMap>({});

export function useEntity(id: EntityId) {
  const entities = useContext(EntitiesContext);
  return entities[id.toString()];
}

export const DebugModeContext = createContext<boolean>(false);

export function useIsDebugMode() {
  return useContext(DebugModeContext);
}
