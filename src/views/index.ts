import { Option } from "../Select";
import { FunctionComponent } from "react";
import { Entity } from "../store";
import { MapView } from "./MapView";
import { WidgetViewProps } from "../Widget";

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
