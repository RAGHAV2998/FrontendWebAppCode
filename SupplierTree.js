import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// Helper function to transform data into a graph structure
const transformDataToGraph = (data) => {
  const nodes = new Map();
  const links = [];
  const levels = new Map(); // To store levels of each node

  const traverse = (node, parentManufacturer, level = 0) => {
    // Extract and normalize manufacturer data
    const manufacturerData = node.manufacturer
      ? node.manufacturer.split(",").map((entry) => entry.trim())
      : [];

    manufacturerData.forEach((entry) => {
      const [manufacturer, countryWithPercentage] = entry.split(" - ");
      let country = countryWithPercentage?.match(/\((.*?)\)/)?.[1] || "Unknown";
      if (country === "nan" || !country.trim()) {
        country = "Unknown";
      }

      const nodeName = `${manufacturer}, ${country}`;

      if (!nodes.has(nodeName)) {
        nodes.set(nodeName, { id: nodeName, level });
      }

      levels.set(nodeName, level);

      if (parentManufacturer) {
        links.push({ source: parentManufacturer, target: nodeName });
      }
    });

    if (node.children) {
      node.children.forEach((child) => {
        traverse(
          child,
          manufacturerData[0]?.split(" - ")[0] + ", " + (manufacturerData[0]?.match(/\((.*?)\)/)?.[1] || "Unknown"),
          level + 1
        );
      });
    }
  };

  traverse(data, null);

  return { nodes: Array.from(nodes.values()), links, levels };
};

const SupplierTree = ({ initialData }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const { nodes, links, levels } = transformDataToGraph(initialData);

    const width = 800;
    const height = 600;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("background", "#f3f6f9");

    // Clear previous render
    svg.selectAll("*").remove();

    const simulation = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Color scale for levels
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    // Draw links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2);

    // Draw nodes
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 10)
      .attr("fill", (d) => colorScale(levels.get(d.id))) // Set color based on level
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Add labels
    const label = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("dy", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#333")
      .text((d) => d.id);

    // Update simulation on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      label.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [initialData]);

  return <svg ref={svgRef} style={{ width: "100%", height: "600px" }}></svg>;
};

export default SupplierTree;