import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// Helper function to normalize the manufacturer string (e.g., 'celanese_bay city_tx')
const normalizeManufacturer = (manufacturerId) => {
    if (!manufacturerId || typeof manufacturerId !== 'string' || manufacturerId.toLowerCase() === 'unknown') 
        return { manufacturer: 'N/A', location: 'N/A' };
        
    const parts = manufacturerId.split('_');
    // e.g., "celanese_bay city_tx" -> ["celanese", "bay city", "tx"]
    if (parts.length >= 3) {
        // Manufacturer Name: capitalize each word and join (e.g., "celanese" -> "Celanese")
        const manufacturer = parts[0].split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        // Location: capitalize each word and join with comma-space (e.g., "bay city", "tx" -> "Bay City, TX")
        const location = parts.slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
        return { manufacturer: manufacturer, location: location };
    }
    // Fallback for names that don't fit the pattern (e.g., global alerts)
    return { manufacturer: manufacturerId, location: 'N/A' };
};


const RiskTree = ({ initialData, alerts, onNodeHover, scrollable }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!initialData) return;

    const riskLevelMap = { "High": 3, "Medium": 2, "Low": 1 };

    // This function recursively processes each node in the tree
    const processNode = (node) => {
        // Find alerts specific to this node's manufacturer from the props
        const nodeAlerts = alerts.filter(a => a.manufacturer === node.manufacturer);
        
        // --- START MODIFICATION ---
        // 1. Enrich the alert with the chemical name (node.name) and clean manufacturer/location
        node.alerts = nodeAlerts.map(alert => {
            const { manufacturer, location } = normalizeManufacturer(alert.manufacturer); 
            return {
                ...alert,
                chemical_name: node.name, // The material name at this node's level
                manufacturer_name: manufacturer,
                location: location // Overwrite generic location with parsed location
            };
        });
        // --- END MODIFICATION ---
        
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

    const margin = { top: 50, right: 150, bottom: 50, left: 150 };

    const svg = d3.select(svgRef.current)
      .style("background", "#f9fafb")
      .style("font-family", "sans-serif");

    svg.selectAll("*").remove(); // Clear previous renders

    const root = d3.hierarchy(dataWithRisk);
    let translateX = margin.left, translateY = margin.top;

    if (scrollable) {
      const treeLayout = d3.tree().nodeSize([50, 300]);
      treeLayout(root);
      let x0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      root.each(d => {
        if (d.x < x0) x0 = d.x;
        if (d.x > x1) x1 = d.x;
        if (d.y > y1) y1 = d.y;
      });
      const svgW = y1 + margin.left + margin.right;
      const svgH = (x1 - x0) + margin.top + margin.bottom;
      translateY = margin.top - x0;
      svg.attr("viewBox", null).attr("width", svgW).attr("height", svgH);
    } else {
      const width = 1200;
      const height = 800;
      const treeLayout = d3.tree().size([
        height - margin.top - margin.bottom,
        width - margin.left - margin.right
      ]);
      treeLayout(root);
      svg.attr("viewBox", `0 0 ${width} ${height}`);
    }

    const g = svg.append("g").attr("transform", `translate(${translateX},${translateY})`);
    
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
        // Pass the enriched alerts to the parent component
        onNodeHover(d.data.alerts); 
      })
      .on("mouseout", () => {
        // This signals to reset the feed to all alerts for the supply chain
        onNodeHover(null); 
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

  }, [initialData, alerts, onNodeHover, scrollable]);

  return (
    <>
      <svg ref={svgRef} style={scrollable ? { display: 'block' } : {}}></svg>
    </>
  );
};

export default RiskTree;