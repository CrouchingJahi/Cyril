import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'

import './pieChart.scss'

/**
 * Pie chart displaying the shares of transactions in each category.
 * 
 * @todo back button in center
 * @todo hover states
 * @todo zoom animation
 */
export default function PieChart ({ transactionData }) {
  const chartContainerRef = useRef(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [chartSize, setChartSize] = useState(0)

  useEffect(() => {
    if (transactionData) {
      setChartSize(chartContainerRef.current.clientWidth)
      setIsDataLoaded(true)
    }
  }, [transactionData])
 
  return <div ref={chartContainerRef}>
    { isDataLoaded ?
      <D3PieChart data={transactionData} size={chartSize} /> :
      <div /> // Loads too fast to show loading icon
    }
  </div>
}

// https://observablehq.com/@d3/zoomable-sunburst
function D3PieChart ({data, size}) {
  const svgRef = useRef()

  useEffect(() => {
    if (data) renderChart()
  }, [data])

  function renderChart () {
    const svg = d3.select(svgRef.current)

    // Chart Dimensions
    const radius = size / 6

    // Chart Styling & Color
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.hierarchy.children.length + 1))

    // Chart Layout
    const hierarchy = d3.hierarchy(data.hierarchy)
      .sum(d => d.value)
    const root = d3.partition().size([2 * Math.PI, hierarchy.height + 1])(hierarchy)
    root.each(d => d.current = d)

    // Generate Arcs
    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius(d => d.y0 * radius)
      .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

    // Append Arcs
    const path = svg.append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
        .attr("d", d => arc(d.current))

    // Create Navigable Elements
    path.filter(d => d.children)
      .style("cursor", "pointer")
      .on("click", zoomOnClick)

    const format = d3.format(",d")
    path.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

    const label = svg.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", d => +labelVisible(d.current))
      .attr("transform", d => labelTransform(d.current))
      .text(d => d.data.name)

    const parent = svg.append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", zoomOnClick)

    // Animations
    // Handle zoom on click.
    function zoomOnClick(event, p) {
      parent.datum(p.parent || root)

      root.each(d => d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
      })

      const t = svg.transition().duration(event.altKey ? 7500 : 750)

      // Transition the data on all arcs, even the ones that aren’t visible,
      // so that if this transition is interrupted, entering arcs will start
      // the next transition from the desired position.
      path.transition(t)
          .tween("data", d => {
            const i = d3.interpolate(d.current, d.target)
            return t => d.current = i(t)
          })
        .filter(function(d) {
          return +this.getAttribute("fill-opacity") || arcVisible(d.target)
        })
          .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
          .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none") 
          .attrTween("d", d => () => arc(d.current))

      label.filter(function(d) {
          return +this.getAttribute("fill-opacity") || labelVisible(d.target)
        }).transition(t)
          .attr("fill-opacity", d => +labelVisible(d.target))
          .attrTween("transform", d => () => labelTransform(d.current))
    }
    
    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0
    }

    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03
    }

    function labelTransform(d) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI
      const y = (d.y0 + d.y1) / 2 * radius
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`
    }
  }

  return data ?
    <svg id="money-pie"
      ref={svgRef}
      viewBox={`${size / -2} ${size / -2} ${size} ${size}`}
    />
    : <div />
}
