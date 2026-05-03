import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './RiskAlerts.css';
import config from './config';
import chemicals from './CategoryChemical.json';
import manufacturers from './chemicals_manufacturing_locations.json';
import globalAlertsData from './alerts.json'; 
import RiskTree from './RiskTree';
import GlobalRiskMap from './GlobalRiskMap';
import { trackPageVisit, trackMaterialSearch } from './activityTracker';

import { FiMap, FiEye, FiMapPin } from 'react-icons/fi';
import { FaIndustry, FaBoxOpen } from 'react-icons/fa'; // Using Font Awesome icons

// Helper function to normalize the manufacturer string (e.g., 'celanese_bay city_tx')
const parseManufacturerString = (supplierId) => {
    if (!supplierId || typeof supplierId !== 'string' || supplierId.toLowerCase() === 'unknown') 
        return { manufacturerName: 'N/A', locationName: 'N/A' };
        
    const parts = supplierId.split('_');
    // e.g., "celanese_bay city_tx" -> ["celanese", "bay city", "tx"]
    if (parts.length >= 3) {
        // Manufacturer Name: capitalize each word and join (e.g., "celanese" -> "Celanese")
        const manufacturer = parts[0].split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        // Location: capitalize each word and join with comma-space (e.g., "bay city", "tx" -> "Bay City, TX")
        const location = parts.slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
        return { manufacturerName: manufacturer, locationName: location };
    }
    // Fallback for non-standard or global names
    return { manufacturerName: supplierId, locationName: 'N/A' }; 
};

