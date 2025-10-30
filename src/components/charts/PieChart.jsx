import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import LoadingIcon from '@/ui/LoadingIcon'

export default function PieChart ({ transactionData }) {
  const chartContainerRef = useRef(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  useEffect(() => {
    console.log(transactionData)
    if (transactionData) {
      setIsDataLoaded(true)
    }
  }, [transactionData])
 
  return <div ref={chartContainerRef}>
    { isDataLoaded ?
      <D3PieChart data={transactionData} size={chartContainerRef.current.clientWidth} /> :
      <LoadingIcon />
    }
  </div>
}

function D3PieChart ({data, size}) {
  function renderChart () {
    // Chart Dimensions
    const radius = size / 2

    // Chart Styling & Color
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.hierarchy.children.length + 1))

    // Chart Layout

    // Generate Arcs

    // Create SVG Container

    // Append Arcs

    // Create Navigable Elements

    // Zoom on Click

    // Animations
  }
  return <svg width={size} height={size}></svg>
}
