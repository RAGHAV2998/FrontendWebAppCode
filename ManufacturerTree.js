import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

const collapseAllNodes = (node) => {
  if (node.children) {
    node._children = node.children;
    node.children.forEach(collapseAllNodes);
    node.children = null;
  }
};

const ManufacturerTree = ({ initialData, isExpanded }) => {
  const svgRef = useRef(null);
  const [popup, setPopup] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });

  const [data, setData] = useState(() => {
    const rootNode = JSON.parse(JSON.stringify(initialData));
    if (!isExpanded) collapseAllNodes(rootNode);
    return rootNode;
  });

  useEffect(() => {
    const rootNode = JSON.parse(JSON.stringify(initialData));
    if (!isExpanded) {
      collapseAllNodes(rootNode);
    }
    setData(rootNode);
  }, [initialData, isExpanded]);

  const toggleNode = useCallback((node) => {
    if (node.children) {
      node._children = node.children;
      node.children = null;
    } else {
      node.children = node._children;
      node._children = null;
    }
    setData((prev) => ({ ...prev }));
  }, []);

  useEffect(() => {
    if (!data) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("background", "#f3f6f9")
      .style("font-family", "sans-serif");

    // Clear previous elements to prevent overlapping on re-renders
    svg.selectAll("*").remove();

    // Define margins to keep text inside the box
    const margin = { top: 60, right: 200, bottom: 60, left: 200 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const treeLayout = d3.tree().size([innerHeight, innerWidth]);
    const root = d3.hierarchy(data);
    treeLayout(root);

    // Create a main group shifted by the top/left margins
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Draw links
    g.selectAll(".link")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2)
      .attr("d", d3.linkHorizontal().x((d) => d.y).y((d) => d.x));

    // Draw nodes
    const nodes = g
      .selectAll(".node")
      .data(root.descendants())
      .join("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .on("click", (event, d) => toggleNode(d.data))
      .on("mouseover", (event, d) => {
        setPopup({
          visible: true,
          x: event.clientX + 15,
          y: event.clientY + 15,
          content: d.data.name || "No chemical info",
        });
      })
      .on("mousemove", (event) => {
        setPopup((prev) => ({
          ...prev,
          x: event.clientX + 15,
          y: event.clientY + 15,
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
          case 0:
            return "#1E88E5";
          case 1:
            return "#FFB300";
          case 2:
            return "#22e42f";
          case 3:
            return "#FF6F00";
          default:
            return "#B3E5FC";
        }
      })
      .attr("stroke", "#333")
      .attr("stroke-width", 2);

    // UPDATED: Text positioned directly below the node
    nodes
      .append("text")
      .attr("dy", "1.8em") // Push the text down
      .attr("x", 0)        // Align exactly to the center horizontally
      .attr("text-anchor", "middle") // Center the text
      .text((d) =>
        d.data.manufacturer ? d.data.manufacturer.split(",")[0] : "Unknown"
      )
      .style("font-size", "18px")
      .style("fill", "#333");

    return () => {
      svg.selectAll("*").remove();
    };
  }, [data, toggleNode]);

  return (
    <>
      <svg ref={svgRef} style={{ width: "100%", height: "70vh" }}></svg>
      {popup.visible && (
        <div
          style={{
            position: "fixed",
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
          <strong>Chemical:</strong>
          <div>{popup.content}</div>
        </div>
      )}
    </>
  );
};

export default ManufacturerTree;