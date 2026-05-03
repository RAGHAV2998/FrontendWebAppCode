import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Layout.css';
import { 
    FiGrid, FiMap, FiGitPullRequest, FiTruck, FiAlertTriangle, 
    FiArchive, FiMapPin, FiBarChart2, FiDatabase, FiUser, FiBell, 
    FiSearch, FiInfo, FiMail, FiFileText, FiShare2, FiMenu,
    FiLogOut, FiSettings, FiMoon, FiSun
} from 'react-icons/fi';

const Layout = ({ children, username, onLogout, darkMode, setDarkMode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="layout-container">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            {!isCollapsed && <h1>Aavyooh</h1>}
          </Link>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/"><FiGrid /> <span>Dashboard</span></NavLink>
          <NavLink to="/supply-chain-map"><FiMap /> <span>Supply Chain Map</span></NavLink>
          <NavLink to="/complete-network"><FiShare2 /> <span>Complete Network</span></NavLink>
          <NavLink to="/regulatory-requirements"><FiFileText /> <span>Regulatory Requirements</span></NavLink>
          <NavLink to="/resilience-tracker"><FiGitPullRequest /> <span>Resilience Tracker</span></NavLink>
          <NavLink to="/transportation"><FiTruck /> <span>Transportation</span></NavLink>
          <NavLink to="/risk-alerts"><FiAlertTriangle /> <span>Risk Alerts</span></NavLink>
          <NavLink to="/inventory"><FiArchive /> <span>Inventory</span></NavLink>
          <NavLink to="/locations"><FiMapPin /> <span>Locations</span></NavLink>
          <NavLink to="/analytics"><FiBarChart2 /> <span>Analytics</span></NavLink>
          <NavLink to="/data-sources"><FiDatabase /> <span>Data Sources</span></NavLink>
        </nav>

        {/* Secondary Navigation Section */}
        <hr className="sidebar-divider" />
        <nav className="sidebar-nav secondary-nav">
            <NavLink to="/about"><FiInfo /> <span>About</span></NavLink>
            <NavLink to="/contact"><FiMail /> <span>Contact</span></NavLink>
        </nav>

        <div className="sidebar-footer">
          <p>{isCollapsed ? '©' : '© 2025 Aavyooh'}</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="main-header">
          <div className="header-left">
            <button className="action-button menu-toggle" onClick={toggleSidebar}>
              <FiMenu />
            </button>
            <div className="search-bar">
              <FiSearch />
              <input type="text" placeholder="Search suppliers, chemicals, routes..." />
            </div>
          </div>
          <div className="header-actions">
            <button className="action-button">
              <FiBell />
              <span className="notification-dot"></span>
            </button>
            <div className="profile-wrapper" ref={profileRef}>
              <button
                className="action-button profile"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <FiUser />
              </button>
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <FiUser className="profile-avatar-icon" />
                    <div>
                      <p className="profile-name">{username || 'User'}</p>
                      <p className="profile-role">Member</p>
                    </div>
                  </div>
                  <hr className="dropdown-divider" />
                  <Link to="/" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                    <FiSettings /> <span>Profile Settings</span>
                  </Link>
                  <button className="dropdown-item" onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? <FiSun /> : <FiMoon />}
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={onLogout}>
                    <FiLogOut /> <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
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