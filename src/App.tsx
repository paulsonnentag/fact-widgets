import { FunctionComponent, useEffect, useRef, useState } from "react";
import { LngLat, LngLatBounds, Map, Marker } from "maplibre-gl";
import { Cross1Icon, PlusIcon } from "@radix-ui/react-icons";
import "maplibre-gl/dist/maplibre-gl.css";

type Fact = [string, any];

interface LocationProvider {
  type: "location";
  location: Option<LngLat>;
}

interface BoundsProvider {
  type: "bounds";
  bounds: LngLatBounds;
}

type Provider = LocationProvider | BoundsProvider;

interface Widget {
  facts: Fact[];
  providers: Provider[];
}

interface Widgets {
  [name: string]: Widget;
}

function App() {
  const [widgets, setWidgets] = useState<Widgets>({
    map1: {
      facts: [
        ["width", 300],
        ["height", 300],
        ["x", 100],
        ["y", 100],
      ],
      providers: [
        {
          type: "location",
          location: LOCATION_OPTIONS[0],
        },
      ],
    },

    empty: {
      facts: [
        ["width", 300],
        ["height", 300],
        ["x", 500],
        ["y", 100],
      ],
      providers: [],
    },
  });

  const onReplaceFact = (
    widgetName: string,
    replaceKey: string,
    replaceValue: any
  ) => {
    setWidgets((widgets) => {
      const prevWidget = widgets[widgetName];
      return {
        ...widgets,
        [widgetName]: {
          ...prevWidget,
          facts: prevWidget.facts
            .filter(([key, value]) => key !== replaceKey)
            .concat([[replaceKey, replaceValue]]),
        },
      };
    });
  };

  const onAddFact = (widgetName: string, key: string, value: any) => {
    setWidgets((widgets) => {
      const prevWidget = widgets[widgetName];
      return {
        ...widgets,
        [widgetName]: {
          ...prevWidget,
          facts: prevWidget.facts.concat([[key, value]]),
        },
      };
    });
  };

  const onDeleteFactAt = (widgetName: string, deletedIndex: number) => {
    setWidgets((widgets) => {
      const prevWidget = widgets[widgetName];
      return {
        ...widgets,
        [widgetName]: {
          ...prevWidget,
          facts: prevWidget.facts.filter(
            (fact, index) => index !== deletedIndex
          ),
        },
      };
    });
  };

  const onChangeProviderAt = (
    widgetName: string,
    changedIndex: number,
    newProvider: Provider
  ) => {
    setWidgets((widgets) => {
      const prevWidget = widgets[widgetName];
      return {
        ...widgets,
        [widgetName]: {
          ...prevWidget,
          providers: prevWidget.providers.map((provider, index) =>
            index === changedIndex ? newProvider : provider
          ),
        },
      };
    });
  };

  const onAddProvider = (widgetName: string, newProvider: Provider) => {
    setWidgets((widgets) => {
      const prevWidget = widgets[widgetName];
      return {
        ...widgets,
        [widgetName]: {
          ...prevWidget,
          providers: prevWidget.providers.concat([newProvider]),
        },
      };
    });
  };

  const onDeleteProviderAt = (widgetName: string, deletedIndex: number) => {
    setWidgets((widgets) => {
      const prevWidget = widgets[widgetName];
      return {
        ...widgets,
        [widgetName]: {
          ...prevWidget,
          providers: prevWidget.providers.filter(
            (provider, index) => index !== deletedIndex
          ),
        },
      };
    });
  };

  return (
    <div>
      {Object.entries(widgets).map(([name, widget]) => (
        <WidgetView
          key={name}
          data={getWidgetData(widget)}
          providers={widget.providers}
          facts={widget.facts}
          onReplaceFact={(key, value) => onReplaceFact(name, key, value)}
          onAddFact={(key, value) => onAddFact(name, key, value)}
          onDeleteFactAt={(index) => onDeleteFactAt(name, index)}
          onChangeProviderAt={(index, provider) =>
            onChangeProviderAt(name, index, provider)
          }
          onAddProvider={(provider) => onAddProvider(name, provider)}
          onDeleteProviderAt={(index) => onDeleteProviderAt(name, index)}
        />
      ))}
    </div>
  );
}

