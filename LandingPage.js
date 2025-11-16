import React from 'react';
import './LandingPage.css';

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
          <div className="hero-box">
            <h2>One Platform. Endless Applications</h2>
            <p>Visualize. Simulate. Design</p>
          </div>
          
          <p className="hero-subtitle">
            Design <strong>Transparent</strong>, <strong>Resilient</strong> and <strong>Circular</strong> supply chains using Aavyooh's engine powered by AI integrated with science
          </p>

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
          <button className="cta-button explore-button">Explore Solutions</button>
          
          <div className="solutions-grid">
            <div className="solution-column">
              <div className="solution-header">Transparent</div>
              <ul>
                <li><span className="solution-item-box"></span>Mapping</li>
                <li><span className="solution-item-box"></span>Risk-Shield</li>
                <li><span className="solution-item-box"></span>Waste Lens</li>
                <li><span className="solution-item-box"></span>Regulatory Lens</li>
              </ul>
            </div>
            
            <div className="solution-column">
              <div className="solution-header">Resilient</div>
              <ul>
                <li><span className="solution-item-box"></span>Alt-Net</li>
                <li><span className="solution-item-box"></span>Alt-Net Dynamics</li>
              </ul>
            </div>
            
            <div className="solution-column">
              <div className="solution-header">Circular</div>
              <ul>
                <li><span className="solution-item-box"></span>Waste 2 Value</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;