import { Option } from "../Select";
import { FunctionComponent } from "react";
import { Entity } from "../store";
import { MapView } from "./MapView";

export interface WidgetViewProps {
  entity: Entity;
}

export function getWidgetViewOptions(
  entity: Entity
): Option<FunctionComponent<WidgetViewProps>>[] {
  const options: Option<FunctionComponent<WidgetViewProps>>[] = [];

  if (entity.data.bounds) {
    options.unshift({
      name: "map",
      value: MapView,
    });
  }

  return options;
}