interface WidgetViewProps {
  data: WidgetData;
  providers: Provider[];
  facts: Fact[];
  onReplaceFact: (key: string, value: any) => void;
  onAddFact: (key: string, value: any) => void;
  onDeleteFactAt: (index: number) => void;
  onChangeProviderAt: (index: number, provider: Provider) => void;
  onAddProvider: (provider: Provider) => void;
  onDeleteProviderAt: (index: number) => void;
}

function WidgetView({
  data,
  providers,
  facts,
  onReplaceFact,
  onAddFact,
  onChangeProviderAt,
  onAddProvider,
  onDeleteProviderAt,
  onDeleteFactAt,
}: WidgetViewProps) {
  const { width, height, x, y, selectedViewIndex = 0 } = data;
  const viewOptions = getWidgetViewOptions(data);

  const selectedViewOption = viewOptions[selectedViewIndex] ?? viewOptions[0];
  const SelectedView = selectedViewOption.value;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
      }}
      className="flex flex-col gap-2 items-start"
    >
      <Select
        selectedOption={selectedViewOption}
        options={viewOptions}
        onChange={(selectedOption) => {
          if (!selectedOption) {
            return;
          }

          const selectedIndex = viewOptions.findIndex(
            (option) => selectedOption.name === option.name
          );
          onReplaceFact("selectedViewIndex", selectedIndex);
        }}
      />

      <div
        className="rounded shadow border border-gray-300 bg-white overflow-auto border"
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <SelectedView
          data={data}
          facts={facts}
          providers={providers}
          onReplaceFact={onReplaceFact}
          onDeleteFactAt={onDeleteFactAt}
          onAddFact={onAddFact}
          onChangeProviderAt={onChangeProviderAt}
          onAddProvider={onAddProvider}
          onDeleteProviderAt={onDeleteProviderAt}
        />
      </div>

      {facts.map(([key, value], index) => (
        <div
          key={index}
          className="p-1 bg-white rounded shadow border border-gray-300 flex gap-1"
        >
          {key} : {JSON.stringify(value)}
          <button onClick={() => onDeleteFactAt(index)}>
            <Cross1Icon />
          </button>
        </div>
      ))}

      {providers.map((provider, index) => (
        <div
          key={index}
          className="p-1 bg-gray-100 rounded shadow border border-gray-300 flex gap-1"
        >
          <ProviderView
            provider={provider}
            onChange={(newProvider) => onChangeProviderAt(index, newProvider)}
          />

          <button onClick={() => onDeleteProviderAt(index)}>
            <Cross1Icon />
          </button>
        </div>
      ))}

      <AddProviderButton onAddProvider={onAddProvider} />
    </div>
  );
}

interface AddProviderButtonProps {
  onAddProvider: (provider: Provider) => void;
}

function AddProviderButton({ onAddProvider }: AddProviderButtonProps) {
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
              onAddProvider({
                type: "location",
                location: LOCATION_OPTIONS[0],
              });
            }}
          >
            Location
          </button>
        </div>
      )}
    </div>
  );
}

interface ProviderViewProps {
  provider: Provider;
  onChange: (provider: Provider) => void;
}

function ProviderView({ provider, onChange }: ProviderViewProps) {
  switch (provider.type) {
    case "location":
      return <LocationProviderView provider={provider} onChange={onChange} />;

    case "bounds":
      return <BoundsProviderView provider={provider} onChange={onChange} />;
  }
}

interface LocationProviderViewProps {
  provider: LocationProvider;
  onChange: (provider: LocationProvider) => void;
}

const LOCATION_OPTIONS: Option<LngLat>[] = [
  { name: "Aachen", value: new LngLat(6.083611, 50.775555) },
  { name: "Boston", value: new LngLat(-71.057083, 42.361145) },
  { name: "San Francisco", value: new LngLat(-122.431297, 37.773972) },
];

