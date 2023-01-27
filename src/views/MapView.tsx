import { useEffect, useRef } from "react";
import { LngLat, Map, Marker } from "maplibre-gl";
import { WidgetViewProps } from "../Widget";
import { EntityValue, getEntityId } from "../store";
import classNames from "classnames";
import { createRoot } from "react-dom/client";
import "maplibre-gl/dist/maplibre-gl.css";

export function MapView({
  entity,
  onReplaceFact,
  onRetractFact,
}: WidgetViewProps) {
  const { bounds, geoPoints, width, height } = entity.data;
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

    if (currentMap && geoPoints) {
      // remove old markers
      const markersToDelete = markers.current.slice(geoPoints.length);

      for (const marker of markersToDelete) {
        marker.remove();
      }

      markers.current = markers.current.slice(0, geoPoints.length);

      (geoPoints as EntityValue<LngLat>[]).forEach((geoPoint, index) => {
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
            onReplaceFact(geoPoint.entity.id, "highlighted", true);
          });

          markerElement.addEventListener("mouseleave", () => {
            onRetractFact(geoPoint.entity.id, "highlighted");
          });

          marker = new Marker(markerElement);
          marker.setLngLat(new LngLat(geoPoint.value.lng, geoPoint.value.lat));
          marker.addTo(currentMap);

          markers.current.push(marker);
        }

        marker.setLngLat(geoPoint.value);

        const markerElement = marker._element;

        markerElement.className = classNames(
          "marker border rounded-full cursor-pointer absolute",
          geoPoint.entity.data.highlighted
            ? "bg-red-500 border-red-600"
            : "bg-red-300 border-red-400"
        );
      });
    }
  }, [geoPoints]);

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
