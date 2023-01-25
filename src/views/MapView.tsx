import { useEffect, useRef } from "react";
import { LngLat, Map, Marker } from "maplibre-gl";
import { WidgetViewProps } from "../Widget";

export function MapView({ entity, onReplaceFact }: WidgetViewProps) {
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

    map.current = new Map({
      container: ref.current, // the id of the div element
      style: "map/styles.json",
      zoom: 15, // starting zoom
      center: [-118.805, 34.027], // starting location [longitude, latitude]
      attributionControl: false,
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
    if (map.current && geoPoints) {
      // remove old markers
      for (const marker of markers.current) {
        marker.remove();
      }

      markers.current = [];

      for (const lngLat of geoPoints as LngLat[]) {
        const marker = new Marker();
        marker.setLngLat(new LngLat(lngLat.lng, lngLat.lat));
        marker.addTo(map.current);
        markers.current.push(marker);
      }
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
