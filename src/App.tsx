import { FunctionComponent, useCallback, useState } from 'react'
import classNames from "classnames";

type Fact = [string, any]

interface Widget {
  facts: Fact[]
}

interface Widgets {
  [name: string]: Widget
}


function App() {
  const [widgets, setWidgets] = useState<Widgets>({
    map1: {
      facts: [
        ["width", 200],
        ["height", 200],
        ["x", 100],
        ["y", 100]
      ]
    }
  })

  const onReplaceFact = (widgetName: string, replaceKey: string, replaceValue: any) => {
    setWidgets((widgets) => {
      const prevWidget = widgets[widgetName]
      return {
        ...widgets,
        [widgetName]: {
          ...prevWidget,
          facts: prevWidget.facts.filter(([key, value]) => key !== replaceKey).concat([[replaceKey, replaceValue]])
        }
      }
    })
  }

  const onAddFact = (widgetName: string, key: string, value: any) => {
    setWidgets((widgets) => {
      const prevWidget = widgets[widgetName]
      return {
        ...widgets,
        [widgetName]: {
          ...prevWidget,
          facts: prevWidget.facts.concat([[key, value]])
        }
      }
    })
  }

  return (
    <div>
      {Object.entries(widgets).map(([name, widget]) => (
        <WidgetView
          key={name}
          data={getWidgetData(widget)}
          onReplaceFact={(key, value) => onReplaceFact(name, key, value)}
          onAddFact={(key, value) => onAddFact(name, key, value)}
        />
      ))}
    </div>
  )
}

interface WidgetViewProps {
  data: WidgetData
  onReplaceFact: (key: string, value: any) => void
  onAddFact: (key: string, value: any) => void
}

function WidgetView({ data, onReplaceFact, onAddFact }: WidgetViewProps) {
  const { width, height, x, y, selectedViewIndex = 0 } = data
  const viewOptions = getWidgetViewOptions(data)

  const selectedViewOption = viewOptions[selectedViewIndex] ?? viewOptions[0]
  const SelectedView = selectedViewOption.value

  return (
    <div
      style={{
        position: "absolute",
        left: `${y}px`,
        top: `${y}px`,
      }}>

      <Select
        selectedOption={selectedViewOption}
        options={viewOptions}
        onChange={(selectedOption) => {

          console.log("change", selectedOption)

          if (!selectedOption) {
            return
          }


          const selectedIndex = viewOptions.findIndex((option) => selectedOption.name === option.name)
          onReplaceFact("selectedViewIndex", selectedIndex)
        }}
      />

      <div
        className="p-1 rounder shadow border border-gray-300 bg-white overflow-auto"
        style={{
          width: `${width}px`,
          height: `${height}px`
        }}><SelectedView data={data} onReplaceFact={onReplaceFact} onAddFact={onAddFact} />
      </div>
    </div>
  )
}


interface SelectProps<T> {
  selectedOption: Option<T>,
  options: Option<T>[]
  onChange: (option: Option<T> | undefined) => void
}

function Select<T>({ selectedOption, options, onChange }: SelectProps<T>) {

  return (
    <select value={selectedOption.name}
            onChange={(evt) => {
              const selectedOption = options.find((option) => option.name === evt.target.value)


              onChange(selectedOption)
            }}
    >
      {options.map((option) => (
        <option key={option.name}>{option.name}</option>
      ))}
    </select>
  )

}


interface WidgetData {
  [key: string]: any
}

function getWidgetData(widget: Widget): WidgetData {
  const data: WidgetData = {}

  for (const [key, value] of widget.facts) {
    switch (key) {
      default:
        data[key] = value
    }
  }


  return data
}


interface Option<T> {
  name: string
  value: T
}

function getWidgetViewOptions(data: WidgetData): Option<FunctionComponent<WidgetViewProps>>[] {
  const options: Option<FunctionComponent<WidgetViewProps>>[] = [{
    name: "raw",
    value: RawWidgetView
  }, {
    name: "map",
    value: MapWidgetView
  }]


  return options;
}

function RawWidgetView(data: WidgetData) {
  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  )
}

function MapWidgetView () {
  return (
    <div>Map</div>
  )
}


export default App
