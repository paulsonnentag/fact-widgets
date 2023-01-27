import { useEffect, useRef } from "react";
import { LngLat, Map, Marker } from "maplibre-gl";
import { WidgetViewProps } from "../Widget";
import { EntityValue, getEntityId } from "../store";
import classNames from "classnames";
import { createRoot } from "react-dom/client";

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
          const element = document.createElement("div");

          element.addEventListener("mouseenter", () => {
            onReplaceFact(geoPoint.entity.id, "highlighted", true);
          });

          element.addEventListener("mouseleave", () => {
            onRetractFact(geoPoint.entity.id, "highlighted");
          });

          marker = new Marker(element);
          marker.setLngLat(new LngLat(geoPoint.value.lng, geoPoint.value.lat));
          marker.addTo(currentMap);

          markers.current.push(marker);
        }

        marker.setLngLat(geoPoint.value);
        marker._element.className = classNames(
          "border rounded-full cursor-pointer",
          geoPoint.entity.data.highlighted
            ? "bg-red-500 border-red-600"
            : "bg-red-300 border-red-400"
        );
        marker._element.style.width = "16px";
        marker._element.style.height = "16px";
        marker._element.dataset.e = geoPoint.entity.id.toString();
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
