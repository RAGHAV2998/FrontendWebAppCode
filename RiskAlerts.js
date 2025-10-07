import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './RiskAlerts.css';
import config from './config';
import chemicals from './CategoryChemical.json';
import manufacturers from './chemicals_manufacturing_locations.json';
import globalAlertsData from './alerts.json'; 
import RiskTree from './RiskTree';
import GlobalRiskMap from './GlobalRiskMap';

import { FiMap, FiEye, FiMapPin } from 'react-icons/fi';

// Helper function to recursively extract all manufacturer names from the tree
const extractManufacturers = (node) => {
    let names = new Set();
    // Add the node's own manufacturer if it exists and is not an empty string
    if (node.manufacturer && node.manufacturer.trim() !== "") {
        names.add(node.manufacturer);
    }
    // Recurse through children
    if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
            const childNames = extractManufacturers(child);
            childNames.forEach(name => names.add(name));
        });
    }
    return names;
};


const RiskAlerts = () => {
  // View and Data State
  const [viewMode, setViewMode] = useState('global'); // 'global' or 'supplyChain'
  const [globalAlerts, setGlobalAlerts] = useState([]);
  const [supplierAlerts, setSupplierAlerts] = useState([]);
  const [treeData, setTreeData] = useState(null);
  const [displayedAlerts, setDisplayedAlerts] = useState([]);

  // Control State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Fetch global alerts on initial load
  useEffect(() => {
    const fetchInitialAlerts = async () => {
      setLoading(true);
      setLoadingMessage('Fetching global risk data...');
      try {
        // Simulating fetch - in real app, this would be an API call to a global alerts endpoint
        const allAlerts = globalAlertsData.filter(a => a.type === 'Global');
        setGlobalAlerts(allAlerts);
        setDisplayedAlerts(allAlerts);
      } catch (err) {
        setError('Failed to fetch global risk alerts.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialAlerts();
  }, []);
  
  const fetchSupplyChainData = useCallback(async (query) => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setTreeData(null);
    setSupplierAlerts([]);

    try {
      // Step 1: Fetch the supply chain hierarchy
      setLoadingMessage(`Fetching hierarchy for ${query.replace(/_/g, ' ')}...`);
      const hierarchyResponse = await axios.get(`${config.API_BASE_URL}/get_hierarchy?product=${query}`);
      const hierarchyData = hierarchyResponse.data;
      setTreeData(hierarchyData);

      // Step 2: Extract unique manufacturer names from the hierarchy
      const manufacturerNames = Array.from(extractManufacturers(hierarchyData));

      if (manufacturerNames.length === 0) {
          setLoadingMessage('No manufacturers found in the supply chain. Displaying hierarchy without alerts.');
          setSupplierAlerts([]);
          setDisplayedAlerts([]);
          setViewMode('supplyChain');
          setLoading(false);
          return;
      }
      
      // Step 3: Fetch dynamic alerts for these specific manufacturers from your backend
      setLoadingMessage(`Analyzing risks for ${manufacturerNames.length} suppliers...`);
      const alertsResponse = await axios.post(
        `${config.API_BASE_URL}/getalertformanufacturers`, 
        { manufacturers: manufacturerNames }
      );
      
      const manufacturerSpecificAlerts = alertsResponse.data;

      setSupplierAlerts(manufacturerSpecificAlerts);
      setDisplayedAlerts(manufacturerSpecificAlerts); // Initially display all fetched alerts
      setViewMode('supplyChain');

    } catch (err) {
      setError("Failed to fetch supply chain data or alerts. Please ensure the backend is running and reachable.");
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  }, []);

  const handleApplySelection = () => {
    if (selectedProduct && selectedManufacturer) {
      const finalSelection = `${selectedProduct}_${selectedManufacturer}`;
      fetchSupplyChainData(finalSelection);
    }
  };

  const handleClearSelection = () => {
    setSelectedCategory('');
    setSelectedProduct('');
    setSelectedManufacturer('');
    setTreeData(null);
    setError(null);
    setViewMode('global');
    setDisplayedAlerts(globalAlerts);
  };
  
  const handleNodeHover = (nodeAlerts) => {
      if(nodeAlerts && nodeAlerts.length > 0){
        setDisplayedAlerts(nodeAlerts);
      } else if (nodeAlerts === null) {
        // If hovering off a node, reset the feed to show all alerts for the current supply chain
        setDisplayedAlerts(supplierAlerts); 
      }
  };

  return (
    <div className="risk-alerts-container">
      {/* Selection Controls */}
      <div className="controls-container">
         <div className="selection-controls">
            <div className="dropdown">
                <label>Category</label>
                <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setSelectedProduct(''); setSelectedManufacturer(''); }}>
                    <option value="">Select Category</option>
                    {Object.keys(chemicals).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="dropdown">
                <label>Product</label>
                <select value={selectedProduct} onChange={e => { setSelectedProduct(e.target.value); setSelectedManufacturer(''); }} disabled={!selectedCategory}>
                    <option value="">Select Product</option>
                    {selectedCategory && chemicals[selectedCategory].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div className="dropdown">
                <label>Manufacturer</label>
                <select value={selectedManufacturer} onChange={e => setSelectedManufacturer(e.target.value)} disabled={!selectedProduct}>
                    <option value="">Select Manufacturer</option>
                    {selectedProduct && manufacturers[selectedProduct] && manufacturers[selectedProduct].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
        </div>
        <div className="action-buttons">
            <button className="apply-btn" onClick={handleApplySelection} disabled={!selectedManufacturer || loading}>
                <FiEye /> Analyze Supply Chain
            </button>
            <button className="clear-btn" onClick={handleClearSelection}>
                <FiMap /> Show Global View
            </button>
        </div>
      </div>

      <div className="risk-alerts-content">
        {/* Left Column - Visualization */}
        <div className="risk-visualization-section">
          <h2>{viewMode === 'global' ? 'Global Hotspots' : `Risk Analysis for ${selectedProduct}`}</h2>
          <div className="visualization-container">
            {loading && <div className="loading-indicator">{loadingMessage}</div>}
            {error && <div className="error-message">{error}</div>}
            
            {!loading && !error && viewMode === 'global' && (
              <GlobalRiskMap alerts={globalAlerts} />
            )}

            {!loading && !error && viewMode === 'supplyChain' && treeData && (
              <RiskTree initialData={treeData} alerts={supplierAlerts} onNodeHover={handleNodeHover} />
            )}
          </div>
        </div>

        {/* Right Column - Alerts Feed */}
        <div className="alerts-feed-section">
          <h2>Alerts Feed</h2>
          <div className="alerts-feed">
             {displayedAlerts.length === 0 && !loading && <p className="no-alerts">No active alerts for this view.</p>}
             {displayedAlerts.map((alert, index) => ( // Added index for a more robust key
              <div key={`${alert.id}-${index}`} className={`alert-card ${alert.risk_level.toLowerCase()}`}>
                <div className="alert-card-header">
                  <span className="alert-type">{alert.category}</span>
                  <span className={`alert-risk-level ${alert.risk_level.toLowerCase()}`}>{alert.risk_level}</span>
                </div>
                <div className="alert-card-body">
                  <p className="alert-location"><FiMapPin /> {alert.location}</p>
                  <p className="alert-details">{alert.details}</p>
                </div>
                <div className="alert-card-footer">
                  <span className="alert-date">{alert.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAlerts;