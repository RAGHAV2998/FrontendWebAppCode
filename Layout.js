import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Layout.css';
import { 
    FiGrid, FiMap, FiGitPullRequest, FiTruck, FiAlertTriangle, 
    FiArchive, FiMapPin, FiBarChart2, FiDatabase, FiUser, FiBell, 
    FiSearch, FiInfo, FiMail // <-- Added FiInfo and FiMail
} from 'react-icons/fi';

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <h1>Aavyooh</h1>
          </Link>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/"><FiGrid /> Dashboard</NavLink>
          <NavLink to="/supply-chain-map"><FiMap /> Supply Chain Map</NavLink>
          <NavLink to="/resilience-tracker"><FiGitPullRequest /> Resilience Tracker</NavLink>
          <NavLink to="/transportation"><FiTruck /> Transportation</NavLink>
          <NavLink to="/risk-alerts"><FiAlertTriangle /> Risk Alerts</NavLink>
          <NavLink to="/inventory"><FiArchive /> Inventory</NavLink>
          <NavLink to="/locations"><FiMapPin /> Locations</NavLink>
          <NavLink to="/analytics"><FiBarChart2 /> Analytics</NavLink>
          <NavLink to="/data-sources"><FiDatabase /> Data Sources</NavLink>
        </nav>

        {/* Secondary Navigation Section */}
        <hr className="sidebar-divider" />
        <nav className="sidebar-nav secondary-nav">
            <NavLink to="/about"><FiInfo /> About</NavLink>
            <NavLink to="/contact"><FiMail /> Contact</NavLink>
        </nav>

        <div className="sidebar-footer">
          <p>© 2025 Aavyooh</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="main-header">
          <div className="search-bar">
            <FiSearch />
            <input type="text" placeholder="Search suppliers, chemicals, routes..." />
          </div>
          <div className="header-actions">
            <button className="action-button">
              <FiBell />
              <span className="notification-dot"></span>
            </button>
            <button className="action-button profile">
              <FiUser />
            </button>
          </div>
        </header>
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;