// Helper function to recursively extract all manufacturer IDs and their associated material (chemical) name
const extractManufacturersWithMaterial = (node) => {
    let list = [];
    
    if (node.manufacturer && node.manufacturer.trim() !== "") {
        // The node's name is the chemical/material name at this tier
        list.push({ 
            id: node.manufacturer, 
            chemical_name: node.name
        });
    }

    if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
            // Recursively get manufacturers/materials from children
            list = list.concat(extractManufacturersWithMaterial(child));
        });
    }
    return list;
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
    trackPageVisit('Risk Alerts');
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
      const hierarchyResponse = await axios.get(`${config.API_BASE_URL}/get_hierarchy?product=${encodeURIComponent(query)}`);
      const hierarchyData = hierarchyResponse.data;
      setTreeData(hierarchyData);

      // Step 2: Extract unique manufacturers and their associated materials from the hierarchy
      const manufacturerMaterialList = extractManufacturersWithMaterial(hierarchyData);
      const manufacturerNames = [...new Set(manufacturerMaterialList.map(m => m.id))];

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
      
      // Start async job
      const jobResponse = await axios.post(
        `${config.API_BASE_URL}/getalertformanufacturers`, 
        { manufacturers: manufacturerNames },
        { timeout: 30000 }
      );

      let rawSupplierAlerts;

      if (jobResponse.status === 202 && jobResponse.data.job_id) {
        // Poll for results
        const jobId = jobResponse.data.job_id;
        const total = jobResponse.data.total;
        while (true) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          const statusRes = await axios.get(`${config.API_BASE_URL}/alert_status/${jobId}`, { timeout: 15000 });
          if (statusRes.data.status === 'completed') {
            rawSupplierAlerts = statusRes.data.alerts;
            break;
          } else if (statusRes.data.status === 'failed') {
            throw new Error(statusRes.data.error || 'Alert generation failed');
          } else {
            const progress = statusRes.data.progress || 0;
            setLoadingMessage(`Analyzing risks... (${progress}/${total} suppliers processed)`);
          }
        }
      } else {
        // Direct response (e.g. cached Washington Mills case)
        rawSupplierAlerts = jobResponse.data;
      }

      // --- START ENRICHMENT for initial view ---
      const enrichedSupplierAlerts = rawSupplierAlerts.map(alert => {
          // Use alert.manufacturer (from RiskTree's expected input) or alert.supplier_id (from alerts.json structure)
          const alertId = alert.manufacturer || alert.supplier_id; 
          
          // Find the material name. Note: This assumes a 1:1 mapping is the best approach for the initial list.
          const materialEntry = manufacturerMaterialList.find(m => m.id === alertId);
          const chemicalName = materialEntry ? materialEntry.chemical_name : selectedProduct; // Fallback to root product

          // Parse manufacturer string for cleaner display names
          const { manufacturer, location } = parseManufacturerString(alertId);
          
          return {
              ...alert,
              chemical_name: chemicalName,
              manufacturer_name: manufacturer,
              location: location // Use the parsed location (e.g., "Bay City, TX")
          };
      });
      // --- END ENRICHMENT ---
      
      setSupplierAlerts(enrichedSupplierAlerts);
      setDisplayedAlerts(enrichedSupplierAlerts); // Initially display all fetched alerts
      setViewMode('supplyChain');

    } catch (err) {
      setError("Failed to fetch supply chain data or alerts. Please ensure the backend is running and reachable.");
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  }, [selectedProduct]);

  const handleApplySelection = () => {
    if (selectedProduct && selectedManufacturer) {
      const finalSelection = `${selectedProduct}_${selectedManufacturer}`;
      trackMaterialSearch(selectedProduct, 'Risk Alerts', selectedManufacturer);
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
        // Node alerts are already enriched in RiskTree.js, just use them
        setDisplayedAlerts(nodeAlerts);
      } else if (nodeAlerts === null) {
        // If hovering off a node, reset the feed to show all alerts for the current supply chain
        setDisplayedAlerts(supplierAlerts); 
      }
  };

  // Utility to get the chemical name for display (used for the card header in global view)
  const getAlertChemicalName = (alert) => {
    if (alert.type === 'Global') {
        return alert.location; 
    }
    return alert.chemical_name || 'N/A';
  }
  
  // Utility to get the manufacturer name for display (used for the card header in global view)
  const getAlertManufacturerName = (alert) => {
    if (alert.type === 'Global') {
        return 'Global Supply Network'; 
    }
    return alert.manufacturer_name || 'N/A';
  }

  // Utility to get the location name for display (used for the card header in global view)
  const getAlertLocationName = (alert) => {
    if (alert.type === 'Global') {
        return alert.location; 
    }
    return alert.location || 'N/A';
  }

  // Extract manufacturer/location once for the header when in supplyChain view
  const { manufacturerName: primaryManufacturerName, locationName: primaryLocationName } = parseManufacturerString(selectedManufacturer);


  const SupplyChainHeaderInfo = () => (
    <div className="selected-node-info" style={{ marginBottom: '24px' }}>
        <p style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)'}}>
            Primary Supply Chain Details:
        </p>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.95rem'}}>
            <p>
                <FaBoxOpen style={{ marginRight: '8px', color: 'var(--primary-accent)' }} /> 
                <strong>Chemical:</strong> {selectedProduct}
            </p>
            <p>
                <FaIndustry style={{ marginRight: '8px', color: 'var(--primary-accent)' }} /> 
                <strong>Manufacturer:</strong> {primaryManufacturerName}
            </p>
            <p>
                <FiMapPin style={{ marginRight: '8px', color: 'var(--primary-accent)' }} /> 
                <strong>Location:</strong> {primaryLocationName}
            </p>
        </div>
    </div>
  );


  return (
    <div className="risk-alerts-container">
      {/* Selection Controls - UNCHANGED */}
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
        {/* Left Column - Visualization - UNCHANGED */}
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
          <div className="alerts-feed-header">
              <h2>Alerts Feed</h2>
          </div>
          
          {/* Display Supply Chain Context once at the top */}
          {viewMode === 'supplyChain' && selectedProduct && <SupplyChainHeaderInfo />}
          
          <div className="alerts-feed">
             {displayedAlerts.length === 0 && !loading && <p className="no-alerts">No active alerts for this view.</p>}
             {displayedAlerts.map((alert, index) => ( 
              <div key={`${alert.id}-${index}`} className={`alert-card ${alert.risk_level.toLowerCase()}`}>
                <div className="alert-card-header">
                  <span className="alert-type">{alert.category}</span>
                  <span className={`alert-risk-level ${alert.risk_level.toLowerCase()}`}>{alert.risk_level}</span>
                </div>
                <div className="alert-card-body">
                    {viewMode === 'global' ? (
                        <>
                            {/* Display full details for Global alerts */}
                            <p className="alert-location">
                                <FaBoxOpen /> 
                                <strong>Chemical: </strong>
                                {getAlertChemicalName(alert)}
                            </p>
                            <p className="alert-location">
                                <FaIndustry /> 
                                <strong>Manufacturer: </strong>
                                {getAlertManufacturerName(alert)}
                            </p>
                            <p className="alert-location">
                                <FiMapPin /> 
                                <strong>Location: </strong>
                                {getAlertLocationName(alert)}
                            </p>
                        </>
                    ) : (
                        // In supplyChain view, show only the specific manufacturer/location that the alert is for.
                        // For node-hover, this alert is specific to one manufacturer/location.
                        <p className="alert-location" style={{ marginBottom: '12px' }}>
                            {alert.manufacturer_name && <><FaIndustry /> {alert.manufacturer_name} </>}
                            {alert.manufacturer_name && alert.location && <span> @ </span>}
                            {alert.location && <><FiMapPin /> {alert.location}</>}
                            {/* If the user is viewing all alerts (not hovering), this will show the specific alert context. */}
                        </p>
                    )}
                    
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