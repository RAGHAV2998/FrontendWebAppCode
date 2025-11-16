import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import './RegulatoryRequirements.css';
import config from './config';
import chemicals from './CategoryChemical.json';
import manufacturers from './chemicals_manufacturing_locations.json';
import { FiFilter, FiRefreshCw, FiFileText, FiLoader, FiAlertTriangle, FiChevronDown } from 'react-icons/fi';

const RegulatoryRequirements = () => {
  // State for dropdown selections
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');

  // State for data and loading for the tree visualization
  const [treeData, setTreeData] = useState(null);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState(null);
  
  // State for the selected node in the D3 tree
  const [selectedNode, setSelectedNode] = useState(null);

  // State for regulations data and loading, split into local and global
  const [locationRegulations, setLocationRegulations] = useState([]);
  const [globalRegulations, setGlobalRegulations] = useState([]);
  const [regulationsLoading, setRegulationsLoading] = useState(false);
  const [regulationsError, setRegulationsError] = useState(null);

  const svgRef = useRef();

  // Fetches the hierarchy data to build the supply chain tree
  const handleApplySelection = useCallback(async () => {
    if (!selectedProduct || !selectedManufacturer) return;

    setTreeLoading(true);
    setTreeError(null);
    setTreeData(null);
    setSelectedNode(null);
    setLocationRegulations([]);
    setGlobalRegulations([]);
    setRegulationsError(null);
    
    const query = `${selectedProduct}_${selectedManufacturer}`;

    try {
      const response = await axios.get(`${config.API_BASE_URL}/get_hierarchy?product=${query}`);
      // Collapse all nodes by default except the root
      const root = response.data;
      if (root.children) {
        root._children = root.children;
        root.children = null;
      }
      setTreeData(root);
    } catch (err) {
      console.error("Failed to fetch tree data:", err);
      setTreeError("Failed to fetch supply chain data. Please try again later.");
    } finally {
      setTreeLoading(false);
    }
  }, [selectedProduct, selectedManufacturer]);

  // Fetches regulations for the currently selected node from the backend
  const handleShowRegulations = useCallback(async () => {
    if (!selectedNode) return;

    setRegulationsLoading(true);
    setRegulationsError(null);
    setLocationRegulations([]);
    setGlobalRegulations([]);

    try {
      const postData = {
        material: selectedNode.data.name,
        location: selectedNode.data.manufacturer 
      };
      
      const response = await axios.post(`${config.API_BASE_URL}/get_regulations`, postData);
      
      setLocationRegulations(response.data.location_regulations || []);
      setGlobalRegulations(response.data.global_regulations || []);

    } catch (err) {
      console.error("Failed to fetch regulations:", err);
      setRegulationsError("Could not load regulations. The service may be temporarily unavailable.");
    } finally {
      setRegulationsLoading(false);
    }
  }, [selectedNode]);
  
  // Resets all selections and data
  const handleClearSelection = () => {
    setSelectedCategory('');
    setSelectedProduct('');
    setSelectedManufacturer('');
    setTreeData(null);
    setTreeError(null);
    setSelectedNode(null);
    setLocationRegulations([]);
    setGlobalRegulations([]);
    setRegulationsError(null);
  };

  // D3 rendering logic
  useEffect(() => {
    if (!treeData) {
        d3.select(svgRef.current).selectAll("*").remove();
        return;
    }

    const width = 1200;
    const height = 600;

    const svg = d3.select(svgRef.current)
        .attr("viewBox", [0, 0, width, height + 100])
        .style("font-family", "sans-serif");

    svg.selectAll("*").remove(); // Clear previous render

    const root = d3.hierarchy(treeData, d => d.children || d._children);
    const treeLayout = d3.tree().size([height, width - 400]);
    treeLayout(root);

    const g = svg.append("g").attr("transform", `translate(150, 50)`);

    // Links
    g.selectAll(".link")
        .data(root.links())
        .join("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#9ca3af")
        .attr("stroke-width", 1.5)
        .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));

    // Nodes
    const node = g.selectAll(".node")
        .data(root.descendants())
        .join("g")
        .attr("class", d => `node ${d.children ? "node--internal" : "node--leaf"}`)
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .on("click", (event, d) => {
            // Toggle children
            if (d.data.children) {
                d.data._children = d.data.children;
                d.data.children = null;
            } else {
                d.data.children = d.data._children;
                d.data._children = null;
            }
            setTreeData({...treeData}); 
        });

    // Node Circles
    node.append("circle")
        .attr("r", 8)
        .attr("fill", d => selectedNode && d.id === selectedNode.id ? '#4f46e5' : '#3b82f6')
        .attr("stroke", d => selectedNode && d.id === selectedNode.id ? '#c7d2fe' : '#fff')
        .attr("stroke-width", 3)
        .style("cursor", "pointer")
        .on("click", (event, d) => {
            event.stopPropagation();
            setSelectedNode(d);
            setLocationRegulations([]);
            setGlobalRegulations([]);
            setRegulationsError(null);
        });

    // Node Labels
    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children || d._children ? -15 : 15)
        .attr("text-anchor", d => d.children || d._children ? "end" : "start")
        .text(d => d.data.name)
        .style("font-size", "14px")
        .style("font-weight", "500")
        .clone(true).lower()
        .attr("stroke", "white").attr("stroke-width", 4);

  }, [treeData, selectedNode]);

  return (
    <div className="regulatory-requirements-container">
      {/* Controls Section */}
      <div className="controls-container">
        <div className="selection-controls">
          <div className="dropdown">
            <label htmlFor="categorySelect">Category</label>
            <select id="categorySelect" value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setSelectedProduct(''); setSelectedManufacturer(''); }}>
              <option value="">Select Category</option>
              {Object.keys(chemicals).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="dropdown">
            <label htmlFor="productSelect">Product</label>
            <select id="productSelect" value={selectedProduct} onChange={e => { setSelectedProduct(e.target.value); setSelectedManufacturer(''); }} disabled={!selectedCategory}>
              <option value="">Select Product</option>
              {selectedCategory && chemicals[selectedCategory].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="dropdown">
            <label htmlFor="manufacturerSelect">Manufacturer</label>
            <select id="manufacturerSelect" value={selectedManufacturer} onChange={e => setSelectedManufacturer(e.target.value)} disabled={!selectedProduct}>
              <option value="">Select Manufacturer</option>
              {selectedProduct && manufacturers[selectedProduct] && manufacturers[selectedProduct].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="action-buttons">
          <button className="apply-btn" onClick={handleApplySelection} disabled={!selectedManufacturer || treeLoading}>
            <FiFilter /> Apply
          </button>
          <button className="clear-btn" onClick={handleClearSelection}>
            <FiRefreshCw /> Clear
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="regulatory-content-area">
        <div className="visualization-container">
          {treeLoading && <div className="message-overlay"><FiLoader className="spinner" /> <p>Loading Supply Chain...</p></div>}
          {treeError && <div className="message-overlay error"><FiAlertTriangle /> <p>{treeError}</p></div>}
          {!treeData && !treeLoading && !treeError && (
            <div className="message-overlay">
              <FiFileText size={48} />
              <h2>Regulatory Requirements Explorer</h2>
              <p>Select a product and manufacturer to visualize the supply chain and check regulations.</p>
            </div>
          )}
          <svg ref={svgRef}></svg>
        </div>

        {treeData && (
          <div className="regulations-section">
            <div className="regulations-header">
              <h3>Regulatory Information</h3>
              <button onClick={handleShowRegulations} disabled={!selectedNode || regulationsLoading}>
                  {regulationsLoading ? <FiLoader className="spinner-sm" /> : <FiChevronDown />}
                  Show Regulations for {selectedNode ? `"${selectedNode.data.name}"` : '...'}
              </button>
            </div>
            { selectedNode && (
                <div className="selected-node-info">
                    <p><strong>Material:</strong> {selectedNode.data.name}</p>
                    <p><strong>Location:</strong> {selectedNode.data.manufacturer?.split('_').join(', ')}</p>
                </div>
            )}
            <div className="regulations-table-container">
              {regulationsLoading && <div className="message-overlay"><FiLoader className="spinner" /> <p>Fetching regulations...</p></div>}
              {regulationsError && <div className="message-overlay error"><FiAlertTriangle /> <p>{regulationsError}</p></div>}
              
              {!regulationsLoading && !regulationsError && (
                <>
                  {locationRegulations.length > 0 && (
                    <>
                      <h4 className="regulations-table-title">Location-Specific Regulations</h4>
                      <table className="regulations-table">
                        <thead>
                          <tr>
                            <th>Jurisdiction</th>
                            <th>Regulation</th>
                            <th>Details</th>
                            <th>Link</th>
                          </tr>
                        </thead>
                        <tbody>
                          {locationRegulations.map(reg => (
                            <tr key={reg.id}>
                              <td>{reg.jurisdiction}</td>
                              <td>{reg.regulation}</td>
                              <td>{reg.details}</td>
                              <td><a href={reg.link} target="_blank" rel="noopener noreferrer">Learn More</a></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}

                  {globalRegulations.length > 0 && (
                    <>
                      <h4 className="regulations-table-title">Global & International Regulations</h4>
                      <table className="regulations-table">
                        <thead>
                          <tr>
                            <th>Jurisdiction</th>
                            <th>Regulation</th>
                            <th>Details</th>
                            <th>Link</th>
                          </tr>
                        </thead>
                        <tbody>
                          {globalRegulations.map(reg => (
                            <tr key={reg.id}>
                              <td>{reg.jurisdiction}</td>
                              <td>{reg.regulation}</td>
                              <td>{reg.details}</td>
                              <td><a href={reg.link} target="_blank" rel="noopener noreferrer">Learn More</a></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}

                  {locationRegulations.length === 0 && globalRegulations.length === 0 && selectedNode && !regulationsLoading && (
                     <div className="message-overlay quiet">
                        <p>Click "Show Regulations" to fetch data. If no data appears, none was found for this combination.</p>
                     </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegulatoryRequirements;