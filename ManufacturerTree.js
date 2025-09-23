import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// Function to collapse all nodes except the root
const collapseAllNodes = (node) => {
  if (node.children) {
    node._children = node.children;
    node.children.forEach(collapseAllNodes);
    node.children = null;
  }
};

const ManufacturerTree = ({ initialData }) => {
  const svgRef = useRef(null);
  const [popup, setPopup] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });

  const [data, setData] = useState(() => {
    const rootNode = JSON.parse(JSON.stringify(initialData));
    collapseAllNodes(rootNode);
    return rootNode;
  });

  // Toggle node expand/collapse
  const toggleNode = (node) => {
    if (node.children) {
      node._children = node.children;
      node.children = null;
    } else {
      node.children = node._children;
      node._children = null;
    }
    setData({ ...data });
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

    svg.selectAll(".link").remove();
    svg.selectAll(".node").remove();

    // Draw links
    svg
      .selectAll(".link")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2)
      .attr("d", d3.linkHorizontal().x((d) => d.y).y((d) => d.x));

    // Draw nodes
    const nodes = svg
      .selectAll(".node")
      .data(root.descendants())
      .join("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .on("click", (event, d) => toggleNode(d.data))
      .on("mouseover", (event, d) => {
        setPopup({
          visible: true,
          x: event.pageX + 15,
          y: event.pageY - 15,
          content: d.data.name || "No chemical info",
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
          case 0:
            return "#1E88E5"; // root
          case 1:
            return "#FFB300";
          case 2:
            return "#FFB300";
          case 3:
            return "#FF6F00";
          default:
            return "#B3E5FC";
        }
      })
      .attr("stroke", "#333")
      .attr("stroke-width", 2);

    nodes
      .append("text")
      .attr("dy", "0.35em")
      .attr("x", (d) => (d.children || d._children ? -15 : 15))
      .attr("text-anchor", (d) =>
        d.children || d._children ? "end" : "start"
      )
      .text((d) =>
        d.data.manufacturer ? d.data.manufacturer.split(",")[0] : "Unknown"
      )
      .style("font-size", "18px")
      .style("fill", "#333");

    return () => {
      svg.selectAll("*").remove();
    };
  }, [data]);

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
          <strong>Chemical:</strong>
          <div>{popup.content}</div>
        </div>
      )}
    </>
  );
};

export default ManufacturerTree;