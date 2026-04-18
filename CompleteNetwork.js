import React, { useState } from 'react';
import axios from 'axios';
import Tree from './Tree';
import ManufacturerTree from './ManufacturerTree';
import RiskTree from './RiskTree';
import config from './config';
import { FiUpload, FiRefreshCw, FiEye, FiCheckCircle, FiMap, FiAlertTriangle } from 'react-icons/fi';
import './SupplyChainMap.css';

const CompleteNetwork = () => {
  const [file, setFile] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzingRisk, setAnalyzingRisk] = useState(false);
  const [error, setError] = useState(null);
  const [showManufacturerView, setShowManufacturerView] = useState(false);
  const [showRiskView, setShowRiskView] = useState(false);
  const [hoveredAlerts, setHoveredAlerts] = useState(null); // To store alerts for the hovered node

  // Helper to extract manufacturers from the generated tree
  const extractManufacturers = (node) => {
    let list = [];
    if (node.manufacturer && node.manufacturer.trim() !== "" && node.manufacturer.toLowerCase() !== 'unknown') {
      list.push(node.manufacturer);
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        list = list.concat(extractManufacturers(child));
      });
    }
    return list;
  };

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
    setTreeData(null);
    setAlerts([]);
    setShowRiskView(false);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonContent = JSON.parse(e.target.result);
        const response = await axios.post(`${config.API_BASE_URL}/complete_network`, jsonContent);
        setTreeData(response.data);
      } catch (err) {
        setError("Failed to process network. Check JSON validity and server connection.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyzeRisk = async () => {
    if (!treeData) return;
    setAnalyzingRisk(true);
    try {
      const manufacturerIds = [...new Set(extractManufacturers(treeData))];
      const response = await axios.post(`${config.API_BASE_URL}/getalertformanufacturers`, {
        manufacturers: manufacturerIds 
      });
      setAlerts(response.data);
      setShowRiskView(true); // Switch to Risk View once data is ready
    } catch (err) {
      setError("Failed to fetch risk alerts.");
    } finally {
      setAnalyzingRisk(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setTreeData(null);
    setAlerts([]);
    setError(null);
    setShowManufacturerView(false);
    setShowRiskView(false);
    setHoveredAlerts(null);
  };

  return (
    <div className="supply-chain-map-container">
      <div className="controls-container">
        <div className="selection-controls">
          <div className="dropdown">
            <label>Upload Your Network (JSON)</label>
            <input type="file" accept=".json" onChange={handleFileChange} className="file-input-styled" />
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="apply-btn" onClick={handleUpload} disabled={!file || loading}>
            <FiUpload /> {loading ? "Processing..." : "Complete Network"}
          </button>
          
          {/* Risk Analysis Button: Only visible after network is completed */}
          {treeData && (
            <button className="apply-btn" onClick={handleAnalyzeRisk} disabled={analyzingRisk} style={{ backgroundColor: '#e67e22' }}>
              <FiAlertTriangle /> {analyzingRisk ? "Analyzing..." : "Analyze Risk"}
            </button>
          )}

          <button className="clear-btn" onClick={handleClear}>
            <FiRefreshCw /> Clear
          </button>
        </div>
      </div>

      <div className="risk-alerts-content" style={{ display: 'flex', gap: '20px' }}>
        <div className="visualization-section" style={{ flex: 3 }}>
          {treeData && !loading && (
            <div className="view-toggle-header">
              <h3><FiCheckCircle color="green" /> {showRiskView ? "Risk Assessment" : "Network Structure"}</h3>
              <button onClick={() => {
                if (showRiskView) setShowRiskView(false);
                else setShowManufacturerView(!showManufacturerView);
              }}>
                <FiEye /> {showRiskView ? "Back to Structure" : (showManufacturerView ? "Component View" : "Manufacturer View")}
              </button>
            </div>
          )}

          <div className="visualization-container" style={{ minHeight: '600px' }}>
            {!treeData && !loading && <div className="placeholder"><FiMap size={48} /><h2>Upload to Begin</h2></div>}
            
            {treeData && !loading && (
              <div className="tree-wrapper">
                {showRiskView ? (
                  <RiskTree 
                    initialData={treeData} 
                    alerts={alerts} 
                    onNodeHover={setHoveredAlerts} // Capture alerts on hover
                  />
                ) : (
                  showManufacturerView ? <ManufacturerTree initialData={treeData} /> : <Tree initialData={treeData} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hover Alerts Sidebar: Only visible when in Risk View and hovering a node */}
        {showRiskView && (
          <div className="alerts-feed-section" style={{ flex: 1, borderLeft: '1px solid #ddd', paddingLeft: '15px' }}>
            <h3>Node Risk Details</h3>
            {!hoveredAlerts || hoveredAlerts.length === 0 ? (
              <p className="no-alerts">Hover over a node to see active risks.</p>
            ) : (
              <div className="alerts-feed">
                {hoveredAlerts.map((alert, idx) => (
                  <div key={idx} className={`alert-card ${alert.risk_level.toLowerCase()}`} style={{ marginBottom: '10px', padding: '10px', borderRadius: '5px', border: '1px solid #eee' }}>
                    <div className="alert-card-header">
                      <span className={`alert-risk-level ${alert.risk_level.toLowerCase()}`}>{alert.risk_level}</span>
                    </div>
                    <p><strong>{alert.manufacturer_name}</strong></p>
                    <p className="alert-details" style={{ fontSize: '0.85rem' }}>{alert.details}</p>
                    <span className="alert-date" style={{ fontSize: '0.75rem', color: '#888' }}>{alert.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteNetwork;