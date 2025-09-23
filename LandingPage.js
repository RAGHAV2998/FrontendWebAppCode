import React from 'react';
import './LandingPage.css';
import { FiShield, FiTrendingUp, FiRepeat, FiBriefcase } from 'react-icons/fi';

const LandingPage = ({ onLoginClick }) => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <h1>Aavyooh</h1>
        </div>
        <button className="login-button" onClick={onLoginClick}>
          Login
        </button>
      </header>
      
      <main className="landing-content">
        <section className="hero-section">
          <h2>One Platform. Infinite Possibilities.</h2>
          <p>Transform your supply chain with AI-powered insights for resilience and sustainability.</p>
          <div className="hero-buttons">
            <button className="cta-button primary" onClick={onLoginClick}>
              Get Started
            </button>
            <button className="cta-button secondary">
              Learn More
            </button>
          </div>
        </section>
        
        <section className="features-section">
          <h3>Our Solutions</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><FiShield /></div>
              <h4>Risk Shield</h4>
              <p>Detect and mitigate supplier risks with predictive analytics.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><FiTrendingUp /></div>
              <h4>Waste Lens</h4>
              <p>Visualize scope 1, 2, and 3 emissions for each supplier.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><FiRepeat /></div>
              <h4>AltNet</h4>
              <p>Identify alternative and sustainable suppliers with ease.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><FiBriefcase /></div>
              <h4>Waste 2 Value</h4>
              <p>Discover a marketplace for circular economy solutions.</p>
            </div>
          </div>
        </section>
        
        <section className="cta-section">
          <h3>Ready to build a smarter supply chain?</h3>
          <p>Join leading companies using Aavyooh to build resilient, transparent, and sustainable operations.</p>
          <button className="cta-button primary" onClick={onLoginClick}>
            Sign Up Now
          </button>
        </section>
      </main>
      
      <footer className="landing-footer">
        <p>© 2025 Aavyooh. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;