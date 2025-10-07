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

// Style Imports
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("User");
  const [showAuthForm, setShowAuthForm] = useState(false);

  const handleLoginSuccess = useCallback((usernameFromForm) => {
    setIsAuthenticated(true);
    setUsername(usernameFromForm || "User");
    setShowAuthForm(false);
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
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/supply-chain-map" element={<SupplyChainMap />} />
          <Route path="/regulatory-requirements-map" element={<ComingSoon />} />
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