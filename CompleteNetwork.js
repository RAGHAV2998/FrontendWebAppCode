import React, { useState } from 'react';
import axios from 'axios';
import Tree from './Tree';
import ManufacturerTree from './ManufacturerTree';
import config from './config';
// Added FiEye and FiMap for consistency with SupplyChainMap UI
import { FiUpload, FiRefreshCw, FiEye, FiCheckCircle, FiMap } from 'react-icons/fi';
import './SupplyChainMap.css'; 

const CompleteNetwork = () => {
  const [file, setFile] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showManufacturerView, setShowManufacturerView] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a JSON file first.");
      return;
    }

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonContent = JSON.parse(e.target.result);
        
        // Ensure the API call points to your network completion endpoint
        const response = await axios.post(`${config.API_BASE_URL}/complete_network`, jsonContent);
        
        // Store the response data to be passed into the Tree components
        setTreeData(response.data);
      } catch (err) {
        console.error("Processing failed:", err);
        setError("Failed to process network. Ensure the file is valid JSON and the server is connected.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setFile(null);
    setTreeData(null);
    setError(null);
    setShowManufacturerView(false); // Reset view on clear
  };

  return (
    <div className="supply-chain-map-container">
      <div className="controls-container">
        <div className="selection-controls">
          <div className="dropdown">
            <label>Upload Your Network (JSON)</label>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleFileChange}
              className="file-input-styled" // Use CSS for padding instead of inline
            />
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="apply-btn" onClick={handleUpload} disabled={!file || loading}>
            <FiUpload /> {loading ? "Processing..." : "Complete Network"}
          </button>
          <button className="clear-btn" onClick={handleClear}>
            <FiRefreshCw /> Clear
          </button>
        </div>
      </div>

      <div className="visualization-container">
        {!treeData && !loading && (
          <div className="placeholder">
            <FiMap size={48} /> {/* Match icon with SupplyChainMap */}
            <h2>Complete Your Network</h2>
            <p>Upload your current supply chain JSON to identify missing tiers and risks.</p>
          </div>
        )}

        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Analyzing and completing your network...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {treeData && !loading && (
          <>
            {/* Consistent Header with Toggle Button */}
            <div className="view-toggle-header">
              <h3><FiCheckCircle color="green" /> Completed Network Result</h3>
              <button onClick={() => setShowManufacturerView(!showManufacturerView)}>
                <FiEye /> {showManufacturerView ? "Component View" : "Manufacturer View"}
              </button>
            </div>
            
            <div className="tree-wrapper">
              {/* Conditional rendering matches SupplyChainMap logic */}
              {showManufacturerView ? (
                <ManufacturerTree initialData={treeData} />
              ) : (
                <Tree initialData={treeData} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompleteNetwork;