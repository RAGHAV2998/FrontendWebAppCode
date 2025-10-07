import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import './GlobalRiskMap.css';
import worldData from './world-110m.json';

const GlobalRiskMap = ({ alerts }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!alerts || !containerRef.current) return;

        const container = d3.select(containerRef.current);
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous renders

        const width = container.node().getBoundingClientRect().width;
        const height = container.node().getBoundingClientRect().height;

        svg.attr('width', width).attr('height', height);

        // Projection and path generator
        const projection = d3.geoMercator()
            .scale(width / 2 / Math.PI * 0.9)
            .translate([width / 2, height / 1.6]);
        const path = d3.geoPath().projection(projection);

        // Tooltip
        const tooltip = d3.select('body').append('div')
            .attr('class', 'map-tooltip')
            .style('opacity', 0);

        // Draw the world map
        const land = topojson.feature(worldData, worldData.objects.land);

        svg.append('g')
            .selectAll('path')
            .data([land])
            .join('path')
            .attr('d', path)
            .attr('class', 'land');

        // Draw hotspots
        svg.append('g')
            .selectAll('circle')
            .data(alerts)
            .join('circle')
            .attr('cx', d => d.lng ? projection([d.lng, d.lat])[0] : null)
            .attr('cy', d => d.lng ? projection([d.lng, d.lat])[1] : null)
            .attr('r', d => {
                if (d.risk_level.toLowerCase() === 'high') return 8;
                if (d.risk_level.toLowerCase() === 'medium') return 6;
                return 5;
            })
            .attr('class', d => `hotspot ${d.risk_level.toLowerCase()}`)
            .on('mouseover', (event, d) => {
                tooltip.transition().duration(200).style('opacity', 1);
                tooltip.html(`
                    <h4>${d.location}</h4>
                    <p><strong>Risk:</strong> <span class="risk-${d.risk_level.toLowerCase()}">${d.risk_level}</span></p>
                    <p><strong>Type:</strong> ${d.category}</p>
                    <p>${d.details}</p>
                `)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => {
                tooltip.transition().duration(500).style('opacity', 0);
            });

        // Cleanup function
        return () => {
            tooltip.remove();
        };

    }, [alerts]); // Rerun effect if alerts data changes

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default GlobalRiskMap;