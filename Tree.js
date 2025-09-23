import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// Function to collapse all nodes except the root
const collapseAllNodes = (node) => {
  if (node.children) {
    node._children = node.children; // Move children to _children
    node.children.forEach(collapseAllNodes); // Recursively collapse child nodes
    node.children = null; // Set children to null to hide them
  }
};

const Tree = ({ initialData }) => {
  const svgRef = useRef(null);
  const [popup, setPopup] = useState({ visible: false, x: 0, y: 0, content: "" }); // State for popup
  const [data, setData] = useState(() => {
    const rootNode = JSON.parse(JSON.stringify(initialData)); // Deep copy to avoid mutating input data
    collapseAllNodes(rootNode); // Collapse all nodes except the root
    return rootNode;
  });

  // Function to toggle a node's children
  const toggleNode = (node) => {
    if (node.children) {
      node._children = node.children; // Collapse: move children to _children
      node.children = null;
    } else {
      node.children = node._children; // Expand: move children back from _children
      node._children = null;
    }
    setData({ ...data }); // Trigger re-render
  };

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("background", "#f3f6f9")
      .style("font-family", "sans-serif");

    const treeLayout = d3.tree().size([height, width - 200]);
    const root = d3.hierarchy(data);
    treeLayout(root);

    svg.selectAll(".link").remove(); // Clear existing links
    svg.selectAll(".node").remove(); // Clear existing nodes

    // Add links
    svg
      .selectAll(".link")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)
      );

    // Add nodes
    const nodes = svg
      .selectAll(".node")
      .data(root.descendants())
      .join("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .on("click", (event, d) => toggleNode(d.data)) // Add click event for toggling
      .on("mouseover", (event, d) => {
        setPopup({
          visible: true,
          x: event.pageX + 15, // Cursor-relative position
          y: event.pageY - 15,
          content: d.data.manufacturer || "No details available",
        });
      })
      .on("mousemove", (event) => {
        setPopup((prev) => ({
          ...prev,
          x: event.pageX + 15,
          y: event.pageY - 15,
        }));
      })
      .on("mouseout", () => {
        setPopup({ visible: false, x: 0, y: 0, content: "" });
      });
      

    nodes
      .append("circle")
      .attr("r", 10)
      .attr("fill", (d) => {
        switch (d.depth) {
          case 0: // Root node (Tier 1)
            return "#1E88E5";
          case 1: // Tier 2
            return "#FFB300";
          case 2: // Tier 3
            return "#FFB300";
          case 3: // Tier 3
            return "#FF6F00";
          default: // Any deeper levels
            return "#B3E5FC";
        }
      })
      .attr("stroke", "#333")
      .attr("stroke-width", 2)
      .attr("opacity", (d) => d.data.percentage / 100); // Set opacity based on percentage

    nodes
      .append("text")
      .attr("dy", "0.35em")
      .attr("x", (d) => (d.children || d._children ? -15 : 15))
      .attr("text-anchor", (d) =>
        d.children || d._children ? "end" : "start"
      )
      .text((d) => d.data.name)
      .style("font-size", "22px")
      .style("fill", "#333");

    // Add manufacturer text on hover
    nodes
      .append("text")
      .attr("class", "manufacturer")
      .attr("dy", "1.5em")
      .attr("x", (d) => (d.children || d._children ? -15 : 15))
      .attr("text-anchor", (d) =>
        d.children || d._children ? "end" : "start"
      )
      .text((d) => d.data.manufacturer)
      .style("font-size", "20px")
      .style("fill", "#666")
      .style("opacity", 0); // Hide by default

    return () => {
      svg.selectAll("*").remove(); // Clear previous render
    };
  }, [data]);

  // return <svg ref={svgRef} style={{ width: "100%", height: "400px" }}></svg>;
 // return <svg ref={svgRef} style={{ width: "100%", height: "60vh" }}></svg>;

  return (
    <>
      <svg ref={svgRef} style={{ width: "100%", height: "70vh" }}></svg>
      {popup.visible && (
        <div
          style={{
            position: "absolute",
            top: popup.y,
            left: popup.x,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          <strong>Manufacturer Details:</strong>
          <div>{popup.content}</div>
        </div>
      )}
    </>
  );
  
};

export default Tree;
