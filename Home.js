import React from 'react';
import './Home.css';
import { 
    FiTrendingUp, FiTrendingDown, FiCheckCircle, FiAlertCircle, FiCircle, FiArrowUp, FiArrowDown
} from 'react-icons/fi';

const Dashboard = () => {
  const kpiData = [
    { title: 'Supply Chain Health', value: '92%', change: '+2.1%', trend: 'up', icon: <FiCheckCircle /> },
    { title: 'Active Suppliers', value: '847', change: '+12', trend: 'up', icon: <FiCircle /> },
    { title: 'Risk Alerts', value: '3', change: '-7', trend: 'down', icon: <FiAlertCircle /> },
    { title: 'On-Time Delivery', value: '96.2%', change: '+1.8%', trend: 'up', icon: <FiCheckCircle /> },
    { title: 'Inventory Turnover', value: '4.2x', change: '+0.3x', trend: 'up', icon: <FiCircle /> },
    { title: 'Carbon Footprint', value: '2,847 tCO₂', change: '-156 tCO₂', trend: 'down', icon: <FiCircle /> }
  ];

  const locations = [
    { name: 'Shanghai Chemical Hub', risk: 'low' },
    { name: 'Rotterdam Port', risk: 'medium' },
    { name: 'Houston Facility', risk: 'high' },
    { name: 'Mumbai Warehouse', risk: 'low' }
  ];

  const shipments = [
    { id: 'SH001', from: 'Shanghai', to: 'Rotterdam', status: 'in-transit', eta: '2 days' }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Supply Chain Dashboard</h2>
        <p>Monitor your chemical supply chain resilience and performance</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiData.map((kpi, index) => (
          <div key={index} className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">{kpi.title}</span>
              <span className={`kpi-icon ${kpi.trend}`}>{kpi.icon}</span>
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className={`kpi-change ${kpi.trend}`}>
              {kpi.trend === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
              <span>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Global Supply Chain Network */}
      <div className="network-map-container">
        <h3>Global Supply Chain Network</h3>
        <div className="network-map">
          {locations.map((loc, index) => (
            <div key={index} className={`location-node ${loc.risk}`}>
              {loc.name}
              <span className="risk-level">{loc.risk} risk</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Locations & Active Shipments */}
      <div className="bottom-grid">
        <div className="list-card">
          <h3>Key Locations</h3>
          <ul>
            {locations.map((loc, index) => (
              <li key={index}>
                <div className="location-info">
                  <span className="location-name">{loc.name}</span>
                  <span className="location-type">Supplier</span>
                </div>
                <span className="status-badge operational">Operational</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="list-card">
          <h3>Active Shipments</h3>
          <ul>
            {shipments.map((shipment, index) => (
              <li key={index}>
                <div className="shipment-info">
                  <span className="shipment-id">{shipment.id}</span>
                  <span className="shipment-route">{shipment.from} – {shipment.to}</span>
                </div>
                <div className="shipment-status">
                  <span className="status-badge in-transit">{shipment.status}</span>
                  <span className="shipment-eta">ETA: {shipment.eta}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;