function LocationProviderView({
  provider,
  onChange,
}: LocationProviderViewProps) {
  return (
    <>
      Location of
      <Select
        selectedOption={provider.location}
        options={LOCATION_OPTIONS}
        onChange={(newLocation) => {
          if (!newLocation) {
            return;
          }
          onChange({ ...provider, location: newLocation });
        }}
      />
    </>
  );
}

interface BoundsProviderProps {
  provider: BoundsProvider;
  onChange: (provider: BoundsProvider) => void;
}
function BoundsProviderView({ provider, onChange }: BoundsProviderProps) {
  return null;
}

interface SelectProps<T> {
  selectedOption: Option<T>;
  options: Option<T>[];
  onChange: (option: Option<T> | undefined) => void;
}

function Select<T>({ selectedOption, options, onChange }: SelectProps<T>) {
  return (
    <select
      value={selectedOption.name}
      onChange={(evt) => {
        const selectedOption = options.find(
          (option) => option.name === evt.target.value
        );

        onChange(selectedOption);
      }}
    >
      {options.map((option) => (
        <option key={option.name}>{option.name}</option>
      ))}
    </select>
  );
}

interface WidgetData {
  [key: string]: any;
}

function getWidgetData(widget: Widget): WidgetData {
  const data: WidgetData = {};

  for (const [key, value] of widget.facts) {
    switch (key) {
      default:
        data[key] = value;
    }
  }

  for (const provider of widget.providers) {
    switch (provider.type) {
      case "location":
        if (!data.geoPoints) {
          data.geoPoints = [];
        }

        data.geoPoints.push(provider.location.value);
    }
  }

  applyComputations(data);

  return data;
}

function applyComputations(data: WidgetData) {
  // compute bounds that includes all geoPoints
  if (data.geoPoints && !data.bounds) {
    const lngLats: LngLat[] = data.geoPoints;

    let bounds: LngLatBounds = lngLats[0].toBounds(500);

    for (const lngLat of lngLats) {
      bounds = bounds.extend(lngLat.toBounds(500));
    }

    data.bounds = bounds;
  }
}

interface Option<T> {
  name: string;
  value: T;
}

function getWidgetViewOptions(
  data: WidgetData
): Option<FunctionComponent<WidgetViewProps>>[] {
  const options: Option<FunctionComponent<WidgetViewProps>>[] = [
    {
      name: "raw",
      value: RawWidgetView,
    },
  ];

  if (data.geoPoints && data.geoPoints.length !== 0) {
    options.unshift({
      name: "map",
      value: MapWidgetView,
    });
  }

  return options;
}

function RawWidgetView({ data }: WidgetViewProps) {
  return <pre className="p-2">{JSON.stringify(data, null, 2)}</pre>;
}

function MapWidgetView({ data, onReplaceFact }: WidgetViewProps) {
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
      console.log("touchstart");

      isManualInteraction = true;
    });

    const onMapViewChange = () => {
      if (!isManualInteraction) {
        return;
      }

      isManualInteraction = false;

      if (
        !map.current ||
        data.bounds.toString() === map.current.getBounds().toString()
      ) {
        return;
      }

      onReplaceFact("bounds", map.current.getBounds());
    };

    map.current.on("zoomend", onMapViewChange);
    map.current.on("moveend", onMapViewChange);
  }, [ref]);

  useEffect(() => {
    if (map.current && data.geoPoints) {
      // remove old markers
      for (const marker of markers.current) {
        marker.remove();
      }

      markers.current = [];

      for (const lngLat of data.geoPoints as LngLat[]) {
        const marker = new Marker();
        marker.setLngLat(lngLat);
        marker.addTo(map.current);
        markers.current.push(marker);
      }
    }
  }, [data.geoPoints]);

  useEffect(() => {
    if (
      map.current &&
      data.bounds &&
      map.current?.getBounds().toString() !== data.bounds.toString()
    ) {
      map.current.fitBounds(data.bounds, { maxDuration: 1 });
    }
  }, [data.bounds]);

  return (
    <div
      ref={ref}
      style={{
        width: `${data.width}px`,
        height: `${data.height}px`,
      }}
    ></div>
  );
}

export default App;
