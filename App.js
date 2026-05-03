// src/App.js

import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Component Imports
import Layout from './Layout';
import AuthForm from './AuthForm';
import LandingPage from './LandingPage';
import Home from './Home';
import SupplyChainMap from './SupplyChainMap';
import ComingSoon from './ComingSoon';
import About from './About';
import Contact from './Contact';
import RiskAlerts from './RiskAlerts'; // <-- Import RiskAlerts
import RegulatoryRequirements from './RegulatoryRequirements';
import CompleteNetwork from './CompleteNetwork';

// Style Imports
import { saveLastSession } from './activityTracker';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });
  const [username, setUsername] = useState(() => {
    return sessionStorage.getItem('username') || "User";
  });
  const [lastLogin, setLastLogin] = useState(() => {
    return sessionStorage.getItem('lastLogin') || null;
  });
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [routerKey, setRouterKey] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // Apply dark mode class to document
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLoginSuccess = useCallback((usernameFromForm, lastLoginTime) => {
    setIsAuthenticated(true);
    setUsername(usernameFromForm || "User");
    setLastLogin(lastLoginTime || null);
    setShowAuthForm(false);
    setRouterKey(prev => prev + 1);
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('username', usernameFromForm || "User");
    sessionStorage.setItem('loginTime', new Date().toISOString());
    if (lastLoginTime) sessionStorage.setItem('lastLogin', lastLoginTime);
  }, []);

  const handleLogout = useCallback(() => {
    saveLastSession();
    setIsAuthenticated(false);
    setUsername('User');
    setLastLogin(null);
    setShowAuthForm(false);
    sessionStorage.clear();
  }, []);

  const handleLoginClick = useCallback(() => {
    setShowAuthForm(true);
  }, []);

  if (!isAuthenticated) {
    if (showAuthForm) {
      return (
        <div className="center-container">
          <AuthForm onLoginSuccess={handleLoginSuccess} />
        </div>
      );
    }
    return <LandingPage onLoginClick={handleLoginClick} />;
  }

  return (
    <Router key={routerKey}>
      <Layout username={username} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode}>
        <Routes>
          <Route path="/" element={<Home username={username} lastLogin={lastLogin} />} />
          <Route path="/supply-chain-map" element={<SupplyChainMap />} />
          <Route path="/complete-network" element={<CompleteNetwork />} />
          <Route path="/regulatory-requirements" element={<RegulatoryRequirements />} />
          <Route path="/risk-alerts" element={<RiskAlerts />} /> {/* <-- Update this route */}
          <Route path="/resilience-tracker" element={<ComingSoon />} />
          <Route path="/transportation" element={<ComingSoon />} />
          <Route path="/inventory" element={<ComingSoon />} />
          <Route path="/locations" element={<ComingSoon />} />
          <Route path="/analytics" element={<ComingSoon />} />
          <Route path="/data-sources" element={<ComingSoon />} />
          
          {/* Add Routes for About and Contact */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;