import React from 'react';
import './Dashboard.css';

// Import icons (you'll need to install react-icons: npm install react-icons)
import { 
  FaShieldAlt, 
  FaTruck, 
  FaWarehouse, 
  FaExclamationTriangle, 
  FaGlobeAmericas,
  FaMapMarkerAlt
} from 'react-icons/fa';

const Dashboard = ({ username }) => {
  // Sample data - replace with your actual data
  const statsData = [
    {
      title: 'Supply Chain Health',
      value: '92%',
      description: 'Overall resilience score',
      icon: <FaShieldAlt />,
      color: 'blue'
    },
    {
      title: 'On-Time Delivery',
      value: '96.2%',
      description: 'Link 3 of days performance',
      icon: <FaTruck />,
      color: 'green'
    },
    {
      title: 'Active Suppliers',
      value: '847',
      description: 'Worked chemical suppliers',
      icon: <FaWarehouse />,
      color: 'purple'
    },
    {
      title: 'Inventory Turnover',
      value: '4.2x',
      description: 'Chemical inventory efficiency',
      icon: <FaWarehouse />,
      color: 'orange'
    },
    {
      title: 'Risk Alerts',
      value: '3',
      description: 'Optical asset reporting attention',
      icon: <FaExclamationTriangle />,
      color: 'red'
    },
    {
      title: 'Carbon Footprint',
      value: '2,847 tCO₂',
      description: 'Maturity ventilation tracking',
      icon: <FaGlobeAmericas />,
      color: 'teal'
    }
  ];

  const locations = [
    { name: 'Shanghai Chemical Hub', status: 'normal' },
    { name: 'Maritalization Facility', status: 'normal' },
    { name: 'Chairman', status: 'normal' },
    { name: 'Retiredness Port', status: 'medium' },
    { name: 'Manual Wastehouse', status: 'normal' },
    { name: 'Cashflow', status: 'normal' }
  ];

  const shipments = [
    { route: 'Shanghai – Retiredness', status: 'SHORT' }
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Supply Chain Dashboard</h1>
        <p>Monitor your chemical supply chain resilience and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-header">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-icon">{stat.icon}</div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-description">{stat.description}</div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        {/* Left Column - Map Section */}
        <div className="map-section">
          <h2>Global Supply Chain Network</h2>
          <div className="map-container">
            {/* Placeholder for the actual map component */}
            <div className="map-placeholder">
              <p>Supply Chain Network Map Visualization</p>
              <div className="map-points">
                {locations.map((location, index) => (
                  <div 
                    key={index} 
                    className={`map-point ${location.status}`}
                    style={{
                      top: `${20 + (index * 12)}%`,
                      left: `${20 + (index * 8)}%`
                    }}
                  >
                    <span>{location.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Info Panels */}
        <div className="info-panels">
          {/* Key Locations */}
          <div className="info-panel">
            <h3>Key Locations</h3>
            <ul className="locations-list">
              {locations.slice(0, 3).map((location, index) => (
                <li key={index}>
                  <FaMapMarkerAlt className="location-icon" />
                  <span>{location.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Active Shipments */}
          <div className="info-panel">
            <h3>Active Shipments</h3>
            <ul className="shipments-list">
              {shipments.map((shipment, index) => (
                <li key={index}>
                  <span className="shipment-route">{shipment.route}</span>
                  <span className={`shipment-status ${shipment.status.toLowerCase()}`}>
                    {shipment.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="info-panel">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn primary">Generate Report</button>
              <button className="action-btn secondary">View Analytics</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;