import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { FiAlertTriangle } from 'react-icons/fi';
import ReactDOMServer from 'react-dom/server';

const RiskTree = ({ initialData, alerts, onNodeHover }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!initialData) return;

    const riskLevelMap = { "High": 3, "Medium": 2, "Low": 1 };

    // This function recursively processes each node in the tree
    const processNode = (node) => {
        // Find alerts specific to this node's manufacturer from the props
        const nodeAlerts = alerts.filter(a => a.manufacturer === node.manufacturer);
        node.alerts = nodeAlerts;
        
        // Determine the highest risk level for the node based on its own alerts
        let maxRisk = 0;
        if (nodeAlerts.length > 0) {
            maxRisk = Math.max(...nodeAlerts.map(a => riskLevelMap[a.risk_level] || 0));
        }
        
        // Recursively process children and find the max risk among them
        if (node.children && node.children.length > 0) {
            const childMaxRisk = Math.max(...node.children.map(child => processNode(child)));
            // A node's highest risk is the greater of its own risk or its children's highest risk
            maxRisk = Math.max(maxRisk, childMaxRisk);
        }
        
        node.highestRisk = maxRisk;
        return maxRisk; // Return the calculated max risk for the parent to use
    };

    // Create a deep copy to avoid mutating the original data, then process it
    const dataWithRisk = JSON.parse(JSON.stringify(initialData));
    processNode(dataWithRisk);

    const width = 1200;
    const height = 800;
    const margin = { top: 50, right: 150, bottom: 50, left: 150 };

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "#f9fafb")
      .style("font-family", "sans-serif");

    svg.selectAll("*").remove(); // Clear previous renders

    const treeLayout = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    const root = d3.hierarchy(dataWithRisk);
    treeLayout(root);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Color function based on risk level
    const riskColor = (level) => {
        if (level === 3) return "#ef4444"; // High
        if (level === 2) return "#f59e0b"; // Medium
        if (level === 1) return "#10b981"; // Low
        return "#6b7280"; // No risk
    };

    // Draw the links (lines between nodes)
    g.selectAll(".link")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", d => riskColor(d.target.data.highestRisk)) // Color link based on child's risk
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => 1 + d.target.data.highestRisk * 1.5)
      .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));

    // Draw the nodes
    const nodes = g.selectAll(".node")
      .data(root.descendants())
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .on("mouseover", (event, d) => {
        onNodeHover(d.data.alerts); // Update the parent's alert feed
        tooltip.style("display", "block");
        
        const alertIcon = ReactDOMServer.renderToString(<FiAlertTriangle />);
        const alertList = d.data.alerts.length > 0
            ? d.data.alerts.map(a => `
                <div class="tooltip-alert-item ${a.risk_level.toLowerCase()}">
                    <strong>${a.category} (${a.risk_level})</strong>: ${a.details}
                </div>`).join('')
            : '<div>No specific alerts for this supplier.</div>';

        tooltip.html(`
            <div class="tooltip-header">${d.data.name}</div>
            <div class="tooltip-subheader">${d.data.manufacturer || 'Component'}</div>
            <div class="tooltip-alerts-container">
                <div class="tooltip-alerts-title">${alertIcon} Active Alerts</div>
                ${alertList}
            </div>
        `);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY - 15}px`);
      })
      .on("mouseout", () => {
        onNodeHover(null); // Passing null signals to reset the feed
        tooltip.style("display", "none");
      });

    // Draw circles for each node
    nodes.append("circle")
      .attr("r", d => 8 + (d.data.highestRisk || 0) * 2) // Larger circle for higher risk
      .attr("fill", d => riskColor(d.data.highestRisk))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Add text labels to nodes
    nodes.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children ? -15 : 15)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .style("font-size", "14px")
      .style("font-weight", "500")
      .clone(true).lower()
      .attr("stroke", "white").attr("stroke-width", 4);

    const tooltip = d3.select(tooltipRef.current);
  }, [initialData, alerts, onNodeHover]);

  return (
    <>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef} className="risk-tree-tooltip"></div>
    </>
  );
};

export default RiskTree;