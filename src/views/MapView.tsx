import { useEffect, useRef } from "react";
import { LngLat, Map, Marker } from "maplibre-gl";
import { WidgetViewProps } from "../Widget";
import { EntityValue, GeoMarker, getEntityId } from "../store";
import classNames from "classnames";
import { createRoot } from "react-dom/client";
import "maplibre-gl/dist/maplibre-gl.css";

const colors = [
  "bg-gray-400",
  "bg-gray-500",
  "border-gray-500",
  "border-gray-600",

  "bg-blue-400",
  "bg-blue-500",
  "border-blue-500",
  "border-blue-600",
];

export function MapView({
  entity,
  onReplaceFact,
  onRetractFact,
}: WidgetViewProps) {
  const { bounds, geoMarkers, width, height } = entity.data;
  const ref = useRef<HTMLDivElement>(null);
  const map = useRef<Map>();
  const markers = useRef<Marker[]>([]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (map.current) {
      map.current?.remove();
    }

    const currentMap = (map.current = new Map({
      container: ref.current, // the id of the div element
      style: "map/styles.json",
      zoom: 15, // starting zoom
      center: [-118.805, 34.027], // starting location [longitude, latitude]
      attributionControl: false,
    }));

    markers.current.forEach((marker) => {
      marker.addTo(currentMap);
    });

    let isManualInteraction = false;

    map.current.on("mousedown", () => {
      isManualInteraction = true;
    });

    const onMapViewChange = () => {
      if (!isManualInteraction) {
        return;
      }

      isManualInteraction = false;

      if (
        !map.current ||
        bounds.toString() === map.current.getBounds().toString()
      ) {
        return;
      }

      onReplaceFact(entity.id, "bounds", map.current.getBounds());
    };

    map.current.on("zoomend", onMapViewChange);
    map.current.on("moveend", onMapViewChange);
  }, [ref]);

  // add markers

  useEffect(() => {
    const currentMap = map.current;

    if (currentMap && geoMarkers) {
      // remove old markers
      const markersToDelete = markers.current.slice(geoMarkers.length);

      for (const marker of markersToDelete) {
        console.log("remove markers");
        marker.remove();
      }

      markers.current = markers.current.slice(0, geoMarkers.length);

      (geoMarkers as EntityValue<GeoMarker>[]).forEach((geoMarker, index) => {
        let marker = markers.current[index];

        if (!marker) {
          const markerElement = document.createElement("div");

          const width = 16;
          const height = 16;
          markerElement.className = "marker";
          markerElement.style.width = `${width}px`;
          markerElement.style.height = `${height}px`;
          markerElement.style.backgroundSize = "100%";

          markerElement.addEventListener("mouseenter", () => {
            onReplaceFact(geoMarker.entity.id, "highlighted", true);
          });

          markerElement.addEventListener("mouseleave", () => {
            onRetractFact(geoMarker.entity.id, "highlighted");
          });

          marker = new Marker(markerElement);
          marker.setLngLat(
            new LngLat(geoMarker.value.point.lng, geoMarker.value.point.lat)
          );
          marker.addTo(currentMap);

          markers.current.push(marker);
        }

        marker.setLngLat(geoMarker.value.point);

        const markerElement = marker._element;
        const color = geoMarker.value.color ?? "blue";

        markerElement.className = classNames(
          "border rounded-full cursor-pointer absolute",
          geoMarker.entity.data.highlighted
            ? `bg-${color}-500 border-${color}-600`
            : `bg-${color}-400 border-${color}-500`
        );
      });
    }
  }, [geoMarkers]);

  // zoom to current bounds

  useEffect(() => {
    if (
      map.current &&
      bounds &&
      map.current?.getBounds().toString() !== bounds.toString()
    ) {
      map.current.fitBounds(bounds, { maxDuration: 1 });
    }
  }, [bounds]);

  return (
    <div
      ref={ref}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    ></div>
  );
}

function renderGeoPointAsMarker(
  marker: Marker,
  geoPoint: EntityValue<LngLat>
) {}
