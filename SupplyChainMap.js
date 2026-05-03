import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import Tree from './Tree';
import ManufacturerTree from './ManufacturerTree';
import config from './config';
import chemicals from './CategoryChemical.json';
import manufacturers from './chemicals_manufacturing_locations.json';
import { trackPageVisit, trackMaterialSearch } from './activityTracker';
import './SupplyChainMap.css';
import { FiFilter, FiRefreshCw, FiEye, FiMap, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

const SupplyChainMap = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Set default view to Manufacturer View (true)
  const [showManufacturerView, setShowManufacturerView] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => { trackPageVisit('Supply Chain Map'); }, []);

  const fetchTreeData = useCallback(async () => {
    if (!submittedQuery) {
      setTreeData(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${config.API_BASE_URL}/get_hierarchy?product=${submittedQuery}`);
      setTreeData(response.data);
    } catch (err) {
      console.error("Failed to fetch tree data:", err);
      setError("Failed to fetch data. Please check the server connection and try again.");
      setTreeData(null);
    } finally {
      setLoading(false);
    }
  }, [submittedQuery]);

  const handleApplySelection = () => {
    if (selectedProduct && selectedManufacturer) {
      const finalSelection = `${selectedProduct}_${selectedManufacturer}`;
      setSubmittedQuery(finalSelection);
      trackMaterialSearch(selectedProduct, 'Supply Chain Map', selectedManufacturer);
    }
  };
  
  const handleClearSelection = () => {
    setSelectedCategory('');
    setSelectedProduct('');
    setSelectedManufacturer('');
    setSubmittedQuery('');
    setTreeData(null);
    setError(null);
    setIsExpanded(false);
  };

  React.useEffect(() => {
    if (submittedQuery) {
      fetchTreeData();
    }
  }, [submittedQuery, fetchTreeData]);

  return (
    <div className="supply-chain-map-container">
      <div className="controls-container">
        <div className="selection-controls">
          <div className="dropdown">
            <label htmlFor="categorySelect">Category</label>
            <select
              id="categorySelect"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedProduct('');
                setSelectedManufacturer('');
              }}
            >
              <option value="">Select Category</option>
              {Object.keys(chemicals).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="dropdown">
            <label htmlFor="productSelect">Product</label>
            <select
              id="productSelect"
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setSelectedManufacturer('');
              }}
              disabled={!selectedCategory}
            >
              <option value="">Select Product</option>
              {selectedCategory && chemicals[selectedCategory].map((product) => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
          </div>

          <div className="dropdown">
            <label htmlFor="manufacturerSelect">Manufacturer</label>
            <select
              id="manufacturerSelect"
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              disabled={!selectedProduct}
            >
              <option value="">Select Manufacturer</option>
              {selectedProduct && manufacturers[selectedProduct] && manufacturers[selectedProduct].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="action-buttons">
          <button className="apply-btn" onClick={handleApplySelection} disabled={!selectedManufacturer}>
            <FiFilter /> Apply
          </button>
          <button className="clear-btn" onClick={handleClearSelection}>
            <FiRefreshCw /> Clear
          </button>
        </div>
      </div>

      <div className="visualization-container">
        {!submittedQuery && (
          <div className="placeholder">
            <FiMap size={48} />
            <h2>Select a Product to Visualize</h2>
            <p>Use the dropdowns above to choose a category, product, and manufacturer, then click "Apply".</p>
          </div>
        )}

        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading network for {submittedQuery.replace(/_/g, ' ')}...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {treeData && !loading && !error && (
          <>
            <div className="view-toggle-header">
              <h3>{submittedQuery.replace(/_/g, ' ')} Network</h3>
              <div className="header-controls">
                <button onClick={() => setIsExpanded(!isExpanded)} className="action-toggle-btn">
                  {isExpanded ? <><FiMinimize2 /> Collapse Network</> : <><FiMaximize2 /> Expand Full Network</>}
                </button>
                <button onClick={() => setShowManufacturerView(!showManufacturerView)} className="action-toggle-btn">
                  <FiEye /> {showManufacturerView ? (
                    <>Component View <span className="premium-badge">Premium</span></>
                  ) : "Manufacturer View"}
                </button>
              </div>
            </div>
            <div className="tree-wrapper">
              {showManufacturerView 
                ? <ManufacturerTree initialData={treeData} isExpanded={isExpanded} /> 
                : <Tree initialData={treeData} isExpanded={isExpanded} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SupplyChainMap;